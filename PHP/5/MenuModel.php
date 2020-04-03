<?php


namespace App\Models\Main;


use App\Models\BaseModel;
use Config\App;

class MenuModel extends BaseModel
{

    protected $table      = 'menu';

    protected $primaryKey = 'id';

    protected $returnType = 'array';

    /**
     * Get list of all category and subcategory
     * @return array|bool
     */
    public function getMenu() {
        if($data = $items = $this->select("id, url, module, icon, title_{$this->locale} title, parent")
            ->where('active', 1)
            ->where('deleted', 0)
            ->orderBy('order', 'ASC')
            ->findAll()
        ) {
            $result = [];

            array_map(function($item) use(&$result) {
                if ($item['parent']) {
                    if (array_key_exists($item['parent'], $result)) {
                        $result[$item['parent']]['child'][$item['id']] = $item;
                    } else {
                        foreach ($result as &$value) {
                            if(array_key_exists($item['parent'], $value['child'])) {
                                $value['child'][$item['parent']]['child'][] = $item;
                            }
                        }
                    }

                }else{
                    $result[$item['id']] = $item;
                }
            }, $data);

            return $result;
        }
        return false;
    }

}