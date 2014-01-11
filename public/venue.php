<?php

use App\Foursquare\Venue;

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

$venueId = $_POST['id'];
$gateway = $factory->getVenuesGateway();
try {
    $venueData = $gateway->getVenue($venueId);
    $venue = Venue::createDetailed($venueData);
    echo json_encode($venue);
} catch (Exception $e) {
    exit("");
}
