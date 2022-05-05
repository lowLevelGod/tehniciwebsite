window.addEventListener("DOMContentLoaded", function(){
    themebtn = document.getElementById("themebtn");
    themebtn.onclick = function()
    {
        document.body.classList.toggle("darktheme");
        if (document.body.classList.contains("darktheme"))
        {
            localStorage.setItem("theme", "darktheme");
            localStorage.setItem("themebtn", "fa-solid fa-moon");
            document.getElementById("themebtn").childNodes[0].className = "fa-solid fa-moon";
        }
        else
        {
            localStorage.setItem("theme", "lighttheme");
            localStorage.setItem("themebtn", "fa-solid fa-sun");
            document.getElementById("themebtn").childNodes[0].className = "fa-solid fa-sun";
        } 
    }
})