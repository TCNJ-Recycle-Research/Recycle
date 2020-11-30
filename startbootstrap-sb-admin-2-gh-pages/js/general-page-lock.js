if(sessionStorage.getItem("loggedIn") != true){
    var loc = window.location.pathname;
    var dir = loc.substring(0, loc.lastIndexOf('/'));
    
    window.location.href = dir + "/login.html";
}