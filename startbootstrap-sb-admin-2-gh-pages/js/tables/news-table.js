jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
    var maxStringLen = 100;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getArticles();

    $("#newsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

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


    function getArticles(){

        var obj = {func: "get_all_articles"};

        $.post("http://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#newsTable")){
                $('#newsTable').DataTable().destroy();
            }

            var tableBody = $("#newsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["article_id"] + '</td>';
                html += '<td>' + response[i]["article_title"] + '</td>';
                html += '<td>' + response[i]["article_author"] + '</td>';
                html += '<td>' + response[i]["article_text"] + '</td>';
                html += '<td>' + response[i]["publish_date"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#newsTable")){
                $('#newsTable').DataTable().draw();
            }
            else{
                table = $('#newsTable').DataTable({
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
                                text: '<span class="icon text-white-50"><i class="fas fa-plus"></i></span><span class="text">Add Article</span>', 
                                className: 'btn btn-primary btn-icon-split',
                                action: function(){
                                    $("#add-modal").modal("toggle");
                                }
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-edit"></i></span><span class="text">Edit Article</span>', 
                                className: 'btn btn-blue btn-icon-split',
                                action: function(){
                                    editModal();
                                }
                            },
                            {
                               
                                text: '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Delete Article</span>', 
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

                table.buttons().container().appendTo( '#newsTable_wrapper .row:eq(0)');

            }

            table.button(1).enable(false);
            table.button(2).enable(false);
            convertDates(table);

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
                failureAlert("Server Could Not Be Reached!", "Make sure you're connected to TCNJ's network!", true);
        });

    }


    // --------------ADD ARTICLE MODAL------------------
    $(document).on("submit", "#add-article-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        var articleTitle = form[0].value;
        var articleAuthor = form[1].value;
        var articleText = form[2].value;

        var obj = {func: "add_article", title: articleTitle, author: articleAuthor, text: articleText};

        $.post("http://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Add Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["addSuccess"]){
                successAlert("Add Request Completed!", "The news article specified was created!", true);
            }
            else{
                failureAlert("Add Request Failed!", "Server error please try again!", true);
            }

            getArticles();
            $("#add-modal").modal("toggle");
            $("#add-article-form")[0].reset();
            

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           

        
    });
    
    // --------------EDIT article MODAL------------------

    // OPEN Edit modal
    function editModal(){

        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        var rowData = table.row(activeRows[0]).data();

        $("#edit-modal").modal("toggle");

        $("#edit-article-form .article-title").val(rowData[1]);
        $("#edit-article-form .article-author").val(rowData[2]);
        $("#edit-article-form .article-text").val(rowData[3]);

        
    }

    // SUBMIT Edit modal
    $(document).on("submit", "#edit-article-form", function(e){

        e.preventDefault();
        // Get all the info from the form
        var form = $(this).serializeArray();

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

        if(i == form.length){
            console.log("No change in article information so edit request not submitted!");
            $("#edit-modal").modal("toggle");
            return;
        }

        var articleID = rowData[0];
        var articleTitle = form[0].value;
        var articleAuthor = form[1].value;
        var articleText = form[2].value;

        var obj = {func: "edit_article", articleID: articleID, title: articleTitle, author: articleAuthor, text: articleText};

        $.post("http://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected news articles were successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            getArticles();
            $("#edit-modal").modal("toggle");

        }, "json").fail(function(xhr, thrownError) {
                console.log(xhr.status);
                console.log(thrownError);
        });           
        
        
    });

    // --------------DELETE article MODAL------------------
    $(document).on("submit", "#delete-article-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(confirmString != "delete" && confirmString != "DELETE"){
            $("#delete-modal").modal("toggle");
            $("#delete-article-form")[0].reset();
            return;
        }

        var rowsData = table.rows( { selected: true } ).data();

        var articlesDataArray = [];

        for(i = 0; i < rowsData.length; i++){
            articlesDataArray.push(rowsData[i][0]);
        }

        if(articlesDataArray.length < 1){
            console.log("No articles selected!");
        }
        else{
            var obj = {func: "delete_articles", articleIDs: articlesDataArray};

            $.post("http://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

                    if(response["missingInput"]){
                        failureAlert("Delete Request Failed!", "Server request was missing required input!", true);
                    }
                    else if(response["deleteSuccess"]){
                        successAlert("Delete Request Completed!", "The selected news articles were successfully deleted!", true);
                    }
                    else{
                        failureAlert("Delete Request Failed!", "Server error please try again!", true);
                    }

                    getArticles();
                    $("#delete-modal").modal("toggle");
                    $("#delete-article-form")[0].reset();

            }, "json").fail(function(xhr, thrownError) {
                    console.log(xhr.status);
                    console.log(thrownError);
            });
        }
            
    });

});
