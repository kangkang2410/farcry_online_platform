var ipcRenderer = require('electron').ipcRenderer;
// Check if email/username is viable for register
const check_data_API = async() => {
    // Get the user input email/username
    var player_name = document.getElementById("register_username");
    var player_email = document.getElementById("register_email");
    var message = document.getElementById("API_display");
    // Send request to check register data and display result
    const response = await fetch("http://127.0.0.1:8000/farcryAPI/v1/players/check_availability/?player_email=" +
        player_email.value + "&player_name=" + player_name.value, {
            method: "GET",
        });
    switch (response.status) {
        case 200:
        case 406:
            const player_content = await response.json();
            message.innerHTML = Object.values(player_content);
            message.style.color = "blue";
    }
}

// Submit register datas
const submit_register_form_API = async() => {
    // Get name/email/password input from user
    var player_name = document.getElementById("register_username").value;
    var player_email = document.getElementById("register_email").value;
    var player_password = document.getElementById("register_password").value;
    // Disable the register button
    document.getElementById("register_button").disabled = true;
    // Call register api
    const response = await fetch("http://127.0.0.1:8000/farcryAPI/v1/players/register/", {
        method: "POST",
        body: JSON.stringify({ "player_name": player_name, "player_email": player_email, "player_password": player_password }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    });
    // If the call was a success, save player name and token, switch to email verify screen
    if (response.status === 202) {
        const data = await response.json();
        ipcRenderer.send("set-player-name", player_name);
        ipcRenderer.send("set-player-token", data.token);
        window.location.href = "./email_verify.html";
    }
    document.getElementById("register_button").disabled = false;
}

// Validate the username and email
const call_check_data_API = async() => {
    var username_require = document.getElementById("register_username_error_display");
    var email_require = document.getElementById("register_email_error_display");
    if (username_require.innerHTML == "Valid!" && email_require.innerHTML == "Valid!") {
        check_data_API();
    }
}