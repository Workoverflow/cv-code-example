<?php namespace App\Controllers;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 *
 */

use App\Models\Main\MenuModel;
use App\Models\Main\UserModel;
use CodeIgniter\Controller;
use CodeIgniter\Session\Session;
use Config\App;
use Config\Paths;
use Config\Services;

class BaseController extends Controller
{

    /**
     * @var array
     */
    protected $helpers = [];

    /**
     * @var \Smarty
     */
    public $smarty;


    /**
     * @var UserModel
     */
    public $user;

    /**
     * @var Session
     */
    public $session;

    /**
     * @var $lang
     */
    public $lang;

    /**
     * Constructor.
     *
     */
    public function initController(\CodeIgniter\HTTP\RequestInterface $request, \CodeIgniter\HTTP\ResponseInterface $response, \Psr\Log\LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        //--------------------------------------------------------------------
        // Preload any models, libraries, etc, here.
        //--------------------------------------------------------------------
        $this->session = \Config\Services::session();
        $this->user = new UserModel();

        /**
         * Smarty
         */
        $this->initSmarty($request);
        $this->createMenu();
        $this->getLanguage();
    }

    /**
     * Init Smarty
     *
     * @throws \SmartyException
     */
    private function initSmarty($request)
    {
        try {
            $this->smarty = new \Smarty();
            $paths = new Paths();
            $this->smarty->setTemplateDir($paths->viewDirectory . '/');
            $this->smarty->setCompileDir($paths->writableDirectory . '/compiled');
            $this->smarty->setCacheDir($paths->writableDirectory . '/cache');
            $this->smarty->setCaching(false);
            $this->smarty->setDebugging(false);
            $this->smarty->setErrorReporting(E_ALL & ~E_NOTICE);
            $this->smarty->loadFilter('output', 'trimwhitespace');

            // restore aside state
            helper('cookie');
            $this->smarty->assign('aside_state', get_cookie('kt_aside_toggle_state') == 'on' ? 'kt-aside--minimize' : '');

            // assign user info
            $this->smarty->assign("user", $this->session->get('user'));
            $this->smarty->assign("tariff", $this->session->get('tariff'));
            $this->smarty->assign("stations", $this->session->get('stations'));

            // asign CSRF vars
            $this->smarty->assign('csrf_token', csrf_token());
            $this->smarty->assign('csrf_hash', csrf_hash());
            $this->smarty->assign('csrf', csrf_field());

            // asign menu active item
            $segments = $request->uri->getSegments();
            $this->smarty->assign('menu_active', $segments[0]);
            if(count($segments) > 1) {
                $this->smarty->assign('submenu_active', $segments[1]);
            }

            // assign flash messages
            $messages = $fields = [];
            foreach ($this->session->getFlashKeys() as $key) {
                $msg = $this->session->getFlashdata($key);
                if (strpos($key, 'error_') !== false) {
                    $messages[$key] = $msg;
                }

                if (strpos($key, 'field_') !== false) {
                    $fields[$key] = $msg;
                }

            }

            $this->smarty->assign('form', $fields);
            $this->smarty->assign("errors", $messages);
            //TODO: разобраться с исключениями
        } catch (\SmartyException $e) {
            log_message('error', $e->getMessage());
        }

    }

    /**
     * Get user language pack
     *
     * @param array $params - [key:value] array with data to replace in source language string
     */
    public function getLanguage($params = []) {
        $this->lang = Services::language($this->getUserLang())->getLine('app.lang', $params);
        $this->smarty->assign('lang', $this->lang);
        $this->smarty->assign('language', $this->getUserLang());
    }

    /**
     * Get user lang or use auto detected
     *
     * @return array|string|null
     */
    public function getUserLang() {
        if ($this->user->isAuth()) {
            return $this->user->getLang();
        }
        return (new App())->defaultLocale;
    }

    public function createMenu() {
        $this->smarty->assign('menu', (new MenuModel())->getMenu());
    }

}
