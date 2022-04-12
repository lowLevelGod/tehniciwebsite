window.addEventListener("DOMContentLoaded", function() {

    var slider = document.getElementById("priceRange");
    var output = document.getElementById("inp-price");

    let updatePrice = () => output.innerHTML = slider.value;

    slider.addEventListener('input', updatePrice);


    var btn = document.getElementById("filter");
    btn.onclick = function() {
        var articles = document.getElementsByClassName("produs");
        for (let prod of articles) {
            prod.style.display = "none";
            var description = prod.getElementsByClassName("val-description")[0].innerHTML;
            var keyword = document.getElementById("inp-keyword").value;
            var cond1 = description.includes(keyword);

            var inpPrice = parseInt(document.getElementById("inp-price").innerHTML);
            var price = parseInt(prod.getElementsByClassName("val-price")[0].innerHTML);
            var cond2 = price >= inpPrice ? true : false;

            var productChoice = document.getElementById("product-choice").value.toLowerCase();
            var productName = prod.getElementsByClassName("val-name")[0].innerHTML.toLowerCase();
            var cond3 = productName.includes(productChoice);

            var storageSize = parseInt(prod.getElementsByClassName("val-storage_size")[0].innerHTML);
            var radbtns = document.getElementsByName("szrad");
            for (let rad of radbtns) {
                if (rad.checked) {
                    var valSize = rad.value;
                    break;
                }
            }

            var cond4 = false;
            switch (valSize) {
                case "1":
                    cond4 = (storageSize <= 200);
                    break;
                case "2":
                    cond4 = (200 < storageSize && storageSize <= 500);
                    break;
                case "3":
                    cond4 = (500 < storageSize && storageSize <= 950);
                    break;
                default:
                    cond4 = true;
                    break;
            }

            var noutatiDate = Date.parse(document.getElementsByClassName("val-noutati")[0].innerHTML);
            var prodDate = Date.parse(prod.getElementsByClassName("last_update")[0].innerHTML);
            var cond5 = (prodDate > noutatiDate);
            if (!document.getElementById("noutati").checked)
                cond5 = true;

            var textareaName = document.getElementById("textarea-name").value.toLowerCase();
            var cond6 = productName.startsWith(textareaName);

            var prodSource = prod.getElementsByClassName("val-src")[0].innerHTML.toLowerCase();
            var sourceOptions = document.getElementsByName("src-select");
            for (let src of sourceOptions) {
                if (src.selected) {
                    var srcValue = src.value;
                    break;
                }
            }
            var cond7 = false;
            switch (srcValue) {
                case "1":
                    cond7 = (prodSource == "open source");
                    break;
                case "2":
                    cond7 = (prodSource == "closed source");
                    break;
                default:
                    cond7 = true;
                    break;
            }
            console.log(cond7);
            if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7) {
                prod.style.display = "grid";
            }

        }
    }
    var rng = document.getElementById("inp-pret");
    rng.onchange = function() {
        var info = document.getElementById("infoRange"); //returneaza null daca nu gaseste elementul
        if (!info) {
            info = document.createElement("span");
            info.id = "infoRange"
            this.parentNode.appendChild(info);
        }

        info.innerHTML = "(" + this.value + ")";
    }



    function sorteaza(semn) {
        var articole = document.getElementsByClassName("produs");
        var v_articole = Array.from(articole);
        v_articole.sort(function(a, b) {
            var nume_a = a.getElementsByClassName("val-nume")[0].innerHTML;
            var nume_b = b.getElementsByClassName("val-nume")[0].innerHTML;
            if (nume_a != nume_b) {
                return semn * nume_a.localeCompare(nume_b);
            } else {

                var pret_a = parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                var pret_b = parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
                return semn * (pret_a - pret_b);
            }
        });
        for (let art of v_articole) {
            art.parentNode.appendChild(art);
        }
    }

    var btn2 = document.getElementById("sortCrescNume");
    btn2.onclick = function() {

        sorteaza(1)
    }

    var btn3 = document.getElementById("sortDescrescNume");
    btn3.onclick = function() {
        sorteaza(-1)
    }


    document.getElementById("resetare").onclick = function() {
        //resetare inputuri
        document.getElementById("i_rad4").checked = true;
        document.getElementById("inp-pret").value = document.getElementById("inp-pret").min;
        document.getElementById("infoRange").innerHTML = "(" + document.getElementById("inp-pret").min + ")";

        //de completat...


        //resetare articole
        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {

            art.style.display = "block";
        }
    }

    // -------------------- selectare produse cos virtual----------------------------------
    /*
        indicatie pentru cand avem cantitati
        fara cantitati: "1,2,3,4" //1,2,3,4 sunt id-uri
        cu cantitati:"1:5,2:3,3:1,4:1" // 5 produse de tipul 1, 3 produse de tipul 2, 1 produs de tipul 3...
        putem memora: [[1,5],[2,3],[3,1],[4,1]]// un element: [id, cantitate]

    */
    ids_produse_init = localStorage.getItem("produse_selectate");
    if (ids_produse_init)
        ids_produse_init = ids_produse_init.split(","); //obtin vectorul de id-uri ale produselor selectate  (din cosul virtual)
    else
        ids_produse_init = []

    var checkboxuri_cos = document.getElementsByClassName("select-cos");
    for (let ch of checkboxuri_cos) {
        if (ids_produse_init.indexOf(ch.value) != -1)
            ch.checked = true;
        ch.onchange = function() {
            ids_produse = localStorage.getItem("produse_selectate")
            if (ids_produse)
                ids_produse = ids_produse.split(",");
            else
                ids_produse = []
            console.log("Selectie veche:", ids_produse);
            //ids_produse.map(function(elem){return parseInt(elem)});
            //console.log(ids_produse);
            if (ch.checked) {
                ids_produse.push(ch.value); //adaug elementele noi, selectate (bifate)
            } else {
                ids_produse.splice(ids_produse.indexOf(ch.value), 1) //sterg elemente debifate
            }
            console.log("Selectie noua:", ids_produse);
            localStorage.setItem("produse_selectate", ids_produse.join(","))
        }
    }
});


window.onkeydown = function(e) {
    console.log(e);
    if (e.key == "c" && e.altKey == true) {
        var suma = 0;
        var articole = document.getElementsByClassName("produs");
        for (let art of articole) {
            if (art.style.display != "none")
                suma += parseFloat(art.getElementsByClassName("val-pret")[0].innerHTML);
        }

        var spanSuma;
        spanSuma = document.getElementById("numar-suma");
        if (!spanSuma) {
            spanSuma = document.createElement("span");
            spanSuma.innerHTML = " Suma:" + suma; //<span> Suma:...
            spanSuma.id = "numar-suma"; //<span id="..."
            document.getElementById("p-suma").appendChild(spanSuma);
            setTimeout(function() { document.getElementById("numar-suma").remove() }, 1500);
        }
    }


}