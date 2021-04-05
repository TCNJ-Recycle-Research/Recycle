jQuery(function(){

    var calendarEl = document.getElementById('calendar');

    var activeUsersChart;

    var eventsSource = [];

    var obj = {func: "get_all_events"};

    $.post("https://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {


        for(var i = 0; i < response.length; i++){
            eventsSource.push({
                title: response[i]["event_name"], 
                start: response[i]["event_date"] + "T" + response[i]["start_time"], 
                extendedProps: {
                    description: response[i]["event_description"],
                    type: response[i]["event_type"],
                    location: response[i]["event_location"],
                    date: convertDate(response[i]["event_date"]),
                    time: convertTime(response[i]["start_time"] + "-" + response[i]["end_time"]) 
                }
            });
        }

        var calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            events: eventsSource,
            eventClick: function(info) {
                
                viewModal(info);

                // change the border color just for fun
                info.el.style.borderColor = 'red';
              }
        });

        calendar.render();

    }, "json");


    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_topcard_stats"}), function(response) {

        $("#event-signups").html(response["event_signups"]);

        $("#issue-reports").html(response["issues"]);

        $("#material-requests").html(response["material_requests"]);

    }, "json");


    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_material_stats"}), function(response) {

        var i = 0;

        $('#top-materials li').each(function(i)
        {
            $(this).html(response["top_materials"][i]["material_name"]); 
            i++;
        });

    }, "json");

    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_user_stats"}), function(response) {

        if (activeUsersChart != null){
            activeUsersChart.destroy();
        }
    
        activeUsersChart = new Chart(document.getElementById("activeUsersChart"), {
            type: 'doughnut',
            data: {
                labels: ["Student", "Faculty", "Staff", "Visitor", "Community Member", "Outreach Partner"],
                datasets: [{
                data: $.map(response["daily_users"]["active"], function(el) { return el }),
                backgroundColor: ['#54A649' , '#1cc88a', '#f6c23e', '#6610f2', '#4e73df', '#36b9cc'],
                hoverBackgroundColor: ['#43873a', '#13855c', '#dda20a','#6f42c1', '#2e59d9', '#258391' ],
                hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                caretPadding: 10,
                },
                legend: {
                display: false
                },
                cutoutPercentage: 80,
            },
        });

    }, "json");


    $.post("https://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify({func: "get_all_articles"}), function(response) {

        $newsElements = "";
        $htmlStart = '<div class="card mb-2 border-bottom-primary"><div class="card-body mb-0 pb-0"><h3>';
        $htmlEnd = '</strong></p></div></div>';

        for(var i = 0; i < 7; i++){
            
            if(response[i] == null) break;

            $newsElements += $htmlStart + response[i]["article_title"] + '</h3><p> by ' + response[i]["article_author"] + '<strong> ' + response[i]["publish_date"] + $htmlEnd;
        }

        $("#news-list").html($newsElements);

    }, "json");

    // --------------VIEW EVENT MODAL------------------
    function viewModal(info){

        $("#view-event .event-name").empty();
        $("#view-event .event-description").empty();
        $("#view-event .event-type").empty();
        $("#view-event .event-location").empty();
        $("#view-event .event-date").empty();
        $("#view-event .event-time").empty();
       
        $("#view-modal").modal("toggle");

        $("#view-event .event-name").append(info.event.title);
        $("#view-event .event-type").append(info.event.extendedProps.type);
        $("#view-event .event-location").append(info.event.extendedProps.location);
        $("#view-event .event-description").append(info.event.extendedProps.description);
        $("#view-event .event-date").append(info.event.extendedProps.date);
        $("#view-event .event-time").append(info.event.extendedProps.time);
    }


    Chart.plugins.register({
        afterDraw: function (chart) {
          if (chart.data.datasets[0].data.length === 0) {
              noDataChart(chart);
          }
        }
    });

    function noDataChart(chart){
        chart.stop();
        // No data is present
        var ctx = chart.chart.ctx;
        var width = chart.chart.width;
        var height = chart.chart.height;
        chart.clear();

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "20px 'Nunito'";
        ctx.fillText('No data to display', width / 2, height / 2);
        ctx.restore();
    }
});
