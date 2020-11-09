jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
    var maxStringLen = 100;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getEvents();

    $("#eventsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);

        var thisRow;
        var text;

        for(var i = 0; i < indexes.length; i++){

            thisRow = table[ type ]( indexes[i] ).nodes().to$();

            text = table.row(indexes[i]).data()[columnToTrunc];
            
            if (!thisRow.hasClass("selected") && text.length > maxStringLen + 3 ) {
                text = table.row(indexes[i]).data()[columnToTrunc].substring(0,maxStringLen - 1) + '...';
            }
            
            thisRow.children('td:eq(' + columnToTrunc + ')').text(text);
        }
        
    });


    function getEvents(){

        var obj = {func: "get_all_events"};

        $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#eventsTable")){
                $('#eventsTable').DataTable().destroy();
            }

            var tableBody = $("#eventsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["event_id"] + '</td>';
                html += '<td>' + response[i]["event_name"] + '</td>';
                html += '<td>' + response[i]["event_description"] + '</td>';
                html += '<td>' + response[i]["event_date"] + '</td>';
                html += '<td>' + response[i]["start_time"] + '</td>';
                html += '<td>' + response[i]["end_time"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#eventsTable")){
                $('#eventsTable').DataTable().draw();
            }
            else{
                table = $('#eventsTable').DataTable({
                    order: [[ 0, "asc" ]],
                    pageLength: 25,
                    select: {
                        style: "os"
                    },
                    columnDefs: [{
                        targets: columnToTrunc,
                        render: function(data, type, row) {
                        if ( type === 'display') {
                            return renderedData = $.fn.dataTable.render.ellipsis(maxStringLen)(data, type, row);            
                        }
                        return data;
                        }
                    }],
                    buttons: {
                        dom: {
                          button: {
                            className: ''
                          }
                        },
                        buttons: [
                            {
                                text: 'Add Event', className: 'btn btn-success',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: 'Edit Event', className: 'btn btn-primary',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                                text: 'Delete Events', className: 'btn btn-danger',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            }
                        ]
                    }
                });

                table.buttons().container().appendTo( '#eventsTable_wrapper .col-md-6:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            table.button(2).enable(false);


        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    }


    // --------------ADD EVENT MODAL------------------
    $(document).on("submit", "#add-event-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var eventName = form[0].value;
        var eventDescription = form[1].value;
        var eventDate = form[2].value;
        var startTime = form[3].value;
        var endTime = form[4].value;
        //var allowedTypes = form[5].value;

        var obj = {func: "add_event", eventName: eventName, eventDescription: eventDescription, eventDate: eventDate, startTime: startTime,
        endTime: endTime, };

        $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){

                // output missing info
                console.log("Add Request missing input.");
            }
            else if(response["addSuccess"]){
                console.log("Add event operation successful");
            }
            else{
                console.log("Add event operation failed!");
            }

            getEvents();
            $("#add-modal").modal("toggle");
            $("#add-event-form")[0].reset();
            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           

        
    });
    
    // --------------EDIT EVENT MODAL------------------

    // OPEN Edit modal
    function editModal(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#edit-modal").modal("toggle");

        $("#edit-event-form .event-name").val(rowData[1]);
        $("#edit-event-form .event-description").val(rowData[2]);
        $("#edit-event-form .event-date").val(rowData[3]);
        $("#edit-event-form .start-time").val(rowData[4]);
        $("#edit-event-form .end-time").val(rowData[5]);

        
    }

    // SUBMIT Edit modal
    $(document).on("submit", "#edit-event-form", function(e){

        e.preventDefault();
        // Get all the info from the form
        var form = $(this).serializeArray();

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        var i;

        for(i = 0; i < form.length; i++){
            if(rowData[i + 1] !== form[i].value){
                break;
            }
        }

        if(i == form.length){
            console.log("No change in event information so edit request not submitted!");
            $("#edit-modal").modal("toggle");
            return;
        }

        var eventID = rowData[0];
        var eventName = form[0].value;
        var eventDescription = form[1].value;
        var eventDate = form[2].value;
        var startTime = form[3].value;
        var endTime = form[4].value;

        var obj = {func: "edit_event", eventID: eventID, eventName: eventName, eventDescription: eventDescription, eventDate: eventDate, 
        startTime: startTime, endTime: endTime};

        $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){

                // output missing info
                console.log("Edit Request missing input.");
            }
            else if(response["editSuccess"]){
                console.log("Edit event operation successful");
            }
            else{
                console.log("Edit event operation failed!");
            }

            getEvents();
            $("#edit-modal").modal("toggle");

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           
        
        
    });

    // --------------DELETE event MODAL------------------
    $(document).on("submit", "#delete-event-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString === "DELETE")){
            $("#delete-modal").modal("toggle");
            $("#delete-event-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var eventsDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            eventsDataArray.push(rowsData[i][0]);
        }

        if(eventsDataArray.length < 1){
            console.log("No events selected!");
        }
        else{
            var obj = {func: "delete_events", eventIDs: eventsDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){

                        // output missing info
                        console.log("Delete Request missing input.");
                    }
                    else if(response["deleteSuccess"]){
                        console.log("Delete event operation successful");
                    }
                    else{
                        console.log("Delete event operation failed!");
                    }

                    getEvents();
                    $("#delete-modal").modal("toggle");
                    $("#delete-event-form")[0].reset();

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });

});
