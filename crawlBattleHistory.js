'use strict';
const fs = require('fs');
const fetch = require("node-fetch");

const summoners = [{ 224: 'dragon' },
{ 27: 'earth' },
{ 16: 'water' },
{ 156: 'life' },
{ 189: 'earth' },
{ 167: 'fire' },
{ 145: 'death' },
{ 5: 'fire' },
{ 71: 'water' },
{ 114: 'dragon' },
{ 178: 'water' },
{ 110: 'fire' },
{ 49: 'death' },
{ 88: 'dragon' },
{ 38: 'life' },
{ 239: 'life' },
{ 74: 'death' },
{ 78: 'dragon' },
{ 260: 'fire' },
{ 70: 'fire' },
{ 109: 'death' },
{ 111: 'water' },
{ 112: 'earth' },
{ 130: 'dragon' },
{ 72: 'earth' },
{ 235: 'dragon' },
{ 56: 'dragon' },
{ 113: 'life' },
{ 200: 'dragon' },
{ 236: 'fire' },
{ 240: 'dragon' },
{ 254: 'water' },
{ 257: 'water' },
{ 258: 'death' },
{ 259: 'earth' },
{ 261: 'life' },
{ 262: 'dragon' },
{ 278: 'earth' },
{ 73: 'life' }];

const counterSummonerList = [
{
  16: {
    cardList: [17, 66, 172, 194, 338, 339],
    counters: [{27 : 'earth'}, {189: 'earth'}]
  }
}
];


const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon'];


const puppeteer = require('puppeteer');    

async function getBattleHistory(player = '', data = {}) {
  // TODO: UNCOMMENT
//   const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player=' + player)
//       .then((response) => {
//           if (!response.ok) {
//               throw new Error('Network response was not ok');
//           }
//           return response;
//       })
//       .then((battleHistory) => {
//           return battleHistory.json();
//       })
//       .catch((error) => {
//           console.error('There has been a problem with your fetch operation:', error);
//       });
//   return battleHistory.battles;
  return;
}

const extractGeneralInfo = (x) => {
  return {
      created_date: x.created_date ? x.created_date : '',
      match_type: x.match_type ? x.match_type : '',
      mana_cap: x.mana_cap ? x.mana_cap : '',
      ruleset: x.ruleset ? x.ruleset : '',
      inactive: x.inactive ? x.inactive : ''
  }
}

const extractMonster = (team) => {
  const monster1 = team.monsters[0];
  const monster2 = team.monsters[1];
  const monster3 = team.monsters[2];
  const monster4 = team.monsters[3];
  const monster5 = team.monsters[4];
  const monster6 = team.monsters[5];

  return {
      summoner_id: team.summoner.card_detail_id,
      summoner_level: team.summoner.level,
      monster_1_id: monster1 ? monster1.card_detail_id : '',
      monster_1_level: monster1 ? monster1.level : '',
      monster_1_abilities: monster1 ? monster1.abilities : '',
      monster_2_id: monster2 ? monster2.card_detail_id : '',
      monster_2_level: monster2 ? monster2.level : '',
      monster_2_abilities: monster2 ? monster2.abilities : '',
      monster_3_id: monster3 ? monster3.card_detail_id : '',
      monster_3_level: monster3 ? monster3.level : '',
      monster_3_abilities: monster3 ? monster3.abilities : '',
      monster_4_id: monster4 ? monster4.card_detail_id : '',
      monster_4_level: monster4 ? monster4.level : '',
      monster_4_abilities: monster4 ? monster4.abilities : '',
      monster_5_id: monster5 ? monster5.card_detail_id : '',
      monster_5_level: monster5 ? monster5.level : '',
      monster_5_abilities: monster5 ? monster5.abilities : '',
      monster_6_id: monster6 ? monster6.card_detail_id : '',
      monster_6_level: monster6 ? monster6.level : '',
      monster_6_abilities: monster6 ? monster6.abilities : ''
  }
}

// const counterSummonerList = [
//     {
//       16: {
//         cardList: [17, 66, 172, 194, 338, 339],
//         counters: [{27 : 'earth'}, {189: 'earth'}]
//       }
//     }
//     ];

Object.byString = function(o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1'); // convert indexes to properties
    s = s.replace(/^\./, '');           // strip a leading dot
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
        var k = a[i];
        if (k in o) {
            o = o[k];
        } else {
            return;
        }
    }
    return o;
}

const checkForCounterSplinter = function(battlesList){
    let usualSummoner = 0;
    let counterSummoners = [];
    for(let i = 0; i < 15; i++)
    {
        if (counterSummonerList[0].hasOwnProperty(battlesList[i].summoner_id))
        {
            console.log( 'summoner_id[' + battlesList[i].summoner_id + '] BattleNum[' + i +']');
            let cardsOccur = 0;
            const cardList = counterSummonerList[0][battlesList[i].summoner_id].cardList;

            if(cardList.includes(battlesList[i].monster_1_id)){
                cardsOccur++;
            }
            if(cardList.includes(battlesList[i].monster_2_id)){
                cardsOccur++;
            }
            if(cardList.includes(battlesList[i].monster_3_id)){
                cardsOccur++;
            }
            if(cardList.includes(battlesList[i].monster_4_id)){
                cardsOccur++;
            }
            if(cardList.includes(battlesList[i].monster_5_id)){
                cardsOccur++;
            }
            if(cardList.includes(battlesList[i].monster_6_id)){
                cardsOccur++;
            }
            console.log('cardsOccur[+' + cardsOccur + '] manaCap[' + battlesList[i].mana_cap + ']');

            if((battlesList[i].mana_cap >= 10 && battlesList[i].mana_cap <= 12 && cardsOccur >= 1) ||
               (battlesList[i].mana_cap >= 13 && battlesList[i].mana_cap <= 15 && cardsOccur >= 2) ||
               (battlesList[i].mana_cap >= 16 && battlesList[i].mana_cap <= 20 && cardsOccur >= 3) ||
               (battlesList[i].mana_cap >= 21 && battlesList[i].mana_cap <= 25 && cardsOccur >= 4) ||
               (battlesList[i].mana_cap >= 26 && cardsOccur >= 4))
            {
                usualSummoner++;
                console.log('Summoner used repeatedly');
                if(usualSummoner >=3)
                {
                    counterSummoners = counterSummonerList[0][battlesList[i].summoner_id].counters;
                }
            }
        }        
    }

    return counterSummoners;
}


