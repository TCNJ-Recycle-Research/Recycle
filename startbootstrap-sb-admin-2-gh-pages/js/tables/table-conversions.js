// This file converts dates and times to human readable American format for any tables
// on the admin portal
function convertDate(date){

    let year = date.substring(0, 4);

    let month = date.substring(5, 7);

    let day = date.substring(8, 10);
        
    return "" + month + "/" + day + "/" + year;
}

function convertTime(time){

    let hourStart = parseInt(time.substring(0, 2));
    let minStart = parseInt(time.substring(3, 5));

    let hourEnd = parseInt(time.substring(9, 11));
    let minEnd = parseInt(time.substring(12, 14));

    let formatStart = hourStart >= 12 ? 'PM' : 'AM'; 
    let formatEnd = hourEnd >= 12 ? 'PM' : 'AM'; 

    hourStart = hourStart % 12;  
    hourEnd = hourEnd % 12;

    // To display "0" as "12" 
    hourStart = hourStart ? hourStart : 12;  
    minStart = minStart < 10 ? '0' + minStart : minStart; 

    hourEnd = hourEnd ? hourEnd : 12;  
    minEnd = minEnd < 10 ? '0' + minEnd : minEnd; 

    return hourStart + ':' + minStart + formatStart + '-' + hourEnd + ':' + minEnd + formatEnd;
}

function convertDates(table){

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
        $(allCols[i]).text(convertDate(allData[i]));
    }

    
}

function convertTimes(table){

    var allData = table.columns(".time").data();
    var allCols = table.columns(".time").nodes().to$();

    // If there is more than one time column we must concat the returned arrays
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

    for(var i = 0; i < allData.length; i++){
        $(allCols[i]).text(convertTime(allData[i]));
    }
    
}