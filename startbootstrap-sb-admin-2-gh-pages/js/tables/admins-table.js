jQuery(function(){

    var submitted = false;

    var selectedRows = 0;

    var table;
    
    getAdmins();

    $("#adminsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);
    });


    function getAdmins(){

        var obj = {func: "get_all_admins"};

        $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#adminsTable")){
                $('#adminsTable').DataTable().destroy();
            }

            var tableBody = $("#adminsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["admin_id"] + '</td>';
                html += '<td>' + response[i]["admin_email"] + '</td>';
                html += '<td>' + response[i]["admin_first_name"] + '</td>';
                html += '<td>' + response[i]["admin_last_name"] + '</td>';
                html += '<td>' + response[i]["date_created"] + '</td>';
                html += '<td>' + response[i]["last_login"] + '</td>';
                html += '<td>' + getAccessBitstring(response[i]) + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#adminsTable")){
                $('#adminsTable').DataTable().draw();
            }
            else{
                table = $('#adminsTable').DataTable({
                    order: [[ 0, "asc" ]],
                    pageLength: 25,
                    autoWidth: false,
                    select: {
                        style: "os"
                    },
                    buttons: {
                        dom: {
                          button: {
                            className: ''
                          }
                        },
                        buttons: [
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Admin</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Access Levels</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Admin</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                }
                                
                            }
                        ]
                    },
                    initComplete: function(){ 
                        $("#invisible-card").removeClass("invisible");
                    }
                });

                table.buttons().container().appendTo( '#adminsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;

            convertDates(table);
            convertAccessStrings();

            table.button(1).enable(false);
            table.button(2).enable(false);

        }, "json");

    }

    // --------------ADD ADMIN MODAL------------------
    $(document).on("submit", "#add-admin-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var adminEmail = form[0].value;
        var first = form[1].value;
        var last = form[2].value;
        var pwd = form[3].value;
        var pwdRepeat = form[4].value;

        var accessLevels = {"events":0, "materials":0, "news":0,
             "reports":0, "users":0 , "admins":0 };
        
        // Form only submits actively checked boxes
        for(var i = 5; i < form.length; i++){

            switch(form[i].name){

                case "add-events-access":
                    accessLevels["events"] = 1;
                break;
                case "add-materials-access":
                    accessLevels["materials"] = 1;
                break;
                case "add-news-access":
                    accessLevels["news"] = 1;
                break;
                case "add-reports-access":
                    accessLevels["reports"] = 1;
                break;
                case "add-users-access":
                    accessLevels["users"] = 1;
                break;
                case "add-admins-access":
                    accessLevels["admins"] = 1;
                break;
                default:
                break;
            }
        }

        var obj = {func: "add_admin", email: adminEmail, firstName: first, lastName: last, 
        password: pwd, passwordRepeat: pwdRepeat, accessLevels: accessLevels};

        $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The admin account specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Make sure the email is not already taken and that the passwords match!", true);
            }

            getAdmins();
            $("#add-modal").modal("toggle");
            $("#add-admin-form")[0].reset();
            

        }, "json");           

        
    });
    
    // --------------EDIT ADMIN MODAL------------------

    // OPEN Edit modal
    function editModal(){

        $("#edit-admin-form")[0].reset();
        $("#edit-admin-form").data('changed', false);

        $("#edit-admin-form #edit-events-access").prop("checked", false);
        $("#edit-admin-form #edit-materials-access").prop("checked", false);
        $("#edit-admin-form #edit-news-access").prop("checked", false);
        $("#edit-admin-form #edit-reports-access").prop("checked", false);
        $("#edit-admin-form #edit-users-access").prop("checked", false);
        $("#edit-admin-form #edit-admins-access").prop("checked", false);  

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        if(rowData[6] & 1)  {   $("#edit-admin-form #edit-events-access").prop("checked", true);     }
        if(rowData[6] & 2)  {   $("#edit-admin-form #edit-materials-access").prop("checked", true);  }
        if(rowData[6] & 4)  {   $("#edit-admin-form #edit-news-access").prop("checked", true);       }
        if(rowData[6] & 8)  {   $("#edit-admin-form #edit-reports-access").prop("checked", true);    }
        if(rowData[6] & 16) {   $("#edit-admin-form #edit-users-access").prop("checked", true);      }
        if(rowData[6] & 32) {   $("#edit-admin-form #edit-admins-access").prop("checked", true);     }

        $("#edit-modal").modal("toggle");

    }

    // Set changed variable when the form is modified so we know whether to submit to the server
    $("form :input").change(function() {
        $(this).closest('form').data('changed', true);
    });

    // SUBMIT Edit modal
    $(document).on("submit", "#edit-admin-form", function(e){

        e.preventDefault();

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        // Get all the info from the form
        var form = $(this).serializeArray();

        var rowData = table.row(activeRows[0]).data();
        
        if(!$(this).closest('form').data('changed')) {

            console.log("No changes were made to the form so it was not submitted!");

            $("#edit-modal").modal("toggle");
            return;
        }

        var accessLevels = {"events":0, "materials":0, "news":0,
             "reports":0, "users":0 , "admins":0 };
        
        for(var i = 0; i < form.length; i++){

            switch(form[i].name){

                case "edit-events-access":
                    accessLevels["events"] = 1;
                break;
                case "edit-materials-access":
                    accessLevels["materials"] = 1;
                break;
                case "edit-news-access":
                    accessLevels["news"] = 1;
                break;
                case "edit-reports-access":
                    accessLevels["reports"] = 1;
                break;
                case "edit-users-access":
                    accessLevels["users"] = 1;
                break;
                case "edit-admins-access":
                    accessLevels["admins"] = 1;
                break;
                default:
                break;
            }
        }

        var obj = {func: "edit_access_levels", adminID: rowData[0], accessLevels: accessLevels};

        $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected admin's access levels were edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server Error please try again!", true);
            }

            getAdmins();
            $("#edit-modal").modal("toggle");

        }, "json");           
        
    });

    // --------------DELETE admin MODAL------------------
    $(document).on("submit", "#delete-admin-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString == "delete")){
            $("#delete-modal").modal("toggle");
            $("#delete-admin-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var adminsDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            adminsDataArray.push(rowsData[i][0]);
        }

        if(adminsDataArray.length < 1){
            console.log("No admins selected!");
        }
        else{
            var obj = {func: "delete_admins", adminIDs: adminsDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected admin accounts were deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server Error please try again!", true);
                    }

                    getAdmins();
                    $("#delete-modal").modal("toggle");
                    $("#delete-admin-form")[0].reset();

            }, "json");
        }
            
    });

    function getAccessBitstring(response){
        
        var bitString = 0;

        if(response["events_access"] == 1)    { bitString += 1 << 0; }
        if(response["materials_access"] == 1)    { bitString += 1 << 1; }
        if(response["news_access"] == 1)      { bitString += 1 << 2; }
        if(response["reports_access"] == 1)    { bitString += 1 << 3; }
        if(response["users_access"] == 1)  { bitString += 1 << 4; }
        if(response["admins_access"] == 1)   { bitString += 1 << 5; }

        return bitString;
    }

    function convertAccessStrings(){

        var bitString;
        var allowedAccess = [];
        var allowedString = "";
        var i = 0, j = 0;

        var allData = table.columns(".access-level").data();
        var allCols = table.columns(".access-level").nodes().to$();
        
        allData = allData[0];
        allCols = allCols[0];

        for(i = 0; i < allData.length; i++){

            bitString = allData[i];

            allowedAccess = [];
            allowedString = "";

            if(bitString & 1)  {   allowedAccess.push("Events");  }
            if(bitString & 2)  {  allowedAccess.push("Materials");   }
            if(bitString & 4)  {   allowedAccess.push("News");    }
            if(bitString & 8)  {    allowedAccess.push("Reports"); }
            if(bitString & 16) {    allowedAccess.push("Users");   }
            if(bitString & 32) {    allowedAccess.push("Admins");    }

            for(j = 0; j < allowedAccess.length - 1; j++){
                allowedString += allowedAccess[j] + ", ";
            }
    
            if(allowedAccess.length === 0)
                allowedString = "None";
            else
                allowedString += allowedAccess[allowedAccess.length - 1]; // Add this user type last with no following comma

            $(allCols[i]).text(allowedString);
        }

    }

    
});
