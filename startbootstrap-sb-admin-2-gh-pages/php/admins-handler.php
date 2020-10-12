<?php
    // Enable cors to allow cross origin requests which will allow Ionic app to call these scripts
    //require_once "cors.php";
    require_once "admins-table.php";
    
    $postContents = file_get_contents("php://input");
    $postData = json_decode($postContents, true);

    $functionCall = $postData['func'];

    switch($functionCall){

        case ("sign_up"):    
            sign_up($postData);
        break;
        case ("try_login"):    
            try_login($postData);
        break;
        default:
        break;

    }

    function sign_up($postData){

        $adminsTable = Admins::get_instance();

        $jsonResponse = array("missingInput" => false, "signupSuccess" => false);

        if(empty($postData['email']) || empty($postData['password']) || empty($postData['firstName']) || empty($postData['lastName'])){
            $jsonResponse["missingInput"] = true;
        }
        else{
            $email = $postData['email'];
            $password = $postData['password'];
            $firstName = $postData['firstName'];
            $lastName = $postData['lastName'];

            $signupSuccess = $adminsTable->add_admin($email, $password, $firstName, $lastName);
                
            if($signupSuccess)
            {   $jsonResponse["signupSuccess"] = true;   }

        }
        
        echo json_encode($jsonResponse);
    }

    function try_login($postData){

        $adminsTable = Admins::get_instance();

        $jsonResponse = array("missingInput" => false, "loginSuccess" => false);

        if(empty($postData['email']) || empty($postData['password'])){
            $jsonResponse["missingInput"] = true;
        }
        else{
            $email = (string)$postData['email'];
            $rawPassword = (string)$postData['password'];

            $loginSuccess = $adminsTable->verify_admin($email, $rawPassword);

            if($loginSuccess)
            {   $jsonResponse["loginSuccess"] = true;   }
            
        }

        echo json_encode($jsonResponse);
    }

?>