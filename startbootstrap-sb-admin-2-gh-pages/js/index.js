

jQuery(function(){
    var calendarEl = document.getElementById('calendar');

    var eventsSource = [];

    var obj = {func: "get_all_events"};

    $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

        for(var i = 0; i < response.length; i++){
            console.log("i: " + response[i]["event_name"]+response[i]["event_description"]);
            eventsSource.push({"title": response[i]["event_name"], "start" : response[i]["event_date"] + "T" + response[i]["start_time"], "description": response[i]["event_description"]});
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: eventsSource

        });

          // $("eventsSource.events").click(function(){
          //   alert("The event was clicked.");
          // });

          // $("p").click(function(){
          //   alert("The paragraph was clicked.");
          // });




          // var calendar = new FullCalendar.Calendar(calendarEl, {
          //   eventClick: function(info) {
          //     var eventObj = info.event;
          //   }
          // }

        // eventClick = function(info) {
        //   var eventsSource = info.event_name;
        //
        //   if (eventsSource.url) {
        //     alert(
        //       'Clicked ' + eventsSource.title + '.\n' +
        //       'Will open ' + eventsSource.url + ' in a new tab'
        //     );
        //
        //     window.open(eventsSource.url);
        //
        //     info.jsEvent.preventDefault(); // prevents browser from following link in current tab.
        //   } else {
        //     alert('Clicked ' + eventsSource.event_name);
        //   }
        // },

        // eventDidMount = function(info) {
        //   var tooltip = new Tooltip(info.eventsSource, {
        //     title: info.event_name.extendedProps.event_description,
        //     placement: 'top',
        //     trigger: 'hover',
        //     container: 'body'
        //   });
        // }

        // eventDidMount= function(info) {
        //   var tooltip = new Tooltip(info.el, {
        //     title: info.event_name.extendedProps.event_description,
        //     placement: 'top',
        //     trigger: 'hover',
        //     container: 'body'
        //   });
        // },

        // createPopper(popcorn, tooltip, {
        //   placement: 'top',
        //   trigger: 'hover',
        //   container: 'body'
        // });

        // eventRender = function(event, element) {
        //   $(element).popover({title: event.title, content: event.description, trigger: 'hover', placement: 'auto right', delay: {"hide": 300 }});
        // },

        // var $calendar = $("#calendar");
        //   $(".fc-day, .fc-day-top").hover(function(e) {
        //     var date = moment.utc($(e.currentTarget).data("date"));
        //     var events = $calendar.fullCalendar("clientEvents", function(event) { return event.start.startOf("day").isSame(date); });
        //     console.log(events);
        //   });

        // eventDidMount: function(info) {
        //   var tooltip = new Tooltip(info.el, {
        //     title: info.event.extendedProps.description,
        //     placement: 'top',
        //     trigger: 'hover',
        //     container: 'body'
        //   });
        // },

        calendar.render();

    }, "json");

    // $('#calendar').FullCalendar({
    //   eventClick: function(eventsSource) {
    //
    //     alert('Event: ' + eventsSource.events);
    //     // alert('Coordinates: ' + jsEvent.pageX + ',' + jsEvent.pageY);
    //     // alert('View: ' + view.name);
    //
    //     // change the border color just for fun
    //     $(this).css('border-color', 'red');
    //
    //   }
    // });

});
