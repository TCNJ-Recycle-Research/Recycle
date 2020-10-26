jQuery(function(){

    var userEmail, pwd, pwdRepeat, first, last;
    var submitted = false;

    $(document).on("submit", "#admin-signup", function(e){

        // Prevent form submission which refreshes page
        e.preventDefault();

        if(!submitted){
            
            submitted = true;

            userEmail = $("#email").val();
            pwd = $("#password").val();
            pwdRepeat = $("#password-repeat").val();
            first = $("#first-name").val();
            last = $("#last-name").val();

            if(userEmail === "" || pwd  === "" || pwdRepeat  === "" || first  === "" || last  === ""){
                console.log("Signup info missing input");

            }
            else if(!(pwd === pwdRepeat)){
                console.log("Passwords don't match");

            }
            else{

                var obj = {func: "sign_up", email: userEmail, password: pwd, firstName: first, lastName: last};

                $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

                    // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
                    if(response["signupSuccess"]){

                        // output success and move to next html page
                        console.log("Signup Success");

                    }
                    else if(response["missingInput"]){
                        // output missing info
                        console.log("Missing post data input");
                    }
                    else{
                        // output failure message 
                        console.log("Signup Failed, an account with that email already exists!");
                        
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