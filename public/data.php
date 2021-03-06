<?php

use App\Foursquare\Venue;
use App\Foursquare\VenueOrdering;

header('Content-Type: application/json');
date_default_timezone_set('Europe/Budapest');

include '../app/config.php';
include '../vendor/autoload.php';

$client = new \TheTwelve\Foursquare\HttpClient\CurlHttpClient('../cacert.pem');
$redirector = new \TheTwelve\Foursquare\Redirector\HeaderRedirector();

$factory = new \TheTwelve\Foursquare\ApiGatewayFactory($client, $redirector);
$factory->setClientCredentials(FSQR_CLIENT_ID, FSQR_CLIENT_SECRET);
$factory->setEndpointUri('https://api.foursquare.com');
$factory->useVersion(2);

$venueList = array();
foreach ($foodLists as $foodType => $foodCategory) {
    $gateway = $factory->getListGateway($foodCategory);
	$list = $gateway->getList();
	if (isset($list->listItems) && $list->listItems->count > 0) {
		foreach ($list->listItems->items as $item) {
			$v = Venue::createFromList($item, $foodType);
            $venueList[$item->id] = $v;
		}
	}
}
uasort($venueList, VenueOrdering::create()->ordering());
echo "[" . json_encode($venueList) . "]";
