const fetch = require("node-fetch");
const chalk = require('chalk');
const helper = require('./helper');

let userNames = [];
let totalDec = 0;

const accountInfosJson = require('./accounts_all.json');

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
        helper.getPlayerEarnings(user)
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


(async () => {

    await getDecEarning();

})();