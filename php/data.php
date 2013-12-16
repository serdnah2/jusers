<?php

error_reporting(0);

class Data {

    private $file = "../data/data.json";
    public $messages = array(
        1 => "error al conectarse con el usuario establecido",
        2 => "No se ha podido establecer la conexi&oacute;n a la base de datos con la informaci&oacute;n establecida",
        3 => "Ha ocurrido un error al momento de guardar los datos",
        4 => "El archivo <b>data.json</b> no tiene permisos suficientes",
        5 => "No se ha podido crear la base de datos con la informaci&oacute;n ingresada"
    );
    private $host = "";
    private $user = "";
    private $pass = "";
    private $base = "";
    private $error = false;

    public function __construct($host, $user, $pass, $base) {
        $this->host = $host;
        $this->user = $user;
        $this->pass = $pass;
        $this->base = $base;
    }

    public function createDataBase() {
        $connect = mysql_connect($this->host, $this->user, $this->pass);
        $createDatabse = mysql_query("CREATE DATABASE IF NOT EXISTS $this->base", $connect);
        if ($createDatabse) {
            return true;
        } else {
            return false;
        }
    }

    public function createTables() {
        $con = mysqli_connect($this->host, $this->user, $this->pass, $this->base);
        $sqlComments = "CREATE TABLE IF NOT EXISTS comments (
            idcomments int(11) NOT NULL AUTO_INCREMENT,
            idusercommented int(255) DEFAULT NULL,
            idimage int(255) DEFAULT NULL,
            comment varchar(500) DEFAULT NULL,
            time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (idcomments)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

        $sqlCommentsProfile = "CREATE TABLE IF NOT EXISTS comments_profile (
            idcomment int(11) NOT NULL AUTO_INCREMENT,
            iduser int(11) DEFAULT NULL,
            iduserposted int(11) DEFAULT NULL,
            comment varchar(45) DEFAULT NULL,
            time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (idcomment)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

        $sqlImages = "CREATE TABLE IF NOT EXISTS images (
            idimages int(11) NOT NULL AUTO_INCREMENT,
            iduser int(255) DEFAULT NULL,
            description varchar(500) DEFAULT NULL,
            link varchar(500) DEFAULT NULL,
            time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (idimages),
            UNIQUE KEY idimages_UNIQUE (idimages)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

        $sqlNews = "CREATE TABLE IF NOT EXISTS news (
            idnews int(11) NOT NULL AUTO_INCREMENT,
            time timestamp NULL DEFAULT CURRENT_TIMESTAMP,
            type int(11) DEFAULT NULL,
            iduser int(11) DEFAULT NULL,
            iduserto int(11) DEFAULT NULL,
            idpicture int(11) DEFAULT NULL,
            comment varchar(255) DEFAULT 'none',
            PRIMARY KEY (idnews)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

        $sqlUsers = "CREATE TABLE IF NOT EXISTS users (
            id int(11) NOT NULL AUTO_INCREMENT,
            username varchar(255) DEFAULT NULL,
            password varchar(255) DEFAULT NULL,
            email varchar(255) DEFAULT NULL,
            city varchar(255) DEFAULT NULL,
            description varchar(255) DEFAULT NULL,
            userpicture varchar(255) DEFAULT NULL,
            PRIMARY KEY (id)
          ) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;";

        $tableComments = mysqli_query($con, $sqlComments);
        $tableCommentsProfile = mysqli_query($con, $sqlCommentsProfile);
        $tableImages = mysqli_query($con, $sqlImages);
        $tableNews = mysqli_query($con, $sqlNews);
        $tableUsers = mysqli_query($con, $sqlUsers);

        if ($tableComments && $tableCommentsProfile && $tableImages && $tableNews && $tableUsers) {
            return true;
        } else {
            return false;
        }
    }

    public function init() {
        $checkDataUser = mysql_connect($this->host, $this->user, $this->pass);
        $checkDataBase = mysql_select_db($this->base, $checkDataUser);
        if (!$checkDataUser) {
            $this->error = true;
            $this->error('1');
            exit();
        }
        if (!$checkDataBase) {
            $this->error = true;
            $this->error('2');
            exit();
        }
        if (!$this->error) {
            $obj = array(
                "db_host" => $this->host,
                "db_user" => $this->user,
                "db_password" => $this->pass,
                "db_base" => $this->base,
            );
            $save = file_put_contents($this->file, json_encode($obj));
            $table = $this->createTables();
            if ($save && $table) {
                $obj = array(
                    "success" => "La conexi&oacute;n se ha establecido correctamente"
                );
                print json_encode($obj);
            } else {
                is_writable($this->file) ? $this->error('3') : $this->error('4');
            }
        }
    }

    public function error($code) {
        $array = array(
            "error" => "Guardando",
            "code" => $code,
            "description" => $this->messages[$code]
        );
        print json_encode($array);
    }

}

$data = new Data($_POST['host'], $_POST['user'], $_POST['pass'], $_POST['base']);
$createDataBase = $data->createDataBase();
if ($createDataBase) {
    $data->init();
} else {
    $array = array(
        "error" => "Conectando...",
        "code" => "5",
        "description" => $data->messages["5"]
    );
    print json_encode($array);
}
