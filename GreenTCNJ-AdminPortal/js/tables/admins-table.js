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

        $.post("https://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#adminsTable")){
                $('#adminsTable').DataTable().destroy();
            }

            var tableBody = $("#adminsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["adminID"] + '</td>';
                html += '<td>' + response[i]["adminEmail"] + '</td>';
                html += '<td>' + response[i]["adminFirstName"] + '</td>';
                html += '<td>' + response[i]["adminLastName"] + '</td>';
                html += '<td>' + response[i]["dateCreated"] + '</td>';
                html += '<td>' + response[i]["lastLogin"] + '</td>';
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

    // Switch add admin modal from existing account mode to new account 
    $(document).on("click", "#new-account-btn", function(){

        $("#new-account-inputs").show();
        $("#new-account-inputs .form-control").prop('required', true);
        $("#add-admin-email").html("Admin Email");
        
    });

    // Switch add admin modal from new account to existing account mode
    $(document).on("click", "#existing-account-btn", function(){

        $("#new-account-inputs").hide();
        $("#new-account-inputs .form-control").prop('required', false);
        $("#add-admin-email").html("User Account Email");
    });

    $(document).on("submit", "#add-admin-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();

        var adminEmail = form[1].value;
        var firstName = form[2].value;
        var lastName = form[3].value;
        var pwd = form[4].value;
        var pwdRepeat = form[5].value;
        var userType = form[6].value;

        var accessLevels = {"events":0, "materials":0, "news":0, "campusResources": 0,
             "reports":0, "users":0 , "admins":0 };
        
        // Form only submits actively checked boxes
        for(var i = 7; i < form.length; i++){

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
                case "add-resources-access":
                    accessLevels["campusResources"] = 1;
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

        var obj;

        // If firstName is empty string that means it's not required for form submission 
        // e.g. we're making an existing user account an admin instead of creating a user+admin account at the same time
        if(document.getElementById('existing-account-btn').checked){
            obj = {func: "add_admin", email: adminEmail, accessLevels: accessLevels};
        }
        else{
            obj = {func: "add_admin_and_user", email: adminEmail, firstName: firstName, lastName: lastName, password: pwd, passwordRepeat: pwdRepeat, accessLevels: accessLevels, userType: userType};
        }
        
        $.post("https://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){

                if(document.getElementById('existing-account-btn').checked)
                {    successAlert("Add Request Completed!", "The admin account specified was created!", true);   }
                else
                {   successAlert("Add Request Completed!", "The admin and user account specified were created!", true);   }
            }
            else if (document.getElementById('new-account-btn').checked && response["passwordMismatch"]){
                failureAlert("Add Request Failed!", "Make sure your passwords match.", true);
            }
            else if (document.getElementById('new-account-btn'.checked) && response["missingPasswordRequirements"]){
                failureAlert("Add Request Failed!", "Missing password requirements. Password must include an uppercase letter, a number, and be 8-30 characters long.", true);
            }
            else{

                if(document.getElementById('existing-account-btn').checked)
                {    failureAlert("Add Request Failed!", "Make sure a user account with that email exists and no admin account uses it!", true);   }
                else
                {   failureAlert("Add Request Failed!", "Make sure there are no existing accounts with that email!", true);   }

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
        $("#edit-admin-form #edit-resources-access").prop("checked", false);
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
        if(rowData[6] & 8)  {   $("#edit-admin-form #edit-resources-access").prop("checked", true);  }
        if(rowData[6] & 16) {   $("#edit-admin-form #edit-reports-access").prop("checked", true);    }
        if(rowData[6] & 32) {   $("#edit-admin-form #edit-users-access").prop("checked", true);      }
        if(rowData[6] & 64) {   $("#edit-admin-form #edit-admins-access").prop("checked", true);     }

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

            failureAlert("Edit Request Failed!", "No change in admin info so edit request not submitted!", true);

            $("#edit-modal").modal("toggle");
            return;
        }

        var accessLevels = {"events":0, "materials":0, "news":0, "campusResources":0,
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
                case "edit-resources-access":
                    accessLevels["campusResources"] = 1;
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

        $.post("https://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

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

        if(confirmString != "delete" && confirmString != "DELETE"){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
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

            $.post("https://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

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

        if(response["eventsAccess"] == 1)    { bitString += 1 << 0; }
        if(response["materialsAccess"] == 1)    { bitString += 1 << 1; }
        if(response["newsAccess"] == 1)      { bitString += 1 << 2; }
        if(response["campusResourcesAccess"] == 1)      { bitString += 1 << 3; }
        if(response["reportsAccess"] == 1)    { bitString += 1 << 4; }
        if(response["usersAccess"] == 1)  { bitString += 1 << 5; }
        if(response["adminsAccess"] == 1)   { bitString += 1 << 6; }

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
            if(bitString & 8)  {   allowedAccess.push("Campus Resources");    }
            if(bitString & 16) {    allowedAccess.push("Reports"); }
            if(bitString & 32) {    allowedAccess.push("Users");   }
            if(bitString & 64) {    allowedAccess.push("Admins");    }

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
