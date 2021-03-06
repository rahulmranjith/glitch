const Util = require('../AllCoinZ/util')
const telegram = require('../AllCoinZ/telegram')
const Google = require('../AllCoinZ/Google')
const slack = require('../AllCoinZ/slack')
const Q = require('q')
//const dbAllCoinZ = require('../db/initialize');
const dynamoDB = require('../db/dynamoDB');
//var gUser = dbAllCoinZ.g_User;
const myCoins = require('../AllCoinZ/jsonCoin');

function getWelcomeMessage(displayName) {
    console.log(Util.m_platform)
    switch (Util.m_platform) {
        case "telegram":
            telegram.m_formatWelcomeMessage(displayName);
            break;
        case "slack":
            slack.m_formatWelcomeMessage(displayName);
            break;
        case "google":
            Google.m_formatWelcomeMessage(displayName);
            break;
        default:
            "Hello Welcome to AllCryptoCoinZ"
    }
}

function getDefaultFallBack() {
    switch (Util.m_platform) {
        case "telegram":
            telegram.m_formatFallback();
            break;
        case "slack":
            slack.m_formatFallback();
            break;
        case "google":
            Google.m_formatFallback();
            break;
        default:
            "Hello Welcome to AllCryptoCoinZ"
    }
}

function help(displayName) {

    switch (Util.m_platform) {
        case "telegram":
            telegram.m_getHelp(displayName);
            break;
        case "slack":
            slack.m_getHelp(displayName);
            break;
        case "google":
            Google.m_getHelp(displayName);
            break;
        default:
            "Hello Welcome to AllCryptoCoinZ"
    }

}

function sendSimpleMessage(message, displayText, title) {
    console.log(Util.m_platform)
    switch (Util.m_platform) {
        case "telegram":
            telegram.m_sendSimpleMessage(callPayLoadFormatMessage(message));
            break;
        case "slack":
            slack.m_sendSimpleMessage(callPayLoadFormatMessage(message));
            break;
        case "google":
            Google.m_sendSimpleMessage(message, displayText, title);
            break;
        default:
            "Hello Welcome to AllCryptoCoinZ"
    }


}

function sendCoinResponse(coinResult) {

    var responseMessage
    console.log(Util.m_platform)
    switch (Util.m_platform) {
        case "telegram":
            telegram.m_ResponseMessage(coinResult);
            break;
        case "slack":
            slack.m_ResponseMessage(coinResult);
            break;
        case "skype":
            telegram.m_ResponseMessage(coinResult);
            break;
        case "google":
            Google.m_ResponseMessage(coinResult);
            break;
        default:
            "Please try again !!!"


    }
    return responseMessage
}

