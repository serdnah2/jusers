<?php

include "conexion.php";
$conextion = new Conexion();
$getConnect = $conextion->checkConnect();
$succeed = 0;
$error = 0;
$arrayPictures = array();
$user = $_GET['usr'];
foreach ($_FILES["img"]["error"] as $key => $value) {
    if ($value == UPLOAD_ERR_OK) {
        $succeed++;
        // get the image original name
        $name = $_FILES["img"]["name"][$key];
        // get some specs of the images
        $arr_image_details = getimagesize($_FILES["img"]["tmp_name"][$key]);
        $width = $arr_image_details[0];
        $height = $arr_image_details[1];
        $mime = $arr_image_details['mime'];
        // Replace the images to a new nice location. Note the use of copy() instead of move_uploaded_file(). I did this becouse the copy function will replace with the good file rights and  move_uploaded_file will not shame on you move_uploaded_file.
        $idImage = uniqid('ju_');
        copy($_FILES['img']['tmp_name'][$key], '../img/pictures/' . $idImage . $name);
        $linkImage = 'img/pictures/' . $idImage . $name;
        $insert = mysql_query("INSERT INTO images (idimages,iduser,description,link) VALUES (NULL, '{$user}', 'NULL', '{$linkImage}')");

        $result = mysql_query("SELECT * FROM images WHERE link = '$linkImage'");
        $idimages = null;
        while ($r = mysql_fetch_assoc($result)) {
            $idimages = $r['idimages'];
        }

        $insertNew = mysql_query("INSERT INTO news (idnews,type,iduser,iduserto,idpicture,comment) VALUES (NULL,'3', '{$user}', '{$user}' , '{$idimages}', 'none')") or die(mysql_error());

        $array = array(
            "link" => 'img/pictures/' . $idImage . $name
        );
        array_push($arrayPictures, $array);
    } else {
        $error++;
    }
}

if ($error > 0) {
    $array = array(
        "error" => "un error ha ocurrido al momento de subir a imágen"
    );
    print json_encode($array);
} else {
    print json_encode($arrayPictures);
}