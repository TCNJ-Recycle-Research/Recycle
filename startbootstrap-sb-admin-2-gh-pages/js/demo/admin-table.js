jQuery(function(){

    var submitted = false;

    getAdmins();

    $(document).on("click", ".clickable-row", function(){

        if($(this).hasClass("active-row")){
            $(this).removeClass("active-row");
        }
        else{
            $(this).addClass("active-row");
        }
        
        console.log("Clicked");

    });


    $(document).on("click", "#delete-admin", function(){

        var activeRows = document.getElementsByClassName("active-row");

        if(!submitted){

            console.log("Submitted");

            submitted = true;

            var adminDataArray = [];

            var len = activeRows.length;

            var id;

            for(i = 0; i < len; i++){

                id = activeRows[i].getAttribute("data-id");

                adminDataArray.push(id);
            }

            if(adminDataArray.length < 1){
              alert("No admins selected!");

              submitted = false;
            }
            else{

                var confirmMsg = prompt("Are you sure you want to delete these admins?\nType DELETE to confirm and permanently delete them.");

                if(confirmMsg === "DELETE"){

                    var obj = {func: "delete_admin", adminIDs: adminDataArray};

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
                        submitted = false;

                    }, "json").fail(function(xhr, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                    });
                }
                else{
                    submitted = false;
                }
                
            }



        }


    });


    function getAdmins(){

        var obj = {func: "get_all_admins"};

        $.post("http://recycle.hpc.tcnj.edu/php/admins-handler.php", JSON.stringify(obj), function(response) {

            var html;

            var tableBody = $("#data-table tbody");

            tableBody.empty();

            for(i = 0; i < response.length; i++){

                html = '<tr class="clickable-row" data-id="' + response[i]["admin_id"] + '">';
                html += '<td>' + response[i]["admin_id"] + '</td>';
                html += '<td>' + response[i]["admin_first_name"] + '</td>';
                html += '<td>' + response[i]["admin_last_name"] + '</td>';
                html += '<td>' + response[i]["admin_email"] + '</td>';
                html += '</tr>';

                tableBody.append(html);
            }

            submitted = false;

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });
    }

});
