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
                            }
                        ]
                    },
                    initComplete: function(){ 
                        $(".table-hidden").show(); 
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
                failureAlert("Server Could Not Be Reached!", "Make sure you're connected to TCNJ's network!", true);
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

        var imgFile = $("#add-material-form .image-upload")[0].files;

        var formData = new FormData();

        var obj = {func: "add_material", materialName: matName, materialType: matType, materialDescription: matDescription, imagePath: null};

        // Check file selected or not
        if(imgFile.length > 0 ){

            formData.append('file', imgFile[0]);

            obj.imagePath = imgFile[0].name;

            $.ajax({
                url: 'http://recycle.hpc.tcnj.edu/php/image-upload.php',
                type: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function(response){

                    if(response["maxFiles"] == true){
                        console.log("SERVER REACHED MAX OF 200 IMAGE UPLOADS. FREE MEMORY BY DELETING MATERIALS/IMAGES TO UPLOAD MORE!");
                        return;
                    }
                    else if(response["missingFile"] == true){
                        // output missing info
                        console.log("Upload material image operation missing file input.");
                        return;
                    }
                    else if(response["uploadSuccess"] == true){

                        console.log("Upload material image operation successful");
                        addMaterial(obj);
                    }
                    else{
                        console.log("Upload material image operation failed! Make sure the file is a jpg, jpeg, or png file type and is less than 2MB.");
                        return;
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

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

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
                

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });    
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
            $("#edit-image").attr("src", "http://recycle.hpc.tcnj.edu/materialImages/" + rowData[4]);
        }
        else{
            $("#edit-image").attr("src", "http://recycle.hpc.tcnj.edu/materialImages/not-found.jpg");
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
            console.log("No change in material information so edit request not submitted!");
            $("#edit-modal").modal("toggle");
            return;
        }

        // Check file selected or not
        if(imgFile.length > 0){

            formData.append('file', imgFile[0]);

            obj.imagePath = imgFile[0].name;

            $.ajax({
                url: 'http://recycle.hpc.tcnj.edu/php/image-upload.php',
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

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {

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

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });       
    }

    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-material-form", function(e){

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

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });

});
