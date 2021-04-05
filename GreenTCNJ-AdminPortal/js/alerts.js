$(".alert").hide();

$(document).on('click', '.alert-close', function() {
    $(".alert").finish();
    $(".alert").hide();
});

function successAlert(strongText, alertText, fadeOut){

    $(".alert").finish();
    $(".alert").hide();

    $("#success-alert-strong").html("");
    $("#success-alert-strong").html(strongText);

    $("#success-alert-text").html("");
    $("#success-alert-text").html(alertText);

    
    if(fadeOut === true){
        $("#success-alert").fadeTo(10000, 500).slideUp(500, function() {
            $(".alert").hide();
        });
    }
    else{
        $("#success-alert").show();
    }
}

function failureAlert(strongText, alertText, fadeOut){

    $(".alert").finish();
    $(".alert").hide();

    $("#failure-alert-strong").html("");
    $("#failure-alert-strong").html(strongText);

    $("#failure-alert-text").html("");
    $("#failure-alert-text").html(alertText);

    if(fadeOut === true){
        $("#failure-alert").fadeTo(1, 500).shake({
            speed: 100,
            distance: 10
        }).delay(15000).slideUp(500, function() {
            $(".alert").hide();
        });
    }
    else{
        $("#failure-alert").show().shake({
            speed: 100,
            distance: 10
        });
    }
}

    