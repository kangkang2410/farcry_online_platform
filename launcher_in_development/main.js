// Modules to control application life and create native browser window
const { app, BrowserWindow, dialog, net } = require('electron')
const isSecondInstance = app.requestSingleInstanceLock()

// Only one instance allowed in a given time
if (!isSecondInstance) {
    app.quit()
}

var os = require('os');
const fs = require('fs');
const ipcMain = require('electron').ipcMain
const delay = ms => new Promise(res => setTimeout(res, ms));
const exec = require('child_process').exec;

global.sharedObj = {
    player_name: undefined,
    player_token: undefined,
    file_path: undefined,
    player_data: undefined,
}

// FIXME: THIS IS FOR DEBUG ONLY!
if (process.env.NODE_ENV === 'development') { require('electron-reload')(__dirname) }

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow


function createWindow() {
    mainWindow = new BrowserWindow({
            width: 1000,
            height: 750,
            webPreferences: {
                nodeIntegration: true,
            },
            // resizable: false,
        })
        // mainWindow.removeMenu()
    mainWindow.loadFile('./html/state.html')
    mainWindow.on('closed', function() {
        mainWindow = null
    })
}

const readConfigFile = function(configPath, keyBindingsPath) {
    var systemcfContent = fs.readFileSync(configPath, 'utf8');
    try {
        return {
            'playerModel': systemcfContent.match(/mp_model = \".*\"/g)[0],
            'playerColor': systemcfContent.match(/p_color = \".*\"/g)[0],
            'keyBindings': fs.readFileSync(keyBindingsPath, 'utf8'),
        }
    } catch (e) {
        return {
            'playerModel': "",
            'playerColor': "",
            'keyBindings': "",
        }
    }
}

const updatePlayerData = function(fileContents) {
    var request = net.request({
        url: "http://127.0.0.1:8000/farcryAPI/v1/players/update/?player_name=" + global.sharedObj.player_name,
        method: "PUT",
    })
    request.setHeader('Accept', 'application/json')
    request.setHeader('Content-Type', 'application/json')
    request.setHeader('Authorization', global.sharedObj.player_token)
    request.write(JSON.stringify({
        "player_character_model": fileContents.playerModel,
        "player_character_color": fileContents.playerColor,
        "player_key_bindings": fileContents.keyBindings
    }))
    request.end()
}


// ipcMain event receiver

ipcMain.on("set-player-name", (event, name) => {
    global.sharedObj.player_name = name;
})

ipcMain.on("set-player-token", (event, token) => {
    global.sharedObj.player_token = token;
})

ipcMain.on("set-player-data", (event, playerData) => {
    global.sharedObj.player_data = playerData;
})

ipcMain.on("set-file-path", (event, filePath) => {
    global.sharedObj.file_path = filePath;
})

ipcMain.on('open-file-dialog-for-file', function(event) {
    // Control button 'Select' from login.html
    // In order to get absolute path of selected file instead of /fakepath/
    if (os.platform() === 'linux' || os.platform() === 'win32') {
        dialog.showOpenDialog({
            properties: ['openFile']
        }, function(files) {
            if (files) {
                event.sender.send('selected-file', files[0]);
            }
        })
    } else {
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }, function(files) {
            if (files) {
                event.sender.send('selected-file', files[0]);
            }
        })
    }
})

ipcMain.on("update-player-data", function(_, configPath, keyBindingsPath) {
    var fileContents = readConfigFile(configPath, keyBindingsPath)
    updatePlayerData(fileContents)
    console.log(123)
})

// App event receiver
app.on('ready', createWindow)

app.on('window-all-closed', async function() {
    if (global.sharedObj.file_path != undefined) {
        if (global.sharedObj.player_name != undefined) {
            // Get config files path
            var farcryFolder = global.sharedObj.file_path.split("\\").slice(0, -2);
            var configPath = farcryFolder.join("\\") + "\\system.cfg";
            var keyBindingsPath = farcryFolder.join("\\") + "\\game.cfg";
            var fileContents = readConfigFile(configPath, keyBindingsPath);
            updatePlayerData(fileContents);
        }

        // Kill running Watchdog and FarCry before quitting
        var executable_file_name = global.sharedObj.file_path.split("\\").slice(-1)[0];
        exec("taskkill /IM " + executable_file_name + " /F");
    }

    // Delay 3 seconds
    await delay(3000);
    exec("taskkill /IM farcry_watchdog.exe /F");
    app.quit();
})

app.on('activate', function() {
    if (mainWindow === null) createWindow()
})