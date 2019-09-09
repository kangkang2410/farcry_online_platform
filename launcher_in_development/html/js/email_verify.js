var ipcRenderer = require('electron').ipcRenderer;
var remote = require('electron').remote;
var player_name;
var player_token;
var verified = false;
var currentProcess;

$(function() {
    player_name = remote.getGlobal('sharedObj').player_name;
    player_token = remote.getGlobal('sharedObj').player_token;
    console.log(player_name);
    console.log(player_token);
    currentProcess = setTimeout(checkEmailVerification, 1000);
});

const checkEmailVerification = async function() {
    if (!verified) {
        try {
            const response = await fetch("http://127.0.0.1:8000/farcryAPI/v1/players/login/", {
                method: 'POST',
                body: JSON.stringify({ "player_name": player_name, "player_password": player_token }),
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            switch (response.status) {
                case 200:
                    verified = true;
                    data = await response.json();
                    ipcRenderer.send("set-player-token", data.token);
                    ipcRenderer.send("set-player-name", data.player_name);
                    ipcRenderer.send("set-player-data", {
                        'player_character_model': data.player_character_model,
                        'player_character_color': data.player_character_color,
                        'player_key_bindings': data.player_key_bindings
                    });
                    window.location.replace("./logout.html");
                    break;
                case 406:
                    data = await response.json();
                    player_token = data.token;
                    currentProcess = setTimeout(checkEmailVerification, 1000);
                    break;
                default:
                    alert("An unknown error happened during the verification process. Return to login page.");
                    window.location.href = "./login.html";
            }
            console.log(response.status);
        } catch (e) {
            console.log(e);
        }
    }
}

function returnToLoginPage() {
    ipcRenderer.send("set-player-name", undefined);
    ipcRenderer.send("set-player-password", undefined);
    clearTimeout(currentProcess);
    window.location.href = "./login.html";
}
