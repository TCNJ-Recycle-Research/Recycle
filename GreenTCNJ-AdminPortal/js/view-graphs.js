jQuery(function(){

    var statsArray, dailyUsers, weeklyUsers, monthlyUsers;

    var activeUsersChart, newUsersChart, materialsViewedChart, eventBreakdownChart;

    var eventBreakdown = {"student" : true, "faculty" : false, "staff" : false, "visitor" : false, "community" : false, "outreach" : false};

    var userPrimaryColors = {"student" : "#54A649", "faculty" : "#1cc88a", "staff" : "#f6c23e", "visitor" : "#6610f2", "community" : "#4e73df", "outreach" : "#36b9cc"};

    var userSecondaryColors = {"student" : "#43873a", "faculty" : "#13855c", "staff" : "#dda20a", "visitor" : "#6f42c1", "community" : "#2e59d9", "outreach" : "#258391"};

    // Set new default font family and font color to mimic Bootstrap's default styling
    Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
    Chart.defaults.global.defaultFontColor = '#858796';

    Chart.plugins.register({
      afterDraw: function (chart) {
        if (chart.data.datasets[0].data.length === 0) {
            noDataChart(chart);
        }
      }
    });


    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_topcard_stats"}), function(response) {

      statsArray = $.extend(statsArray, response);
      
      loadTopcardStats();

    }, "json");

    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_user_stats"}), function(response) {

      statsArray = $.extend(statsArray, response);

      dailyUsers = statsArray["dailyUsers"];
      weeklyUsers = statsArray["weeklyUsers"];
      monthlyUsers = statsArray["monthlyUsers"];

      loadActiveUsers(monthlyUsers);
      loadNewUsers(monthlyUsers);

    }, "json");

    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_material_stats"}), function(response) {

      statsArray = $.extend(statsArray, response);
      
      loadMaterialStats();

    }, "json");

    $.post("https://recycle.hpc.tcnj.edu/php/graphs-handler.php", JSON.stringify({func: "get_event_breakdown_stats"}), function(response) {

      var breakdown = response["eventBreakdown"];

      var sum;

      for(var key in eventBreakdown){

        sum = parseInt(breakdown[key + "Water"]) + parseInt(breakdown[key + "Energy"]) + parseInt(breakdown[key + "Pollution"]) + parseInt(breakdown[key + "Recycling"]);
        
        sum /= 100;

        breakdown[key + "Water"] = Math.round((breakdown[key + "Water"] / sum) * 100) / 100;
        breakdown[key + "Energy"] = Math.round((breakdown[key + "Energy"] / sum) * 100) / 100;
        breakdown[key + "Pollution"] = Math.round((breakdown[key + "Pollution"] / sum) * 100) / 100;
        breakdown[key + "Recycling"] = Math.round((breakdown[key + "Recycling"] / sum) * 100) / 100;

      }

      statsArray = $.extend(statsArray, breakdown);
      
      loadEventsBreakdown();

    }, "json");

    function loadTopcardStats(){

      $("#event-signups").html(statsArray["eventSignups"]);

      $("#event-attendance").html((statsArray["eventAttendance"] * 100).toFixed(2) + "%");

      $('#event-attendance-progressbar').attr('aria-valuenow', statsArray["eventAttendance"] * 100).css("width", statsArray["eventAttendance"] * 100 + "%");

      $("#material-requests").html(statsArray["materialRequests"]);

      $("#issue-reports").html(statsArray["issues"]);

    }

    function loadActiveUsers(stats){

      if (activeUsersChart != null){
        activeUsersChart.destroy();
      }

      activeUsersChart = new Chart(document.getElementById("activeUsersChart"), {
        type: 'doughnut',
        data: {
            labels: ["Student", "Faculty", "Staff", "Visitor", "Community Member", "Outreach Partner"],
            datasets: [{
            data: $.map(stats["active"], function(el) { return el }),
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
    }

    function loadNewUsers(stats){

      if (newUsersChart != null){
        newUsersChart.destroy();
      }

      newUsersChart = new Chart(document.getElementById("newUsersChart"), {
        type: 'doughnut',
        data: {
            labels: ["Student", "Faculty", "Staff", "Visitor", "Community Member", "Outreach Partner"],
            datasets: [{
            data: $.map(stats["new"], function(el) { return el }),
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

    }

    function loadEventsBreakdown(){
        
        if (eventBreakdownChart != null){
          eventBreakdownChart.destroy();
        }
        
        var datasets = [];

        for(var key in eventBreakdown){

          if(eventBreakdown[key] == true){

            datasets.push({
              backgroundColor: transparentize(userPrimaryColors[key], 0.9),
              borderColor: userPrimaryColors[key],
              borderWidth: 1.25,
              lineTension: 0.2,
              data: [statsArray[key + "Water"], statsArray[key + "Energy"], statsArray[key + "Pollution"], statsArray[key + "Recycling"]],
              label: key.charAt(0).toUpperCase() + key.slice(1)
              
            });
          }
          
        }

        if(datasets.length == 0){
          datasets.push({
            backgroundColor: transparentize(userPrimaryColors[key], 0.8),
            borderColor: userPrimaryColors[key],
            borderWidth: 1,
            data: []
          });
        }

        var options = {
          maintainAspectRatio: false,
          spanGaps: false,
          elements: {
            line: {
              tension: 0.000001
            }
          },
          plugins: {
            filler: {
              propagate: false
            }
          },
          legend: {
          display: false
          },
          tooltips: {
            callbacks: {
                title: (tooltipItem, data) => data.labels[tooltipItem[0].index],
                label: (tooltipItem, data) => data.datasets[tooltipItem.datasetIndex].label + ": " + 
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index] + "%"
            }
          },
          scale: {
            ticks: {
              beginAtZero: true,
              userCallback: function (value, index, values) {
                return value + "%";
              }
            }
          }
    
        };
    

        eventBreakdownChart = new Chart(document.getElementById("eventBreakdownChart"), {
          type: 'radar',
          data: {
              labels: ['Water Conservation', 'Energy',  'Pollution Prevention', 'Recycling'],
              datasets: datasets,
          },
          options: options,
          });

    }

    function loadMaterialStats(){

      if (materialsViewedChart != null){
        materialsViewedChart.destroy();
      }

      var i = 0;

      $('#top-materials li').each(function(i)
      {
        $(this).html(statsArray["topMaterials"][i]["materialName"]); 
        i++;
      });
      
      var d;
      var monthNames = [];
      var monthData = [];

      for(var i = 0; i < statsArray["materialsViewed"].length; i++){

        d = new Date(statsArray["materialsViewed"][i]["month"] + ' 00:00');
        monthNames.push(d.toLocaleString('default', { month: 'short' }));
        monthData.push(statsArray["materialsViewed"][i]["totalViews"]);

      }

      materialsViewedChart = new Chart(document.getElementById("materialsViewedChart"), {
          type: 'line',
          data: {
            labels: monthNames,
            datasets: [{
              label: "Total Views",
              lineTension: 0.3,
              backgroundColor: "rgba(78, 115, 223, 0.05)",
              borderColor: "rgba(78, 115, 223, 1)",
              pointRadius: 3,
              pointBackgroundColor: "rgba(78, 115, 223, 1)",
              pointBorderColor: "rgba(78, 115, 223, 1)",
              pointHoverRadius: 3,
              pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
              pointHoverBorderColor: "rgba(78, 115, 223, 1)",
              pointHitRadius: 10,
              pointBorderWidth: 2,
              data: monthData,
            }],
          },
          options: {
            maintainAspectRatio: false,
            layout: {
              padding: {
                left: 10,
                right: 25,
                top: 25,
                bottom: 0
              }
            },
            scales: {
              xAxes: [{
                time: {
                  unit: 'date'
                },
                gridLines: {
                  display: false,
                  drawBorder: false
                },
                ticks: {
                  maxTicksLimit: 7
                }
              }],
              yAxes: [{
                ticks: {
                  maxTicksLimit: 5,
                  padding: 10
                },
                gridLines: {
                  color: "rgb(234, 236, 244)",
                  zeroLineColor: "rgb(234, 236, 244)",
                  drawBorder: false,
                  borderDash: [2],
                  zeroLineBorderDash: [2]
                }
              }],
            },
            legend: {
              display: false
            },
            tooltips: {
              backgroundColor: "rgb(255,255,255)",
              bodyFontColor: "#858796",
              titleMarginBottom: 10,
              titleFontColor: '#6e707e',
              titleFontSize: 14,
              borderColor: '#dddfeb',
              borderWidth: 1,
              xPadding: 15,
              yPadding: 15,
              displayColors: false,
              intersect: false,
              mode: 'index',
              caretPadding: 10
            }
          }
        });

        
        
    }

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

    $(document).on("click", "#daily-active-users", function(){
        
      $("#active-users-header").html("Daily Active Users");
      loadActiveUsers(dailyUsers);

    });

    $(document).on("click", "#weekly-active-users", function(){

      $("#active-users-header").html("Weekly Active Users");
      loadActiveUsers(weeklyUsers);
        
    });

    $(document).on("click", "#monthly-active-users", function(){

      $("#active-users-header").html("Monthly Active Users");
      loadActiveUsers(monthlyUsers);

    });

    $(document).on("click", "#daily-new-users", function(){
        
      $("#new-users-header").html("Daily New Users");
      loadNewUsers(dailyUsers);

    });

    $(document).on("click", "#weekly-new-users", function(){

      $("#new-users-header").html("Weekly New Users");
      loadNewUsers(weeklyUsers);
        
    });

    $(document).on("click", "#monthly-new-users", function(){

      $("#new-users-header").html("Monthly New Users");
      loadNewUsers(monthlyUsers);

    });

    $(document).on("click", "#event-breakdown .dropdown-item", function(){

      var split = $(this).attr("id").split("-");
      eventBreakdown[split[0]] = !eventBreakdown[split[0]];
      loadEventsBreakdown();

    });


    function transparentize(color, opacity) {
			var alpha = opacity === undefined ? 0.5 : 1 - opacity;
			return Color(color).alpha(alpha).rgbString();
		}
});
