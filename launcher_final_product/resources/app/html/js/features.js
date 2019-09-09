// Display the text inside password field when the button is clicked
$('.btn-show-password').click(
    function() {
        inputField = $(this).closest('.input-group').find('input')[0];
        iconButton = $(this).find('i')[0];
        if (inputField.type == "password") {
            inputField.type = "text";
            iconButton.classList.remove("fa-eye-slash");
            iconButton.classList.add('fa-eye');
        } else {
            inputField.type = "password";
            iconButton.classList.remove("fa-eye");
            iconButton.classList.add('fa-eye-slash');
        }
    }
)

// Enable register button when register infos are valid
function manage_register_submit() {
    var submit_button = document.getElementById("register_button");
    var elm = document.getElementsByClassName("error");
    var message = document.getElementById("API_display");
    for (var i = 0; i < elm.length; i++) {
        if (elm[i].innerHTML == "Valid!" && message.innerHTML == "This account is valid for new registration") {
            submit_button.disabled = false;
        } else {
            submit_button.disabled = true;
            return false;
        }
    }
}