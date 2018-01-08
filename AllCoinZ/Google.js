const Util = require('../AllCoinZ/util')

var gapp;
function formatWelcomeMessage(displayName) {
    console.log("welcome");

    // return "\n Hello *" + displayName + "*     !!!\n\n *💰All CoinZ - Get CryptoCoins' value in local currencies!!!💰*\n\n `Type in any Coin name like` *BTC* `or` *BitCoin* .\n\n *>*` Can ask interactively : `"+
    //   "\n *   -What's the value of XRP* \n *   -How much is BTC* \n *   -Get me value of ETH and so on..*\n\n *>* `Send` *help* `for help/configuration` \n\n *>*` Set default currency by sending:` \n    -*CUR[USD]* / *CURR BTC* / *CUR IND*"
    //     //+"\n aaa"
    //   +"\n \n*>*` Set Portfolio using` :\n   - `To Add send` *B 1.23 BTC* \n   - `To Remove send` *S 1.00 BTC* \n   - `To view current Portfolio send` *VP* \n   - `To view Total Porftolio Value send` *PT*"

  var welcomeMessage =""
  const textToSpeech = '<speak>' +
    'Here are <say-as interpret-as="characters">SSML</say-as> samples. ' +
    'I can pause <break time="3" />. ' +
    'I can play a sound <audio src="https://www.example.com/MY_WAVE_FILE.wav">your wave file</audio>. ' +
    'I can speak in cardinals. Your position is <say-as interpret-as="cardinal">10</say-as> in line. ' +
    'Or I can speak in ordinals. You are <say-as interpret-as="ordinal">10</say-as> in line. ' +
    'Or I can even speak in digits. Your position in line is <say-as interpret-as="digits">10</say-as>. ' +
    'I can also substitute phrases, like the <sub alias="World Wide Web Consortium">W3C</sub>. ' +
    'Finally, I can speak a paragraph with two sentences. ' +
    '<p><s>This is sentence one.</s><s>This is sentence two.</s></p>' +
    '</speak>';
  
  welcomeMessage ='<speak>'+
  'All CoinZ - Get CryptoCoins value in local currencies!!'+
  'Type in any Coin name like BTC or BitCoin '+
  '</speak>';
    
   gapp.ask(welcomeMessage)
//   gapp.ask({
//     speech: 'Howdy! I can tell you fun facts about ' +
//     'almost any number, like 42. What do you have in mind?',
//     displayText: "\n Hello *" + displayName + "*     !!!\n\n *💰All CoinZ - Get CryptoCoins' value in local currencies!!!💰*\n\n `Type in any Coin name like` *BTC* `or` *BitCoin* .\n\n *>*` Can ask interactively : `"+
//       "\n *   -What's the value of XRP* \n *   -How much is BTC* \n *   -Get me value of ETH and so on..*\n\n *>* `Send` *help* `for help/configuration` \n\n *>*` Set default currency by sending:` \n    -*CUR[USD]* / *CURR BTC* / *CUR IND*"
//         //+"\n aaa"
//       +"\n \n*>*` Set Portfolio using` :\n   - `To Add send` *B 1.23 BTC* \n   - `To Remove send` *S 1.00 BTC* \n   - `To view current Portfolio send` *VP* \n   - `To view Total Porftolio Value send` *PT*"


//   });
}

 function setgapp(mgapp){
       gapp=mgapp
 }

function ResponseMessage(coinResult) {

    var responseData = {

        "messages": [getCoinInfo(coinResult), {
            "platform": "telegram",
            "type": 4,
            payload: {
                "telegram": {
                    "text": "&#9889;<i> Please select next coin...</i>", //\n\n["+link +"]",,
                    //photo:coinResult.CoinImg,
                    parse_mode: "HTML",
                    disable_web_page_preview: false,
                    "title": "AllCoinZ",
                    "reply_markup": {
                        "keyboard": [
                            [{
                                "text": "BTC"

                            }, {
                                "text": "ETH"

                            }, {
                                "text": "XRP"

                            }, {
                                "text": "PINK"

                            }, {
                                "text": "DOGE"
                            }, {
                                "text": "IOTA"
                            }],
                            [{
                                "text": "ETN"
                            }, {
                                "text": "XLM"
                            }, {
                                "text": "XVG"
                            }, {
                                "text": "ADA"
                            }, {
                                "text": "BCH"
                            }, {
                                "text": "TRX"
                            }],
                            [{
                                    "text": "C[USD]"
                                }, {
                                    "text": "C[INR]"
                                }, {
                                    "text": "View Portfolio"
                                }, {
                                    "text": "Portfolio Total"
                                },
                                //{
                                //     "text": "CUR[BTC]"
                                // }, {
                                //     "text": "CUR[EUR]"
                                // }
                            ]

                        ],
                        resize_keyboard: true

                    }
                }
            }
        }]

    }

    //console.log(responseData)
    return responseData;
}

 

function getPayLoadMessage(message){

 return {
          speech:"telegram",
            "messages": [{
                "platform": "telegram",
                "type": 4,
                 payload: {
                    "telegram": 
                       {
                      "text": message,
                       parse_mode: "Markdown",
}}}]}
 
}

