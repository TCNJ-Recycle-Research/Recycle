
/*
//////// IDEAS FOR LOCKING USER LOGIN //////////////////


// Required to set and read sessions
session_start();
// Conditional if logged in
if(isset($_SESSION['username'])) {
        // do logged in stuff
    }
else 
    // Redirect if not logged in
    header("Location: login.php");



//////////////////////////////////

// login_submit.php

// Check if username and password are correct
if ($username == $valid_username && $password == $valid_password) {
    session_start(); // Start the session
    $_SESSION["session_secret"] = "a_secret_string"; // Set a secret variable
    header("Location: index.php"); // Redirect the user to index.php
}


/////////////////////////

// index.php 

// Resume the session
session_start();

// Check if the user is logged in
if ($_SESSION["session_secret"] != "a_secret_string") {
    // Nope! This user is NOT logged in!
    header("Location: login.php"); // Redirect the user to login.php
    exit(); // Exit the script so code doesn't get leaked
}

// Code for logged in users goes below */