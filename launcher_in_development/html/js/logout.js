const ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs');
const exec = require('child_process').exec;
const remote = require('electron').remote;
var player_name;
var player_token;
var player_data;
var configPath = "";
var keyBindingsPath = "";
const delay = ms => new Promise(res => setTimeout(res, ms));
var executable_file_name = ""


// Read a file,  filePath must be an absolute path
const myReadFile = function(cfPath = configPath, kbPath = keyBindingsPath) {
    // Return file's content
    var systemcfContent = fs.readFileSync(cfPath, 'utf8');

    try {
        return {
            'playerModel': systemcfContent.match(/mp_model = \".*\"/g)[0],
            'playerColor': systemcfContent.match(/p_color = \".*\"/g)[0],
            'keyBindings': fs.readFileSync(kbPath, 'utf8'),
        }
    } catch (e) {
        return {
            'playerModel': "",
            'playerColor': "",
            'keyBindings': "",
        }
    }
}


document.addEventListener("DOMContentLoaded", function() {
    // Get global vars
    var sharedObj = remote.getGlobal('sharedObj');
    // Get player data
    player_name = sharedObj.player_name;
    player_token = sharedObj.player_token;
    player_data = sharedObj.player_data;
    // Get folder path and the executable path
    var game_location = sharedObj.file_path;
    var farcryFolder = game_location.split("\\").slice(0, -2)
    executable_file_name = game_location.split("\\").slice(-1)[0]

    // Overwrite config files, return error if any error occurs
    if (!overwriteConfig(farcryFolder, player_data.player_character_model, player_data.player_character_color, player_data.player_key_bindings)) {
        $("#display-message").text("Config files are corrupted or not accessible. Please log out and check your game folder.").prop("style", "color:red")
        return
    }

    // Run game
    var child = exec(game_location);

    // Run watchdog
    var log_location = farcryFolder.join("\\") + "\\log.txt";
    watchdog = exec(process.cwd() + '\\farcry_watchdog.exe' + ' ' + log_location + ' ' + player_token + ' ' + player_name + ' ' + executable_file_name)

    // When exit the game
    child.on('exit', (code) => {
        ipcRenderer.send("update-player-data", configPath, keyBindingsPath)
    });
})


async function logout() {
    // Disable log out button
    document.getElementById("logout_button").disabled = true;

    // Kill running game and watchdog
    exec("taskkill /IM " + executable_file_name + " /F");
    await delay(3000);
    exec("taskkill /IM farcry_watchdog.exe /F");

    // Call 'logout' API
    try {
        await fetch(
            "http://127.0.0.1:8000/farcryAPI/v1/players/logout/?player_name=" + player_name, {
                method: "GET",
                headers: {
                    "Authorization": player_token,
                }
            }
        )
        ipcRenderer.send("set-player-name", undefined);
        ipcRenderer.send("set-player-token", undefined);
        ipcRenderer.send("set-player-data", undefined);
        window.location.href = "./login.html";
    } catch (e) {
        console.log(e);
    }
}


// Overwrite config files
function overwriteConfig(farcryFolder, playerModel, playerColor, newKeyBindings) {
    // Get config files' path
    configPath = farcryFolder.join("\\") + "\\system.cfg";
    keyBindingsPath = farcryFolder.join("\\") + "\\game.cfg";

    // Create a new system.cfg's content
    try {
        var currentConfig = fs.readFileSync(configPath, { encoding: 'utf8' });
    } catch (e) {
        return false
    }

    if (playerColor != 'new') {
        var newConfig = currentConfig.replace(/mp_model = \".*\"/g, playerModel).replace(/p_color = \".*\"/g, playerColor).replace(/p_name = \".*\"/g, "p_name = " + '"' + player_name + '"');
    } else {
        var newConfig = currentConfig.replace(/p_name = \".*\"/g, "p_name = " + '"' + player_name + '"');
    }

    try {
        // Overwrite config files
        fs.writeFileSync(configPath, newConfig, { encoding: 'utf8', flag: 'w' });
        if (newKeyBindings != 'new') {
            fs.writeFileSync(keyBindingsPath, newKeyBindings, { encoding: 'utf8', flag: 'w' });
        }
    } catch (err) {
        return false
    }
    return true
}