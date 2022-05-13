const express = require('express')
const fs = require('fs')
const sharp = require('sharp')
const { Client } = require('pg')
const res = require('express/lib/response')
const ejs = require('ejs')
const sass = require('sass')
const formidable = require('formidable')
const crypto = require('crypto')
const path = require('path')
const nodemailer = require('nodemailer')
const session = require('express-session')

async function trimiteMail(
    email,
    subiect,
    mesajText,
    mesajHtml,
    atasamente = []
) {
    var transp = nodemailer.createTransport({
            service: 'gmail',
            secure: false,
            auth: {
                //date login
                user: obGlobal.emailServer,
                pass: 'LcQ2i54A5NP48zk'
            },
            tls: {
                rejectUnauthorized: false
            }
        })
        //genereaza html
    await transp.sendMail({
        from: obGlobal.emailServer,
        to: email,
        subject: subiect, //"Te-ai inregistrat cu succes",
        text: mesajText, //"Username-ul tau este "+username
        html: mesajHtml, // `<h1>Salut!</h1><p style='color:blue'>Username-ul tau este ${username}.</p> <p><a href='http://${numeDomeniu}/cod/${username}/${token}'>Click aici pentru confirmare</a></p>`,
        attachments: atasamente
    })
    console.log('trimis mail')
}

const obGlobal = {
    obImagini: null,
    obErori: null,
    emailServer: 'notpedrosancheztw@gmail.com',
    protocol: null,
    numeDomeniu: null,
    port: 8080,
    sirAlphaNum: ''
}

if (process.env.SITE_ONLINE) {
    obGlobal.protocol = 'https://'
    obGlobal.numeDomeniu = 'floating-earth-91056.herokuapp.com'
    var client = new Client({
        database: 'ddl79c5s37vdrg',
        user: 'qzqucoccjhgisf',
        password: '2ebe44ef014e628f3a672fca87314e00000bda6c24406b9bb093fa97714c5cae',
        host: 'ec2-23-20-224-166.compute-1.amazonaws.com',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
    })
} else {
    obGlobal.protocol = 'http://'
    obGlobal.numeDomeniu = '127.0.0.1:' + obGlobal.port
    var client = new Client({
        database: 'dbfortw',
        user: 'pedro',
        password: '1234',
        host: 'localhost',
        port: 5432
    })
}

// var client = new Client({
//     database: 'dbfortw',
//     user: 'pedro',
//     password: '1234',
//     host: 'localhost',
//     port: 5432
// })
client.connect()

app = express()

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')

app.use('/resurse', express.static(__dirname + '/resurse'))

app.use(
    session({
        secret: 'abcdefg', //folosit de express session pentru criptarea id-ului de sesiune
        resave: true,
        saveUninitialized: false
    })
)

app.use('/*', function(req, res, next) {
    res.locals.utilizator = req.session.utilizator
    res.locals.mesajLogin = req.session.mesajLogin
    req.session.mesajLogin = null
    next()
})

app.use('/*', function(req, res, next) {
    client.query(
        'select max(pret) from produse union select min(pret) from produse',
        function(err, rezRows) {
            res.locals.max_price = rezRows.rows[0].max
            res.locals.min_price = rezRows.rows[1].max
            next()
        }
    )
})

app.use('/*', function(req, res, next) {
    client.query('select count(*) from produse', function(err, noRows) {
        var sirScss = fs
            .readFileSync(__dirname + '/resurse/scss/produs.scss')
            .toString('utf8')
        rezScss = ejs.render(sirScss, { nrproducts: noRows.rows[0].count })
            // console.log(rezScss)
        var caleScss = __dirname + '/temp/produs.scss'
        fs.writeFileSync(caleScss, rezScss)
        try {
            rezCompilare = sass.compile(caleScss, { sourceMap: true })

            var caleCss = __dirname + '/resurse/style/produs.css'
            fs.writeFileSync(caleCss, rezCompilare.css)
        } catch (err) {
            // console.log(err)
            res.send('Eroare')
        }
        next()
    })
})

app.use('/*', function(req, res, next) {
    client.query(
        'select * from unnest(enum_range(null::categorie_mare))',
        function(err, rezCateg) {
            res.locals.categ = rezCateg.rows
            next()
        }
    )
})

