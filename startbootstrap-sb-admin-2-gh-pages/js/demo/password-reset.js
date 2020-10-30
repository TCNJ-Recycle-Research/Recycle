function printError(elemId, hintMsg) {
    document.getElementById(elemId).innerHTML = hintMsg;
}

jQuery(function(){

    var submitted = false;
    var emailErr = passwordError = passwordRErr = true;

    $(document).on("submit", "#reset-form", function(e){

        var email, pwd, pwdRepeat, select, valid;


        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){
            console.log("submitted");
            submitted = true;

            email = $("#email").val();
            pwd = $("#password").val();
            pwdRepeat = $("#password-repeat").val();


            if(email == ""){
              printError("emailErr", "  Please enter your email address");
            }

            if(pwd == ""){
              printError("passwordError", "  Please enter your password");
            }

            if(pwdRepeat== ""){
              printError("passwordRErr", "  Please enter your password");
            }

            if(!(pwd === pwdRepeat)){
              printError("passwordError", "Passwords don't match");
              printError("passwordRErr", "Passwords don't match");
              //alert("Passwords don't match")
                //console.log("Passwords don't match");
                submitted = false;
            }
            else{

                var queryString = window.location.search;
                var urlParams = new URLSearchParams(queryString);

                if(!urlParams.has('selector') || !urlParams.has('validator')){
                    submitted = false;
                }
                else{

                    select = urlParams.get('selector');
                    valid = urlParams.get('validator');

                    var obj = {func: "verify_reset", email: email, password: pwd, passwordRepeat: pwdRepeat, selector: select, validator: valid};

                    $.post("http://recycle.hpc.tcnj.edu/php/password-resets-handler.php", JSON.stringify(obj), function(response) {

                        // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                        if(response["resetSuccess"]){

                            // output success and move to next html page
                            alert("Password Reset Success");
                            //console.log("Password Reset Success");

                        }
                        else if(response["missingInput"]){

                            // output missing info
                            alert("Password reset info missing input");
                            //console.log("Password reset info missing input");
                        }
                        else if(response["passwordMismatch"]){
                            alert("Passwords don't match");
                            //console.log("Passwords don't match");
                        }
                        else{
                            // output failure message
                            alert("Password Reset Failed. Please try to send another password reset request!");
                            //console.log("Password Reset Failed. Please try to send another password reset request!");
                        }

                        submitted = false;

                    }, "json").fail(function(xhr, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                    });
                }


            }



        }


    });




});
