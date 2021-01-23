if(sessionStorage.getItem("loggedIn") === true && sessionStorage.getItem("adminName") != null){

    // !!!! Probably don't need to do this POST request as we're doing a POST request to get the Datatable and it can return whether
    // !!!! the request was valid or not

    /*
    $.post("http://recycle.hpc.tcnj.edu/php/admin-page-lock.php", function(response) {

        console.log("response: " + response);
        console.log("id: " + response["id"]);
        console.log("valid: " + response["valid"]);
        
        if(response["valid"] !== true){
            redirectToLogin();
        }

    }, "json").fail(function(xhr, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
    });

    $("#username").append(sessionStorage.getItem("adminName"));
    */

    document.getElementById("username").innerHTML = sessionStorage.getItem("adminName");
}
else{
    //redirectToLogin();
}

function logoutAdmin(){
    /*
    $.post("http://recycle.hpc.tcnj.edu/php/admin-logout.php").success(function(){

        redirectToLogin();
        
    }).fail(function(xhr, thrownError) {
        console.log(xhr.status);
        console.log(thrownError);
    });           
    */

    redirectToLogin();
}


function redirectToLogin(){
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    window.location.href = dir + "/login.html";
}

