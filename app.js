const express = require("express");
const fs = require('fs');
const sharp = require('sharp');
const { Client } = require('pg');
const res = require('express/lib/response');
const ejs = require('ejs');
const sass = require('sass');

var client = new Client({ database: "dbfortw", user: "pedro", password: "1234", host: "localhost", port: 5432 });
client.connect();

app = express();

app.set("view engine", "ejs");

app.use("/resurse", express.static(__dirname + "/resurse"))

app.use("/*", function(req, res, next) {
    client.query("select max(pret) from produse union select min(pret) from produse", function(err, rezRows) {
        res.locals.max_price = rezRows.rows[0].max;
        res.locals.min_price = rezRows.rows[1].max;
        next();
    });
});

app.use("/*", function(req, res, next) {
    client.query("select count(*) from produse", function(err, noRows) {
        var sirScss = fs.readFileSync(__dirname + "/resurse/scss/produs.scss").toString("utf8");
        rezScss = ejs.render(sirScss, { nrproducts: noRows.rows[0].count });
        console.log(rezScss);
        var caleScss = __dirname + "/temp/produs.scss"
        fs.writeFileSync(caleScss, rezScss);
        try {
            rezCompilare = sass.compile(caleScss, { sourceMap: true });

            var caleCss = __dirname + "/resurse/style/produs.css";
            fs.writeFileSync(caleCss, rezCompilare.css);
        } catch (err) {
            console.log(err);
            res.send("Eroare");
        }
        next();
    });
});

app.use("/*", function(req, res, next) {
    client.query("select * from unnest(enum_range(null::categorie_mare))", function(err, rezCateg) {
        res.locals.categ = rezCateg.rows;
        next();
    });
});


console.log("Director proiect:", __dirname);

app.get(["/", "/index", "/home"], function(req, res) {
    //res.sendFile(__dirname+"/index1.html");
    var quarter = Math.floor(new Date().getMinutes() / 15)
    res.render("pagini/index", { ip: req.ip, imagini: obImagini.imagini, quarter: quarter });

})

app.get("/produse", function(req, res) {
    var condWhere = req.query.tip ? `categorie_mare='${req.query.tip}'` : "1=1";
    console.log(condWhere);
    client.query("select * from produse where " + condWhere, function(err, rezQuery) {
        res.render("pagini/produse", { produse: rezQuery.rows });
    });
})

app.get("/produs/:id", function(req, res) {
    client.query(`select * from produse where id=${req.params.id}`, function(err, rezQuery) {
        res.render("pagini/produs", { prod: rezQuery.rows[0] });
    });
});

app.get("/eroare", function(req, res) {
    randeazaEroare(res, 1, "Titlu schimbat");
});


function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

app.get("/contact", function(req, res) {
    var sirScss = fs.readFileSync(__dirname + "/resurse/scss/galerie_animata.scss").toString("utf8");
    const nrmaxImagini = 10
    var randomNumber = getRandomArbitrary(0, nrmaxImagini);
    while (randomNumber % 3 != 0) {
        randomNumber = getRandomArbitrary(1, nrmaxImagini);
    }
    var randomOffset = getRandomArbitrary(0, nrmaxImagini - randomNumber - 1);
    rezScss = ejs.render(sirScss, { nrimag: randomNumber });
    console.log(rezScss);
    var caleScss = __dirname + "/temp/galerie_animata.scss"
    fs.writeFileSync(caleScss, rezScss);
    try {
        rezCompilare = sass.compile(caleScss, { sourceMap: true });

        var caleCss = __dirname + "/resurse/style/galerie_animata.css";
        fs.writeFileSync(caleCss, rezCompilare.css);
    } catch (err) {
        console.log(err);
        res.send("Eroare");
    }
    res.render("pagini/contact", { imagini: obImagini.imagini, offset: randomOffset, nrImagini: randomNumber });
});

app.get("/*.ejs", function(req, res) {
    //res.sendFile(__dirname+"/index1.html");
    //res.status(403).render("pagini/403");
    randeazaEroare(res, 403);
})

/*
app.get("/despre", function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    res.render("pagini/despre");
})
*/
app.get("/ceva", function(req, res, next) {
    res.write("<p style='color:pink'>Salut-1</p>");
    console.log("1");
    next();
    //res.end();
})
app.get("/ceva", function(req, res, next) {
    res.write("Salut-2");

    console.log("2");
    next();
})


app.get("/*", function(req, res) {
    res.render("pagini" + req.url, function(err, rezRender) {
        if (err) {
            if (err.message.includes("Failed to lookup view")) {
                console.log(err);
                //res.status(404).render("pagini/404");
                randeazaEroare(res, 404);
            } else {

                res.render("pagini/error_default");
            }
        } else {
            console.log(rezRender);
            res.send(rezRender);
        }
    });

    //console.log("generala:",req.url);
    res.end();
})

function creeazaImagini() {
    var buf = fs
        .readFileSync(__dirname + "/resurse/json/galerie.json")
        .toString("utf8");

    obImagini = JSON.parse(buf); //global

    //console.log(obImagini);
    for (let imag of obImagini.imagini) {
        let nume_imag, extensie;
        [nume_imag, extensie] = imag.cale_imagine.split("."); // "abc.de".split(".") ---> ["abc","de"]
        let dim_mic = 150;

        imag.mic = `${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp`; //nume-150.webp // "a10" b=10 "a"+b `a${b}`
        //console.log(imag.mic);

        imag.mare = `${obImagini.cale_galerie}/${imag.cale_imagine}`;
        if (!fs.existsSync(imag.mic))
            sharp(__dirname + "/" + imag.mare)
            .resize(dim_mic)
            .toFile(__dirname + "/" + imag.mic);
        let dim_mediu = 300;
        imag.mediu = `${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`;
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname + "/" + imag.mare)
            .resize(dim_mediu)
            .toFile(__dirname + "/" + imag.mediu);
    }
}
creeazaImagini();

function creeazaErori() {
    var buf = fs
        .readFileSync(__dirname + "/resurse/json/errors.json")
        .toString("utf8"); // global
    obErori = JSON.parse(buf);
}
creeazaErori();

function randeazaEroare(res, identificator, titlu, text, imagine) {
    var eroare = obErori.errors.find(function(elem) {
        return identificator == elem.id;
    });

    titlu = titlu || (eroare && eroare.title) || "Eroare - eroare";
    text = text || (eroare && eroare.text) || "Dap, asta e o eroare.";
    imagine =
        imagine ||
        (eroare && obErori.root + "/" + eroare.image) ||
        "resurse/pics/errors/denied640.png";

    if (eroare && eroare.status) {
        res.status(eroare.id).render("pagini/error_default", {
            title: titlu,
            text: text,
            image: imagine,
        });
    } else {
        res.render("pagini/error_default", {
            title: titlu,
            text: text,
            image: imagine,
        });
    }
}

const hostname = "127.0.0.1";
var port = process.env.PORT || 8080;

app.listen(port, hostname);
console.log("A pornit")