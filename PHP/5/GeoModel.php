<?php


namespace App\Models\Main;


use App\Models\BaseModel;

class GeoModel extends BaseModel
{

    protected $table = 'countries';

    protected $primaryKey = 'id';

    protected $returnType = 'array';


    /**
     * Get countries or find by id
     * 
     * @param int $id
     * @return array|bool
     */
    public function getCountry($id = 0) {
        if ($id) {
            $this->where($this->primaryKey, $id);
        }

        if ($items = $this->select("id, title_{$this->locale} country_name")->orderBy($this->primaryKey, 'asc')->get()->getResultArray()) {
            $result = [];
            foreach ($items as $item) {
                $result[$item['id']] = $item;
            }

            return $result;
        }
        return false;
    }

    /**
     * Find similar country
     *
     * @param $country
     * @return array|bool
     */
    public function findCountry($country) {
        if ($country) {
            if ($items = $this->select('*')
                ->like("{$this->locale}" , $country, 'before')
                ->orderBy($this->primaryKey, 'asc')
                ->get()->getResultArray()
            ) {
                $result = [];
                foreach ($items as $item) {
                    $result[$item['id']] = $item;
                }

                return $result;
            }
            return false;
        }
        return false;
    }


    /**
     * Get regions for country
     *
     * @param $country_id
     * @return array|bool
     */
    public function getRegions($country_id) {
        $query = $this->db->table('regions');
        if ($country_id) {
            $query->where('country_id', intval($country_id));
        }

        if ($items = $query->select('*')->orderBy("title_{$this->locale}", 'asc')->get()->getResultArray()) {
            $result = [];
            foreach ($items as $item) {
                $result[$item['id']] = $item;
            }

            return $result;
        }
        return false;
    }

    /**
     * Get cities for country and region
     *
     * @param $country_id
     * @param $region_id
     * @return array|bool
     */
    public function getCities($country_id, $region_id) {
        if ($country_id && $region_id) {
            $query = $this->db->table('cities');
            $query->where('country_id', intval($country_id))
                  ->where('region_id', intval($region_id));

            $query->select("id, title_{$this->locale}, area_{$this->locale}")
                  ->orderBy('important', 'DESC')
                  ->orderBy("title_{$this->locale}", 'asc');

            if ($items = $query->get()->getResultArray()) {
                // get important cities before region
                $important = $this->db
                        ->table('cities')
                        ->select("id, title_{$this->locale}, area_{$this->locale}")
                        ->where('country_id', intval($country_id))
                        ->where('important', 1)
                        ->orderBy('id', 'ASC')
                        ->orderBy("title_{$this->locale}", 'ASC')
                        ->get()->getResultArray();

                return $important + $items;
            }
        }
        return false;
    }

}