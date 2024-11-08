<?php
session_start();
if (!isset($_SESSION['loggedin']) || time() - $_SESSION['last_activity'] > 30) { // 30 seconds for testing
    session_unset(); // Unset session variables
    session_destroy(); // Destroy the session
    echo "<script>setTimeout(() => { showLogoutPopup(); }, 0);</script>"; // Call the blur function
    exit;
}
$_SESSION['last_activity'] = time(); // Update last activity time
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blue Rhyno Dashboard</title>
    <link rel="stylesheet" href="assets/css/main.css">
    <style>
        body {
            font-family: Arial, sans-serif;
        }
        .blurred {
            filter: blur(5px);
            pointer-events: none; /* Prevent interactions */
        }
        .logout-popup {
            display: none; /* Hidden by default */
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 20px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            z-index: 1000; /* Above all other content */
            text-align: center;
        }
        .overlay {
            display: none; /* Hidden by default */
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 999; /* Below the popup */
        }
    </style>
</head>
<body>
    <!-- Logout popup -->
    <div class="overlay" id="overlay"></div>
    <div class="logout-popup" id="logoutPopup">
        <h2>You have been logged out due to inactivity.</h2>
        <button onclick="window.location.href='login.html'">Login Again</button>
    </div>

    <script>
        function showLogoutPopup() {
            document.body.classList.add('blurred'); // Blur the body
            document.getElementById('overlay').style.display = 'block'; // Show overlay
            document.getElementById('logoutPopup').style.display = 'block'; // Show popup
        }
        <script>
    let timeout;

    function startTimer() {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            document.body.style.filter = "blur(5px)";
            alert("Due to inactivity, you are logged out.");
            window.location.href = 'login.html'; // Redirect to login page
        }, 30000); // 30 seconds timeout
    }

    window.onload = startTimer;
    document.onmousemove = startTimer;
    document.onkeypress = startTimer;
</script>


    <!-- Your header content -->
    <div id="header-wrapper">
        <div class="container">
            <!-- Header -->
            <header id="header">
                <div class="inner">
                    <!-- Logo -->
                    <h1><a href="index.html" id="logo">Blue Rhyno</a></h1>

                    <!-- Nav -->
                    <nav id="nav">
                        <ul>
                            <li><a href="index.html">Home</a></li>
                            <li><a href="showquotes.html">Quotes</a></li>
                            <li><a href="active_jobs.html">Active Jobs</a></li>
                            <li><a href="completed_jobs.html">Completed Jobs</a></li>
                        </ul>
                    </nav>
                </div>
            </header>
        </div>
    </div>
</body>
</html>
