// Validate if username's format
function valid_username(username) {
    var re = /^(?!.*__.*)[A-Z|a-z|0-9|_]+$/;
    return re.test(username);
}

// Validate if email's format
function valid_email(email) {
    var re = /^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]\@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){3}\.[a-z]{2,3}$/;
    return re.test(email);
}

// Validate if password's format
function valid_password(password) {
    var re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])[!-~]{8,35}$/;
    return re.test(password);
}

// Check if username is correct
function check_username() {
    var username = document.getElementById("register_username");
    var username_require = document.getElementById("register_username_error_display");
    if (valid_username(username.value) == true) {
        username_require.innerHTML = "Valid!";
        username_require.style.backgroundColor = "rgb(91, 255, 70)";
        return 1;
    } else {
        username_require.innerHTML = "Invalid!";
        username_require.style.backgroundColor = "red";
        username_require.style.color = "white";
        return 0;
    }
}

// Check if email is correct
function check_email() {
    var email = document.getElementById("register_email");
    var email_require = document.getElementById("register_email_error_display");
    if (valid_email(email.value) == true) {
        email_require.innerHTML = "Valid!";
        email_require.style.backgroundColor = "rgb(91, 255, 70)";
    } else {
        email_require.innerHTML = "Invalid!";
        email_require.style.backgroundColor = "red";
        email_require.style.color = "white";
    }
}

// Check if password is correct
function check_password() {
    var password = document.getElementById("register_password");
    var password_require = document.getElementById("register_password_error_display");
    if (valid_password(password.value) == true) {
        password_require.innerHTML = "Valid!";
        password_require.style.backgroundColor = "rgb(91, 255, 70)";
    } else {
        password_require.innerHTML = "Invalid!";
        password_require.style.backgroundColor = "red";
        password_require.style.color = "white";
    }
}

// Check if re-confirm password is correct
function check_same_password() {
    var password = document.getElementById("register_password");
    var re_password = document.getElementById("register_re_password");
    var require = document.getElementById("register_re_password_error_display");
    if (re_password.value == password.value) {
        require.innerHTML = "Valid!";
        require.style.backgroundColor = "rgb(91, 255, 70)";
    } else {
        require.innerHTML = "Invalid!";
        require.style.backgroundColor = "red";
        require.style.color = "white";
    }
}