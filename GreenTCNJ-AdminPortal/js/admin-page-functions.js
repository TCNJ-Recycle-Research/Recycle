if(sessionStorage.getItem("loggedIn") == "true" && sessionStorage.getItem("adminName") != null){

    document.getElementById("admin-name").innerHTML = sessionStorage.getItem("adminName");
}
else{
    redirectToLogin();
}

generateSidebar();


function logoutAdmin(){
    
    //$.post("http://recycle.hpc.tcnj.edu/php/admin-logout.php");

    sessionStorage.clear();
    redirectToLogin();

}

function redirectToLogin(){

    // Replace this with "http://recycle.hpc.tcnj.edu/GreenTCNJ/login.html" when development/testing is complete

    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    window.location.replace(dir + "/login.html");
}

function generateSidebar(){

    var accessLevels = JSON.parse(sessionStorage.getItem("accessLevels"));

    if(accessLevels != null){

        if(accessLevels["events"] === 1 || accessLevels["materials"] === 1 || accessLevels["news"] === 1 || accessLevels["reports"] === 1 || accessLevels["campusResources"] === 1){

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

            if(accessLevels["campusResources"] === 1){
                $("#campus-resources-link").removeClass("d-none");
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

}

$(document).ajaxError(function(event, jqxhr, settings, exception) {

    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));

    if(jqxhr.status == 401){
        window.location.replace(dir + "/login.html");
    }
    else if (jqxhr.status == 403) {
        window.location.replace(dir + "/403.html");
    }
    else if (jqxhr.status == 404) {
        window.location.replace(dir + "/404.html");
    }
    else{
        console.log(jqxhr.status);
        console.log(exception);
        $(".modal").modal("hide");
        $(".form").trigger("reset");
        failureAlert("Server Could Not Be Reached!", "Make sure you're connected to TCNJ's network!", true);
    }
});

// Datatables Accessibility
// Handle event when cell gains focus
$('.table').on('key-focus.dt', function(e, datatable, cell, originalEvent){

    if(!$('.modal').hasClass('show') && originalEvent != undefined 
    && originalEvent.originalEvent != undefined && originalEvent.originalEvent.type != "click"){

        datatable.rows( { selected: true } ).deselect();
        
        datatable.row(cell.index().row).select();
    }
    
});

$('.page-shortcut').on('keypress click', function(e){

    if (e.which === 13 || e.type === 'click') {
        var loc = window.location.pathname;
        var dir = loc.substring(0, loc.lastIndexOf('/'));
        window.location.replace(dir + "/" + $(this).data("location"));
    }
});


$(window).on('shown.bs.modal', function(e) { 
    $(e.target).find('button, a, form-control, input, select, textarea, [tabindex]:not([tabindex="-1"])').eq(1).focus();
});