app.use('/*', function(req, res, next) {
    client.query(
        'select * from unnest(enum_range(null::categorie_mica))',
        function(err, rezCateg) {
            res.locals.categMica = rezCateg.rows
            next()
        }
    )
})

console.log('Director proiect:', __dirname)

app.get(['/', '/index', '/home'], function(req, res) {
    //res.sendFile(__dirname+"/index1.html");
    var quarter = Math.floor(new Date().getMinutes() / 15)
    client.query('select * from produse', function(err, rezQuery) {
        res.render('pagini/index', {
            ip: req.ip,
            imagini: obImagini.imagini,
            quarter: quarter,
            produse: rezQuery.rows,
            cnt: 0
        })
    })
})

app.get('/produse', function(req, res) {
    var condWhere = req.query.tip ? `categorie_mare='${req.query.tip}'` : '1=1'
        //console.log(condWhere)
    client.query('select * from produse where ' + condWhere, function(
        err,
        rezQuery
    ) {
        res.render('pagini/produse', { produse: rezQuery.rows })
    })
})

app.get('/produs/:id', function(req, res) {
    client.query(`select * from produse where id=${req.params.id}`, function(
        err,
        rezQuery
    ) {
        res.render('pagini/produs', { prod: rezQuery.rows[0] })
    })
})

app.get('/eroare', function(req, res) {
    randeazaEroare(res, 1, 'Titlu schimbat')
})

function getRandomArbitrary(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
}

app.get('/contact', function(req, res) {
    var sirScss = fs
        .readFileSync(__dirname + '/resurse/scss/galerie_animata.scss')
        .toString('utf8')
    const nrmaxImagini = 10
    var randomNumber = getRandomArbitrary(0, nrmaxImagini)
    while (randomNumber % 3 != 0) {
        randomNumber = getRandomArbitrary(1, nrmaxImagini)
    }
    var randomOffset = getRandomArbitrary(0, nrmaxImagini - randomNumber - 1)
    rezScss = ejs.render(sirScss, { nrimag: randomNumber })
        //le.log(rezScss)
    var caleScss = __dirname + '/temp/galerie_animata.scss'
    fs.writeFileSync(caleScss, rezScss)
    try {
        rezCompilare = sass.compile(caleScss, { sourceMap: true })

        var caleCss = __dirname + '/resurse/style/galerie_animata.css'
        fs.writeFileSync(caleCss, rezCompilare.css)
    } catch (err) {
        console.log(err)
        res.send('Eroare')
    }
    res.render('pagini/contact', {
        imagini: obImagini.imagini,
        offset: randomOffset,
        nrImagini: randomNumber
    })
})

app.get('/*.ejs', function(req, res) {
    //res.sendFile(__dirname+"/index1.html");
    //res.status(403).render("pagini/403");
    randeazaEroare(res, 403)
})

/*
app.get("/despre", function(req, res){
    //res.sendFile(__dirname+"/index1.html");
    res.render("pagini/despre");
})
*/
app.get('/ceva', function(req, res, next) {
    res.write("<p style='color:pink'>Salut-1</p>")
        //console.log('1')
    next()
        //res.end();
})
app.get('/ceva', function(req, res, next) {
    res.write('Salut-2')

    //le.log('2')
    next()
})

function creeazaImagini() {
    var buf = fs
        .readFileSync(__dirname + '/resurse/json/galerie.json')
        .toString('utf8')

    obImagini = JSON.parse(buf) //global

    //console.log(obImagini);
    for (let imag of obImagini.imagini) {
        let nume_imag, extensie;
        [nume_imag, extensie] = imag.cale_imagine.split('.') // "abc.de".split(".") ---> ["abc","de"]
        let dim_mic = 150

        imag.mic = `${obImagini.cale_galerie}/mic/${nume_imag}-${dim_mic}.webp` //nume-150.webp // "a10" b=10 "a"+b `a${b}`
            //console.log(imag.mic);

        imag.mare = `${obImagini.cale_galerie}/${imag.cale_imagine}`
        if (!fs.existsSync(imag.mic))
            sharp(__dirname + '/' + imag.mare)
            .resize(dim_mic)
            .toFile(__dirname + '/' + imag.mic)
        let dim_mediu = 300
        imag.mediu = `${obImagini.cale_galerie}/mediu/${nume_imag}-${dim_mediu}.png`
        if (!fs.existsSync(imag.mediu))
            sharp(__dirname + '/' + imag.mare)
            .resize(dim_mediu)
            .toFile(__dirname + '/' + imag.mediu)
    }
}
creeazaImagini()

