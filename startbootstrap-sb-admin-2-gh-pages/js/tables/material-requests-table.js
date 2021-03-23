jQuery(function(){

    var columnToTrunc = 2;      // Column where we will truncate the string inside
    var maxStringLen = 75;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getRequests();

    $("#requestsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows > 0);
        table.button(2).enable(selectedRows > 0);

        var cell;
        var text;

        for(var i = 0; i < indexes.length; i++){

            cell = table.cell(indexes[i], ".paragraph").nodes().to$();

            text = table.cell(indexes[i], ".paragraph").data();

            if (!table.row(indexes[i]).nodes().to$().hasClass("selected") && text.length > maxStringLen + 3 ) {
                text = text.substring(0,maxStringLen - 1) + '...';
            }
            
            cell.text(text);
        }
        
    });


    function getRequests(){

        var obj = {func: "get_all_requests"};

        $.post("https://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#requestsTable")){
                $('#requestsTable').DataTable().destroy();
            }

            var tableBody = $("#requestsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["request_id"] + '</td>';
                html += '<td>' + response[i]["request_material"] + '</td>';
                html += '<td>' + response[i]["request_description"] + '</td>';
                html += '<td>' + response[i]["user_email"] + '</td>';
                html += '<td>' + response[i]["request_date"] + '</td>';
                html += '<td>' + (response[i]["resolved"] ? "Yes" : "No") + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#requestsTable")){
                $('#requestsTable').DataTable().draw();
            }
            else{
                table = $('#requestsTable').DataTable({
                    order: [[ 5, "asc" ]],
                    pageLength: 25,
                    select: {
                        style: "os"
                    },
                    keys: {
                        keys: [38 /* UP */, 40 /* DOWN */ ]
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Request</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Resolved</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function () {
                                    $("#edit-resolved-modal").modal("toggle");
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Request</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            }
                        ]
                    },
                    initComplete: function(){ 
                        $("#invisible-card").removeClass("invisible");
                    }
                });

                table.buttons().container().appendTo( '#requestsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            table.button(2).enable(false);

            convertDates(table);


        }, "json");

    }

    // --------------ADD MATERIAL MODAL------------------
    $(document).on("submit", "#add-request-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();

        var requestMaterial = form[0].value;
        var requestDescription = form[1].value;
        var userEmail = form[2].value;

        var obj = {func: "add_request", requestMaterial: requestMaterial, requestDescription: requestDescription, userEmail: userEmail};

        $.post("https://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The material request specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Server error please try again!", true);
            }

            getRequests();
            $("#add-modal").modal("toggle");
            $("#add-request-form")[0].reset();
            

        }, "json");           

        
    });


    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-request-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(confirmString != "delete" && confirmString != "DELETE"){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
            $("#delete-modal").modal("toggle");
            $("#delete-request-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var requestsDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            requestsDataArray.push(rowsData[i][0]);
        }

        if(requestsDataArray.length < 1){
            failureAlert("Delete Request Failed!", "No material requests selected!", true);
            $("#delete-modal").modal("toggle");
            $("#delete-request-form")[0].reset();
        }
        else{
            var obj = {func: "delete_requests", requestIDs: requestsDataArray};

            $.post("https://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected material requests were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getRequests();
                    $("#delete-modal").modal("toggle");
                    $("#delete-request-form")[0].reset();

            }, "json");
        }
            
    });



    // --------------SUBMIT EDIT ATTENDANCE MODAL------------------
    $(document).on("submit", "#edit-resolved-form", function(e){

        e.preventDefault();

        var form = $(this).serializeArray();

        var resolved = parseInt(form[0].value);

        var selectedRows = table.rows( { selected: true } ).data();

        if(selectedRows == null || selectedRows.length < 1){
            return;
        }

        var requestIDs = [];

        for(var i = 0; i < selectedRows.length; i++){
            requestIDs.push(selectedRows[i][0]);
        }

        var obj = {func: "set_resolved", requestIDs: requestIDs, resolved: resolved};

        $.post("https://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected material requests were successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            getRequests();
            $("#edit-resolved-modal").modal("toggle");
            $("#edit-resolved-form")[0].reset();

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    });

});
