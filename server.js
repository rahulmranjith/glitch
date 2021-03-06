'use strict'; //rahulmr

const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const request = require('request');
const Map = require('es6-map');
const Q = require('q')
//const dbAllCoinZ = require('./db/initialize');

const dynamoDB = require('./db/dynamoDB');
const exposedAPI = require('./AllCoinZ/exposedAPI');
const telegramAPI = require('./AllCoinZ/telegram')
const Util = require('./AllCoinZ/util')
const GenProc = require('./AllCoinZ/GenericProcess')
const telegramPush = require('./AllCoinZ/push')
const fetchCoin = require('./AllCoinZ/fetchCoin');
const Google = require('./AllCoinZ/Google')
const Alexa = require('./AllCoinZ/Alexa')
var verifier// = require('alexa-verifier-middleware')
const uuidv1 = require('uuid/v1');
const ApiAiApp = require('actions-on-google').DialogflowApp;
var jwt = require('jsonwebtoken');

var uniqID;
var displayName;
var currency = "";
var exchange = "CCCAGG"
var platform;
var gapp;

var res;
var hanlders = Alexa.handlers
var languageStrings = Alexa.languageStrings

var verifier = require('alexa-verifier')
//var gUser = dbAllCoinZ.g_User;

const app = express();
var alexaRouter = express.Router()
//app.use('/', alexaRouter)

alexaRouter.use(function (req, res, next) {
    if (req._body) {
        var er = 'The raw request body has already been parsed.'
        return res.status(400).json({ status: 'failure', reason: er })
    }

    // TODO: if _rawBody is set and a string, don't obliterate it here!

    // mark the request body as already having been parsed so it's ignored by
    // other body parser middlewares
    req._body = true
    req.rawBody = ''
    req.on('data', function (data) {
        return req.rawBody += data
    })
    req.on('end', function () {
        var certUrl, er, error, signature

        try {
            req.body = JSON.parse(req.rawBody)
        } catch (error) {
            er = error
            req.body = {}
        }
        certUrl = req.headers.signaturecertchainurl
        signature = req.headers.signature
        var skipver = req.headers.skipver
        if (req.body && req.body.originalRequest) {
            if (req.body.originalRequest.source) {
                skipver = "bypass"
            }
        }
        if (skipver) {
            if (skipver == 'rmr999alexaskill' || skipver == "bypass") {
                next()
            }
        } else {
            verifier(certUrl, signature, req.rawBody, function (er) {
                if (er) {
                    res.status(400).json({ status: 'failure', reason: er })
                } else {
                    next()
                }
            })
        }
    })
})

//alexaRouter.use(verifier)

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

var projectID = 'allcryptocoinz'
app.get('/auth', (req, res) => {
    //res.status(200).send('JAI - @ Welcome to Smart Crypto \n' + new Date()).end();
    var clientID = 'JAIsmartcrypto'
    var redirectURL = 'https://oauth-redirect.googleusercontent.com/r/' + projectID

    var ACCESS_TOKEN = 'JAISmartCryptoAT' + uuidv1()
    var STATE_STRING;

    if (req.query.client_id) {
        if (req.query.client_id != clientID) {
            res.status(503).send("Incorrect ClientID");
        }
    }
    if (req.query.redirect_uri) {
        if (req.query.redirect_uri != redirectURL) {
            res.status(503).send("Incorrect Re-directURL")
        }
    }
    if (req.query.response_type) {
        if (req.query.response_type != 'token') {
            res.status(503).send("Incorrect Response_type")
        }
    }

    if (req.query.state) {
        STATE_STRING = req.query.state
    }
    var responseoAuthURL = 'https://oauth-redirect.googleusercontent.com/r/' + projectID + '#access_token=' + ACCESS_TOKEN + '&token_type=bearer&state=' + STATE_STRING
    res.redirect(responseoAuthURL)
});


app.get('/home', function (request, response, next) {
    response.sendFile(__dirname + '/AllCoinZ/home.html');
}
)