function creeazaErori() {
    var buf = fs
        .readFileSync(__dirname + '/resurse/json/errors.json')
        .toString('utf8') // global
    obErori = JSON.parse(buf)
}
creeazaErori()

function randeazaEroare(res, identificator, titlu, text, imagine) {
    var eroare = obErori.errors.find(function(elem) {
        return identificator == elem.id
    })

    titlu = titlu || (eroare && eroare.title) || 'Eroare - eroare'
    text = text || (eroare && eroare.text) || 'Dap, asta e o eroare.'
    imagine =
        imagine ||
        (eroare && obErori.root + '/' + eroare.image) ||
        'resurse/pics/errors/denied640.png'

    if (eroare && eroare.status) {
        res.status(eroare.id).render('pagini/error_default', {
            title: titlu,
            text: text,
            image: imagine
        })
    } else {
        res.render('pagini/error_default', {
            title: titlu,
            text: text,
            image: imagine
        })
    }
}

var intervaleAscii = [
        [48, 57],
        [65, 90],
        [97, 122]
    ]
    // for (let interval of intervaleAscii) {
for (let i = intervaleAscii[2][0]; i <= intervaleAscii[2][1]; i++)
    obGlobal.sirAlphaNum += String.fromCharCode(i)
    // }

function genereazaToken(n) {
    var token = ''
    for (let i = 0; i < n; i++) {
        token +=
            obGlobal.sirAlphaNum[
                Math.floor(Math.random() * obGlobal.sirAlphaNum.length)
            ]
    }
    return token
}

parolaServer = 'tehniciweb'
app.post('/companyform', function(req, res) {
    var formular = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, 'user_pics'),
        keepExtensions: true
    })
    formular.parse(req, function(err, campuriText, campuriFisier) {
        var eroare = ''
        if (campuriText.username == '') {
            eroare += 'Username necompletat. '
        }
        if (campuriText.nume == '') {
            eroare += 'nume necompletat. '
        }
        if (campuriText.prenume == '') {
            eroare += 'prenume necompletat. '
        }
        if (campuriText.parola == '') {
            eroare += 'parola necompletat. '
        }
        if (campuriText.rparola == '') {
            eroare += 'rparola necompletat. '
        }
        if (campuriText.email == '') {
            eroare += 'email necompletat. '
        }
        if (!campuriText.email.includes('@')) {
            eroare += 'email invalid. '
        }
        if (!campuriText.username.match(new RegExp('[A-Za-z0-9]+$'))) {
            eroare += 'Username nu corespunde patternului. '
        }
        if (!eroare) {
            queryUtiliz = `select username from utilizatori where username='${campuriText.username}'`
            client.query(queryUtiliz, function(err, rezUtiliz) {
                if (rezUtiliz.rows.length != 0) {
                    eroare += 'Username-ul mai exista. '
                    res.render('pagini/companyform', {
                        err: eroare
                    })
                } else {
                    campuriText.username = campuriText.username.toLowerCase()
                    var token = genereazaToken(50)
                    var token2 = Math.floor(new Date().getTime() / 1000)
                    var token3 = (token + token2.toString()).trim()
                    console.log(token)
                    var parolaCriptata = crypto
                        .scryptSync(campuriText.parola, parolaServer, 64)
                        .toString('hex')
                    var comandaInserare = `insert into utilizatori (username, nume, prenume, email, parola, culoare_chat, cod,  telefon, imagine_profil) values ('${campuriText.username}', '${campuriText.nume}', '${campuriText.prenume}', '${campuriText.email}', '${parolaCriptata}', '${campuriText.culoare_chat}', '${token3}', '${campuriText.phone}', '${campuriFisier.poza.newFilename}')`
                    client.query(comandaInserare, function(err, rezInserare) {
                        if (err) {
                            //console.log(err)
                            res.render('pagini/companyform', {
                                err: 'Eroare baza de date'
                            })
                        } else {
                            res.render('pagini/companyform', {
                                raspuns: 'Datele au fost introduse'
                            })
                            let usernameupper = campuriText.username.toUpperCase()
                            let linkConfirmare = `${obGlobal.protocol}${obGlobal.numeDomeniu}/cod_mail/${token}-${token2}/${usernameupper}`
                            trimiteMail(
                                campuriText.email,
                                'Te-ai inregistrat',
                                'mesaj text',
                                `<h1>Salut, stimate ${campuriText.nume}!</h1><p style='color:blue'>Username-ul tau este ${campuriText.username} pe site-ul <span style='font-weight : bold; font-style : italic; text-decoration : underline' >Software license shop</span>.</p><p>Link confirmare: <a href='${linkConfirmare}'>${linkConfirmare}</a></p>`
                            )
                        }
                    })
                }
            })
        } else {
            res.render('pagini/companyform', {
                eroare: eroare
            })
        }
    })
})

