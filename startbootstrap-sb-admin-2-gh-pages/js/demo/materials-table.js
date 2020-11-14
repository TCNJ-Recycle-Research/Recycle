jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
    var maxStringLen = 100;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getMaterials();

    $("#materialsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
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


    function getMaterials(){

        var obj = {func: "get_all_materials"};

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#materialsTable")){
                $('#materialsTable').DataTable().destroy();
            }

            var tableBody = $("#materialsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr class="clickable-row">';
                html += '<td>' + response[i]["material_id"] + '</td>';
                html += '<td>' + response[i]["material_name"] + '</td>';
                html += '<td>' + response[i]["material_type"] + '</td>';
                html += '<td>' + response[i]["material_description"] + '</td>';
                html += '<td>' + response[i]["image_path"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#materialsTable")){
                $('#materialsTable').DataTable().draw();
            }
            else{
                table = $('#materialsTable').DataTable({
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Material</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Material</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Material</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            }
                        ]
                    }
                });

                table.buttons().container().appendTo( '#materialsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            table.button(2).enable(false);


        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    }


    // --------------ADD MATERIAL MODAL------------------
    $(document).on("submit", "#add-material-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var matName = form[0].value;
        var matType = form[1].value;
        var matDescription = form[2].value;
        var imgPath = form[3].value;

        var obj = {func: "add_material", materialName: matName, materialType: matType, materialDescription: matDescription, imagePath: imgPath};

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){

                // output missing info
                console.log("Add Request missing input.");
            }
            else if(response["addSuccess"]){
                console.log("Add material operation successful");
            }
            else{
                console.log("Add material operation failed!");
            }

            getMaterials();
            $("#add-modal").modal("toggle");
            $("#add-material-form")[0].reset();
            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           

        
    });
    
    // --------------EDIT MATERIAL MODAL------------------

    // OPEN Edit modal
    function editModal(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#edit-modal").modal("toggle");

        $("#edit-material-form").attr("data-id", rowData[0]);
        $("#edit-material-form .material-name").val(rowData[1]);
        $("#edit-material-form .material-type").val(rowData[2]);
        $("#edit-material-form .material-description").val(rowData[3]);
        $("#edit-material-form .image-path").val(rowData[4]);

        
    }

    // SUBMIT Edit modal
    $(document).on("submit", "#edit-material-form", function(e){

        e.preventDefault();
        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var matID = $(this).attr("data-id");

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
            console.log("No change in material information so edit request not submitted!");
            $("#edit-modal").modal("toggle");
            return;
        }

        var matName = form[0].value;
        var matType = form[1].value;
        var matDescription = form[2].value;
        var imgPath = form[3].value;

        var obj = {func: "edit_material", materialID: matID, materialName: matName, materialType: matType, materialDescription: matDescription, imagePath: imgPath};

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){

                // output missing info
                console.log("Edit Request missing input.");
            }
            else if(response["editSuccess"]){
                console.log("Edit material operation successful");
            }
            else{
                console.log("Edit material operation failed!");
            }

            getMaterials();
            $("#edit-modal").modal("toggle");

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           
        
        
    });

    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-material-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString === "DELETE")){
            $("#delete-modal").modal("toggle");
            $("#delete-material-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var materialsDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            materialsDataArray.push(rowsData[i][0]);
        }

        if(materialsDataArray.length < 1){
            console.log("No materials selected!");
        }
        else{
            var obj = {func: "delete_materials", materialIDs: materialsDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){

                        // output missing info
                        console.log("Delete Request missing input.");
                    }
                    else if(response["deleteSuccess"]){
                        console.log("Delete material operation successful");
                    }
                    else{
                        console.log("Delete material operation failed!");
                    }

                    getMaterials();
                    $("#delete-modal").modal("toggle");
                    $("#delete-material-form")[0].reset();

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });

});