function SyncPortfolio(userInfo, gapp) {

    var deferred = Q.defer();
    var portfolio;
    var cryptoCoin = gapp.getArgument("CryptoCoin");
    var newQuantity = ""
    if (gapp.getArgument("number") != null) {
        newQuantity = gapp.getArgument("number")
    };

    var buysellDeleteOption;

    if (gapp.getArgument("BuySell")) {
        buysellDeleteOption = gapp.getArgument("BuySell").toUpperCase()
    }


    if (gapp.getArgument("Delete")) {
        buysellDeleteOption = gapp.getArgument("Delete").toUpperCase()
    }


    var userInfoData;

    dynamoDB.g_getRecord({
        uniqID: userInfo.uniqID
    }).then(function (item) {
        var coinQuantity;
        var updatedQuantity
        var updatetext = "";

        if (buysellDeleteOption == "ADD") {
            updatetext = "added"
        } else if (buysellDeleteOption == "DEDUCT") {
            updatetext = "deducted"
        } else if (buysellDeleteOption == "DELETE") {
            updatetext = "deleted"
            updatedQuantity = 0;
        }
        //console.log("items" + item);
        if (item == null) {
            updatedQuantity = newQuantity
            userInfoData = {
                displayName: userInfo.displayName,
                uniqID: userInfo.uniqID,
                curr: "INR",
                portfolio: JSON.stringify({
                    [cryptoCoin]: newQuantity
                })
            }
            //console.log(JSON.stringify(item))
        } else {
            var currentPortfolio;
            if (item.portfolio) { currentPortfolio = JSON.parse(item.portfolio) }
            if (currentPortfolio != null) {
                if (currentPortfolio[cryptoCoin] == undefined) {
                    coinQuantity = 0;
                } else {
                    //var updatedQuantity = 1;
                    coinQuantity = currentPortfolio[cryptoCoin]
                }
                if (buysellDeleteOption == "ADD") {
                    updatetext = "added"
                    updatedQuantity = +newQuantity + +coinQuantity;
                } else if (buysellDeleteOption == "DEDUCT") {
                    updatetext = "deducted"
                    updatedQuantity = +coinQuantity - newQuantity;
                } else if (buysellDeleteOption == "DELETE") {
                    updatetext = "deleted"
                    updatedQuantity = 0;
                }
                if (updatedQuantity < 0) {
                    updatedQuantity = 0;
                }
                currentPortfolio[cryptoCoin] = updatedQuantity

                userInfoData = {
                    displayName: item.displayName,
                    uniqID: item.uniqID,
                    curr: item.curr,
                    portfolio: JSON.stringify(currentPortfolio)
                }
            } else {
                if (updatetext != "added") {
                    quantityused = 0;
                } else {
                    quantityused = newQuantity;
                }
                userInfoData = {
                    displayName: userInfo.displayName,
                    uniqID: userInfo.uniqID,
                    curr: "INR",
                    portfolio: JSON.stringify({
                        [cryptoCoin]: quantityused
                    })
                }
            }
        }
        var currentValue = newQuantity
        if (updatedQuantity != undefined) {
            currentValue = updatedQuantity
        }
        if (updatetext == "deleted") {
            currentValue = 0;
            newQuantity = "All "
        }
        dynamoDB.g_UpdateInsert(userInfoData).then(function () {
            switch (Util.m_platform) {
                case "telegram":
                case "slack":
                    sendSimpleMessage("Portfolio Details\n`" + newQuantity + " " + cryptoCoin + " has been " + updatetext + " successfully !!!`")
                    break;
                case "google":
                    //sendSimpleMessage("**"+newQuantity + " " + cryptoCoin + "** has been " + updatetext + " !!!  \nAvailable "+cryptoCoin+" : "+ updatedQuantity,"","Portfolio Update :");

                    sendSimpleMessage("**" + newQuantity + " " + cryptoCoin + "** has been " + updatetext + " !!!  \n*Available " + cryptoCoin + " :* **" + currentValue + "**  \n  \n", "", "Portfolio Update :")
                    break;
                default:
                    "Hello Welcome to AllCoinZ"
            }
            //deferred.resolve(callPayLoadFormatMessage("Portfolio Details\n`"+ newQuantity + " " + cryptoCoin + " has been " +updatetext+" successfully !!!`"))

            //         deferred.resolve(Util.m_getDefaultCardMessageResponse(Util.m_platform, {
            //     subtitle:"`"+ newQuantity + " " + cryptoCoin + " has been " +updatetext+" successfully !!!`",
            //     title: "Portfolio Details",
            //     buttons: []
            // }))
            //console.log("updated the portfolio");
        }, function (error) {
            deferred.reject(error)
        })
    })
    return deferred.promise;
}


function callPayLoadFormatMessage(message) {
    var responseMessage
    switch (Util.m_platform) {
        case "telegram":
            responseMessage = telegram.m_getPayLoadMessage(message);
            break;
        case "slack":
            responseMessage = slack.m_getPayLoadMessage(message);
            break;
        case "skype":
            responseMessage = telegram.m_getPayLoadMessage(message);
            break;
        default:
            "Please try again !!!"
    }
    return responseMessage;
}

