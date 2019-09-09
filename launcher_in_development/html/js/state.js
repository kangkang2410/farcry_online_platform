// Change to login page after 1.5s
document.onreadystatechange = function() {
    var state = document.readyState;
    if (state == 'complete') {
        setTimeout(function() {
            window.location.href = "./login.html";
        }, 2500);
    }
}