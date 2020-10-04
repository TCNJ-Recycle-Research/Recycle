<?php 

// Including the database in every table so we can get the connection
require_once ("database-handler.php");

/* Table-Handler Guide
    This table-handler php script is used as the base parent class from which all of the other table classes 
    inherit. It's goal was reduce rewritten code in all of the other table scripts for this project by
    defining the basic SQL queries we will need in all of the other files. All functiosn were written so 
    that they can take variable column names and data since every table has different column names and data types. 

    Some important functions that are used by almost all of the SQL operation functions are the
    ones used for prepared statements. These are get_sql_code(), format_data_types(), prepare_statement(), and execute_statement().

    Prepared statements are used to stop SQL injections, which is when someone types in SQL code instead of a username as input, and then
    when that reaches the SQL database it is executed. This allows any user to call any code such as one that deletes the entire database.
    We don't want this to happen, so we must prepare the incoming data to let the server know not to mistake it as code.

1. Creating SQL code   

    This is done by first writing out the SQL code we want to execute:
    e.g. "INSERT INTO 'materials' ('Material_Name', 'Material_Type') VALUES (?, ?);"     <- Those question marks let the server know where our data will go

    ^ This is accomplished in the get_sql_code() function and it can look pretty confusing broken up because it was written to accept any number of columns and data
    but it basically just adds the column names and a ? mark for every column/data is reads in the array

2. Preparing Data Types String & Binding Params

    Next we need to "prepare" the statement by binding the variables in prepare_statement() and sending the SQL code to the database. 

        - So first we must give the database a string declaring the data types it should expect. For example, if we're passing an 
        integer, double, string, and integer we would format and send the string "idsi" (one char for each data). We add this string as
        the first index in the bindingParams array.

        - Next we must associate every ? in the above SQL code with a memory address and give the database those memory references. 
        So we add the memory references of each data as indices in the bindingParams array after the data types string discussed above.

        - Finally we call the mysqli pre-written function prepare() to send the SQL code to the database so it knows what to expect.

3. Binding and Executing Statement

    Now that we prepared the statement and have the bindingParams we can call "call_user_func_array()" to call the pre-written MySQL function 
    bind_param() since it can't take a variable number of inputs. So we use "call_user_func_array()" to pass an array and it places the 
    unknown amount of variables for us. E.g. $statment->bind_param(Variable1, Variable2, Variable3); or $statment->bind_params(Variable1, Variable2); 
    This gives the database the bindingParams and now we can call execute() on the statement which finally executes our SQL query.

    Additionally, we can replace the data at the memory locations that we passed when calling bind_param() and then call $statement-execute() 
    again without having to go through creating an entirely new prepared statement. This is much more efficient.
*/

class Table {

    // name of the table to be used for SQL statements
    private $tableName;

    // database object and connection
    private $mysqli;
    
    // Constructor requires database connection, name of the table being accessed, and the columns in the table
    function __construct($name)
    {
        $this->mysqli = Database::get_db_connection();

        // Store table name, using real_escape_string to modify input to stop SQL injections
        $this->tableName = $this->mysqli->real_escape_string($name);
    }

// Overall SQL Operations

