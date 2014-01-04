<?php

namespace App\Foursquare;

use DateTime;

class VenueOrdering
{
    /**
     * @var DateTime
     */
    private $dateNow;

    public static function create()
    {
        return new self(
            new DateTime('now')
        );
    }

    /**
     * @param DateTime $date
     */
    public function __construct($date)
    {
        $this->dateNow = $date;
    }

    /**
     * @return callable
     */
    public function ordering()
    {
        $hour = (int) $this->dateNow->format('G');
        $isWorkHour = $this->isWorkHour($hour);
        $isWorkDay = $this->isWorkDay($this->dateNow);

        return function($a, $b) use ($isWorkDay, $isWorkHour)
        {
            if ($isWorkDay && $isWorkHour) {
                return $this->orderByLikeCount($a, $b);
            }

            return $this->orderByNightLife($a, $b);
        };
    }

    /**
     * @param int $hour
     * @return bool
     */
    private function isWorkHour($hour)
    {
        return 6 < $hour && $hour < 17;
    }

    /**
     * @param DateTime $date
     * @return bool
     */
    private function isWorkDay($date)
    {
        return !(date('N', $date->getTimestamp()) >= 6);
    }

    /**
     * @param Venue $a
     * @param Venue $b
     * @return int
     */
    private function orderByLikeCount(Venue $a, Venue $b) {
        if ($a->likeCount == $b->likeCount) {
            return 0;
        }
        return ($a->likeCount < $b->likeCount) ? 1 : -1;
    }

    /**
     * @param Venue $a
     * @param Venue $b
     * @return int
     */
    private function orderByNightLife(Venue $a, Venue $b) {
        if ($a->hereNow == $b->hereNow) {
            return $this->orderByLikeCount($a, $b);
        }
        return ($a->hereNow < $b->hereNow) ? 1 : -1;
    }
}
