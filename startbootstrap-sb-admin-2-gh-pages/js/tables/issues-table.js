jQuery(function(){

    var columnToTrunc = 2;      // Column where we will truncate the string inside
    var maxStringLen = 75;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getIssues();

    $("#issuesTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows > 0);

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



    function getIssues(){

        var obj = {func: "get_all_issues"};

        $.post("http://recycle.hpc.tcnj.edu/php/issues-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#issuesTable")){
                $('#issuesTable').DataTable().destroy();
            }

            var tableBody = $("#issuesTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["issue_id"] + '</td>';
                html += '<td>' + response[i]["user_email"] + '</td>';
                html += '<td>' + response[i]["issue_description"] + '</td>';
                html += '<td>' + response[i]["issue_date"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#issuesTable")){
                $('#issuesTable').DataTable().draw();
            }
            else{
                table = $('#issuesTable').DataTable({
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Issue</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Issue</span>', 
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

                table.buttons().container().appendTo( '#issuesTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            table.button(1).enable(false);
            convertDates(table);

        }, "json");

    }

    // --------------ADD MATERIAL MODAL------------------
    $(document).on("submit", "#add-issue-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();

        var userEmail = form[0].value;
        var issueDescription = form[1].value;
        
        var obj = {func: "add_issue", userEmail: userEmail, issueDescription: issueDescription};

        $.post("http://recycle.hpc.tcnj.edu/php/issues-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Issue Failed!", "Server issue was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Issue Completed!", "The issue report specified was created!", true);
            }
            else{
                failureAlert("Add Issue Failed!", "Server error please try again!", true);
            }

            getIssues();
            $("#add-modal").modal("toggle");
            $("#add-issue-form")[0].reset();
            

        }, "json");           

        
    });


    // --------------DELETE MATERIAL MODAL------------------
    $(document).on("submit", "#delete-issue-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(!(confirmString == "delete")){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
            $("#delete-modal").modal("toggle");
            $("#delete-issue-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var issuesDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            issuesDataArray.push(rowsData[i][0]);
        }

        if(issuesDataArray.length < 1){
            failureAlert("Delete Request Failed!", "No issue reports selected!", true);
            $("#delete-modal").modal("toggle");
            $("#delete-request-form")[0].reset();
        }
        else{
            var obj = {func: "delete_issues", issueIDs: issuesDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/issues-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete issue Failed!", "Server issue was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete issue Completed!", "The selected issue reports were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete issue Failed!", "Server error please try again!", true);
                    }

                    getIssues();
                    $("#delete-modal").modal("toggle");
                    $("#delete-issue-form")[0].reset();

            }, "json");
        }
            
    });

});
