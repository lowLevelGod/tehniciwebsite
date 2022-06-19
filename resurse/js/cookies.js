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
/*
functie de verificare a faptului ca exista cookie-ul "acceptat_banner_cookies", 
caz in care ascundem banner_cookiesul. Altfel, daca nu exista cookie-ul afisam 
banner_cookiesul si setam o functie la click pe buton prin care adaugam cookie-ul (care va expira dupa 5 secunde).*/

function checkBanner() {
    if (getCookie("acceptat_banner_cookies")) {
        document.getElementById("banner_cookies").style.display = "none";
    } else {
        document.getElementById("banner_cookies").style.display = "block";
        document.getElementById("ok_cookies").onclick = function() {
            document.getElementById("banner_cookies").style.display = "none";
            setCookie("acceptat_banner_cookies", "true", 500000);
        }
    }
}


window.addEventListener("DOMContentLoaded", function() {
    checkBanner();
})