async function checkOpponentBattleHistory(page) {
  // const rules = await page.$$eval("div.bio__name > div.bio__name__display > div>  img", el => el.map(x => x.getAttribute("data-original-title")));
  // const opponent = getElementText(page, 'bio__name__display', 15000);
  // var opponentName = await page.evaluate(() => {
  //     const opponent = document.querySelectorAll('div.bio__name > span.bio__name__display')[0].innerText;
  // });
  console.log('Enter 2');
  // const opponentName =  await page.$eval('.bio__name .bio__name__display', el => { return el.innerText });
  console.log('Enter 3');
  const value = await page.evaluate(
      () => document.querySelectorAll('.bio__name .bio__name__display')[0].innerText
  );

  console.log('Enter 4');
  const value2 = await page.evaluate(
    () => document.querySelectorAll('.bio__name .bio__name__display')[1].innerText
  );

  console.log('value ', value);
  console.log('value2 ', value2.toLowerCase());

  const opponentName = value2.toLowerCase();

  // let battleCounter = 0;
  let battlesList = [];
  let cleanBattlesList = [];
  const battles = getBattleHistory(opponentName)
                  .then(battles => battles.map(
                      battle => {
                          const details = JSON.parse(battle.details);
                          if (details.type != 'Surrender') {
                              if (opponentName == battle.player_1) {
                                  const monstersDetails = extractMonster(details.team1)
                                  const info = extractGeneralInfo(battle)
                                  // battleCounter++;
                                  return {
                                      ...monstersDetails,
                                      ...info,
                                      battle_queue_id: battle.battle_queue_id_1,
                                      player_rating_initial: battle.player_1_rating_initial,
                                      player_rating_final: battle.player_1_rating_final,
                                      winner: battle.player_1,

                                  }
                              } else if (opponentName == battle.player_2) {
                                  const monstersDetails = extractMonster(details.team2)
                                  const info = extractGeneralInfo(battle)
                                  // battleCounter++;
                                  return {
                                      ...monstersDetails,
                                      ...info,
                                      battle_queue_id: battle.battle_queue_id_2,
                                      player_rating_initial: battle.player_2_rating_initial,
                                      player_rating_final: battle.player_2_rating_final,
                                      winner: battle.player_2,
                                  }
                              }
                          }
                      })
                  ).then(x => {
                      battlesList = [...battlesList, ...x]
                    //   console.log(battlesList);
                    //   const cleanBattleList = battlesList.filter(x => x != undefined)
                    //   fs.writeFile(`/home/jevinoh/Documents/07_PROJECTS/bot-notes/battleHistory.json`, JSON.stringify(cleanBattleList, null, 2), function (err) {
                    //       if (err) {
                    //           console.log(err);
                    //       }
                    //   });
                    //   checkForCounterSplinter(cleanBattleList);
                    // fetch('/home/jevinoh/Documents/07_PROJECTS/bot-notes/battleHistory.json')
                    //     .then(response => response.json())
                    //     .then(json => checkForCounterSplinter(json));
                    const cleanBattleList = battlesList.filter(x => x != undefined)
                    const summoners = checkForCounterSplinter(jsonFile);
                    console.log('Counter summoners ' + JSON.stringify(summoners));
                    });

    var jsonFile = require('/home/jevinoh/Documents/07_PROJECTS/bot-notes/battleHistory.json');
    const summoners = checkForCounterSplinter(jsonFile);

    console.log('Counter summoners ' + JSON.stringify(summoners));
    console.log('Counter summoners ' + summoners[0][1] + summoners[1][1]);
    // Promise.all(battles).then(() => {
    //     const cleanBattleList = battlesList.filter(x => x != undefined)
    //     fs.writeFile(`/home/jevinoh/Documents/07_PROJECTS/bot-notes/battleHistory.json`, JSON.stringify(cleanBattleList, null, 2), function (err) {
    //         if (err) {
    //             console.log(err);
    //         }
    //     });
    //     checkForCounterSplinter(battlesList);
    // });

  return value2;
}   


(async() => {    
// const browser = await puppeteer.launch();

const browser = await puppeteer.launch({
  headless: false,
  args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ]
    });// default is true

const page = await browser.newPage();
await page.setDefaultNavigationTimeout(500000);
await page.on('dialog', async dialog => {
    await dialog.accept();
});
// var contentHtml = fs.readFileSync('file:///home/jevinoh/Documents/07_PROJECTS/bot-notes/battle_info_html.html', 'utf8');
await page.goto('file:///home/jevinoh/Documents/07_PROJECTS/bot-notes/battle_info_html.html');
await page.waitForTimeout(3000);
console.log('Enter 1');

const opponent = checkOpponentBattleHistory(page);
// await page.evaluate(checkOpponentBattleHistory(page));

//console.log('Opponent', opponent);

// await page.evaluate(() => {
//   checkOpponentBattleHistory(page);
//   return true;
// });


await page.waitForTimeout(5000);
await browser.close();
})();