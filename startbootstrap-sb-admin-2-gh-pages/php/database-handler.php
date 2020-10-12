<?php 

 class Database {
        
    static $mysqli;

    public static function get_db_connection(){
        
        // Check if a table object already established a connection to the database
        if(!self::$mysqli){

            // Connect to database (Will need to be replaced by VM info once off of our local machines)
            //Database::$mysqli = new mysqli("localhost", "root", "", "recyclingapptest");
            // VM database connection info
            Database::$mysqli = new mysqli("localhost", "root", "reduceReuse", "Green_TCNJ");

            // Have MySQLI report and throw errors so individual error reporting for every MySQLI function isn't required 
            mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        }

      

        return self::$mysqli;
    }
}

?>