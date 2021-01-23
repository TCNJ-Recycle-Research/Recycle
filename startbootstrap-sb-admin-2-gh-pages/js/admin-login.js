jQuery(function(){

    var userEmail, userPassword;
    var submitted = false, isValid = false;

    function printError(elemId, hintMsg) {
        document.getElementById(elemId).innerHTML = hintMsg;
    }

    $(document).on("submit", "#admin-login", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        isValid = true;

        if(!submitted){

            submitted = true;

            userEmail = $("#email-input").val();
            userPassword = $("#password-input").val();

            if(userEmail == ''){
              printError("email-error", "Please enter your email address");
              isValid = false;
            }
            else{
                printError("email-error", "");
            }

            if(userPassword == ''){
              printError("password-error", "Please enter your password");
              isValid = false;
            }
            else{
                printError("password-error", "");
            }

            if(!isValid){
                submitted = false;
            }
            else{

                var obj = {func: "try_login", email: userEmail, password: userPassword};

                $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

                    // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                    if(response["loginSuccess"]){

                        //set the session on the login page
                        sessionStorage.setItem("loggedIn", true);
                        sessionStorage.setItem("adminName", response["adminName"]);

                        var loc = window.location.pathname;
                        var dir = loc.substring(0, loc.lastIndexOf('/'));

                        window.location.href = dir + "/index.html";
                    }
                    else if(response["missingInput"]){
                        failureAlert("Login Failed!", "Server request was missing required input!", false);
                    }
                    else{
                        failureAlert("Login Failed!", "Incorrect email or password entered!", false);
                    }

                    
                }, "json").fail(function(xhr, thrownError) {
                        console.log(xhr.status);
                        console.log(thrownError);
                });
            }

            submitted = false;

        }

    });


});