app.post('/login', function(req, res) {
    var formular = new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier) {
        console.log(campuriText)
        var parolaCriptata = crypto
            .scryptSync(campuriText.parola, parolaServer, 64)
            .toString('hex')
        var querySelect = `select * from utilizatori where username='${campuriText.username}' and parola='${parolaCriptata}' and confirmat_mail=true`
            // var querySelect = `select * from utilizatori where username='$1::text and parola=$2::text and confirmat_mail=true`;
        console.log(querySelect)
        client.query(querySelect, function(err, rezSelect) {
            if (err) console.log(err)
            else {
                if (rezSelect.rows.length == 1) {
                    //daca am utilizatorul si a dat credentiale corecte
                    req.session.utilizator = {
                        id: rezSelect.rows[0].id,
                        nume: rezSelect.rows[0].nume,
                        prenume: rezSelect.rows[0].prenume,
                        username: rezSelect.rows[0].username,
                        email: rezSelect.rows[0].email,
                        culoare_chat: rezSelect.rows[0].culoare_chat,
                        rol: rezSelect.rows[0].rol,
                        imagine: rezSelect.rows[0].imagine_profil,
                        phone: rezSelect.rows[0].telefon
                    }
                    res.redirect('/index')
                } else {
                    req.session.mesajLogin = 'Login esuat'
                    res.redirect('/index')
                }
            }
        })
    })
})

app.get('/cod_mail/:token/:username', function(req, res) {
    req.params.username = req.params.username.toLowerCase()
    req.params.token = req.params.token.replace('-', '')
    var comandaSelect = `update utilizatori set confirmat_mail=true where username='${req.params.username}' and cod='${req.params.token}'`
    console.log(comandaSelect)
    client.query(comandaSelect, function(err, rezUpdate) {
        if (err) {
            console.log(err)
            randeazaEroare(res, 2)
        } else {
            if (rezUpdate.rowCount == 1) {
                console.log(rezUpdate)
                res.render('pagini/confirmare')
            } else {
                randeazaEroare(
                    res,
                    2,
                    'Eroare link confirmare',
                    'Nu e userul sau linkul corect'
                )
            }
        }
    })
})

app.get('/useri', function(req, res) {
    if (req.session.utilizator && req.session.utilizator.rol == 'admin') {
        console.log(req.session.utilizator.username)
        client.query(`select * from utilizatori where username != '${req.session.utilizator.username}'`, function(
            err,
            rezQuery
        ) {
            console.log(err)
            console.log(rezQuery)
            res.render('pagini/useri', { useri: rezQuery.rows })
        })
    } else {
        randeazaEroare(res, 403)
    }
})

app.post('/sterge_utiliz', function(req, res) {
    var formular = new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier) {
        let queryDel = `delete from utilizatori where id=${campuriText.id_utiliz}`
        client.query(queryDel, function(err, rezQuery) {
            console.log(err)
                // TO DO afisare a unui mesaj friendly pentru cazurile de succes si esec
            res.redirect('/useri')
        })
    })
})

app.post('/modifproduse', function(req, res) {
    var formular = new formidable.IncomingForm()
    formular.parse(req, function(err, campuriText, campuriFisier) {
        campuriText.platforms = "{" + campuriText.platforms + "}";
        let queryUpdate = `update produse set nume='${campuriText.nume}', descriere='${campuriText.descriere}', storage_size='${campuriText.storage_size}', categorie_mare='${campuriText.categorie_mare}', categorie_mica='${campuriText.categorie_mica}', platforms='${campuriText.platforms}' where id='${campuriText.id}'`
        console.log(queryUpdate);
        client.query(queryUpdate, function(err, rezQuery) {
            console.log(err)
                // TO DO afisare a unui mesaj friendly pentru cazurile de succes si esec
            res.redirect('/administrare')
        })
    })
})