function getCoinInfo(CoinInfo) {


    var coinInfoinCurrency = CoinInfo.CoinValue.DISPLAY[CoinInfo.CoinSN][CoinInfo.CoinCurrency]
    var coinInfoinBTC = CoinInfo.CoinValue.DISPLAY[CoinInfo.CoinSN]["BTC"]

    var currencyPrice = Util.m_removeCurrencySymbols(coinInfoinCurrency)
    var BTCPrice = Util.m_removeCurrencySymbols(coinInfoinBTC)


    var coinDetail = "💰" + "*" + CoinInfo.CoinFN.toUpperCase() + "*💰\n\n` " + CoinInfo.CoinCount + " " + CoinInfo.CoinSN + "` = *" + (CoinInfo.CoinCount * currencyPrice).toFixed(5) + " " + coinInfoinCurrency.TOSYMBOL + "*" + "\n " +
        "\n` " + CoinInfo.CoinCount + " " + CoinInfo.CoinSN + "` = *" + (CoinInfo.CoinCount * BTCPrice).toFixed(9) + " " + coinInfoinBTC.TOSYMBOL + "* \n\n _ % in 24 Hrs : _ *" + coinInfoinCurrency.CHANGEPCT24HOUR + "* \n " + "_ High Day : _ *" + coinInfoinCurrency.HIGHDAY + "* \n " +
        "_ Low Day : _ *" + coinInfoinCurrency.LOWDAY + "* \n " + "_ Market Cap : _ *" + coinInfoinCurrency.MKTCAP + "* \n " + "_ Updated : _ *" + coinInfoinCurrency.LASTUPDATE + "* \n "

    var customcardMessage = {
        "buttons": [
            // {
            //   "postback": CoinInfo.CoinURL,
            //   "text": CoinInfo.CoinFN
            // }
        ],
        //"imageUrl": CoinInfo.CoinURL,
        "platform": Util.m_platform,
        "subtitle": coinDetail,
        //"title": "AllCoinZ",
        "type": 1
    }

    return customcardMessage
}


function formatMyPortfoliowithData(data, myCoins, currency) {

    var op = "\n"
    var priceinBTC = 0;
    var priceinCurrency = 0;
    var totalBTC = 0;
    var totalCurrency = 0;
    var displayCurrency;
    var displayBTC;
    for (const coin of Object.keys(myCoins)) {
        //console.log(coin, myCoins[coin]);

        //console.log(data.DISPLAY[coin]["BTC"].PRICE)
       // console.log(data.DISPLAY[coin][currency].PRICE)

        priceinBTC = (Util.m_removeCurrencySymbols(data.DISPLAY[coin]["BTC"]) * myCoins[coin]).toFixed(9)
        //console.log("priceinINR"+ data.DISPLAY[coin][currency].PRICE)

        priceinCurrency = (Util.m_removeCurrencySymbols(data.DISPLAY[coin][currency]) * myCoins[coin]).toFixed(2)

        // op = op + "*" + coin + "(" + (+myCoins[coin]).toFixed(2) + "):*  `" + priceinCurrency + " " + data.DISPLAY[coin][currency].TOSYMBOL + " |" + " " + priceinBTC + " " + data.DISPLAY[coin]["BTC"].TOSYMBOL + "` " +
        //     "\n"
      
       op = op +"`" + (+myCoins[coin]).toFixed(2) + "` "+ "*[" + coin + "*]=`" + priceinCurrency + "" + data.DISPLAY[coin][currency].TOSYMBOL + " |" + " " + priceinBTC + "" + data.DISPLAY[coin]["BTC"].TOSYMBOL + "` " +
            "\n"

        displayCurrency = data.DISPLAY[coin][currency].TOSYMBOL
        displayBTC = data.DISPLAY[coin]["BTC"].TOSYMBOL

        totalBTC = +totalBTC + +priceinBTC
        totalCurrency = +totalCurrency + +priceinCurrency


    }
    op = op + "\n*[TPV]:  " + " " + totalCurrency.toFixed(3) + " " + displayCurrency + " | " + totalBTC.toFixed(9) + " " + displayBTC + "*"

    return op;
}

function getPortfolioData(myportfolioData, myCoins) {
  
    
    var TelegramTPV = getPayLoadMessage("*Total Portfolio Value:*\n"+formatMyPortfoliowithData(myportfolioData, myCoins, Util.m_myCurrency)) 
    return TelegramTPV
}



//format portfolio info

function getPortfolioInfo(myCoins) {
  
   
    var op="";
    for (const coin of Object.keys(myCoins)) {
       
        op = op + "`" + (+myCoins[coin]).toFixed(3) + " " + coin + "`\n"
  
    }
  
   

    var TelegramPInfo = getPayLoadMessage("*My Portfolio:*\n\n"+op)
    
    
    return TelegramPInfo

}

module.exports = {
    m_formatWelcomeMessage: formatWelcomeMessage,
    m_ResponseMessage: ResponseMessage,
    m_getPortfolioData: getPortfolioData,
    m_getPortfolioInfo: getPortfolioInfo,
  m_getPayLoadMessage:getPayLoadMessage,
  m_gapp:setgapp
}