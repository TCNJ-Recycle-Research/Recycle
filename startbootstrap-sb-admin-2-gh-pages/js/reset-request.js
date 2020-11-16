function printError(elemId, hintMsg) {
    document.getElementById(elemId).innerHTML = hintMsg;
}

jQuery(function(){

    var email;
    var submitted = false;
    var emailErr = submitSuccess = true;

    $(document).on("submit", "#reset-form", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){

            console.log("Submitted");

            submitted = true;

            email = $("#email").val();

            if(email == ''){
              printError("emailErr", "  Please enter your email address");

              submitted = false;
            }
            // }else if(email != ''){
            //   printError("emailErr", "");
            //   //emailErr = false;
            // }

            // if(email === ""){
            //     alert("Missing input");
            //     //console.log("JS side info missing input");
            //     submitted = false;
            // }
            else{

                var obj = {func: "generate_reset", email: email};

                $.post("http://recycle.hpc.tcnj.edu/php/password-resets-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){

                        // output missing info
                        alert("Reset Request missing input");
                        //console.log("Reset Request missing input");
                    }

                    submitted = false;
                    alert("If an account with that email exists and password reset link will be sent");
                    //printError("submitSuccess", "If an account with that email exists and password reset link will be sent");

                }, "json").fail(function(xhr, thrownError) {
                        console.log(xhr.status);
                        console.log(thrownError);
                });
            }



        }


    });




});
