function setCookie(nume, val, timpExp, path = "/") {
    //timpExp timp in milisecunde in care va expira cookie-ul
    d = new Date();
    d.setTime(d.getTime() + timpExp);
    console.log("Va expira:", d.toUTCString());
    document.cookie = `${nume}=${val}; expires=${d.toUTCString()}; path=${path}`;
}

function getCookie(nume) {
    var vectCookies = document.cookie.split(";");
    for (let c of vectCookies) {
        c = c.trim();
        if (c.startsWith(nume + "=")) {
            return c.substring(nume.length + 1)
        }
    }

}

function deleteCookie(nume) {
    setCookie(nume, "", 0);

}

function ultimproduse() {
    if (!getCookie("ultim_produs")) {
        document.getElementById("ultim_produs").style.display = "none";
    } else {
        document.getElementById("ultim_produs").style.display = "block";
        document.getElementById("ultim_produs_val").innerHTML = getCookie("ultim_produs");
    }
}

window.addEventListener("DOMContentLoaded", function() {
    ultimproduse();
})