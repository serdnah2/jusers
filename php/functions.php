<?php

error_reporting(0);

class Functions {

    public function checkConnection() {
        include "conexion.php";
        $conextion = new Conexion();
        $getConnect = $conextion->checkConnect();
        if ($getConnect['connected']) {
            if (isset($_GET['function'])) {
                $this->call();
            } else {
                $array = array(
                    "description" => "Please set a function"
                );
                print json_encode($array);
            }
        }
    }

    public function call() {
        $function = $_GET['function'];
        if (method_exists($this, $function)) {
            call_user_func(array($this, $function));
        } else {
            $array = array(
                "error" => "get function",
                "code" => "6",
                "description" => "El m&eacute;todo " . $function . "() no existe"
            );
            print json_encode($array);
        }
    }

    public function returnData($result, $message) {
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $rows[] = $r;
        }
        $total = count($rows);
        if ($total > 0) {
            print json_encode($rows);
        } else {
            $array = array(
                "error" => $message
            );
            print json_encode($array);
            return;
        }
        return;
    }

    public function getDataImage($idPicture) {
        $result = mysql_query("SELECT * FROM images WHERE idimages = '$idPicture'");
        $array = null;
        while ($r = mysql_fetch_assoc($result)) {
            $array = array(
                "idimages" => $r['idimages'],
                "iduser" => $r['iduser'],
                "link" => $r['link']
            );
        }
        return $array;
    }

    public function login() {
        $username = $_GET['username'];
        $password = $_GET['password'];
        $result = mysql_query("SELECT * FROM users WHERE username = '$username' AND password = '$password' ");
        if ($result) {
            $this->returnData($result, "El usuario o la contraseña son incorrectos");
        }
    }

    public function createUser() {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $city = $_POST['city'];
        $description = $_POST['description'];
        $password = $_POST['password'];

        $validateUser = mysql_query("SELECT id FROM users WHERE username = '$username'");
        $rows = Array();
        while ($r = mysql_fetch_assoc($validateUser)) {
            $rows[] = $r;
        }
        $total = count($rows);
        if ($total > 0) {
            $array = array(
                "error" => "Usuario ya existe",
            );
            print json_encode($array);
            return;
        } else {
            if (!empty($username) && !empty($email) && !empty($city) && !empty($description) && !empty($password)) {
                $insert = mysql_query("INSERT INTO users (id,username,password,email,city,description,userpicture) VALUES (NULL, '{$username}', '{$password}', '{$email}', '{$city}', '{$description}', 'img/default.png')") or die(mysql_error());
                if ($insert) {
                    $array = array(
                        "success" => "Usuario creado correctamente",
                    );
                    print json_encode($array);
                    return;
                }
            } else {
                $array = array(
                    "error" => "Por favor ingresa todos los datos",
                );
                print json_encode($array);
                return;
            }
        }
    }

    public function getImagesUser() {
        $user = $_GET['user'];
        $result = mysql_query("SELECT * FROM images WHERE iduser = '$user' ORDER BY idimages DESC");
        if ($result) {
            $this->returnData($result, "A&uacute;n no tienes fotos");
        }
    }

    public function addDescription() {
        $idPicture = $_GET['id'];
        $description = $_GET['description'];
        $result = mysql_query("UPDATE images SET description = '$description' WHERE idimages = '$idPicture'");
        if ($result) {
            $array = array(
                "success" => "La descripci&oacute;n ha sido actualizada",
            );
            print json_encode($array);
            return;
        }
    }

    public function deleteImage() {
        $idPicture = $_GET['id'];
        $result = mysql_query("SELECT * FROM images WHERE idimages = '$idPicture'");
        while ($row = mysql_fetch_array($result)) {
            $link = $row['link'];
            $idUser = $row['iduser'];
            $deltePicture = unlink('../' . $link);
            $result = mysql_query("DELETE FROM images WHERE idimages = '$idPicture' ");
            $resultDeleteComments = mysql_query("DELETE FROM comments WHERE idimage = '$idPicture' ");
            $resultDeleteNews = mysql_query("DELETE FROM news WHERE idpicture = '$idPicture' ");

            $resultValidate = mysql_query("SELECT * FROM users WHERE userpicture = '$link'");
            $validate = false;
            while ($rowValidate = mysql_fetch_array($resultValidate)) {
                $validate = true;
                $result = mysql_query("UPDATE users SET userpicture = 'img/default.png' WHERE id = '$idUser'");
            }

            if ($deltePicture && $result && $resultDeleteComments && $resultDeleteNews) {
                $array = array(
                    "success" => "La im&aacute;gen se elimin&oacute; correctamente",
                    "validate" => $validate
                );
                print json_encode($array);
                return;
            } else {
                $array = array(
                    "error" => "La im&aacute;gen no se pudo eliminar",
                );
                print json_encode($array);
                return;
            }
        }
    }

    public function getInfo() {
        $idUser = $_GET['id'];
        $result = mysql_query("SELECT username,email,city,description,userpicture FROM users WHERE id = '$idUser'");
        if ($result) {
            $this->returnData($result, "No tienes informaci&oacute;n");
        }
    }

    public function getCurrentPosition($idpicture, $imagesData, $total) {
        for ($i = 1; $i <= $total; $i++) {
            if ($idpicture == $imagesData[$i]) {
                return $array = array(
                    "prev" => $imagesData[$i - 1],
                    "next" => $imagesData[$i + 1],
                );
            }
        }
    }

    public function checkImage($idpicture, $iduser) {
        $imagesData = array();
        $result = mysql_query("SELECT * FROM images WHERE iduser = '$iduser'");
        $resultImages = mysql_query("SELECT * FROM images WHERE iduser = '$iduser' AND idimages = '$idpicture' ");
        $rows = array();
        $message = null;
        $prev = null;
        $next = null;
        while ($rImages = mysql_fetch_assoc($resultImages)) {
            $rows[] = $rImages;
        }
        $totalImages = count($rows);
        if ($totalImages > 0) {
            while ($r = mysql_fetch_assoc($result)) {
                $current = ($current + 1);
                $imagesData[$current] = $r['idimages'];
            }
            $total = count($imagesData);
            if ($idpicture == $imagesData[1]) {
                $prev = $imagesData[$total];
                $next = $imagesData[2];
                $message = "first";
            } else if ($idpicture == $imagesData[$total]) {
                $prev = $imagesData[$total - 1];
                $next = $imagesData[1];
                $message = "last";
            } else {
                $data = $this->getCurrentPosition($idpicture, $imagesData, $total);
                $prev = $data['prev'];
                $next = $data['next'];
                $message = "next";
            }
            return $array = array(
                "validate" => $message,
                "prev" => $prev,
                "next" => $next
            );
        }

        return $message;
    }

    public function slidePictures() {
        $idpicture = $_GET['idpicture'];
        $iduser = $_GET['iduser'];
        $result = mysql_query("SELECT * FROM images WHERE idimages = '$idpicture'");
        $validate = $this->checkImage($idpicture, $iduser);
        if ($validate != null) {
            $rows = array();
            while ($r = mysql_fetch_assoc($result)) {
                $rows[] = $r;
            }
            $array = array(
                "pagination" => $validate,
                "data" => $rows
            );
            print json_encode($array);
        } else {
            $array = array(
                "error" => 'Esta im&aacute;gen no existe'
            );
            print json_encode($array);
            return;
        }
    }

    public function getDataUser($id) {
        $result = mysql_query("SELECT id,username,userpicture FROM users WHERE id = '$id'");
        $array = null;
        while ($r = mysql_fetch_assoc($result)) {
            $array = array(
                "id" => $r['id'],
                "username" => $r['username'],
                "userpicture" => $r['userpicture']
            );
        }
        return $array;
    }

    public function getComments() {
        $idpicture = $_GET['idpicture'];
        $iduser = $_GET['iduser'];
        $page = $_GET['page'];

        $totalItems = 10;
        $limit = ($totalItems * $page);

        $result = mysql_query("SELECT * FROM comments WHERE idimage = '$idpicture' ORDER BY time DESC LIMIT $limit , $totalItems");
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $id = $r['idusercommented'];
            $user = $this->getDataUser($id);
            $arrayLocal = array(
                "idcomment" => $r['idcomments'],
                "idusercommented" => $id,
                "username" => $user['username'],
                "userpicture" => $user['userpicture'],
                "comment" => $r['comment'],
                "time" => $r['time']
            );
            $rows[] = $arrayLocal;
        }
        $total = count($rows);
        if ($total > 0) {
            print json_encode($rows);
        } else {
            $array = array(
                "error" => 'No existen comentarios en esta im&aacute;gen'
            );
            print json_encode($array);
            return;
        }
        return;
    }

    public function newComment() {
        $idpicture = $_GET['idpicture'];
        $iduser = $_GET['iduser'];
        $comment = $_POST['comment'];

        $insert = mysql_query("INSERT INTO comments (idcomments,idusercommented,idimage,comment) VALUES (NULL, '{$iduser}', '{$idpicture}', '{$comment}')") or die(mysql_error());
        $pictureInfo = $this->getDataImage($idpicture);
        $insertNew = mysql_query("INSERT INTO news (idnews,type,iduser,iduserto,idpicture, comment) VALUES (NULL,'2', '{$iduser}', '{$pictureInfo['iduser']}' , '{$idpicture}', '{$comment}')") or die(mysql_error());
        if ($insert && $insertNew) {
            $user = $this->getDataUser($iduser);
            $array = array(
                "complete" => "Se ha agregado tu comentario",
                "data" => $user
            );
            print json_encode($array);
            return;
        } else {
            echo 'error';
        }
    }

    public function getCommentProfile() {
        $iduser = $_GET['iduser'];
        $page = $_GET['page'];

        $totalItems = 10;
        $limit = ($totalItems * $page);

        $result = mysql_query("SELECT * FROM comments_profile WHERE iduser = '$iduser' ORDER BY time DESC LIMIT $limit , $totalItems");
        $rows = array();
        while ($r = mysql_fetch_assoc($result)) {
            $id = $r['iduserposted'];
            $user = $this->getDataUser($id);
            $arrayLocal = array(
                "idcomment" => $r['idcomment'],
                "idusercommented" => $id,
                "username" => $user['username'],
                "userpicture" => $user['userpicture'],
                "comment" => $r['comment'],
                "time" => $r['time']
            );
            $rows[] = $arrayLocal;
        }
        $total = count($rows);
        if ($total > 0) {
            print json_encode($rows);
        } else {
            $array = array(
                "error" => 'No existen comentarios'
            );
            print json_encode($array);
            return;
        }
        return;
    }

    public function newCommentProfile() {
        $iduserposted = $_GET['iduserposted'];
        $iduser = $_GET['iduser'];
        $comment = $_POST['comment'];

        $insert = mysql_query("INSERT INTO comments_profile (idcomment,iduser,iduserposted,comment) VALUES (NULL, '{$iduser}', '{$iduserposted}', '{$comment}')") or die(mysql_error());
        $insertNew = mysql_query("INSERT INTO news (idnews,type,iduser,iduserto,idpicture, comment) VALUES (NULL,'1', '{$iduserposted}', '{$iduser}' , 'NULL', '{$comment}' )") or die(mysql_error());
        if ($insert && $insertNew) {
            $user = $this->getDataUser($iduserposted);
            $array = array(
                "complete" => "Se ha agregado tu comentario",
                "data" => $user
            );
            print json_encode($array);
            return;
        } else {
            echo 'error';
        }
    }

    public function editDescription() {
        $username = $_POST['username'];
        $email = $_POST['email'];
        $city = $_POST['city'];
        $description = $_POST['description'];
        $iduser = $_POST['iduser'];
        $result = mysql_query("UPDATE users SET username = '$username', email = '$email', city = '$city', description = '$description' WHERE id = '$iduser'");
        if ($result) {
            $array = array(
                "success" => "La descripci&oacute;n ha sido actualizada",
            );
            print json_encode($array);
            return;
        }
    }

    public function changePassword() {
        $actualPassword = $_POST['actualPassword'];
        $password = $_POST['newPassword'];
        $iduser = $_POST['iduser'];

        $result = mysql_query("SELECT id FROM users WHERE password = '$actualPassword' AND id = '$iduser' ");
        if ($result) {
            $rows = array();
            while ($r = mysql_fetch_assoc($result)) {
                $rows[] = $r;
            }
            $total = count($rows);
            if ($total > 0) {
                $resultPass = mysql_query("UPDATE users SET password = '$password' WHERE password = '$actualPassword' AND id = '$iduser' ");
                $array = array(
                    "success" => "La contrase&ntilde;a ha sido actualizada",
                );
                print json_encode($array);
                return;
            } else {
                $array = array(
                    "error" => "La contrase&ntilde;a es incorrecta",
                );
                print json_encode($array);
                return;
            }
        }
    }

    public function setPictureProfile() {
        $idpicture = $_GET['idpicture'];
        $id = $_GET['id'];

        $result = mysql_query("SELECT link FROM images WHERE idimages = '$idpicture' AND iduser = '$id' ");
        while ($r = mysql_fetch_assoc($result)) {
            $link = $r['link'];
            $resultUpdate = mysql_query("UPDATE users SET userpicture = '$link' WHERE id = '$id' ");
            if ($resultUpdate) {
                $array = array(
                    "success" => "Im&aacute;gen cambiada correctamente",
                );
                print json_encode($array);
                return;
            }
        }
    }

    public function getNews() {
        $page = $_GET['page'];

        $totalItems = 10;
        $limit = ($totalItems * $page);
        $result = mysql_query("SELECT * FROM news ORDER BY time DESC LIMIT $limit , $totalItems");
        if ($result) {
            $rows = array();
            while ($r = mysql_fetch_assoc($result)) {
                $id = $r['iduser'];
                $user = $this->getDataUser($id);
                $idTo = $r['iduserto'];
                $userTo = $this->getDataUser($idTo);
                $pictureLink = "none";

                if ($r['type'] == 2 || $r['type'] == 3) {
                    $idPicture = $r['idpicture'];
                    $pictureInfo = $this->getDataImage($idPicture);
                    $pictureLink = $pictureInfo['link'];
                    if ($pictureLink === null) {
                        $pictureLink = array(
                            "error" => "Noticia no existe",
                        );
                    } else {
                        $pictureLink = $pictureInfo;
                    }
                } else {
                    $pictureLink = "none";
                }

                $arrayLocal = array(
                    "type" => $r['type'],
                    "username" => $user,
                    "usernameto" => $userTo,
                    "picture" => $pictureLink,
                    "comment" => $r['comment'],
                    "time" => $r['time']
                );
                $rows[] = $arrayLocal;
            }

            $total = count($rows);
            if ($total > 0) {
                print json_encode($rows);
            } else {
                $array = array(
                    "error" => "No existen m&aacute;s noticias recientes",
                );
                print json_encode($array);
            }
        }
    }

    public function checkInstall() {
        $array = array(
            "connected" => "Jusers est&aacute; instalado correctamente"
        );
        print json_encode($array);
    }

    public function init() {
        $this->checkConnection();
    }

}

$functions = new Functions();
$functions->init();