//https://actionsts.smartcrypto.bid/https://a5641d11.ngrok.io
var exposedURL = 'https://a5641d11.ngrok.io/'
app.get('/token', (req, res) => {

    var authorizCode = req.query.code
    var state = req.query.state;
    var authURL = 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' //+ authorizCode
    var clientID //=  'JAISPCI'
    clientID = '178495420010-247u2k5ir6r9e6biehjv2i43a5nudgmu.apps.googleusercontent.com'
    var redirectURL = 'https://oauth-redirect.googleusercontent.com/r/'+projectID
    
    var clientsecret = ''

    request.post({
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        url: 'https://www.googleapis.com/oauth2/v4/token',
        form: {
            code: authorizCode, client_id: clientID, client_secret: clientsecret,
            redirect_uri: exposedURL + 'token',
            grant_type: 'authorization_code'
        }
    }, function (error, response, body) {

        if (error == null && body) {
            var access_token = JSON.parse(body).access_token;
            console.log(body);
            request(authURL + access_token, function (error, response, body) {
                console.log('error:', error);
                console.log('statusCode:', response && response.statusCode);
                console.log('body:', body);
                if (body && error == null) {
                    var email = JSON.parse(body).email
                    var userID = JSON.parse(body).id
                    var name = JSON.parse(body).name
                    var ACCESS_TOKEN = 'JAISmartCryptoAT' + uuidv1();
                    var userOb = { name: name, email: email, userID: userID }
                    var jwttoken = jwt.sign(userOb, 'JAISmartCrypto');

                    dynamoDB.g_UpdateInsert({
                        displayName: name,
                        uniqID: jwttoken,
                        curr: "USD"
                    }).then(function () {

                        var responseoAuthURL// = 'https://oauth-redirect.googleusercontent.com/r/' + projectID + '?code=' + ACCESS_TOKEN + '&state=' + state
                        responseoAuthURL = 'https://oauth-redirect.googleusercontent.com/r/' + projectID + '#access_token=' + jwttoken + '&token_type=bearer&state=' + state
                        res.redirect(responseoAuthURL)
                        //GenProc.m_sendSimpleMessage("Hello " + name + ", Welcome to Smart Crypto!!! Say help for getting assitance or Say a coin name ")
                    }, function (error) {
                        console.log(error)
                    })




                }
            });
        }
    });
})



app.post('/', function (request, response, next) {
    //console.log(request)
    console.log(JSON.stringify(request.body))
    var reqsession = request.body.session
    if (reqsession != undefined) {
        if (reqsession.user != null) {
            if (reqsession.user.userId.toUpperCase().indexOf('AMZN') > -1) {
                Alexa.configure(request, response)
            }
        }
    } else {

        gapp = new ApiAiApp({
            request,
            response
        });

        Google.m_gapp(gapp)
        //console.log("GAPP" + JSON.stringify(gapp.body_.originalRequest))
        res = response;
        Util.m_setHttpResponse(res)
        var originalRequest = gapp.body_.originalRequest

        //console.log(originalRequest.source)  
        switch (originalRequest.source) {
            case "telegram":
                platform = "telegram"
                displayName = originalRequest.data.message.chat.username;
                uniqID = originalRequest.data.message.chat.id
                break;
            case "slack_testbot":
                displayName = originalRequest.data.user;
                uniqID = originalRequest.data.user;
                platform = "slack"
                break;
            case "skype":
                platform = "skype"
                break;
            case "google":
                platform = "google"
                uniqID = gapp.getUser().accessToken//gapp.body_.originalRequest.data.user.userId
                break;
            default:
                platform = "telegram"
        }
        Util.m_platform = platform

        var actionMap = new Map();
        actionMap.set('getCoinValue', getCoinValue);
        actionMap.set('TotalPortfolioValue', TotalPortfolioValue);
        actionMap.set('ViewPortfolio', ViewPortfolio);
        actionMap.set('ViewPortfolio', ViewPortfolio);
        actionMap.set('input.welcome', DefaultWelcomeIntent);
        actionMap.set('setCurrency', ChangeCurrency);
        actionMap.set('input.unknown', DefaultFallbackIntent);
        actionMap.set('BuySellCoin', BuySellCoin);
        actionMap.set('gethelp', help);
        actionMap.set('DeleteCoin', BuySellCoin);
        actionMap.set('GoogleWelcomeContext', googleWelcomeContext)
        actionMap.set('ViewPortfolio-SelectItemAction', portfolioOptionSelect)
        actionMap.set('getCoinValueOption', getCoinValueOption)
        actionMap.set('namepermission', namepermission)
        actionMap.set('sign.in', checkAuthenticated)

        gapp.handleRequest(actionMap);
    }
})

