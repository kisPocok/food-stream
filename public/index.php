<?php

$title       = "Food-Stream";
$appTitle    = "FoodStream";
$description = "We.Are.Providing.Food.";
$url         = "http://" . $_SERVER['HTTP_HOST'];

?><!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title><?=$title; ?></title>
    <meta name="viewport" content="initial-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="<?=$title; ?>">

    <meta name="robots" content="index, nofollow" />
    <meta name="description" content="<?=$description; ?>" />
    <meta property="og:title" content="<?=$title; ?>" />
    <meta property="og:description" content="<?=$description; ?>" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="<?=$url; ?>" />
    <meta property="og:locale" content="hu_HU" />
    <meta property="og:site_name" content="<?=$appTitle; ?>" />
    <meta property="og:image" content="<?=$url; ?>/images/welcome-1100x990-compressed.png" />

    <link rel="shortcut icon" href="images/favicon.png" />
    <link rel="apple-touch-icon" href="apple-touch-icon-57x57-precomposed.png" />
    <link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72-precomposed.png" />
    <link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114-precomposed.png" />
    <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144-precomposed.png" />
    <link rel="canonical" href="<?=$url; ?>" />

	<link rel="stylesheet" href="css/bootstrap.min.css">
	<link rel="stylesheet" href="css/app.css?v=1">
</head>
<body>

<div class="container-full">
	<div class="menu-opener">
		<span></span>
		<span></span>
		<span></span>
		<span></span>
	</div>
	<div class="menubar">
        <div class="page-header">
            <h1><?=$title; ?></h1>
        </div>
        <div id="controll" class="btn-group clearfix">
            <button class="btn btn-danger selected" data-name="breakfast">breakfast</button>
            <button class="btn btn-warning selected" data-name="streetFood">streetfood</button>
            <button class="btn btn-success selected" data-name="businessLunch">business</button>
            <button class="btn btn-caffeine selected" data-name="sugarAndKaffeine">caffeine</button>
        </div>
		<div id="search" class="input-group">
			<input id="search-field" type="text" class="form-control" placeholder="Where do you want to eat?">
                <span class="input-group-btn">
                    <button class="btn btn-default" type="button">
                        <span class="glyphicon glyphicon-search"></span>
                    </button>
                </span>
		</div>
        <div id="places" class="list-group">
            <a href="#" class="list-group-item not-selectable select-category" style="display: none;">
                <span class="glyphicon glyphicon-arrow-up"></span>
                <p>
                    Please, select least 1 category asap.<br />
                    Someone is waiting for food.
                </p>
            </a>
            <a href="#" class="list-group-item not-selectable no-result" style="display: none;">
                <span class="glyphicon glyphicon-arrow-up"></span>
                <p>
                    Wait... WAT? Please, be <b style="display: none;">more </b>simple.<br />
                    Search for company name or location.
                </p>
            </a>
        </div>
	</div>
	<!-- Google map container -->
	<div id="map"><span class="loading">Loading map...</span></div>
</div>

<script src="http://maps.googleapis.com/maps/api/js?key=AIzaSyBTYqceLuszLWf1_yF9CExEitMtvkZQIzE&sensor=true&language=hu&libraries=geometry"></script>
<script src="js/q.min.js"></script>
<script src="https://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="js/bootstrap.min.js"></script>
<script src="js/app.js?v=1"></script>
<script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-46863323-1', 'food-stream.herokuapp.com');
    ga('send', 'pageview');
</script>
</body>
</html>
