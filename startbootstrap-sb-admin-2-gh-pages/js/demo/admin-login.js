jQuery(function(){

    var userEmail, userPwd;
    var submitted = false;

    $(document).on("submit", "#admin-login", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){
            
            submitted = true;

            userEmail = $("#email-input").val();
            userPwd = $("#password-input").val();

            if(userEmail == '' || userPwd == ''){
                console.log("Login info missing input");
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
                        console.log("Missing post data input");
                        
                    }
                    else{
                        // output failure message 
                        console.log("Login Failed, incorrect email or password!");
                        
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