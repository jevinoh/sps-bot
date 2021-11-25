const fetch = require("node-fetch");
const chalk = require('chalk');
const AbortController = require('abort-controller');
const controller = new AbortController();

async function getPlayerInfo(player = '') {
    const timeout = setTimeout(() => {
		controller.abort();
	  }, 5000);

    const playerInfo = await fetch('https://api2.splinterlands.com/players/balances?username=' + player, {signal: controller.signal })
        .then((response) => {
            if (!response.ok) {
                // console.error('Network response was not ok');
                return [];
            }
            return response;
        })
        .then((playerInfo) => {
            return playerInfo.json();
        })
        .catch((error) => {
            clearTimeout(timeout)
            const secondaryPlayerInfo = fetch('https://api.splinterlands.io/players/balances?username=' + player, {signal: controller.signal })
            .then((response) => {
                if (!response.ok) {
                    // console.error('Network response was not ok');
                    return [];
                }
                return response;
            })
            .then((playerInfo) => {
                return playerInfo.json();
            })
            .catch((error) => {
                console.error('There has been a problem with your fetch operation:', error);
                return [];
            })
            .finally(() => clearTimeout(timeout));
            return secondaryPlayerInfo;
        })
        .finally(() => clearTimeout(timeout));

    return playerInfo;
}

let userNames = [];
let totalDec = 0;

// const accountInfosJson = require('./accounts_all.json');
var accountInfosJson
async function getDecEarning() {
    var users = [];
    console.log('Account size[' + accountInfosJson.length + ']');
    for (var i = 0; i < accountInfosJson.length; i++) {
        // append each person to our page
        if(!userNames.includes(accountInfosJson[i].account))
        {
            userNames.push(accountInfosJson[i].account);
        }
    }

    const battles = userNames.map(user =>
        getPlayerInfo(user)
            .then((infos) => {
                for(var i = 0; i < infos.length; i++)
                {
                    // const tokenInfo =infos[1];
                    if (infos[i].token == 'DEC') {
                        // console.log("DEC earning of "+ infos[i].player + "[" + chalk.yellow(infos[i].balance) + "]");
                        totalDec = totalDec + infos[i].balance
                    }
                }
            })
        )

    Promise.all(battles).then(() => {
        console.log(chalk.green(new Date(Date.now()).toLocaleString() + " Current DEC earning [" + totalDec + "]"));
    })
}


// (async () => {

//     await getDecEarning();

// })();

module.exports.getPlayerInfo = getPlayerInfo;