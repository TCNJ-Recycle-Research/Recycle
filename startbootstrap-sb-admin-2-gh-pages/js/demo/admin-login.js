$(document).ready(function(){

    var userEmail, userPwd, usersName;
    var submitted = false;

    $("#admin-login").submit(function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){
            
            submitted = true;
            console.log("Submit");

            userEmail = $("#email-input").val();
            userPwd = $("#password-input").val();

            $.post("php/admins-handler.php", {func: "try_login", email: userEmail, password: userPwd}, function(response) {

                // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                if(response.loginSuccess){

                    // output success and move to next html page
                    console.log("Login Success");
                    alert("Success");
                    //set the session on the login page
                    sessionStorage.setItem("loggedIn", true);

                    var loc = window.location.pathname;
                    var dir = loc.substring(0, loc.lastIndexOf('/'));
                    // Go to the material listing page where we will load in the info associated with the material ID
                    window.location.href = dir + "/index.html";
                }
                else if(response.missingInput){

                    // output missing info
                    console.log("Login info missing input");
                    alert("Login info missing input");
                }
                else{
                    // output failure message 
                    console.log("Login Failed");
                    alert("Email or password incorrect");
                }

                submitted = false;

            }, "json").fail(function(xhr, ajaxOptions, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
            
        }


    });



});