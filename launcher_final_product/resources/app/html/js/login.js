const klawSync = require('klaw-sync');
const os = require('os');
const exec = require('child_process').exec;
const fs = require('fs');
const find = require('find-process');
var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var checkRequestCount = 0;
var loginRequestCount = 0;
var cacheLocation = process.cwd() + "\\launcher_cache.txt"


// Clear error messages and disable login button when the state of login page has changed
function _changeState() {
    _clearErrorMessages();
    document.getElementById("login_button").disabled = true;
}

function _clearErrorMessages() {
    var errorMessages = document.getElementsByClassName("error-message");
    for (var i = 0; i < errorMessages.length; i++) {
        errorMessages[i].innerHTML = "";
        errorMessages[i].style.backgroundColor = "transparent";
    }
}

// Disable all inputs
function _disableInputs() {
    var inputs = document.getElementsByClassName('user-input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = true;
    }
    document.getElementById("upload").disabled = true;
}

// Enable all inputs
function _enableInputs() {
    var inputs = document.getElementsByClassName('user-input');
    for (var i = 0; i < inputs.length; i++) {
        inputs[i].disabled = false;
    }
    document.getElementById("upload").disabled = false;
}

const checkUsernameAndPassword = async function () {
    // Increase request count and set current request index to the current count
    checkRequestCount++;
    var currentRequestIndex = checkRequestCount;

    // Notify that the state of textfield input has been changed
    _changeState();

    // Get input player name and password
    var player_name = document.getElementById("login_username").value;
    var player_password = document.getElementById("login_password").value;

    // Notify user when username is left blank
    if (player_name == "") {
        var login_username_error_message = document.getElementById("login-username-error-message");
        login_username_error_message.innerHTML = "Username cannot be blank!";
        login_username_error_message.style.backgroundColor = "red";
        login_username_error_message.style.color = "white";
    }
    // Notify user when password is left blank
    if (player_password == "") {
        var login_password_error_message = document.getElementById("login-password-error-message");
        login_password_error_message.innerHTML = "Password cannot be blank!";
        login_password_error_message.style.backgroundColor = "red";
        login_password_error_message.style.color = "white";
    }
    if (player_name != "" && player_password != "") {
        // Check if the input is a correct username or email
        const response1 = await fetch("https://farcryserver.herokuapp.com/farcryAPI/v1/players/check_email/?player_email=" + player_name, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        const response2 = await fetch("https://farcryserver.herokuapp.com/farcryAPI/v1/players/check_player_name/?player_name=" + player_name, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        // Check if current request is latest and enable the login button if username is valid
        if (checkRequestCount === currentRequestIndex) {
            if (response1.status === 406 || response2.status === 406) {
                document.getElementById("login_button").disabled = false;
            } else {
                document.getElementById("login-error-message").innerHTML = "Something wrong with user's information";
            }
        }
    }
}

const loginUser = async function () {
    // Increase request count and set current request index to the current count
    loginRequestCount++;
    var currentRequestIndex = loginRequestCount;
    // Change state
    _changeState();
    // Disable all input fields on the screen
    _disableInputs();
    // Get player name and password
    var player_name = document.getElementById("login_username").value;
    var player_password = document.getElementById("login_password").value;
    // If no file folder is defined, notify the user
    var file_path = remote.getGlobal('sharedObj').file_path
    var file_name = file_path.split("\\").slice(-1)[0]

    // Check if there is another game instance is running
    var game_is_running = false
    await find('name', file_name)
        .then(function (array) {
            game_is_running = array.length >= 1
        },
            function (err) { })

    if (file_path === undefined) {
        // User didn't locate game folder
        document.getElementById("login-error-message").innerHTML = "Please locate game folder before login.";
    } else if (game_is_running) {
        // Another game instance is running before loging in
        document.getElementById("login-error-message").innerHTML = "Please quit current game session before loging in!";
    } else if (!fs.existsSync(file_path)) {
        // Game execution file not accessible
        document.getElementById("login-error-message").innerHTML = "Game execution file is corrupted or not accessible";
    } else {
        const response = await fetch("https://farcryserver.herokuapp.com/farcryAPI/v1/players/login/", {
            method: 'POST',
            body: JSON.stringify({ "player_name": player_name, "player_password": player_password }),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        // Check if the current request is the latest request
        if (loginRequestCount == currentRequestIndex) {
            switch (response.status) {
                case 200:
                case 406:
                    // Set player name and token for 200 and 406 response code
                    data = await response.json();
                    ipcRenderer.send("set-player-name", data.player_name);
                    ipcRenderer.send("set-player-token", data.token);
                case 200:
                    // Set player data for 200 response code, then switch to logout screen
                    ipcRenderer.send("set-player-data", {
                        'player_character_model': data.player_character_model,
                        'player_character_color': data.player_character_color,
                        'player_key_bindings': data.player_key_bindings
                    });
                    window.location.replace("./logout.html");
                    break;
                case 406:
                    // Set player data for 406 response code, then switch to email verify screen    
                    window.location.replace("./email_verify.html");
                    break;
                case 404:
                    // Notify the incorrect password and username
                    document.getElementById("login-error-message").innerHTML = "This combination of username and password is incorrect.";
                    break;
            }
        }
    }
    // Reenable the inputs
    _enableInputs();
}

ipcRenderer.on('selected-file', function (_, path) {
    $('#filePath').prop('value', path);
    ipcRenderer.send("set-file-path", path);
    fs.writeFileSync(cacheLocation, path, { encoding: 'utf8', flag: 'w' });
    checkUsernameAndPassword();
})

// Autorun this when application is ready
$(async function () {

    // Kill running game and Watchdog
    exec("taskkill /IM farcry_watchdog.exe /F");

    // Event click on button Select
    document.getElementById('upload').addEventListener('click', function (event) {
        ipcRenderer.send('open-file-dialog-for-file');
    })

    // Try to get FarCry.exe location from cache
    try {
        var cachedGamePath = fs.readFileSync(cacheLocation, { encoding: 'utf8' })
        if (cachedGamePath != "blank") {
            if (fs.existsSync(cachedGamePath)) {
                // Valid path from cache
                $('#filePath').prop('value', cachedGamePath);
                ipcRenderer.send("set-file-path", cachedGamePath);
                return;
            } else {
                // Path doesnt exist, overwrite cache file to "blank"
                fs.writeFileSync(cacheLocation, "blank", { encoding: 'utf8', flag: 'w' });
            }
        };
    } catch (error) { console.log(error) }

    // If no cache, try finding FarCry.exe automatically
    // Get home directory depends on OS
    if (os.platform() === 'linux' || os.platform() === 'darwin') {
        var directoryToExplore = os.homedir() + "/Downloads";
    } else {
        var directoryToExplore = "C:\\Bin";
    }

    try {
        // Get list of filenames
        var files = klawSync(directoryToExplore, {
            nodir: true
        });
    } catch (err) { }

    if (files != undefined) {
        for (index = 0; index < files.length; index++) {
            // Return file path if found
            if (files[index].path.includes("FarCry.exe")) {
                $('#filePath').prop('value', files[index].path);
                ipcRenderer.send("set-file-path", files[index].path);
                break;
            };
        };
    }
})