jQuery(function(){

    var submitted = false;

    var columnToTrunc = 3;      // Column where we will truncate the string inside
    var maxStringLen = 75;     // Max length of truncated string to display
    var selectedRows = 0;

    var table;
    
    getArticles();

    $("#newsTable").on('select.dt deselect.dt', function (e, dt, type, indexes ) {

        selectedRows = table.rows( { selected: true } ).count();

        table.button(1).enable(selectedRows === 1);
        table.button(2).enable(selectedRows > 0);
        table.button(3).enable(selectedRows === 1);

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
        
        if(table)   table.rows( { selected: true } ).deselect();

        var obj = {func: "get_all_articles"};

        $.post("https://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

            if($.fn.dataTable.isDataTable("#newsTable")){
                $('#newsTable').DataTable().destroy();
            }

            var tableBody = $("#newsTable tbody");
            tableBody.empty();

            var html;

            for(i = 0; i < response.length; i++){

                html += '<tr>';
                html += '<td>' + response[i]["articleID"] + '</td>';
                html += '<td>' + response[i]["articleTitle"] + '</td>';
                html += '<td>' + response[i]["articleAuthor"] + '</td>';
                html += '<td>' + response[i]["articleText"] + '</td>';
                html += '<td>' + response[i]["publishDate"] + '</td>';
                html += '</tr>';
                
            }

            tableBody.append(html);

            if($.fn.dataTable.isDataTable("#newsTable")){
                $('#newsTable').DataTable().draw();
            }
            else{
                table = $('#newsTable').DataTable({
                    order: [[ 4, "desc" ]],
                    pageLength: 25,
                    select: {
                        style: "os"
                    },
                    keys: {
                        keys: [38 /* UP */, 40 /* DOWN */ ]
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
                            },
                            {
                                text: '<span class="icon text-white-50"><i class="fas fa-list"></i></span><span class="text">View Article</span>', 
                                className: 'btn btn-success btn-icon-split',
                                action: function(){
                                    $('.modal').modal('hide');
                                    viewModal();
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

                table.buttons().container().appendTo( '#newsTable_wrapper .row:eq(0)');
            }

            selectedRows = 0;
            
            convertDates(table);

            table.button(1).enable(false);
            table.button(2).enable(false);
            table.button(3).enable(false);

        }, "json");

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

        $.post("https://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

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
            

        }, "json");  
        
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

        if(i == form.length) {
            failureAlert("Edit Request Failed!", "No change in article info so edit request not submitted!", true);

            $("#edit-modal").modal("toggle");
            return;
        }

        var articleID = rowData[0];
        var articleTitle = form[0].value;
        var articleAuthor = form[1].value;
        var articleText = form[2].value;

        var obj = {func: "edit_article", articleID: articleID, title: articleTitle, author: articleAuthor, text: articleText};

        $.post("https://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

            if(response["missingInput"]){
                failureAlert("Edit Request Failed!", "Server request was missing required input!", true);
            }
            else if(response["editSuccess"]){
                successAlert("Edit Request Completed!", "The selected news article was successfully edited!", true);
            }
            else{
                failureAlert("Edit Request Failed!", "Server error please try again!", true);
            }

            $("#edit-modal").modal("toggle");
            getArticles();

        }, "json");           
        
        
    });

    // --------------DELETE article MODAL------------------
    $(document).on("submit", "#delete-article-form", function(e){

        e.preventDefault();

        // Get all the info from the form
        var form = $(this).serializeArray();
        
        var confirmString = form[0].value;

        if(confirmString != "delete" && confirmString != "DELETE"){
            failureAlert("Delete Request Failed!", "Incorrect confirmation string entered!", true);
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

            $.post("https://recycle.hpc.tcnj.edu/php/news-handler.php", JSON.stringify(obj), function(response) {

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

            }, "json");
        }
            
    });

    // --------------VIEW ARTICLE MODAL------------------
    function viewModal(){
        
        var activeRows = table.rows( { selected: true } );

        if(activeRows == null || activeRows.length != 1){
            return;
        }

        $("#view-article .article-title").empty();
        $("#view-article .article-author").empty();
        $("#view-article .date-published").empty();
        $("#view-article .article-text").empty();

        var rowData = table.row(activeRows[0]).data();
        var row = table.row(activeRows[0]).nodes().to$();
        
        $("#view-modal").modal("toggle");

        $("#view-article .article-title").append(rowData[1]);
        $("#view-article .article-author").append(rowData[2]);
        $("#view-article .date-published").append(row.children("td:eq(4)").text());
        $("#view-article .article-text").append(rowData[3]);

    }

});
