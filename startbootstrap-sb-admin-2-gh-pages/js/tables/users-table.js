jQuery(function(){

    var submitted = false;

    var selectedRows = 0;

    var table;
    
    getUsers();

    $("#usersTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows > 0);

        
    });

    function getUsers(){

        var obj = {func: "get_all_users"};

        $.post("https://recycle.hpc.tcnj.edu/php/users-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#usersTable")){
                $('#usersTable').DataTable().destroy();
            }

            var tableBody = $("#usersTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["user_id"] + '</td>';
                html += '<td>' + response[i]["user_email"] + '</td>';
                html += '<td>' + response[i]["user_first_name"] + '</td>';
                html += '<td>' + response[i]["user_last_name"] + '</td>';
                html += '<td>' + response[i]["user_type"] + '</td>';
                html += '<td>' + response[i]["date_created"] + '</td>';
                html += '<td>' + response[i]["last_login"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#usersTable")){
                $('#usersTable').DataTable().draw();
            }
            else{
                table = $('#usersTable').DataTable({
                    order: [[ 0, "asc" ]],
                    pageLength: 25,
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add User</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete User</span>', 
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

                table.buttons().container().appendTo( '#usersTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            convertDates(table);
            table.button(1).enable(false);


        }, "json");

    }


    // --------------ADD user MODAL------------------
    $(document).on("submit", "#add-user-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var userEmail = form[0].value;
        var first = form[1].value;
        var last = form[2].value;
        var pwd = form[3].value;
        var pwdRepeat = form[4].value;
        var type = form[5].value;
        var userInterests = {"recycling":0, "water":0, "pollution":0, "energy":0};
        
        // Form only submits actively checked boxes
        for(var i = 6; i < form.length; i++){

            switch(form[i].name){

                case "recycling-interest":
                    userInterests["recycling"] = 1;
                break;
                case "water-interest":
                    userInterests["water"] = 1;
                break;
                case "pollution-interest":
                    userInterests["pollution"] = 1;
                break;
                case "energy-interest":
                    userInterests["energy"] = 1;
                break;
                default:
                break;
            }
        }

        var obj = {func: "add_user", email: userEmail, firstName: first, lastName: last, password: pwd, passwordRepeat: pwdRepeat, 
        userType: type, userInterests: userInterests};

        $.post("https://recycle.hpc.tcnj.edu/php/users-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The user account specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Make sure the email is not already taken and that the passwords match!", true);
            }

            getUsers();
            $("#add-modal").modal("toggle");
            $("#add-user-form")[0].reset();
            

        }, "json");           

        
    });
    

    // --------------DELETE user MODAL------------------
    $(document).on("submit", "#delete-user-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString == "delete")){
            $("#delete-modal").modal("toggle");
            $("#delete-user-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var usersDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            usersDataArray.push(rowsData[i][0]);
        }

        if(usersDataArray.length < 1){
            console.log("No users selected!");
        }
        else{
            var obj = {func: "delete_users", userIDs: usersDataArray};

            $.post("https://recycle.hpc.tcnj.edu/php/users-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected users were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getUsers();
                    $("#delete-modal").modal("toggle");
                    $("#delete-user-form")[0].reset();

            }, "json");
        }
            
    });

});
