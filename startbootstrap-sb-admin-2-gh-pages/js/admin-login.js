<<<<<<< HEAD:startbootstrap-sb-admin-2-gh-pages/js/demo/admin-login.js
function printError(elemId, hintMsg) {
    document.getElementById(elemId).innerHTML = hintMsg;
}

jQuery(function(){

    var userEmail, userPwd;
    var submitted = false;
    var emailErr = passwordError = true;

    $(document).on("submit", "#admin-login", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){

            submitted = true;

            userEmail = $("#email-input").val();
            userPwd = $("#password-input").val();

            if(userEmail == ''){
              printError("emailErr", "  Please enter your email address");
            }else{
              printError("emailErr", "");
              emailErr = false;
            }

            if(userPwd == ''){
              printError("passwordError", "  Please enter your password");
            }

            else{

                var obj = {func: "try_login", email: userEmail, password: userPwd};

                $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

                    // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                    if(response["loginSuccess"]){

                        // output success and move to next html page
                        console.log("Login Success");

                        //set the session on the login page
                        sessionStorage.setItem("loggedIn", true);

                        var loc = window.location.pathname;
                        var dir = loc.substring(0, loc.lastIndexOf('/'));
                        // Go to the material listing page where we will load in the info associated with the material ID
                        window.location.href = dir + "/index.html";
                    }
                    else if(response["missingInput"]){

                        // output missing info
                        alert("Missing post data input");
                        // console.log("Missing post data input");

                    }
                    else{
                        // output failure message
                        printError("emailErr", "Login Failed, incorrect email or password!");
                        printError("passwordError", "Login Failed, incorrect email or password!");
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
=======
function printError(elemId, hintMsg) {
    document.getElementById(elemId).innerHTML = hintMsg;
}

jQuery(function(){

    var userEmail, userPwd;
    var submitted = false;
    var emailErr = passwordError = true;

    $(document).on("submit", "#admin-login", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){

            submitted = true;

            userEmail = $("#email-input").val();
            userPwd = $("#password-input").val();

            if(userEmail == ''){
              printError("emailErr", "  Please enter your email address");
            }else{
              printError("emailErr", "");
              emailErr = false;
            }

            if(userPwd == ''){
              printError("passwordError", "  Please enter your password");
            }
            // }else{
            //   printError("passwordError", "");
            //   passwordError = false;
            // }
            // if(userEmail == '' || userPwd == ''){
            //     setErrorFor(userEmail, 'Username cannot be blank');
            //     //alert("Login info missing input");
            //     //console.log("Login info missing input");
            // }
            else{

                var obj = {func: "try_login", email: userEmail, password: userPwd};

                $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

                    // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                    if(response["loginSuccess"]){

                        // output success and move to next html page
                        console.log("Login Success");

                        //set the session on the login page
                        sessionStorage.setItem("loggedIn", true);

                        var loc = window.location.pathname;
                        var dir = loc.substring(0, loc.lastIndexOf('/'));
                        // Go to the material listing page where we will load in the info associated with the material ID
                        window.location.href = dir + "/index.html";
                    }
                    else if(response["missingInput"]){

                        // output missing info
                        alert("Missing post data input");
                        // console.log("Missing post data input");

                    }
                    else{
                        // output failure message
                        //setErrorFor("Login Failed, incorrect email or password!");
                        //alert("Login Failed, incorrect email or password!");
                        //console.log("Login Failed, incorrect email or password!");
                        printError("emailErr", "Login Failed, incorrect email or password!");
                        printError("passwordError", "Login Failed, incorrect email or password!");
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
>>>>>>> ca14193bf87902c77ae76965415f68fdedfaf67d:startbootstrap-sb-admin-2-gh-pages/js/admin-login.js
