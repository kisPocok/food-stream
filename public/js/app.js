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
var miakaja = (function(window, $)
{
	var self = {};

	self.init = function()
	{
		console.log('run');

		map = initializeMap();
		streetView = initializeStreetView(map);

		// ustream
		marker.create(map, getDefaultLocation(), icons.office(), 'Ustream');

		return self;
	};

	/**
	 * @returns {google.maps.Map}
	 */
	var initializeMap = function()
	{
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
				position: google.maps.ControlPosition.LEFT_TOP,
				style: google.maps.ZoomControlStyle.SMALL
			},
			styles: styleParams
		};
		return new google.maps.Map(container, params);
	};

	/**
	 * @param map {google.maps.Map}
	 * @returns {*}
	 */
	var initializeStreetView = function(map)
	{
		var panorama = map.getStreetView();
		panorama.setPov({
			heading: 265,
			pitch:   0
		});
		return panorama;
	};

	/**
	 * Center of Budapest
	 *
	 * @returns {google.maps.LatLng}
	 */
	var getDefaultLocation = function()
	{
		return new google.maps.LatLng(47.503739, 19.061415);
	};

	var marker = {};

	/**
	 * @param map {google.maps.Map}
	 * @param pos {google.maps.LatLng}
	 * @param icon {object}
	 * @param title {string}
	 * @returns {google.maps.Marker}
	 */
	marker.create = function(map, pos, icon, title)
	{
		return new google.maps.Marker({
			map: map,
			position: pos,
			icon: icon,
			title: title
		});
	};

	/**
	 * @param markerItem {google.maps.Marker}
	 */
	marker.selfNavigationClick = function(markerItem)
	{
		/*
		Q.all([
				user.getLocation(),
				markerItem.getPosition()
			])
			.spread(navigateFromAToB)
			.then(transformNavigationResponse)
			.then(populateDestionationView)
			.done();
		*/
	};

	var icons = {};

	/**
	 * @returns {google.maps.MarkerImage}
	 */
	icons.office = function()
	{
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
	icons.restaurant = function()
	{
		return new google.maps.MarkerImage(
			'img/icons/glyphicons_276_cutlery.png',
			new google.maps.Size(16, 24), // (width,height)
			new google.maps.Point(0, 0),  // The origin point (x,y)
			new google.maps.Point(8, 24) // The anchor point (x,y)
		);
	};

	return self;
}(window, jQuery));

/**
 * - All batteries concentrate forward firepower.
 * - Spin up drives two and six!
 * - All hands brace for warp jump on my mark!
 * - [..]
 * - Mark!
 */
jQuery(function() {
	var app = miakaja.init();
});