/**
 * Console for all browser
 */
var method;
var noop = function () {};
var methods = [
	'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
	'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
	'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
	'timeStamp', 'trace', 'warn'
];
var length = methods.length;
var console = (window.console = window.console || {});

while (length--) {
	method = methods[length];

	// Only stub undefined methods.
	if (!console[method]) {
		console[method] = noop;
	}
}

/**
 * Application
 */
var miakaja = (function (window, $, Q) {
	var self = {
		venues: {}
	};

	var map,
		streetView,
		hqMarker,
		markers,
		directionsRenderer,
		directionService = new google.maps.DirectionsService(),
		disabledCategories = {},
		alreadyHadNoResult = false,
		lastVenueLoadingAjax = null,
		searchElement = $('#search-field');

	self.init = function () {
		map = initializeMap();
		streetView = initializeStreetView(map);
		searchElement.focus();
		directionsRenderer = initializeDirectionsRenderer();

		//Mobile menu opener
		$('.menu-opener').on('click', function () {
			toggleMenuBar();
		});

		// HQ
		hqMarker = marker.create(map, getDefaultLocation(), icons.office(), 'Ustream');

		Q.fcall(loadMarkers)
			.then(function (venueLocations) {
				self.venues = venueLocations[0];
				markers = placeMarkersOnMap(self.venues);
				$('#places').find('.list-group-item:not(.not-selectable)').click(function (event) {
					var element = $(event.target);
					var target = element.is('a.list-group-item') ? element : element.parent('a.list-group-item');
					var id = target.data('id');
					marker.selfCenterClick(self.venues['v' + id] || self.venues[id]);
					toggleMenuBar();
				});
				searchElement.keyup(search);
				if (searchElement.val()) {
					search();
				}
				$('#controll').find('.btn').click(handleCategorySelectorButtons).click(search);
			})
			.fail(defaultErrorHandler)
			.done();

		return self;
	};

	var handleCategorySelectorButtons = function (event) {
		var target = $(event.target);
		target.toggleClass('selected');
		var name = target.data('name');
		if (target.hasClass('selected')) {
			disabledCategories[name] = false;
			$('#places').find('.category-' + name).show();
		} else {
			disabledCategories[name] = true;
			$('#places').find('.category-' + name).hide();
		}

		checkCategories();
	};

	var checkCategories = function () {
		if ($('#controll').find('.selected').length === 0) {
			$('.select-category').show();
		} else {
			$('.select-category').hide();
		}
	};

	/**
	 * Toggles menu bar on mobile layout
	 */
	var toggleMenuBar = function () {
		if (!isMobileLayout) return;

		$('.menu-opener, .menubar').toggleClass('opened');
	};

	var search = function () {
		bubble.close();
		var q = searchElement.val().toString();
		$.each(self.venues, function (index, venue) {
			var data = venue.name + ' ' + venue.location.address;
			if ((new RegExp(q, 'i').test(data) || q.length <= 0) && isCategoryEnabled(venue.baseCategory)) {
				venue.listItem.show();
				venue.marker.setVisible(true);
			} else {
				venue.listItem.hide();
				venue.marker.setVisible(false);
			}
		});

		var results = $('#places').find('.list-group-item:not(.not-selectable)').filter(':visible');
		noResultControll(results.length, q.length);
		if (results.length === 1) {
			var venueId = results.data('id');
			var venue = self.venues[('v' + venueId) || venueId];
			if (venue) {
				marker.selfCenterClick(venue);
			}
		} else {
			bubble.close();
		}

		if (q.length === 0) {
			map.panTo(getDefaultLocation());
		}
	};


	/**
	 * @param {int} resultLength
	 * @param {int} queryLength
	 */
	var noResultControll = function (resultLength, queryLength) {
		var element = $('.no-result');
		if (queryLength !== 0 && resultLength === 0) {
			if (alreadyHadNoResult) {
				element.find('b:hidden').show();
			}
			element.show();
			alreadyHadNoResult = true;
		} else {
			element.hide();
		}
	};

	/**
	 * @param {string} categoryName
	 * @returns {boolean}
	 */
	var isCategoryEnabled = function (categoryName) {
		return !disabledCategories[categoryName];
	};

	/**
	 * @returns {promise}
	 */
	var loadMarkers = function () {
		var def = Q.defer();
		var params = {
			method: 'post',
			dataType: 'json'
		};
		$.ajax('data.php', params)
			.done(function (response) {
				if (!response.length) {
					def.reject();
					return;
				}
				def.resolve(response);
			})
			.fail(function (e) {
				def.reject(e);
			});
		return def.promise;
	};

	/**
	 * @param {string} venueId
	 * @returns {promise}
	 */
	var loadVenueDetails = function (venueId) {
		if (lastVenueLoadingAjax) {
			lastVenueLoadingAjax.abort();
		}

		var def = Q.defer();
		var params = {
			method: 'post',
			dataType: 'json',
			data: {id: venueId}
		};
		lastVenueLoadingAjax = $.ajax('venue.php', params)
			.done(function (response) {
				if (!response) {
					def.reject();
					return;
				}

				def.resolve(response);
			})
			.fail(function (e) {
				def.reject(e);
			});
		return def.promise;
	};

	/**
	 * @param venues
	 * @returns {Array}
	 */
	var placeMarkersOnMap = function (venues) {
		// TODO unused markers var!
		var markers = [];
		$.each(venues, function (i, venue) {
			var listItemHtml = createListItemPlace(venue);
			$('#places').append(listItemHtml);

			var pos = new google.maps.LatLng(venue.location.lat, venue.location.lng);
			var icon = getVenueMarkerIconByCategory(venue);
			var markerItem = marker.create(map, pos, icon, venue.name);
			google.maps.event.addListener(markerItem, 'click', function () {
				return marker.selfCenterClick(venue);
			});
			venue.marker = markerItem;
			venue.listItem = listItemHtml;
			markers.push(markerItem);
		});
		return markers;
	};

	/**
	 * @param venue
	 * @returns {MarkerImage}
	 */
	var getVenueMarkerIconByCategory = function (venue) {
		switch (venue.baseCategory) {
			case 'breakfast':
				return icons.breakfast();
			case 'streetFood':
				return icons.fastfood();
			case 'businessLunch':
				return icons.restaurant();
			case 'sugarAndKaffeine':
				return icons.caffeine();
			default:
				return icons.pin();
		}
	};

	/**
	 * @param venue
	 */
	var createListItemPlace = function (venue) {
		var guest = venue.hereNow > 0 ? ' <span class="glyphicon glyphicon-user"></span> ' + venue.hereNow : '';
		var txt = '<a href="javascript:void(0);" class="list-group-item category-' + venue.baseCategory + '" data-id="' + venue.id + '">' +
			'<img src="' + venue.previewUrl + '" class="list-group-item-img" />' +
			'<h4 class="list-group-item-heading">' + venue.name + '</h4>' +
			'<p class="list-group-item-text">' + venue.location.address + guest + '</p>' +
			'<span class="pipe">' +
			'<span class="a"></span>' +
			'</span>' +
			'</a>';
		return $(txt);
	};

	var navigateToVenue  = function (venueDetailed) {
		var start = getDefaultLocation(),
			end = new google.maps.LatLng(venueDetailed.location.lat, venueDetailed.location.lng),
			request = {
				origin: start,
				destination: end,
				travelMode: google.maps.TravelMode.WALKING
			};

		directionService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsRenderer.setMap(map);
				directionsRenderer.setDirections(result);
				if (
					result.routes &&
					result.routes[0] &&
					result.routes[0].legs &&
					result.routes[0].legs[0]
				) {
					var leg = result.routes[0].legs[0],
						distance = leg.distance.value;

					venueDetailed.distance = distance / 1000 > 1 ? (distance / 1000).toFixed(2) + ' km' : distance + ' m';
					venueDetailed.duration = leg.duration.text;
				}

				bubble.update(venueDetailed);
			}
		});

		return venueDetailed;
	};

	/**
	 * @returns {google.maps.Map}
	 */
	var initializeMap = function () {
		var container = document.getElementById("map");
		var styleParams = [
			{
				// disable business texts
				featureType: 'poi.business',
				elementType: 'labels',
				stylers: [
					{
						visibility: 'off'
					}
				]
			}
		];

		var params = {
			backgroundColor: '#fff',
			// TODO user location
			center: getDefaultLocation(),
			zoom: 17,
			minZoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			mapTypeControl: false,
			streetViewControl: false,
			panControl: false,
			zoomControl: true,
			zoomControlOptions: {
				position: isMobileLayout ?
					google.maps.ControlPosition.RIGHT_TOP : google.maps.ControlPosition.LEFT_TOP,
				style: google.maps.ZoomControlStyle.SMALL
			},
			styles: styleParams
		};

		return new google.maps.Map(container, params);
	};

	var initializeDirectionsRenderer = function () {
		return new google.maps.DirectionsRenderer({
			preserveViewport: true,
			suppressMarkers: true
		});
	};

	/**
	 * @param map {google.maps.Map}
	 * @returns {*}
	 */
	var initializeStreetView = function (map) {
		var panorama = map.getStreetView();
		panorama.setPov({
			heading: 265,
			pitch: 0
		});
		return panorama;
	};

	/**
	 * Center of Ustream HQ
	 *
	 * @returns {google.maps.LatLng}
	 */
	var getDefaultLocation = function () {
		return new google.maps.LatLng(47.503739, 19.061415);
	};

	var isMobileLayout = function () {
		return window.innerWidth < 800;
	};

	var marker = {};

	/**
	 * @param map {google.maps.Map}
	 * @param pos {google.maps.LatLng}
	 * @param icon {object}
	 * @param title {string}
	 * @returns {google.maps.Marker}
	 */
	marker.create = function (map, pos, icon, title) {
		return new google.maps.Marker({
			map: map,
			position: pos,
			icon: icon,
			title: title
		});
	};

	/**
	 * @param venue
	 */
	marker.selfCenterClick = function (venue) {
		Q.fcall(function () {
			bubble.close();
			map.panTo(venue.marker.getPosition());
			bubble.open(venue);
		})
			.then(function () {
				return venue.id;
			})
			.then(loadVenueDetails)
			.then(navigateToVenue)
			.then(bubble.update)
			.fail(defaultErrorHandler)
			.done();
	};

	var bubble = {
		infoWindow: null
	};

	/**
	 * @param venue
	 */
	bubble.open = function (venue) {
		bubble.close();

		bubble.infoWindow = new google.maps.InfoWindow({
			content: getInfoWindowContent(venue)
		});

		google.maps.event.addListener(bubble.infoWindow,'closeclick',function() {
			directionsRenderer.setMap(null);
		});

		bubble.infoWindow.open(map, venue.marker);
	};

	bubble.close = function () {
		directionsRenderer.setMap(null);
		if (bubble.infoWindow) {
			bubble.infoWindow.close();
		}
	};

	/**
	 * @param venueDetailed
	 */
	bubble.update = function (venueDetailed) {
		var container = $('#bubble-content');
		container.find('.rating').html('<span class="glyphicon glyphicon-star"></span> ' + venueDetailed.rating);

		var openMarker = venueDetailed.isOpen ? 'glyphicon-ok' : 'glyphicon-remove';
		container.find('.content-row .status').html(
			'<span class="glyphicon ' + openMarker + '"></span>' + (venueDetailed.openingStatus || 'no information available')
		);

		if (venueDetailed.distance) {
			container.find('.distance').html(venueDetailed.distance + '<b>' + venueDetailed.duration + '</b>');
		}

		if (venueDetailed.wifi) {
			container.find('.likes').append('<span class="glyphicon glyphicon-signal" title="Wi-Fi available"></span>');
		}
		if (venueDetailed.creditCard) {
			container.find('.likes').append('<span class="glyphicon glyphicon-credit-card" title="You can pay with Credit Card"></span>');
		}
		if (venueDetailed.outdoor) {
			container.find('.likes').append('<span class="glyphicon glyphicon-tree-conifer" title="Outdoor seating available"></span>');
		}
	};

	/**
	 * @param venue
	 * @returns {string}
	 */
	var getInfoWindowContent = function (venue) {
		var phone = venue.contactPhone ? '<a href="tel:' + venue.contactPhone + '">' + (venue.formattedPhone || venue.contactPhone) + '</a>' : '-';
		var location = '<span style="display: none;">' + (venue.location.postalCode || '') + ' ' + (venue.location.city || '') + ', </span>' + venue.location.address;

		return '<div id="bubble-content">' +
			'<div class="image-row">' +
				'<img src="' + venue.screenUrl + '">' +
				'<div class="distance"><i class="loader"></i>loading</div>' +
			'</div>' +
			'<div class="content-row">' +
			'<h1>' + venue.name.replace(/\./g, '. ') + '</h1>' +
			'<ul>' +
				'<li class="likes">' +
				'<span class="label label-danger rating"><i class="loader"></i>loading</span>' +
				'<span class="glyphicon glyphicon-heart"></span>' + venue.likeCount +
				'<span class="glyphicon glyphicon-user"></span>' + venue.hereNow +
				'</li>' +
				'<li class="hereNow"></li>' +
				'<li class="location"><span class="glyphicon glyphicon-home"></span>' + location + '</li>' +
				'<li class="phone"><span class="glyphicon glyphicon-phone-alt"></span>' + phone + '</li>' +
				'<li class="status">&nbsp;</li>' +
			'</ul>' +
			'</div>' +
			'</div>';
	};

	var icons = {};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.office = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_169_record.png',
			new google.maps.Size(20, 20), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(10, 20) // The anchor point (x,y)
		);
	};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.restaurant = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_276_cutlery.png',
			new google.maps.Size(16, 24), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(8, 24) // The anchor point (x,y)
		);
	};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.caffeine = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_294_coffe_cup.png',
			new google.maps.Size(25, 19), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(12, 10) // The anchor point (x,y)
		);
	};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.fastfood = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_275_fast_food.png',
			new google.maps.Size(28, 24), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(14, 12) // The anchor point (x,y)
		);
	};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.breakfast = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_292_tea_kettle.png',
			new google.maps.Size(26, 23), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(13, 12) // The anchor point (x,y)
		);
	};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.pin = function () {
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_242_google_maps.png',
			new google.maps.Size(16, 24), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(8, 0) // The anchor point (x,y)
		);
	};

	/**
	 * @param error
	 */
	var defaultErrorHandler = function (error) {
		if (console && console.error) {
			console.error(error.stack);
		}
	};

	self.d = disabledCategories;
	return self;
}(window, jQuery, Q));

var app = {};
/**
 * - All batteries concentrate forward firepower.
 * - Spin up drives two and six!
 * - All hands brace for warp jump on my mark!
 * - [..]
 * - Mark!
 */
jQuery(function () {
	app = miakaja.init();
});
