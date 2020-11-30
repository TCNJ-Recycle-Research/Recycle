jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
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

            if (!table.row(indexes[i]).nodes().to$().hasClass("selected") && text.length > maxStringLen + 3 ) {
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
                html += '<td>' + "Brower Student Center" + '</td>';
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
                        targets: 6,
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
                    }
                });

                table.buttons().container().appendTo( '#eventsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            convertDates(table);
            convertTimes(table);
            convertUserTypes();
            table.button(1).enable(false);
            table.button(2).enable(false);
            table.button(3).enable(false);
            table.button(4).enable(false);

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
        console.log(form);
        var eventName = form[0].value;
        var eventLocation = form[1].value;
        var eventDescription = form[2].value;
        var eventDate = form[3].value;
        var startTime = form[4].value;
        var endTime = form[5].value;
        var allowedTypes = {"allowStudent":0, "allowFaculty":0, "allowStaff":0,
             "allowVisitor":0, "allowCommunity":0 , "allowOutreach":0 };
        
        for(var i = 6; i < form.length; i++){

            switch(form[i].name){

                case "student":
                    allowedTypes["allowStudent"] = 1;
                break;
                case "faculty":
                    allowedTypes["allowFaculty"] = 1;
                break;
                case "staff":
                    allowedTypes["allowStaff"] = 1;
                break;
                case "visitor":
                    allowedTypes["allowVisitor"] = 1;
                break;
                case "community":
                    allowedTypes["allowCommunity"] = 1;
                break;
                case "outreach":
                    allowedTypes["allowOutreach"] = 1;
                break;
                default:
                break;
            }
        }

        var obj = {func: "add_event", eventName: eventName, eventLocation: eventLocation, eventDescription: eventDescription, eventDate: eventDate, 
                startTime: startTime, endTime: endTime, allowedTypes: allowedTypes};

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

        $("#edit-event-form")[0].reset();

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
        $("#edit-event-form .event-location").val(rowData[2]);
        $("#edit-event-form .event-description").val(rowData[3]);
        $("#edit-event-form .event-date").val(rowData[4]);
        $("#edit-event-form .start-time").val(rowData[5].split("-")[0]);
        $("#edit-event-form .end-time").val(rowData[5].split("-")[1]);

        if(rowData[6] & 1)  {   $("#edit-event-form #student-edit").prop("checked", true);  }
        if(rowData[6] & 2)  {  $("#edit-event-form #faculty-edit").prop("checked", true);   }
        if(rowData[6] & 4)  {   $("#edit-event-form #staff-edit").prop("checked", true);    }
        if(rowData[6] & 8)  {    $("#edit-event-form #visitor-edit").prop("checked", true); }
        if(rowData[6] & 16) {    $("#edit-event-form #community-edit").prop("checked", true);   }
        if(rowData[6] & 32) {    $("#edit-event-form #outreach-edit").prop("checked", true);    }

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
        var eventLocation = form[1].value;
        var eventDescription = form[2].value;
        var eventDate = form[3].value;
        var startTime = form[4].value;
        var endTime = form[5].value;
        var allowedTypes = {"allowStudent":0, "allowFaculty":0, "allowStaff":0,
             "allowVisitor":0, "allowCommunity":0 , "allowOutreach":0 };
        
        for(var i = 6; i < form.length; i++){

            switch(form[i].name){

                case "student":
                    allowedTypes["allowStudent"] = 1;
                break;
                case "faculty":
                    allowedTypes["allowFaculty"] = 1;
                break;
                case "staff":
                    allowedTypes["allowStaff"] = 1;
                break;
                case "visitor":
                    allowedTypes["allowVisitor"] = 1;
                break;
                case "community":
                    allowedTypes["allowCommunity"] = 1;
                break;
                case "outreach":
                    allowedTypes["allowOutreach"] = 1;
                break;
                default:
                break;
            }
        }
        
        var obj = {func: "edit_event", eventID: eventID, eventName: eventName, eventLocation: eventLocation, eventDescription: eventDescription, 
        eventDate: eventDate, startTime: startTime, endTime: endTime, allowedTypes: allowedTypes};

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

    // --------------DELETE EVENT MODAL------------------
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

    // --------------GENERATE EVENT QR CODE MODAL------------------
    function generateQR(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data()[0];

        $("#QR-code-holder").empty();

        $('#QR-code-holder').qrcode({
            text	: rowData,
            render	: "canvas",  // 'canvas' or 'table'. Default value is 'canvas'
            background : "#ffffff",
            foreground : "#000000",
            width : 150,
            height: 150
        });

        $("#QR-modal").modal("toggle");
        
    }

    // --------------VIEW EVENT MODAL------------------
    function viewModal(){
        
        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        $("#view-event .event-name").empty();
        $("#view-event .event-location").empty();
        $("#view-event .event-description").empty();
        $("#view-event .event-date").empty();
        $("#view-event .event-time").empty();
        $("#view-event .allowed-users").empty();

        var rowData = table.row(activeRows[0]).data();
        var row = table.row(activeRows[0]).nodes().to$();
       
        $("#view-modal").modal("toggle");

        $("#view-event .event-name").append(rowData[1]);
        $("#view-event .event-location").append(rowData[2]);
        $("#view-event .event-description").append(rowData[3]);
        $("#view-event .event-date").append(row.children("td:eq(4)").text());
        $("#view-event .event-time").append(row.children("td:eq(5)").text());
        $("#view-event .allowed-users").append(convertUserTypes(rowData[6]));

        getParticipants();
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
        var string = "";

        if(userBitString & 1)  {   allowedUsers.push("Students");  }
        if(userBitString & 2)  {  allowedUsers.push("Faculty");   }
        if(userBitString & 4)  {   allowedUsers.push("Staff");    }
        if(userBitString & 8)  {    allowedUsers.push("Visitors"); }
        if(userBitString & 16) {    allowedUsers.push("Community Members");   }
        if(userBitString & 32) {    allowedUsers.push("Outreach Partners");    }

        for(var i = 0; i < allowedUsers.length - 1; i++){
            string += allowedUsers[i] + ", ";
        }

        string += allowedUsers[allowedUsers.length - 1];
        
        return string;
    }




});
