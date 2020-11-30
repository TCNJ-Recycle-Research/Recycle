jQuery(function(){

    $.post("http://recycle.hpc.tcnj.edu/php/admin-logout.php").fail(function(xhr, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);
    });           

});
