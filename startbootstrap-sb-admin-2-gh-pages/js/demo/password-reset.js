jQuery(function(){

    var submitted = false;

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

            if(email === "" || pwd === "" || pwdRepeat === ""){
                console.log("Reset info missing input");
                submitted = false;
            }
            else if(!(pwd === pwdRepeat)){
                console.log("Passwords don't match");
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
                            console.log("Password Reset Success");

                        }
                        else if(response["missingInput"]){
        
                            // output missing info
                            console.log("Password reset info missing input");
                        }
                        else if(response["passwordMismatch"]){
                            console.log("Passwords don't match");
                        }
                        else{
                            // output failure message 
                            console.log("Password Reset Failed. Please try to send another password reset request!");
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