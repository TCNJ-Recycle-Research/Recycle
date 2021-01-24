jQuery(function(){

    var columnToTrunc = 2;      // Column where we will truncate the string inside
    var maxStringLen = 75;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getRequests();

    $("#requestsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows > 0);

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

        $.post("http://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

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
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#requestsTable")){
                $('#requestsTable').DataTable().draw();
            }
            else{
                table = $('#requestsTable').DataTable({
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Request</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
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
                        $(".table-hidden").show(); 
                    }
                });

                table.buttons().container().appendTo( '#requestsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            convertDates(table);


        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
                failureAlert("Server Could Not Be Reached!", "Make sure you're connected to TCNJ's network!", true);
        });

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

        $.post("http://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

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
            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           

        
    });


    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-request-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString == "delete")){
            $("#delete-modal").modal("toggle");
            $("#delete-material-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var requestsDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            requestsDataArray.push(rowsData[i][0]);
        }

        if(requestsDataArray.length < 1){
            console.log("No materials selected!");
        }
        else{
            var obj = {func: "delete_requests", requestIDs: requestsDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/material-requests-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected material request was successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getRequests();
                    $("#delete-modal").modal("toggle");
                    $("#delete-request-form")[0].reset();

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });

});
