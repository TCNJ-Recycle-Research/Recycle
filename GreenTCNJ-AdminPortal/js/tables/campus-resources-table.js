jQuery(function(){

    var selectedRows = 0;

    var table;
    
    getResources();

    $("#campusResourcesTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);
        
    });


    function getResources(){
        
        if(table)   table.rows( { selected: true } ).deselect();

        var obj = {func: "get_all_resources"};

        $.post("https://recycle.hpc.tcnj.edu/php/resources-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#campusResourcesTable")){
                $('#campusResourcesTable').DataTable().destroy();
            }

            var tableBody = $("#campusResourcesTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["resourceID"] + '</td>';
                html += '<td>' + response[i]["resourceName"] + '</td>';
                html += '<td>' + response[i]["resourceLink"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#campusResourcesTable")){
                $('#campusResourcesTable').DataTable().draw();
            }
            else{
                table = $('#campusResourcesTable').DataTable({
                    order: [[ 0, "asc" ]],
                    pageLength: 25,
                    select: {
                        style: "os"
                    },
                    keys: {
                        keys: [38 /* UP */, 40 /* DOWN */ ]
                    },
                    buttons: {
                        dom: {
                          button: {
                            className: ''
                          }
                        },
                        buttons: [
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Resource Link</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Resource Link</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Resource Link</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                }
                            },
                            {
                                extend: 'print',
                                text: '<span class="icon text-white-50"><i class="fas fa-print"></i></span><span class="text">Print Table</span>', 
                                className: 'btn btn-purple btn-icon-split',
                                exportOptions: {
                                    format: {
                                        body: function (data, rowIdx, columnIdx, node ) {
                                            return $(node).text();
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    initComplete: function(){ 
                        $("#invisible-card").removeClass("invisible");
                    }
                });

                table.buttons().container().appendTo( '#campusResourcesTable_wrapper .row:eq(0)');
            }

            selectedRows = 0;

            table.button(1).enable(false);
            table.button(2).enable(false);

        }, "json");

    }


    // --------------ADD resource MODAL------------------
    $(document).on("submit", "#add-resource-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var resourceName = form[0].value;
        var resourceLink = form[1].value;

        var obj = {func: "add_resource", resourceName: resourceName, resourceLink: resourceLink};

        $.post("https://recycle.hpc.tcnj.edu/php/resources-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The news resource specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Server error please try again!", true);
            }

            getResources();
            $("#add-modal").modal("toggle");
            $("#add-resource-form")[0].reset();
            

        }, "json");           

        
    });
    
    // --------------EDIT resource MODAL------------------

    // OPEN Edit modal
    function editModal(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#edit-modal").modal("toggle");

        $("#edit-resource-form .resource-name").val(rowData[1]);
        $("#edit-resource-form .resource-link").val(rowData[2]);
    }

    // SUBMIT Edit modal
    $(document).on("submit", "#edit-resource-form", function(e){

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

        if(i == form.length) {
            failureAlert("Edit Request Failed!", "No change in resource info so edit request not submitted!", true);

            $("#edit-modal").modal("toggle");
            return;
        }

        var resourceID = rowData[0];
        var resourceName = form[0].value;
        var resourceLink = form[1].value;

        var obj = {func: "edit_resource", resourceID: resourceID,  resourceName: resourceName, resourceLink: resourceLink};

        $.post("https://recycle.hpc.tcnj.edu/php/resources-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected news resource was successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            $("#edit-modal").modal("toggle");
            getResources();

        }, "json");           
        
        
    });

    // --------------DELETE resource MODAL------------------
    $(document).on("submit", "#delete-resource-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(confirmString != "delete" && confirmString != "DELETE"){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
            $("#delete-modal").modal("toggle");
            $("#delete-resource-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var resourcesDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            resourcesDataArray.push(rowsData[i][0]);
        }

        if(resourcesDataArray.length < 1){
            console.log("No resources selected!");
        }
        else{
            var obj = {func: "delete_resources", resourceIDs: resourcesDataArray};

            $.post("https://recycle.hpc.tcnj.edu/php/resources-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected news resources were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getResources();
                    $("#delete-modal").modal("toggle");
                    $("#delete-resource-form")[0].reset();

            }, "json");
        }
            
    });

});
