// Redirect to the login page if not logged in 
if(!sessionStorage.getItem("loggedIn")){
    //redirect to the login page

    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    // Go to the material listing page where we will load in the info associated with the material ID
    window.location.href = dir + "/login.html";
}