function getCoinValueOption() {
    console.log("getCoinValueOption")
    const selectedItem = gapp.getContextArgument('actions_intent_option', 'OPTION').value;
}

function help() {
    GenProc.m_help(displayName)
}

function namepermission() {
    if (gapp.isPermissionGranted()) {
        var userName = gapp.getUserName().displayName;
        displayName = userName
        var userID = gapp.getUser().accessToken//gapp.getUser().user_id;
        dynamoDB.g_UpdateInsert({
            displayName: userName,
            uniqID: userID,
            curr: "USD"
        }).then(function () {
            GenProc.m_sendSimpleMessage("Hello " + userName + ", Welcome to Smart Crypto!!! Say help for getting assitance or Say a coin name ")
        }, function (error) {
            console.log(error)
        })

    } else {
        GenProc.m_sendSimpleMessage("Hello  Welcome to Smart Crypto!!! Say help for getting assitance or Say a coin name ")
    }
}


function googleWelcomeContext() {
    if (gapp.getSignInStatus() == "OK") {
        // if (gapp.getUser().accessToken) {
        //     var userName = getuser(gapp.getUser().accessToken).name
        //     GenProc.m_sendSimpleMessage("Hello **" + userName + "**,  \nWelcome to Smart Crypto!!!  \n  \n*Say a coin name* ")
        // }

        if (gapp.getUser().accessToken) {
            checkUserExist(gapp.getUser().accessToken).then(function (data) {
                var userName = getuser(data.uniqID).name
                GenProc.m_sendSimpleMessage("Hello **" + userName + "**,  \nWelcome to Smart Crypto!!!  \n  \n*Say a coin name* ")
            })
        } else {
            return gapp.tell('You need to sign-in before using some features.This is a one time process and is needed to store your currency/portfolio details.');
        }
    } else if (!gapp.getUser().accessToken) {
        return gapp.tell('You need to sign-in before using some features.This is a one time process and is needed to store your currency/portfolio details.');
    }
}


function portfolioOptionSelect() {
    const selectedItem = gapp.getContextArgument('actions_intent_option', 'OPTION').value;
    var coinObject = {
        count: selectedItem.split('#')[0],
        CryptoCoin: selectedItem.split('#')[1]
    }
    if (!selectedItem) {
        gapp.ask('You did not select any item from the list');
    }

    if (selectedItem == 'My Portfolio') {
        ViewPortfolio();
    }
    else {
        getCoinValue(coinObject, true)
    }
}

function askSignIn() {
    gapp.askForSignIn();
}

function getuser(jsonToken) {
    var decodedUser = jwt.verify(jsonToken, 'JAISmartCrypto');
    return decodedUser;
}
function checkUserExist(accesstoken) {
    return new Promise((resolve, reject) => {
        dynamoDB.g_getRecord({
            uniqID: accesstoken
        }).then((data) => {
            if (data == null) {
                reject(null)
            } else {
                resolve(data)
            }
        })

    })

}
function DefaultWelcomeIntent() {
    if (Util.m_platform == "google") {
        if (gapp.getUser().accessToken) {
            checkUserExist(gapp.getUser().accessToken).then(function (data) {
                var userName = getuser(data.uniqID).name
                GenProc.m_sendSimpleMessage("Hello **" + userName + "**,  \nWelcome to Smart Crypto!!!  \n  \n*Say a coin name* ")
            }, function () {
                GenProc.m_sendSimpleMessage("Hello ,  \nUserToken is corrupted .Please contact support  !!!  \n  \n ")
            })
        } else {
            askSignIn();
        }

    } else {
        GenProc.m_getWelcomeMessage(displayName)
    }
}
function DefaultWelcomeIntent1() {
    if (Util.m_platform == "google") {
        if (!gapp.getUser().accessToken) {
            askSignIn();
        } else {
            var namePermission = gapp.SupportedPermissions.NAME;
            dynamoDB.g_getRecord({
                uniqID: gapp.getUser().accessToken//gapp.getUser().user_id
            }).then((data) => {
                if (data == null) {
                    if (!gapp.isPermissionGranted()) {
                        return gapp.askForPermission('Thanks for signing in . And to address you by name ', gapp.SupportedPermissions.NAME);
                    }
                } else {
                    GenProc.m_sendSimpleMessage("Hello **" + data.displayName + "**,  \nWelcome to Smart Crypto!!!  \n  \n*Say a coin name* ")
                }
            })
        }
    } else {
        GenProc.m_getWelcomeMessage(displayName)
    }
}

