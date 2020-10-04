<?php

    require_once "admins-table.php";

    $functionCall = $_POST['func'];

    switch($functionCall){

        case ("sign_up"):    
            sign_up();
        break;
        case ("try_login"):    
            try_login();
        break;
        default:
        break;

    }

    function sign_up(){

        $adminsTable = Admins::get_instance();

        if(empty($_POST['email']) || empty($_POST['password']) || empty($_POST['name'])){
            $missingInput = array("missingInput" => true);
            echo json_encode($missingInput);
        }
        else{
            $email = $_POST['email'];
            $rawPassword = $_POST['password'];
            $name = $_POST['name'];

            $signupSuccess = $adminsTable->add_admin($email, $rawPassword, $name);

            $jsonObj = array("signupSuccess" => $signupSuccess);

            echo json_encode($jsonObj);
            
        }
        

    }

    function try_login(){

        $adminsTable = Admins::get_instance();

        if(empty($_POST['email']) || empty($_POST['password'])){
            $missingInput = array("missingInput"=>true);
            echo json_encode($missingInput);
        }
        else{
            $email = (string)$_POST['email'];
            $rawPassword = (string)$_POST['password'];

            $loginSuccess = $adminsTable->verify_admin($email, $rawPassword);

            $jsonObj = array("loginSuccess" => $loginSuccess);

            echo json_encode($jsonObj);
        }

        
        
    }

?>