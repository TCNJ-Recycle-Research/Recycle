jQuery(function(){

    var calendarEl = document.getElementById('calendar');

    var eventsSource = [];

    var obj = {func: "get_all_events"};

    $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

        for(var i = 0; i < response.length; i++){
            console.log("i: " + response[i]["event_name"]);
            eventsSource.push({"title": response[i]["event_name"], "start" : response[i]["event_date"] + "T" + response[i]["start_time"]});
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: eventsSource
        });
        
        calendar.render();

    }, "json");

    

});