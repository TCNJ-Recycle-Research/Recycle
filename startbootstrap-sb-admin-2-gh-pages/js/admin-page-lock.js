
$.post("http://recycle.hpc.tcnj.edu/php/admin-page-lock.php", function(response) {

        // Function will return a boolean in json object to let front end know if login succeeded with correct email and password
        if(!response["valid"]){

            var loc = window.location.pathname;
            var dir = loc.substring(0, loc.lastIndexOf('/'));
                // Go to the material listing page where we will load in the info associated with the material ID
            window.location.href = dir + "/login.html";
        }

}, "json").fail(function(xhr, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
});
    
