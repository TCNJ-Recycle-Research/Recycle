<?php 
// Require the Table script only once so we can inherit as our parent class.
require_once ("table-handler.php");

class Admins extends Table{

    // static instance of this class to be given on AJAX PHP calls
    private static $adminsTable;

    // name of the table to be used for SQL statements
    private $name = "admins";

    private $adminColumns = array("Admin_Email", "Admin_Password", "Admin_Name", "Date_Created", "Last_Login");
    
    // Constructor requires database connection, name of the table being accessed, and the columns in the table
    function __construct()
    {
        parent::__construct($this->name);
    }


    public static function get_instance(){

        if(!self::$adminsTable){
            self::$adminsTable = new Admins();
        }

        return self::$adminsTable;
    }
    
    // Try to add new admin to admin database and returns true if the admin was succesfully added.
    // Additionally this function only checks for if the admin already exists in database so any other 
    // input validation (checking if user entered anything) must be done on the front end or added to this later
    function add_admin($adminEmail, $rawPassword, $name){

        // Prepare info for sending to select_row()
        $columnArray = array($this->adminColumns[0]);
        $dataArray = array($adminEmail);

        // Search for existing entry with this email
        $existingAdmin = $this->select_row($columnArray, $dataArray);
        
        // If we couldn't find an already existing admin with entered email, then add it
        if($existingAdmin == NULL){
            
            // Hash the raw password passed
            $hashedPassword = password_hash($rawPassword, PASSWORD_DEFAULT);

            //Get current date to save as last login date for admin
            $date = getdate();

            $yearMonthDay = "".$date['year']."-".$date['mon']."-".$date['mday'];

            // Get all of the data in an array and store date created twice since it's also the "last login" date
            $adminData = array($adminEmail, $hashedPassword, $name, $yearMonthDay, $yearMonthDay);

            $this->insert_row($this->adminColumns, $adminData);
            
            return true;
        }
        else{

            return false;
        }
        
    }

    // Verify the admin password with the email to see if they entered valid admin account info
    // Returns true if the password was correct and false if password or email was wrong
    function verify_admin($adminEmail, $rawPassword){

        $columnArray = array($this->adminColumns[0]);
        $dataArray = array($adminEmail);

        // Check if the email entered exists as an admin in the database
        $existingAdmin = $this->select_row($columnArray, $dataArray);

        // If we couldn't find an already existing admin with entered email, then add it
        if($existingAdmin != NULL){
            
            $hashedPassword = $existingAdmin["Admin_Password"]; 

            $success = password_verify($rawPassword, $hashedPassword);
            
            if($success){
                
                //Get current date to save as last login date for admin
                $date = getdate();

                $yearMonthDay = "".$date['year']."-".$date['mon']."-".$date['mday'];

                $updatingColumn = array($this->adminColumns[4]);
                $updatingValue = array($yearMonthDay);

                $this->update_row($updatingColumn, $updatingValue, $columnArray, $dataArray);
            }

            return $success;
        }
        else{

            return false;
        }

    }


    function delete_admin($adminEmail){

        // Prepare info for sending to select_row()
        $columnArray = array($this->adminColumns[0]);
        $dataArray = array($adminEmail);

        // Search for existing entry with this email
        $existingAdmin = $this->select_row($columnArray, $dataArray);
        
        // If we couldn't find an already existing admin with entered email, then add it
        if($existingAdmin != NULL){
            
            $adminData = array($existingAdmin['Admin_ID']);
            $adminColumn = array("Admin_ID");

            $this->delete_row($adminColumn, $adminData);

            return true;
        }
        else{

            return false;
        }
    }


    function edit_admin($adminEmail, $newPassword, $newName){

        // Prepare info for sending to select_row()
        $columnArray = array($this->adminColumns[0]);
        $dataArray = array($adminEmail);

        // Search for existing entry with this email
        $existingAdmin = $this->select_row($columnArray, $dataArray);
        
        // If we couldn't find an already existing admin with entered email, then add it
        if($existingAdmin != NULL){
            
            $updatingData = array();
            $updatingColumns = array();
            $whereData = array($existingAdmin["Admin_ID"]);
            $whereColumns = array("Admin_ID");
            
            // If a new password was passed 
            if($newPassword != NULL){
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

                $updatingData[] = $hashedPassword;
                $updatingColumns[] = $this->adminColumns[1];
            }

            if($newName != NULL){
                $updatingData[] = $newName;
                $updatingColumns[] = $this->adminColumns[2];
            }

            
            $this->update_row($updatingColumns, $updatingData, $whereColumns, $whereData);

            return true;
        }
        else{

            return false;
        }
    }


}

?>