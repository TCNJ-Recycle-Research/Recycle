jQuery(function(){

    var email;
    var submitted = false;
    
    function printError(elemId, hintMsg) {
        document.getElementById(elemId).innerHTML = hintMsg;
    }

    $(document).on("submit", "#reset-form", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){

            submitted = true;

            email = $("#email").val();

            if(email == ""){
              printError("email-error", "Please enter your email address");

              submitted = false;
            }
            else{

                printError("email-error", "");
                
                var obj = {func: "generate_reset", email: email};

                $.post("http://recycle.hpc.tcnj.edu/php/password-resets-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){

                        failureAlert("Password Reset Request Failed!", "Server request was missing required input!", false);
                    }

                    submitted = false;
                    
                }, "json").fail(function(xhr, thrownError) {
                        console.log(xhr.status);
                        console.log(thrownError);
                });

                successAlert("If the email entered matches an existing account, a password reset email will be sent within a few minutes.", "", false);
                $("#reset-form")[0].reset();
            }

        }


    });

});
