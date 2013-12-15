<?php

error_reporting(0);

class Conexion {

    private $db_host = "";
    private $db_user = "";
    private $db_password = "";
    private $db_base = "";
    private $file = "../data/data.json";
    private $messages = array(
        1 => "Jusers no se ha instalado",
        2 => "Faltan datos para la conexi&oacute;n a la base de datos",
        3 => "Ha ocurrido un error al intentar conectarse a la base de datos",
        4 => "Jusers no se ha instalado y el archivo data.json no tiene permisos de escritura",
        5 => "Jusers est&aacute; instalado pero faltan datos para la conexi&oacute;n a la base de datos. El archivo data.json no tiene permisos de escritura",
        6 => "No se ha podido hacer conexi&oacute;n con las tablas en la base de datos"
    );

    public function checkConnect() {
        $getJson = file_get_contents($this->file);
        $feedJSON = json_decode($getJson, true);
        if (!empty($feedJSON)) {
            $this->db_host = $feedJSON['db_host'];
            $this->db_user = $feedJSON['db_user'];
            $this->db_password = $feedJSON['db_password'];
            $this->db_base = $feedJSON['db_base'];
            if (($this->db_host && $this->db_user && $this->db_base) &&
                    (!empty($this->db_host) && !empty($this->db_user) && !empty($this->db_base))
            ) {
                $connect = $this->connect();
                return $connect;
            } else {
                is_writable($this->file) ? $this->error('2') : $this->error('5');
            }
        } else {
            is_writable($this->file) ? $this->error('1') : $this->error('4');
        }
    }

    public function connect() {
        $dataUser = mysql_connect($this->db_host, $this->db_user, $this->db_password);
        $dataBase = mysql_select_db($this->db_base, $dataUser);
        if ($dataUser && $dataBase) {
            $comments = mysql_query("DESCRIBE comments");
            $commentsProfile = mysql_query("DESCRIBE comments_profile");
            $commentsImages = mysql_query("DESCRIBE images");
            $commentsNews = mysql_query("DESCRIBE news");
            $commentsUsers = mysql_query("DESCRIBE users");
            if ($comments && $commentsProfile && $commentsImages && $commentsNews && $commentsUsers) {
                $array = array(
                    "connected" => "Conectado a la base de datos"
                );
                return json_encode($array);
            } else {
                $this->error('6');
            }
        } else {
            $this->error('3');
        }
    }

    public function error($code) {
        $array = array(
            "error" => "conectando",
            "code" => $code,
            "description" => $this->messages[$code]
        );
        print json_encode($array);
    }

}