// ---------------- Update profil -----------------------------
app.post('/profil', function(req, res) {
    if (!req.session.utilizator) {
        res.render('pagini/error_default', { text: 'Nu sunteti logat.' })
        return
    }
    var formular = new formidable.IncomingForm({
        uploadDir: path.join(__dirname, 'user_pics'),
        keepExtensions: true
    })

    formular.parse(req, function(err, campuriText, campuriFile) {
        var criptareParola = crypto
            .scryptSync(campuriText.rparola, parolaServer, 64)
            .toString('hex')
        var criptareParolaNoua = crypto
            .scryptSync(campuriText.parola, parolaServer, 64)
            .toString('hex')

        var queryUpdate = `update utilizatori set nume='${campuriText.nume}', prenume='${campuriText.prenume}', email='${campuriText.email}', culoare_chat='${campuriText.culoare_chat}', imagine_profil='${campuriFile.poza.newFilename}', parola='${criptareParolaNoua}' where parola='${criptareParola}'`
        client.query(queryUpdate, function(err, rez) {
            if (err) {
                console.log(err)
                res.render('pagini/error_default', {
                    text: 'Eroare baza date. Incercati mai tarziu.'
                })
                return
            }

            if (rez.rowCount == 0) {
                res.render('pagini/profil', {
                    mesaj: 'Update-ul nu s-a realizat. Verificati parola introdusa.'
                })
                return
            } else {
                //actualizare sesiune
                req.session.utilizator.nume = campuriText.nume
                req.session.utilizator.prenume = campuriText.prenume
                req.session.utilizator.email = campuriText.email
                req.session.utilizator.culoare_chat = campuriText.culoare_chat
                req.session.utilizator.imagine = campuriFile.poza.newFilename

                trimiteMail(
                    campuriText.email,
                    'Date schimbate',
                    'mesaj text',
                    `<p>${campuriText.username}</p><p>${campuriText.prenume}</p><p>${campuriText.email}</p>`
                )
            }

            res.render('pagini/profil', {
                mesaj: 'Update-ul s-a realizat cu succes.'
            })
        })
    })
})

app.get('/profil', function(req, res) {
    res.render('pagini/profil')
})

app.get('/logout', function(req, res) {
    req.session.destroy()
    res.locals.utilizator = null
    res.redirect('index')
})

app.post('/promote', function(req, res) {
    var formular = new formidable.IncomingForm()

    formular.parse(req, function(err, campuriText, campuriFile) {
        var newRol = campuriText.rol == 'admin' ? 'comun' : 'admin';
        var queryUpdate = `update utilizatori set rol='${newRol}' where id='${campuriText.id}'`
        client.query(queryUpdate, function(err, rez) {
            if (err) {
                console.log(err)
                res.render('pagini/error_default', {
                    text: 'Eroare baza date. Incercati mai tarziu.'
                })
                return
            } else {
                var msj = newRol == 'admin' ? 'promovat :)' : 'retrogradat :(';
                trimiteMail(
                    campuriText.email,
                    'Schimbare rol',
                    'mesaj text',
                    `<p>Ai fost ${msj}</p>`
                )
                res.redirect('/useri');
            }
        })
    })
})



app.get('/administrare', function(req, res) {
    client.query('select * from produse', function(err, rezQuery) {
        res.render('pagini/administrare', {
            produse: rezQuery.rows,
        })
    })
})

app.get('/*', function(req, res) {
    res.render('pagini' + req.url, function(err, rezRender) {
        if (err) {
            if (err.message.includes('Failed to lookup view')) {
                console.log(err)
                    //res.status(404).render("pagini/404");
                randeazaEroare(res, 404)
            } else {
                res.render('pagini/error_default')
            }
        } else {
            //console.log(rezRender)
            res.send(rezRender)
        }
    })

    //console.log("generala:",req.url);
    res.end()
})

const hostname = '127.0.0.1'
var port = process.env.PORT || 8080

app.listen(port, hostname)
console.log('A pornit')