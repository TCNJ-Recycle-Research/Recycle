// This file converts dates and times to human readable American format for any tables
// on the admin portal

function convertDates(table){

    var year, month, day;
    var date;

    var i = 0;

    var allData = table.columns(".date").data();
    var allCols = table.columns(".date").nodes().to$();

    // If there is more than one date column we must concat the returned arrays
    if(typeof(allData[0]) == "object"){

        var savedData = allData.slice();
        var savedCols = allCols.slice();

        allData = savedData[0].slice();
        allCols = savedCols[0].slice();

        for(i = 1; i < savedData.length; i++){

            allData = allData.concat(savedData[i]); 
            allCols = allCols.concat(savedCols[i]); 
            
        }
        
    }

    for(i = 0; i < allData.length; i++){
        date = allData[i];

        year = date.substring(0, 4);

        month = date.substring(5, 7);

        day = date.substring(8, 10);
        
        $(allCols[i]).text("" + month + "/" + day + "/" + year);
    }

    
}

function convertTimes(table){

    var allData = table.columns(".time").data();
    var thisRow;
    var formatStart, formatEnd;
    var time;
    var hourStart, minStart, hourEnd, minEnd;

    for(var i = 0; i < allData[0].length; i++){

        thisRow = table.cell(i, ".time").nodes().to$();

        time = allData[0][i];

        hourStart = parseInt(time.substring(0, 2));
        minStart = parseInt(time.substring(3, 5));

        hourEnd = parseInt(time.substring(9, 11));
        minEnd = parseInt(time.substring(12, 14));

        formatStart = hourStart >= 12 ? 'PM' : 'AM'; 
        formatEnd = hourEnd >= 12 ? 'PM' : 'AM'; 

        hourStart = hourStart % 12;  
        hourEnd = hourEnd % 12;

        // To display "0" as "12" 
        hourStart = hourStart ? hourStart : 12;  
        minStart = minStart < 10 ? '0' + minStart : minStart; 

        hourEnd = hourEnd ? hourEnd : 12;  
        minEnd = minEnd < 10 ? '0' + minEnd : minEnd; 

        thisRow.text(hourStart + ':' + minStart + formatStart + '-' + hourEnd + ':' + minEnd + formatEnd);
    }
    
}