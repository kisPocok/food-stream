<?php

namespace App\Foursquare;

class Venue
{
	/**
	 * @var string
	 */
	private $id;

	/**
	 * @var string
	 */
	public $name;

	/**
	 * @var object
	 */
	public $location;

	/**
	 * @var array
	 */
	public $categories = array();

	/**
	 * @var string
	 */
	public $contactPhone;

	/**
	 * @var string
	 */
	public $url;

	/**
	 * @var int
	 */
	public $likeCount = 0;

	/**
	 * @var int
	 */
	public $specialCount = 0;

	/**
	 * @var int
	 */
	public $hereNow = 0;

	/**
	 * @var int
	 */
	public $checkinsCount = 0;

	/**
	 * @var int
	 */
	public $usersCount = 0;

	/**
	 * @var int
	 */
	public $tipCount = 0;

	/**
	 * @var string
	 */
	private $photoUrl;

    /**
     * @param $item
     * @return \App\Foursquare\Venue
     */
	public static function create($item)
	{
		$venue = new self();
		$venue->id            = $item->id;
		$venue->name          = $item->venue->name;
		$venue->contactPhone  = $item->venue->contact->formattedPhone;
		$venue->url           = $item->venue->url;
		$venue->likeCount     = (int) $item->venue->likes->count;
		$venue->specialCount  = (int) $item->venue->specials->count;
		$venue->hereNow       = (int) $item->venue->hereNow->count;
		$venue->checkinsCount = (int) $item->venue->stats->checkinsCount;
		$venue->usersCount    = (int) $item->venue->stats->usersCount;
		$venue->tipCount      = (int) $item->venue->stats->tipCount;
		$venue->categories    = (array) $item->venue->categories;
		$venue->location      = $item->venue->location;
		$venue->photoUrl      = $item->photo->prefix . "%dx%d" . $item->photo->suffix;
		return $venue;
	}

	/**
	 * @param int $width
	 * @param int $height
	 * @return string
	 */
	public function getPhotoUrl($width, $height)
	{
		return sprintf($this->photoUrl, (int) $width, (int) $height);
	}
}
