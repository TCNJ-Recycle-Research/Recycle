jQuery(function(){

    var submitted = false;

    var table; 

    // Column where we will truncate the string inside
    var columnToTrunc = 3;
    // Max length of truncated string to display
    var maxStringLen = 100;

    getMaterials();

    // When clicking a row to activate it
    $(document).on("click", ".clickable-row", function(){

        if($(this).hasClass("active-row")){
            $(this).removeClass("active-row");
        }
        else{
            $(this).addClass("active-row");
        }
        
        var text = $(this).children('td:eq(' + columnToTrunc + ')').text();

        if (text.length > 103) {
            text = table.row( this ).data()[columnToTrunc].substring(0,maxStringLen - 1) + '...';
        }
        else {
            text = table.row( this ).data()[columnToTrunc];
        }
        
        $(this).children('td:eq(' + columnToTrunc + ')').text(text);

    });


    $(document).on("click", "#confirm-delete", function(event){

    
        console.log("Submitted");
        var confirmString = $("#confirm-string").val();

        if(!submitted && confirmString === "DELETE"){

            var activeRows = document.getElementsByClassName("active-row");
            
            console.log("Submitted");

            submitted = true;

            var materialsDataArray = [];

            var len = activeRows.length;

            for(i = 0; i < len; i++){
                materialsDataArray.push(activeRows[i].getAttribute("data-id"));
            }

            if(materialsDataArray.length < 1){
              alert("No materials selected!");
              submitted = false;
            }
            else{
                $(".active-row").css("background-color", "red");

                //var confirmMsg = prompt("Are you sure you want to delete these materials?\nType DELETE to confirm and permanently delete them.");

                if(openDialog("DELETE")){

                    var obj = {func: "delete_material", materialIDs: materialsDataArray};

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
                        submitted = false;

                        $(".active-row").css("background-color", "#9db5fc");

                    }, "json").fail(function(xhr, thrownError) {
                            console.log(xhr.status);
                            console.log(thrownError);
                    });
                }
                else{
                    submitted = false;
                    $(".active-row").css("background-color", "#9db5fc");
                }
                
            }


            
        }


    });


    function getMaterials(){

        var obj = {func: "get_all_materials"};

        $.post("http://recycle.hpc.tcnj.edu/php/materials-handler.php", JSON.stringify(obj), function(response) {
            
            var html;

            var tableBody = $("#materialsTable tbody");

            tableBody.empty();

            for(i = 0; i < response.length; i++){

                html = '<tr class="clickable-row" data-id="' + response[i]["material_id"] + '">';
                html += '<td>' + response[i]["material_id"] + '</td>';
                html += '<td>' + response[i]["material_name"] + '</td>';
                html += '<td>' + response[i]["material_type"] + '</td>';
                html += '<td>' + response[i]["material_description"] + '</td>';
                html += '<td>' + response[i]["image_path"] + '</td>';
                html += '</tr>';

                tableBody.append(html);
            }

            table = $('#materialsTable').DataTable({
                order: [[ 0, "asc" ]],
                columnDefs: [{
                    targets: columnToTrunc,
                    render: function(data, type, row) {
                    if ( type === 'display') {
                        return renderedData = $.fn.dataTable.render.ellipsis(maxStringLen, true)(data, type, row);            
                    }
                    return data;
                    }
                }]
                
                
            });


        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

        return null;
    }


});
