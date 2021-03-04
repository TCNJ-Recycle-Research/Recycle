jQuery(function(){

    var submitted = false, isValid = false;

    function printError(elemId, hintMsg) {
        document.getElementById(elemId).innerHTML = hintMsg;
    }

    $(document).on("submit", "#reset-form", function(e){

        var password, passwordRepeat, select, valid;

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){
            
            submitted = isValid = true;

            password = $("#password").val();
            passwordRepeat = $("#password-repeat").val();

            if(password == ""){
                printError("password-error", "Please enter your password");
                isValid = false;
            }
            else{
                printError("password-error", "");
            }

            if(passwordRepeat == ""){
                printError("password-repeat-error", "Please enter your password");
                isValid = false;
            }
            else{
                printError("password-repeat-error", "");
            }

            if(!(password === passwordRepeat)){
                printError("password-error", "Passwords don't match");
                printError("password-repeat-error", "Passwords don't match");
                isValid = false;
            }

            if(!isValid){
                submitted = false;
            }
            else{
                var queryString = window.location.search;
                var urlParams = new URLSearchParams(queryString);

                if(!urlParams.has('selector') || !urlParams.has('validator')){
                    failureAlert("Password Reset Failed!", 
                    "Please try to send another <a class=\"alert-link\" href=\"forgot-password.html\">password reset request</a>!", false);
                    submitted = false;
                }
                else{

                    select = urlParams.get('selector');
                    valid = urlParams.get('validator');

                    var obj = {func: "verify_reset", password: password, passwordRepeat: passwordRepeat, selector: select, validator: valid};

                    $.post("https://recycle.hpc.tcnj.edu/php/password-resets-handler.php", JSON.stringify(obj), function(response) {


                        // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                        if(response["resetSuccess"]){
                            successAlert("Password Reset Complete!", "Your account password has successfully been changed!", false);
                            $("#reset-form")[0].reset();
                        }
                        else if(response["missingInput"]){
                            failureAlert("Password Reset Failed!", "Server request was missing required input!", false);
                        }
                        else if(response["passwordMismatch"]){
                            failureAlert("Password Reset Failed!", "Server recieved mismatching passwords!", false);
                        }
                        else{
                            failureAlert("Password Reset Failed!", 
                            "Please try to send another <a class=\"alert-link\" href=\"forgot-password.html\">password reset request</a>!", false);
                        }

                        submitted = false;

                    }, "json").fail(function(xhr, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                            submitted = false;
                    });
                }
            }
        }
    });
});