    // Adding a single entry to the table specified at object construction. THIS IS SLOWER THAN "add_multiple_entries()" if
    // you need to add several entries at once
    protected function insert_row(&$columnArray, &$dataArray){

        $sqlCode = $this->get_sql_code($columnArray, "insert");

        // get the array containing the prepared statement and the array of binding variables (dataTypesString, data1, data2, ...)
        $preparedStmt = $this->prepare_statement($dataArray, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();

        $preparedStmt->close();
        
    }


    // Adding multiple entries requires an array of data arrays. IT IS FASTER to add multiple then individually calling "add_entry()"
    // the input $dataArrays must be formatted like "$dataArrays = array(array(data1, data2, data3), array(data1, data2, data3),....);"
    protected function insert_multiple_rows(&$columnArray, &$dataArrays){

        // store array length because it saves memory/speed instead of calling count() many times
        $dataArrayLength = count($dataArrays[0]);

        // Parameters saved by reference by SQL and used in each execute statement, 
        // since SQL has memory address we can update values and execute again increasing performance
        $referencedParams = array();

        // create locations for each variable in the data arrays that we will later pass-by-reference
        for($i = 0; $i < $dataArrayLength; $i++){
            $referencedParams[] = $dataArrays[0][$i];
        }

        $sqlCode = $this->get_sql_code($columnArray, "insert");

        $preparedStmt = $this->prepare_statement($referencedParams, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();

        // go though every other data array passed, executing the code with that data
        for($i = 1; $i < count($dataArrays); $i++){

            for($j = 0; $j < $dataArrayLength; $j++){
                // store the data at the addresses that were passed when "bind_param" was called
                $referencedParams[$j] = $dataArrays[$i][$j];
            }
            
            // Execute the SQL code each time the new data is in the reference parameters
            $preparedStmt->execute();

        }

        // close the prepared statement to deallocate resources
        $preparedStmt->close();    
        
        
    }


    // passed arugments format is (What column you want to locate and delete a row by) and (What data is in that column)
    // so if you want to delete entry "Material_Name = Cardboard" you would pass Material_Name in columnArray and Cardboard in dataArray
    protected function delete_row(&$columnArray, &$dataArray){
        
        $sqlCode = $this->get_sql_code($columnArray, "delete");

        // get the array containing the prepared statement and the array of binding variables (dataTypesString, data1, data2, ...)
        $preparedStmt = $this->prepare_statement($dataArray, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();

        // close the prepared statement to deallocate resources
        $preparedStmt->close();
    }


    // passed arguments format is (What column you want to update), (What data to give that column), (What column to locate row by), (What value is in that column)
    // so if you want to update entry "Material_Name = Cardboard" to "Material_Name = Boxes" you would pass ("Material_Name"), ("Boxes"), ("Material_Name"), ("Cardboard")
    protected function update_row(&$updatingColumnArray, &$updatingDataArray, &$whereColumnArray, &$whereDataArray){

        $bothColumnArrays = array($updatingColumnArray, $whereColumnArray);
        $bothDataArrays = array_merge($updatingDataArray, $whereDataArray);

        // get SQL code for editing a row
        $sqlCode = $this->get_sql_code($bothColumnArrays, "update");

        // get the array containing the prepared statement and the array of binding variables (dataTypesString, data1, data2, ...)
        $preparedStmt = $this->prepare_statement($bothDataArrays, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();

        $preparedStmt->close();
    }

    
    // select a single row from the table by giving it specific data of the row e.g. ....WHERE Material_Name = "Cardboard";
    // and return it as an associative array (you access it by column name) e.g array["Material_ID"] to get the Materials ID
    protected function select_row(&$columnArray, &$dataArray){

        $sqlCode = $this->get_sql_code($columnArray, "select");

        // get the array containing the prepared statement and the array of binding variables (dataTypesString, data1, data2, ...)
        $preparedStmt = $this->prepare_statement($dataArray, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();
        
        // get the result of the SQL code
        $result = $preparedStmt->get_result();

        // get the associative array of the row's values
        $rowArray = $result->fetch_assoc();

        // free and close  to deallocate resources for the result and statement
        $preparedStmt->close();

        return $rowArray;

    }

    // gets all of the rows in the table and returns them as an array of associative arrays 
    // (you access it by column name) e.g array["Material_ID"] to get the Materials ID
    // Additionally you can pass a columnToReturn so that the select statement only returns the selected columns
    // or an orderBy string to tell the function how you want the data ordered and returned (e.g ascending/descending)
    protected function select_all_rows($columnsToReturn, $orderBy){

        $sqlCode = "SELECT ";

        // Specify which columns to return from each row if columnsToReturn is not NULL
        if($columnsToReturn == NULL)
        {   $sqlCode .= "* FROM $this->tableName";    }
        else
        {   $sqlCode .= $this->mysqli->real_escape_string($columnsToReturn)." FROM $this->tableName";   }

        // Specify how to order results if orderBy is not NULL
        if($orderBy == NULL)
        {    $sqlCode .= ";";    }
        else
        {    $sqlCode .= " ORDER BY ".$this->mysqli->real_escape_string($orderBy).";";  }

        // prepare the statement but since we have no variables to be bound call it directly instead of using prepare_statement()
        $preparedStmt = $this->mysqli->prepare($sqlCode); 

        // Execute the actual SQL code on the database
        $preparedStmt->execute();
        
        // get the result of the SQL code
        $result = $preparedStmt->get_result();

        $rowsArray = array();
        
        // keep storing selected rows into rowsArray until it returns NULL
        while($row = $result->fetch_assoc())
        {    $rowsArray[] = $row;   }

        //  close to deallocate resources for the result and statement
        $preparedStmt->close();

        return $rowsArray;
    }

    // Search for a user input string inside all rows of the table. "columnsToReturn" can be passed to identify what columns you want returned
    // and orderBy is used to tell the database what to order the returned data by. Returns an array of results found (each index an associative array)
    protected  function search($columnArray, $searchString, $columnsToReturn, $orderBy){

        $sqlCode = "SELECT ";

        // Specify which columns to return from each row if columnsToReturn is not NULL
        if($columnsToReturn == NULL)
        {   $sqlCode .= "* FROM $this->tableName WHERE ";    }
        else
        {   $sqlCode .= $this->mysqli->real_escape_string($columnsToReturn)." FROM $this->tableName WHERE ";    }

        // add column names and ? for binding and preparing the statement
        for($i = 0; $i < count($columnArray) - 1; $i++)
        {   $sqlCode .= $this->mysqli->real_escape_string($columnArray[$i])." LIKE ? OR ";  }

        // last column doesn't require an OR after it so store it seperately
        $sqlCode .= $this->mysqli->real_escape_string($columnArray[count($columnArray) - 1])." LIKE ?";

        // Specify how to order results if orderBy is not NULL
        if($orderBy == NULL)
        {    $sqlCode .= ";";    }
        else
        {    $sqlCode .= " ORDER BY ".$this->mysqli->real_escape_string($orderBy).";";  }


        $dataArray = array();

        // Fill dataArray with searchString since we need it to take the place of every variable in the prepared statment
        for($i = 0; $i < count($columnArray); $i++)
        {   $dataArray[] = $searchString;   }

        // get the array containing the prepared statement and the array of binding variables (dataTypesString, data1, data2, ...)
        $preparedStmt = $this->prepare_statement($dataArray, $sqlCode);

        // Execute the actual SQL code on the database
        $preparedStmt->execute();
        
        // get the result of the SQL code
        $result = $preparedStmt->get_result();

        $rowsArray = array();
        
        // keep storing selected rows into rowsArray until it returns NULL
        while($row = $result->fetch_assoc())
        {   $rowsArray[] = $row;   }

        // free and close  to deallocate resources for the result and statement
        $preparedStmt->close();

        return $rowsArray;
    
    }


// Prepared Statement Section

    // get the specific SQL code formatted as it should be for different basic actions, INSERT/UPDATE/DELETE/SELECT
    private function get_sql_code(&$columnArray, $sqlAction){

        $sqlCode = '';

        switch($sqlAction){

            case ("insert"):    

                // that names of the data columns
                $columnsString = '';

                // insert requires a ? for every variable incoming so, "....VALUES (?, ?, ?, ?);"
                $preparedStmtString = '';

                for($i = 0; $i < count($columnArray) - 1; $i++){
                    // real_escape_string strips input of special characters
                    $columnsString .= $this->mysqli->real_escape_string($columnArray[$i]).", ";

                    $preparedStmtString .= "?, ";
                }
                
                // last column doesn't require a comma after it so store it seperately
                $columnsString .= $this->mysqli->real_escape_string($columnArray[count($columnArray) - 1]);

                $preparedStmtString .= "?";
                
                $sqlCode = "INSERT INTO $this->tableName ($columnsString) VALUES ($preparedStmtString);";

            break;
            case ("delete"):     

                $sqlCode = "DELETE FROM $this->tableName WHERE ";

                for($i = 0; $i < count($columnArray) - 1; $i++){
                    // real_escape_string strips input of special characters
                    $sqlCode .= $this->mysqli->real_escape_string($columnArray[$i])." = ?, ";
                }
                
                // last column doesn't require a comma after it so store it seperately
                $sqlCode .= $this->mysqli->real_escape_string($columnArray[count($columnArray) - 1])." = ?;";

            break;
            case ("update"):     

                $sqlCode = "UPDATE $this->tableName SET ";

                for($i = 0; $i < count($columnArray[0]) - 1; $i++){
                    // real_escape_string strips input of special characters
                    $sqlCode .= $this->mysqli->real_escape_string($columnArray[0][$i])." = ?, ";
                }
                
                // last column doesn't require a comma after it so store it seperately
                $sqlCode .= $this->mysqli->real_escape_string($columnArray[0][count($columnArray[0]) - 1])." = ?";

                $sqlCode .= " WHERE ";

                for($i = 0; $i < count($columnArray[1]) - 1; $i++){
                    // real_escape_string strips input of special characters
                    $sqlCode .= $this->mysqli->real_escape_string($columnArray[1][$i])." = ?, ";
                }

                // last column doesn't require a comma after it so store it seperately
                $sqlCode .= $this->mysqli->real_escape_string($columnArray[1][count($columnArray[1]) - 1])." = ?;";

            break;
            case ("select"):     
                $sqlCode =  "SELECT * FROM $this->tableName WHERE ";

                for($i = 0; $i < count($columnArray) - 1; $i++){

                    $sqlCode .= $this->mysqli->real_escape_string($columnArray[$i])." = ? AND ";
                }
                
                // last column doesn't require a comma after it so store it seperately
                $sqlCode .= $this->mysqli->real_escape_string($columnArray[count($columnArray) - 1])." = ?;";

            break;
            default:
                return NULL;
            break;

        }

        return $sqlCode;
    }

    // formats a string of the initials of the data types you intend on sending when binding parameters
    // so it knows what to replace the ?'s in the statement with as well as avoiding any special characters
    private function format_data_types(&$dataArray){
        
        $dataTypesString = '';

        // go through the passed dataArray argument to figure out all of the data types and store their initials
        for($i = 0; $i < count($dataArray); $i++){

            $dataType = gettype($dataArray[$i]);

            switch ($dataType) {

                case ("integer"):
                    $dataTypesString .= "i";
                    break;
                case ("double"):
                    $dataTypesString .= "d";
                    break;
                case ("string"):
                    $dataTypesString .= "s";
                    break;
                case ("blob"):
                    $dataTypesString .= "b";
                    break; 
                default:
                    return NULL;
                    break;
            }
        }

        return $dataTypesString;
    }


    // bind parameters (get their memory reference) and prepare it (let database know what to expect to avoid SQL injections)
    private function prepare_statement(&$dataArray, $sqlCode){

        $bindingParams = array();

        // bind_param must know what data types to expect so we give it string of data type initials, e.g. ("ssid")
        $bindingParams[] = $this->format_data_types($dataArray);

        // create locations for each variable in the data arrays that we will later pass-by-reference
        for($i = 0; $i < count($dataArray); $i++){

            // add a the referenced data location to the binding parameters array
            $bindingParams[] = &$dataArray[$i];
        }

        // "Prepare" creates an SQL statement and sends it to the database so it knows what to expect
        // and doesn't interpret incoming input as code and thus stops SQL injection attempts
        $stmt = $this->mysqli->prepare($sqlCode); 

        // We use "call_user_func_array" so we can send $stmt->bind_param() a variable amount of parameters
        call_user_func_array(array($stmt, 'bind_param'), $bindingParams);

        return $stmt;
    }

    
}





?>