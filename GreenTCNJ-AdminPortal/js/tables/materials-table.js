jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
    var maxStringLen = 75;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getMaterials();

    $("#materialsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);
        table.button(3).enable(selectedRows === 1);

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

        $.post("https://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#materialsTable")){
                $('#materialsTable').DataTable().destroy();
            }

            var tableBody = $("#materialsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
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
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-list"></i></span><span class="text">View Material</span>', 
                                className: 'btn btn-success btn-icon-split',
                                action: function(){
                                    $('.modal').modal('hide');
                                    viewModal();
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

                table.buttons().container().appendTo( '#materialsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            table.button(2).enable(false);
            table.button(3).enable(false);

        }, "json");

    }

    // --------------ADD MATERIAL MODAL------------------
    $(document).on("submit", "#add-material-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var matName = form[0].value;
        var matType = form[1].value;
        var matDescription = form[2].value;

        var imgFile = $("#add-material-form .image-upload")[0].files;

        var formData = new FormData();

        var obj = {func: "add_material", materialName: matName, materialType: matType, materialDescription: matDescription, imagePath: null};

        // Check file selected or not
        if(imgFile.length > 0 ){

            formData.append('file', imgFile[0]);

            obj.imagePath = imgFile[0].name;

            $.ajax({
                url: 'https://recycle.hpc.tcnj.edu/php/image-upload.php',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response){

                    if(response["maxFiles"] == true){
                        failureAlert("Add Request Failed!", "MAX 200 IMAGE UPLOADS REACHED. DELETE MATERIALS TO UPLOAD MORE!", true);
                        return;
                    }
                    else if(response["missingFile"] == true){
                        failureAlert("Add Request Failed!", "Upload material image operation missing file input.", true);
                        return;
                    }
                    else if(response["uploadSuccess"] == false){
                        failureAlert("Upload Material Image Failed!", "Make sure the file is a jpg, jpeg, or png file and is less than 2MB.", true);
                        return;
                    }
                    else{
                        addMaterial(obj);
                    }

                },
                error: function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                    return;
                },
             });
        }
        else{
            addMaterial(obj);
        }
        
                   

        
    });

    function addMaterial(obj){

        $.post("https://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The material listing specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Server error please try again!", true);
            }

            getMaterials();
            $("#add-modal").modal("toggle");
            $("#add-material-form")[0].reset();
                

        }, "json");    
    }
    
    // --------------EDIT MATERIAL MODAL------------------

    // OPEN Edit modal
    function editModal(){

        $("#edit-material-form")[0].reset();

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

        if(rowData[4] != null && rowData[4] != "null"){
            $("#edit-image").attr("src", "https://recycle.hpc.tcnj.edu/materialImages/" + rowData[4]);
        }
        else{
            $("#edit-image").attr("src", "https://recycle.hpc.tcnj.edu/materialImages/not-found.jpg");
        }
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

        var matName = form[0].value;
        var matType = form[1].value;
        var matDescription = form[2].value;

        var imgFile = $("#edit-material-form .image-upload")[0].files;

        var formData = new FormData();

        var obj = {func: "edit_material", materialID: matID, materialName: matName, materialType: matType, materialDescription: matDescription, imagePath: null};

        if(i == form.length && imgFile.length <= 0){
            failureAlert("Edit Request Failed!", "No change in material info so edit request not submitted!", true);
            $("#edit-modal").modal("toggle");
            return;
        }

        // Check file selected or not
        if(imgFile.length > 0){

            formData.append('file', imgFile[0]);

            obj.imagePath = imgFile[0].name;

            $.ajax({
                url: 'https://recycle.hpc.tcnj.edu/php/image-upload.php',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response){


                    if(response["maxFiles"] == true){
                        failureAlert("SERVER REACHED MAX IMAGE UPLOADS(200)!", "Delete saved materials/images to free space!", true);
                    }
                    else if(response["missingFile"] == true){
                        failureAlert("Upload Image Request Failed!", "Server request was missing file input!", true);
                    }
                    else if(response["uploadSuccess"] == true){
                        editMaterial(obj);
                    }
                    else{
                        failureAlert("Upload Image Request Failed!", "Make sure the file is a .jpg/.jpeg/.png and is less than 2MB in size!", true);
                    }

                },
                error: function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
                    return;
                },
            });
        }
        else{
            editMaterial(obj);
        }
        
    });

    function editMaterial(obj){

        $.post("https://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected material was successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            getMaterials();
            $("#edit-modal").modal("toggle");

        }, "json");       
    }

    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-material-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(confirmString != "delete" && confirmString != "DELETE"){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
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

            $.post("https://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected materials were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getMaterials();
                    $("#delete-modal").modal("toggle");
                    $("#delete-material-form")[0].reset();

            }, "json");
        }
            
    });

    // --------------VIEW MATERIAL MODAL------------------
    function viewModal(){
        
        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        $("#view-material .material-name").empty();
        $("#view-material .material-type").empty();
        $("#view-material .material-description").empty();

        var rowData = table.row(activeRows[0]).data();
       
        $("#view-modal").modal("toggle");

        $("#view-material .material-name").append(rowData[1]);
        $("#view-material .material-type").append(rowData[2]);
        $("#view-material .material-description").append(rowData[3]);

        if(rowData[4] != null && rowData[4] != "null"){
            $("#view-material .material-image").attr("src", "https://recycle.hpc.tcnj.edu/materialImages/" + rowData[4]);
        }
        else{
            $("#view-material .material-image").attr("src", "https://recycle.hpc.tcnj.edu/materialImages/not-found.jpg");
        }

    }

});