function getPortfolio(userInfo) {
    var deferred = Q.defer();
    dynamoDB.g_getRecord({
        uniqID: userInfo.uniqID
    }).then(function (result) {
        var myPortfolio;
        if (result != null) {
            myPortfolio = result.portfolio;
        }
        if (result == null || myPortfolio == null) {
            switch (Util.m_platform) {
                case "telegram", "slack", "skype":
                    return deferred.reject("`Please create a new portfolio. Check help !!`")
                    break;
                case "google":
                    return Google.m_sendPortfolioUpdate("Please create a new portfolio. Check help !!!");
                    break;
                default:
                    "Please try again !!!"
            }
        }
        Util.m_myCurrency = result.curr;
        if (myPortfolio == null) { } else {
            //console.log(JSON.parse(myPortfolio));
            deferred.resolve(JSON.parse(myPortfolio), result.curr);
        }
    }, function (error) { })
    return deferred.promise;
}

function getTotalPortfolioValue(userInfo, fetchValue) {
    var deferred = Q.defer();
    getPortfolio(userInfo).then(function (myPortfolio) {
        if (fetchValue || Util.m_platform == "google") {
            console.log('total1')
            var oPortFolioLatestData = getPortFolioCoinData(myPortfolio, Util.m_myCurrency)
            oPortFolioLatestData.then(function (myportFolioData) {
                console.log('total')
                switch (Util.m_platform) {
                    case "telegram":
                        telegram.m_getPortfolioData(myportFolioData, myPortfolio);
                        break;
                    case "slack":
                        slack.m_getPortfolioData(myportFolioData, myPortfolio);
                        break;
                    case "skype":
                        telegram.m_getPortfolioData(myportFolioData, myPortfolio);
                        break;
                    case "google":
                        Google.m_getPortfolioData(myportFolioData, myPortfolio);
                        break;
                    default:
                        "Please try again !!!"
                }
                // console.log(resultPortFolioWithData)  
                deferred.resolve(true);
            }).catch(function (err) {
                return deferred.reject(false);
            })
        } else {
            switch (Util.m_platform) {
                case "telegram":
                    telegram.m_getPortfolioInfo(myPortfolio);
                    break;
                case "slack":
                    slack.m_getPortfolioInfo(myPortfolio);
                    break;
                case "skype":
                    telegram.m_getPortfolioInfo(myPortfolio);
                    break;
                case "google":
                    Google.m_getPortfolioInfo(myPortfolio);
                    break;
                default:
                    "Please try again !!!"
            }
            deferred.resolve(true);
        }
    }, function (error) {
        console.log(error);
        return deferred.reject(false);
    })
    return deferred.promise;
}

function getPortFolioCoinData(input, myCurrency) {
    var deferred = Q.defer();
    var request = require('request');
    var cryptoCoinstoFetch = "BTC";
    for (const coin of Object.keys(input)) {
        var foundCoin = myCoins.m_findCoin(coin.toUpperCase())
        //console.log(foundCoin);
        if (foundCoin !== null && foundCoin != "") {
            cryptoCoinstoFetch = cryptoCoinstoFetch + "," + foundCoin[0].n
        }
    }
    var baseUrl = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=';
    var parsedUrl = baseUrl + cryptoCoinstoFetch + "&tsyms=BTC," + myCurrency + "&e=CCCAGG"
    //console.log(parsedUrl);
    request(parsedUrl, function (error, response, body) {
        var JSONResponse = JSON.parse(response.body);
        //console.log("CV" + JSON.stringify(JSONResponse));
        if (JSONResponse != null || JSONResponse !== undefined) {
            //console.log("JSON Response" + JSON.stringify(response.body))
            deferred.resolve(JSONResponse);
        } else {
            deferred.reject(null);
        }
    })
    return deferred.promise;
}


module.exports = {
    m_getWelcomeMessage: getWelcomeMessage,
    m_sendSimpleMessage: sendSimpleMessage,
    m_sendCoinResponse: sendCoinResponse,
    m_SyncPortfolio: SyncPortfolio,
    m_getTotalPortfolioValue: getTotalPortfolioValue,
    m_callPayLoadFormatMessage: callPayLoadFormatMessage,
    m_getDefaultFallBack: getDefaultFallBack,
    m_help: help,
    m_getPortFolioCoinData: getPortFolioCoinData
}