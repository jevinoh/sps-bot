'use strict';
const fs = require('fs');

const accountFile = './accounts.json';
const accountNumFile = './accountNum.txt';  
const accountInfosJson = require(accountFile);
const accountLength = Object.keys(accountInfosJson).length;

function updateAccountNum() {
    const currentNum = readCurrentAccountNum();
    var updateNum = 0;

    if(currentNum < accountLength - 1)
    {
        updateNum = currentNum + 1;
    }

    console.log('Updating user from ['+ accountInfosJson[currentNum].account +']' + ' to ['+ accountInfosJson[updateNum].account +']');    

    fs.writeFileSync(accountNumFile, updateNum, 'utf8', (err) => {
        // In case of a error throw err.
        if (err) throw err;
    })
}

function readCurrentAccountNum() {
    var data = 0;
    try {
        var temp = fs.readFileSync(accountNumFile, 'utf8');
        if(!isNaN(temp))
        {
            data = Number(temp)
        }
    } catch(e) {
        console.log('Error:', e.stack);
    }
    return data;
}

// const accountInfosJson = fs.readFileSync('./accounts.json', 'utf8');

// var accounts = Object.keys(accountInfos);
// const accountInfos = JSON.parse(accountInfosJson);

// for(var i = 0; i < accountLength; i++)
// {
//     console.log('account [' + accountInfosJson[i].account + '] ' + 'password[' + accountInfosJson[i].password + ']');
// }


// console.log(accountLength);
// updateAccountNum();
// readCurrentAccountNum();

exports.readCurrentAccountNum = readCurrentAccountNum;
exports.updateAccountNum = updateAccountNum;





