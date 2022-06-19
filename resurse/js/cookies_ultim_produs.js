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

function ultimprodus() {
    var parsedLink = window.location.href.split('/');
    if (parsedLink.includes('produs')) {
        var productnr = parsedLink[parsedLink.length - 1];
        setCookie("ultim_produs", productnr.toString(), 500000);
        // console.log(productnr);
    }
}

window.addEventListener("DOMContentLoaded", function() {
    ultimprodus();
})