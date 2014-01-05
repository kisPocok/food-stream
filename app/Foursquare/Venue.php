<?php

namespace App\Foursquare;

class Venue
{
	/**
	 * @var string
	 */
	public $id;

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
    public $formattedPhone;

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
     * @var boolean|null
     */
    public $isOpen = null;

    /**
     * @var string
     */
    public $openingStatus = false;

    /**
     * @var array
     */
    public $openingHours = array();

    /**
     * @var float
     */
    public $rating = 0;

    /**
     * @var string
     */
    public $baseCategory = '';

    /**
     * @var array
     */
    private $attributes = array();

    /**
	 * @var string
	 */
	private $photoUrl;

    /**
     * @param object $data
     * @param string $baseType
     * @return \App\Foursquare\Venue
     */
    public static function createFromList($data, $baseType)
    {
        $venue = self::create($data->venue);
        $venue->photoUrl = $data->photo->prefix . "%dx%d" . $data->photo->suffix;
        $venue->baseCategory = $baseType;
        $venue->previewUrl = $venue->getPhotoUrl(50, 50);
        $venue->screenUrl = $venue->getPhotoUrl(160, 160);
        return $venue;
    }

    /**
     * @param object $data
     * @return \App\Foursquare\Venue
     */
    public static function createDetailed($data)
    {
        $venue = self::create($data);

        $venue->rating        = (float) $data->rating;
        $venue->isOpen        = $data->hours->isOpen;
        $venue->openingStatus = $data->hours->status; // TODO ez addig használható, míg nincs long cache!
        $venue->openingHours  = (array) $data->hours->timeframes;
        $venue->attributes    = $data->attributes->groups;

        $venue->wifi          = $venue->hasWiFi();
        $venue->outdoor       = $venue->hasOutdoorSeating();
        $venue->creditCard    = $venue->isCreditCardAcceptable();

        return $venue;
    }

    /**
     * @param object $data
     * @return \App\Foursquare\Venue
     */
    public static function create($data)
    {
        $venue = new self();
        $venue->id             = $data->id;
        $venue->name           = $data->name;
        $venue->formattedPhone = $data->contact->formattedPhone;
        $venue->contactPhone   = $data->contact->phone;
        $venue->url            = $data->url;
        $venue->likeCount      = (int) $data->likes->count;
        $venue->specialCount   = (int) $data->specials->count;
        $venue->hereNow        = (int) $data->hereNow->count;
        $venue->checkinsCount  = (int) $data->stats->checkinsCount;
        $venue->usersCount     = (int) $data->stats->usersCount;
        $venue->tipCount       = (int) $data->stats->tipCount;
        $venue->categories     = (array) $data->categories;
        $venue->location       = $data->location;
        return $venue;
    }

    /**
     * @return Venue
     */
    public static function createNull()
    {
        return new self();
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

    /**
     * @return bool
     */
    public function hasWiFi()
    {
        return $this->hasAttribute('wifi');
    }

    /**
     * @return bool
     */
    public function hasOutdoorSeating()
    {
        return $this->hasAttribute('outdoorSeating');
    }

    /**
     * @return bool
     */
    public function isCreditCardAcceptable()
    {
        return $this->hasAttribute('payment');
    }

    /**
     * @param string $name
     * @return bool
     */
    private function hasAttribute($name)
    {
        $attribute = $this->getAttribute($name);
        return $attribute
            && count($attribute->items)
            && isset($attribute->items[0])
            && strtolower($attribute->items[0]->displayValue) == 'yes';
    }

    /**
     * @param string $type
     * @return bool
     */
    private function getAttribute($type)
    {
        if (!count($this->attributes)) {
            return false;
        }

        foreach ($this->attributes as $a) {
            if ($a->type == $type) {
                return $a;
            }
        }

        return false;
    }
}