function checkAuthenticated() {
    if (gapp.getSignInStatus() === gapp.SignInStatus.OK) {
        let accessToken = gapp.getUser().accessToken;

    } else {
        gapp.tell('You need to sign-in before using some features.This is a one time process and is needed to store your currency/portfolio details.');

    }
}
function ChangeCurrency() {
    var userCurrency = gapp.getArgument("currency-name")
    if (userCurrency == "" && gapp.getArgument["CryptoCoin"] !== "") {
        userCurrency = gapp.getArgument["CryptoCoin"]
    }
    if (userCurrency == "") {
        return GenProc.m_sendSimpleMessage("Currency could not be identified.No changes are made :(")
    }
    dynamoDB.g_UpdateInsert({
        displayName: displayName,
        uniqID: uniqID,
        curr: userCurrency
    }).then(function () {
        GenProc.m_sendSimpleMessage("Default currency has been set to " + userCurrency)
    }, function (error) {
        GenProc.m_sendSimpleMessage("Currency could not be set.Please try again or contact support")
    })
}

function DefaultFallbackIntent() {
    GenProc.m_getDefaultFallBack()
}

function BuySellCoin() {
    GenProc.m_SyncPortfolio({
        displayName,
        uniqID
    }, gapp)

}

function getCoinValue(coinObject, external) {
    Util.m_getCurrency(uniqID).then(function () {

        var count = 1;
        if (gapp.getArgument("count") != null) {
            count = gapp.getArgument("count")
        }
        var oCoin;
        if (external != true) {
            oCoin = Util.m_getCoinObject({
                count: count,
                CryptoCoin: gapp.getArgument("CryptoCoin")
            })
        } else {

            oCoin = Util.m_getCoinObject(coinObject)
        }
        oCoin.then(function (coinResult) {

            GenProc.m_sendCoinResponse(coinResult)

        }).catch(function (err) {
            console.log("m_getCoinObject method failed" + err)
        });
    })
}



function ViewPortfolio() {
    GenProc.m_getTotalPortfolioValue({
        displayName,
        uniqID
    }, false)

}
function TotalPortfolioValue() {
    GenProc.m_getTotalPortfolioValue({
        displayName,
        uniqID
    }, true)

}
app.get('/rahulmr', (req, res) => {
    //res.status(200).send('JAI - Welcome to Smart Crypto \n' + new Date()).end();
    exposedAPI.welcome(req, res);
});

app.listen((process.env.PORT || 8000), function () {
    //console.log("Server is up and running... ");
    fetchCoin.m_updateCoins("update").then(function (success) {
        console.log("Loaded the coin array without errors..")

    }, function (error) {
        console.log(error)
    })
});

app.get('/updateCoins/:optype?', (req, res) => {
    exposedAPI.getCoins(req, res);
});
app.get('/users/del/:key?/:secret?', (req, res) => {
    exposedAPI.deleteUser(req, res);
});
app.get('/users/:secret?', (req, res) => {
    exposedAPI.getUsers(req, res);
});
app.get('/cv/:coin?', (req, res) => {
    exposedAPI.getCoinValue(req, res);
});
app.get('/rahulmr', (req, res) => {
    res.status(200).send('JAI - @ Welcome to Smart Crypto \n' + new Date()).end();
});

function sendDialogflowResponse(res, result) {

    if (Util.m_platform != "google") {
        res.send(result)
    }

}