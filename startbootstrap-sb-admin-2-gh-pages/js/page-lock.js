if(sessionStorage.getItem("loggedIn") != "true" || sessionStorage.getItem("adminName") == null){
    var loc = window.location.pathname;var dir = loc.substring(0, loc.lastIndexOf('/'));window.location.replace(dir + "/login.html");
}