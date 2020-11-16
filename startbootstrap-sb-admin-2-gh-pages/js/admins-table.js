jQuery(function(){

    var submitted = false;

    var selectedRows = 0;

    var table;
    
    getAdmins();

    $("#adminsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows > 0);

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
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Admin</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            }
                        ]
                    }
                });

                table.buttons().container().appendTo( '#adminsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            convertDates(table);
            table.button(1).enable(false);


        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    }


    // --------------ADD admin MODAL------------------
    $(document).on("submit", "#add-admin-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var adminEmail = form[0].value;
        var first = form[1].value;
        var last = form[2].value;
        var pwd = form[3].value;
        var pwdRepeat = form[4].value;

        var obj = {func: "add_admin", email: adminEmail, firstName: first, lastName: last, password: pwd, passwordRepeat: pwdRepeat};

        $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){

                // output missing info
                console.log("Add Request missing input.");
            }
            else if(response["addSuccess"]){
                console.log("Add admin operation successful");
            }
            else{
                console.log("Add admin operation failed!");
            }

            getAdmins();
            $("#add-modal").modal("toggle");
            $("#add-admin-form")[0].reset();
            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           

        
    });
    

    // --------------DELETE admin MODAL------------------
    $(document).on("submit", "#delete-admin-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString === "DELETE")){
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

                        // output missing info
                        console.log("Delete Request missing input.");
                    }
                    else if(response["deleteSuccess"]){
                        console.log("Delete admin operation successful");
                    }
                    else{
                        console.log("Delete admin operation failed!");
                    }

                    getAdmins();
                    $("#delete-modal").modal("toggle");
                    $("#delete-admin-form")[0].reset();

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });


    function convertDate(date, isYMD){

        var year, month, day;

        if(isYMD === true){
            year = date.substring(0, 4);

            month = date.substring(5, 7);

            day = date.substring(8, 10);

            date = "" + month + "-" + day + "-" + year;
        }
        else{

            if(date[2] != '-' || date[5] != '-' || date.length() != 10){
                console.log("Invalid date format passed");
                return null;
            }

            year = date.substring(0, 2);

            month = date.substring(3, 5);

            day = date.substring(6, 10);

            date = "" + year + "-" + month + "-" + day;

            console.log("Converted back is " + date);
        }

        return date;
    }
});
