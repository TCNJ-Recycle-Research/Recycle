
    var participantsTable;

    $("#participantsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = participantsTable.rows( { selected: true } ).count();

        console.log("SELECETED");
        participantsTable.button(1).enable(selectedRows > 0);
        participantsTable.button(2).enable(selectedRows > 0);

    });


    function getParticipants(){

        //var obj = {func: "get"};

        //$.post("http://recycle.hpc.tcnj.edu/php/events-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#participantsTable")){
                $('#participantsTable').DataTable().destroy();
            }

            var tableBody = $("#participantsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < 26; i++){

                html += '<tr>';
                html += '<td>' + "1" + '</td>';
                html += '<td>' + "mabreym1@tcnj.edu" + '</td>';
                html += '<td>' + "Matthew" + '</td>';
                html += '<td>' + "Mabrey" + '</td>';
                html += '<td>' + "Student"+ '</td>';
                html += '<td>' + "No"+ '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#participantsTable")){
                $('#participantsTable').DataTable().draw();
            }
            else{
                participantsTable = $('#participantsTable').DataTable({
                    order: [[ 0, "asc" ]],
                    pageLength: 10,
                    select: {
                        style: "os"
                    },
                    columnDefs: [{targets: 0, visible: false}],
                    buttons: {
                        dom: {
                        button: {
                            className: ''
                        }
                        },
                        buttons: [
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Participant</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Set Attended</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Participant</span>', 
                                className: 'btn btn-danger btn-icon-split',
                                action: function () {
                                    $("#delete-modal").modal("toggle");
                                    //$(".active-row").css("background-color", "var(--danger)");
                                }
                            }
                        ]
                    }
                });

                participantsTable.buttons().container().appendTo( '#participantsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            participantsTable.button(1).enable(false);
            participantsTable.button(2).enable(false);

        //}, "json").fail(function(xhr, thrownError) {
                //console.log(xhr.status);
                //console.log(thrownError);
        //});

    }

    function attendanceModal(){

        var selectedRows = participantsTable.rows( { selected: true } ).data();

        var participantIDs = [];

        for(var i = 0; i < selectedRows.length; i++){

            participantIDs.push(selectedRows[i][0]);
        }


        // post participant IDs to set attendance of users on server
    }