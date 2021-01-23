
    var participantsTable;

    var eventID;

    $("#participantsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = participantsTable.rows( { selected: true } ).count();

        participantsTable.button(1).enable(selectedRows > 0);

    });


    function getParticipants(id){

        eventID = id;
        var obj = {func: "get_participants", eventID: id};

        $.post("http://recycle.hpc.tcnj.edu/php/participants-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#participantsTable")){
                $('#participantsTable').DataTable().destroy();
            }

            var tableBody = $("#participantsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["participant_id"] + '</td>';
                html += '<td>' + response[i]["user_id"] + '</td>';
                html += '<td>' + response[i]["user_email"] + '</td>';
                html += '<td>' + response[i]["user_first_name"] + '</td>';
                html += '<td>' + response[i]["user_last_name"] + '</td>';
                html += '<td>' + response[i]["user_type"] + '</td>';
                html += '<td>' + (response[i]["attended"] ? "Yes" : "No") + '</td>';
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
                    columnDefs: [{targets: 0, visible: false}, {targets: 1, visible: false}],
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
                                    $("#add-participant-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Attendance</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    $("#edit-attendance-modal").modal("toggle");
                                    //attendanceModal();
                                }
                            }
                        ]
                    }
                });

                participantsTable.buttons().container().appendTo( '#participantsTable_wrapper .row:eq(0)');

            }

            selectedRows = 0;
            participantsTable.button(1).enable(false);

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    }

    // --------------SUBMIT ADD PARTICIPANT MODAL------------------
    $(document).on("submit", "#add-participant-form", function(e){

        e.preventDefault();

        var form = $(this).serializeArray();

        var userID = form[0].value;

        var obj = {func: "add_participant", userID: userID, eventID: eventID};

        $.post("http://recycle.hpc.tcnj.edu/php/participants-handler.php", JSON.stringify(obj), function(response) {

            if(response["addSuccess"]){
                console.log("Successful participant add");

                getParticipants(eventID);
                $("#add-participant-modal").modal("toggle");
                $("#add-participant-form")[0].reset();
            }
            else if(response["missingInput"]){
                console.log("Missing add participant inputs");
            }
            else{
                console.log("Participant add failed! Make sure the entered email or ID is correct");
            }
            
        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });
    });

    // --------------SUBMIT EDIT ATTENDANCE MODAL------------------
    $(document).on("submit", "#edit-attendance-form", function(e){

        e.preventDefault();

        var form = $(this).serializeArray();

        var attendance = parseInt(form[0].value);

        var selectedRows = participantsTable.rows( { selected: true } ).data();

        if(selectedRows == null || selectedRows.length < 1){
            return;
        }

        var participantIDs = [];

        for(var i = 0; i < selectedRows.length; i++){
            participantIDs.push(selectedRows[i][0]);
        }

        var obj = {func: "set_attendance", participantIDs: participantIDs, attendance: attendance};

        $.post("http://recycle.hpc.tcnj.edu/php/participants-handler.php", JSON.stringify(obj), function(response) {

            if(response["editSuccess"]){
                console.log("Successful participant attendance");

                getParticipants(eventID);
                $("#edit-attendance-modal").modal("toggle");
                $("#edit-attendance-form")[0].reset();
            }
            else if(response["missingInput"]){
                console.log("Missing attendance inputs");
            }
            else{
                console.log("Participant attendance failed!");
            }

            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });

    });

    $(document).on('show.bs.modal', '.modal', function () {
        var zIndex = 1040 + (10 * $('.modal:visible').length);
        $(this).css('z-index', zIndex);
        setTimeout(function() {
            $('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
        }, 0);
    });