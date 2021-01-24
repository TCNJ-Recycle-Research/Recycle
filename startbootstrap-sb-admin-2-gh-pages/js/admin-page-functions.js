if(sessionStorage.getItem("loggedIn") == "true" && sessionStorage.getItem("adminName") != null){

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

    document.getElementById("admin-name").innerHTML = sessionStorage.getItem("adminName");
}
else{
    redirectToLogin();
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
    sessionStorage.clear();
    redirectToLogin();
}


function redirectToLogin(){
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    window.location.href = dir + "/login.html";
}



function generateSidebar(){

    var accessLevels = JSON.parse(sessionStorage.getItem("accessLevels"));

    if(accessLevels["events"] === 1 || accessLevels["materials"] === 1 || accessLevels["news"] === 1 || accessLevels["reports"] === 1){

        $("#initiatives-tables-heading").removeClass("d-none");

        if(accessLevels["events"] === 1){
            $("#events-link").removeClass("d-none");
        }

        if(accessLevels["materials"] === 1){
            $("#materials-link").removeClass("d-none");
        }
    
        if(accessLevels["news"] === 1){
            $("#news-link").removeClass("d-none");
        }
    
        if(accessLevels["reports"] === 1){
            $("#reports-link").removeClass("d-none");
        }
    }
    

    if(accessLevels["users"] === 1 || accessLevels["admins"] === 1){

        $("#account-tables-heading").removeClass("d-none");

        if(accessLevels["users"] === 1){
            $("#users-link").removeClass("d-none");
        }

        if(accessLevels["admins"] === 1){
            $("#admins-link").removeClass("d-none");
        }
    }
}

generateSidebar();