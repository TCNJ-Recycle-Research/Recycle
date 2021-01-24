jQuery(function(){

    var submitted = false;

    var columnToTrunc = 4;      // Column where we will truncate the string inside
    var maxStringLen = 50;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getEvents();

    $("#eventsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);
        table.button(3).enable(selectedRows === 1);
        table.button(4).enable(selectedRows === 1);

        var cell;
        var text;

        for(var i = 0; i < indexes.length; i++){

            cell = table.cell(indexes[i], ".paragraph").nodes().to$();

            text = table.cell(indexes[i], ".paragraph").data();

            if (!table.row(indexes[i]).nodes().to$().hasClass("selected") && text.length > maxStringLen + 3) {
                text = text.substring(0, maxStringLen - 1) + '...';
            }
            
            cell.text(text);
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
                
                if(response[i]["event_type"] == null){
                    html += '<td>None</td>';
                }
                else{
                    html += '<td>' + response[i]["event_type"] + '</td>';
                } 
                    
                if(response[i]["event_location"] == null){
                    html += '<td>None</td>';
                }
                else{
                    html += '<td>' + response[i]["event_location"] + '</td>';
                }
                    
                html += '<td>' + response[i]["event_description"] + '</td>';
                html += '<td>' + response[i]["event_date"] + '</td>';
                html += '<td>' + response[i]["start_time"] + "-" + response[i]["end_time"] + '</td>';
                html += '<td>' + getUserTypes(response[i]) + '</td>';
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
                    },
                    {
                        targets: [2, 7],
                        visible: false,
                        searchable: false
                    }],
                    buttons: {
                        dom: {
                          button: {
                            className: ''
                          }
                        },
                        buttons: [
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Event</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Event</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Event</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-qrcode"></i></span><span class="text">QR Code</span>', 
                                className: 'btn btn-info btn-icon-split',
                                action: function(){
                                    generateQR();
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-list"></i></span><span class="text">View Event</span>', 
                                className: 'btn btn-success btn-icon-split',
                                action: function(){
                                    viewModal();
                                }
                            }
                        ]
                    },
                    initComplete: function(){ 
                        $(".table-hidden").show(); 
                    }
                });

                table.buttons().container().appendTo( '#eventsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            convertDates(table);
            convertTimes(table);
            table.button(1).enable(false);
            table.button(2).enable(false);
            table.button(3).enable(false);
            table.button(4).enable(false);

        }, "json").fail(function(xhr, thrownError) {
            console.log(xhr.status);
            console.log(thrownError);

            failureAlert("Server Could Not Be Reached!", "Make sure you're connected to TCNJ's network!", true);
        });

    }

    // --------------ADD EVENT MODAL------------------
    $(document).on("submit", "#add-event-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();

        var eventName = form[0].value;
        var eventType = form[1].value;
        var eventLocation = form[2].value;
        var eventDescription = form[3].value;
        var eventDate = form[4].value;
        var startTime = form[5].value;
        var endTime = form[6].value;
        var allowedTypes = {"allowStudent":0, "allowFaculty":0, "allowStaff":0,
             "allowVisitor":0, "allowCommunity":0 , "allowOutreach":0 };
        
        // Form only submits actively checked boxes
        for(var i = 6; i < form.length; i++){

            switch(form[i].name){

                case "student-add":
                    allowedTypes["allowStudent"] = 1;
                break;
                case "faculty-add":
                    allowedTypes["allowFaculty"] = 1;
                break;
                case "staff-add":
                    allowedTypes["allowStaff"] = 1;
                break;
                case "visitor-add":
                    allowedTypes["allowVisitor"] = 1;
                break;
                case "community-add":
                    allowedTypes["allowCommunity"] = 1;
                break;
                case "outreach-add":
                    allowedTypes["allowOutreach"] = 1;
                break;
                default:
                break;
            }
        }

        var obj = {func: "add_event", eventName: eventName, eventType: eventType, eventLocation: eventLocation, eventDescription: eventDescription, eventDate: eventDate, 
                startTime: startTime, endTime: endTime, allowedTypes: allowedTypes};

        $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The event specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Server error please try again!", true);
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
    function editModal(){

        $("#edit-event-form")[0].reset();
        $("#edit-event-form").data('changed', false);

        $("#edit-event-form #student-edit").prop("checked", false);
        $("#edit-event-form #faculty-edit").prop("checked", false);
        $("#edit-event-form #staff-edit").prop("checked", false);
        $("#edit-event-form #visitor-edit").prop("checked", false);
        $("#edit-event-form #community-edit").prop("checked", false);
        $("#edit-event-form #outreach-edit").prop("checked", false);  

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#edit-modal").modal("toggle");

        $("#edit-event-form .event-name").val(rowData[1]);
        $("#edit-event-form .event-type").val(rowData[2]);
        $("#edit-event-form .event-location").val(rowData[3]);
        $("#edit-event-form .event-description").val(rowData[4]);
        $("#edit-event-form .event-date").val(rowData[5]);
        $("#edit-event-form .start-time").val(rowData[6].split("-")[0]);
        $("#edit-event-form .end-time").val(rowData[6].split("-")[1]);

        if(rowData[7] & 1)  {   $("#edit-event-form #student-edit").prop("checked", true);     }
        if(rowData[7] & 2)  {   $("#edit-event-form #faculty-edit").prop("checked", true);     }
        if(rowData[7] & 4)  {   $("#edit-event-form #staff-edit").prop("checked", true);       }
        if(rowData[7] & 8)  {   $("#edit-event-form #visitor-edit").prop("checked", true);     }
        if(rowData[7] & 16) {   $("#edit-event-form #community-edit").prop("checked", true);   }
        if(rowData[7] & 32) {   $("#edit-event-form #outreach-edit").prop("checked", true);    }

    }

    $("form :input").change(function() {
        $(this).closest('form').data('changed', true);
    });

    // --------------SUBMIT EVENT MODAL------------------
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

        if(!$(this).closest('form').data('changed')) {

            console.log("No changes were made to the form so it was not submitted!");

            $("#edit-modal").modal("toggle");
            return;
        }

        var eventID = rowData[0];
        var eventName = form[0].value;
        var eventType = form[1].value;
        var eventLocation = form[2].value;
        var eventDescription = form[3].value;
        var eventDate = form[4].value;
        var startTime = form[5].value;
        var endTime = form[6].value;
        var allowedTypes = {"allowStudent":0, "allowFaculty":0, "allowStaff":0,
             "allowVisitor":0, "allowCommunity":0 , "allowOutreach":0 };
        
        for(var i = 6; i < form.length; i++){

            switch(form[i].name){

                case "student-edit":
                    allowedTypes["allowStudent"] = 1;
                break;
                case "faculty-edit":
                    allowedTypes["allowFaculty"] = 1;
                break;
                case "staff-edit":
                    allowedTypes["allowStaff"] = 1;
                break;
                case "visitor-edit":
                    allowedTypes["allowVisitor"] = 1;
                break;
                case "community-edit":
                    allowedTypes["allowCommunity"] = 1;
                break;
                case "outreach-edit":
                    allowedTypes["allowOutreach"] = 1;
                break;
                default:
                break;
            }
        }
        
        var obj = {func: "edit_event", eventID: eventID, eventName: eventName, eventType: eventType, eventLocation: eventLocation, eventDescription: eventDescription, 
        eventDate: eventDate, startTime: startTime, endTime: endTime, allowedTypes: allowedTypes};

        $.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected event was successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            getEvents();
            $("#edit-modal").modal("toggle");

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           
        
        
    });

    // --------------DELETE EVENT MODAL------------------
    $(document).on("submit", "#delete-event-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString == "delete")){
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
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected events were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
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

    // --------------GENERATE EVENT QR CODE MODAL------------------
    function generateQR(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#QR-code").empty();

        $("#QR-code-lg").empty();   // Larger (hidden) QR code display for printing

        var QR = new QRCode("QR-code", {
            text: rowData[0],
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        var lgQR = new QRCode("QR-code-lg", {
            text: rowData[0],
            width: 256,
            height: 256,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });

        $("#QR-modal").modal("toggle");
        
    }

    // --------------PRINT QR CODE PAGE------------------
    $(document).on("click", "#print-button", function(e){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        var dateCell = table.cell(activeRows[0], ".date").nodes().to$();
        var timeCell = table.cell(activeRows[0], ".time").nodes().to$();

        var header = '<h1>' + rowData[1] + '</h1><h2>' + dateCell.text() + '</h2><h2 style="margin-bottom: 2em;">' + timeCell.text() + '</h2>';

        var QR = $("#QR-code-lg").html();
        
        var printContents = '<div style="font-size: 1.5em; text-align: center; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 800px;">' 
        + header + QR + '</div>';

        w = window.open();
        w.document.write(printContents);
        
        w.print();
        w.close();
    });

    // --------------VIEW EVENT MODAL------------------
    function viewModal(){
        
        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        $("#view-event .event-name").empty();
        $("#view-event .event-description").empty();
        $("#view-event .event-type").empty();
        $("#view-event .event-location").empty();
        $("#view-event .event-date").empty();
        $("#view-event .event-time").empty();
        $("#view-event .allowed-users").empty();

        var rowData = table.row(activeRows[0]).data();
        var row = table.row(activeRows[0]).nodes().to$();
       
        $("#view-modal").modal("toggle");

        $("#view-event .event-name").append(rowData[1]);
        $("#view-event .event-type").append(rowData[2]);
        $("#view-event .event-location").append(rowData[3]);
        $("#view-event .event-description").append(rowData[4]);
        $("#view-event .event-date").append(row.children("td:eq(4)").text());
        $("#view-event .event-time").append(row.children("td:eq(5)").text());
        $("#view-event .allowed-users").append(convertUserTypes(rowData[7]));

        getParticipants(rowData[0]);
    }
    

    function getUserTypes(response){
        
        var bitString = 0;

        if(response["allow_student"] == 1)    { bitString += 1 << 0; }
        if(response["allow_faculty"] == 1)    { bitString += 1 << 1; }
        if(response["allow_staff"] == 1)      { bitString += 1 << 2; }
        if(response["allow_visitor"] == 1)    { bitString += 1 << 3; }
        if(response["allow_community"] == 1)  { bitString += 1 << 4; }
        if(response["allow_outreach"] == 1)   { bitString += 1 << 5; }

        return bitString;
    }

    function convertUserTypes(userBitString){

        var allowedUsers = [];
        var allowedString = "";

        if(userBitString & 1)  {   allowedUsers.push("Students");  }
        if(userBitString & 2)  {  allowedUsers.push("Faculty");   }
        if(userBitString & 4)  {   allowedUsers.push("Staff");    }
        if(userBitString & 8)  {    allowedUsers.push("Visitors"); }
        if(userBitString & 16) {    allowedUsers.push("Community Members");   }
        if(userBitString & 32) {    allowedUsers.push("Outreach Partners");    }

        for(var i = 0; i < allowedUsers.length - 1; i++){
            allowedString += allowedUsers[i] + ", ";
        }

        if(allowedUsers.length === 0)
            allowedString = "None";
        else
            allowedString += allowedUsers[allowedUsers.length - 1]; // Add this user type last with no following comma

        return allowedString;
    }

});
