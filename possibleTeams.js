require('dotenv').config()
var fs = require('fs');
const path = require('path');

const card = require('./cards');
const helper = require('./helper');
const battles = require('./battles');
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
{ 73: 'life' }]

const splinters = ['fire', 'life', 'earth', 'water', 'death', 'dragon']

const getSummoners = (myCards, splinters) => {
    try {
        const sumArray = summoners.map(x=>Number(Object.keys(x)[0]))
        const mySummoners = myCards.filter(value => sumArray.includes(Number(value)));
        const myAvailableSummoners = mySummoners.filter(id=>splinters.includes(summonerColor(id)))
        return myAvailableSummoners || mySummoners;             
    } catch(e) {
        console.log(e);
        return [];
    }
}

const summonerColor = (id) => {
    const summonerDetails = summoners.find(x => x[id]);
    return summonerDetails ? summonerDetails[id] : '';
}

// const historyBackup = require("./data/newHistory.json");
const basicCards = require('./data/basicCards.js');
const { ConsoleMessage } = require('puppeteer');

let availabilityCheck = (base, toCheck) => toCheck.slice(0, 7).every(v => base.includes(v));
let isHistoryInitialize = false;
var allBattleHistory = [];
const battleDirectory = ['./data/bronzeRankLow/', './data/bronzeRank/', './data/silverRank/'];
var battleHistoryBronzeLow = [];
var battleHistoryBronze = [];
var battleHistorySilver = [];

function initializedBattleHistory () {

    for (let x in battleDirectory) {
        var dir = battleDirectory[x]
        fs.readdirSync(dir).forEach(filename => {
          const name = path.parse(filename).name;
          const ext = path.parse(filename).ext;
          const filepath = path.resolve(dir, filename);
          const stat = fs.statSync(filepath);
          const isFile = stat.isFile();

          if (isFile)
          {
            const jsonString = fs.readFileSync(filepath)
            const jsonFile = JSON.parse(jsonString)
            if(x == 0)
            {
                battleHistoryBronzeLow = battleHistoryBronzeLow.concat(jsonFile);
            }
            else if(x == 1)
            {
                battleHistoryBronze = battleHistoryBronze.concat(jsonFile);
            }
            else if(x == 2)
            {
                battleHistorySilver = battleHistorySilver.concat(jsonFile);
            }
          }
        });
    }
}

const getBattlesWithRuleset = (ruleset, mana, summoners) => {
    const rulesetEncoded = encodeURIComponent(ruleset);
    console.log(process.env.API)
    const host = process.env.API || 'https://splinterlands-data-service.herokuapp.com/'
//    const host = 'http://localhost:3000/'
    let url = ''
    if (process.env.API_VERSION == 2) {
        url = `V2/battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${process.env.ACCOUNT}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
    } else {
        url = `battlesruleset?ruleset=${rulesetEncoded}&mana=${mana}&player=${process.env.ACCOUNT}&token=${process.env.TOKEN}&summoners=${summoners ? JSON.stringify(summoners) : ''}`;
    }
    console.log('API call: ', host+url)
    return fetch(host+url)
        .then(x => x && x.json())
        .then(data => data)
        .catch((e) => console.log('fetch ', e))
}

function battlesFilterByManacapHelper(mana, ruleset, historyBackup){
    const result = historyBackup.filter(
        battle =>
            battle.mana_cap == mana &&
            (ruleset ? battle.ruleset === ruleset : true))

    return result;
}

const battlesFilterByManacap = async (mana, ruleset, summoners, rank) => {

    // TODO: disable this API call for now, no usage because we don't have any access to it
    //       WE MIGHT NEED to create our own API
    /*
    const history = await getBattlesWithRuleset(ruleset, mana, summoners);
    if (history) {
        console.log('API battles returned ', history.length)
        return history.filter(
            battle =>
                battle.mana_cap == mana &&
                (ruleset ? battle.ruleset === ruleset : true)
        )
    }
    console.log('API battles did not return ', history)
    */

    if(isHistoryInitialize == false)
    {
        initializedBattleHistory();
        isHistoryInitialize = true;
    }

    var battleHistory = [];

    if(rank == 1 || rank == 2)
    {
        battleHistory = battleHistoryBronzeLow
    }
    else if (rank == 3)
    {
        battleHistory = battleHistoryBronze
    }
    else if (rank == 4)
    {
        battleHistory = battleHistorySilver
    }

    const battleResult = battleHistory.filter(
                            battle =>
                                battle.mana_cap == mana &&
                                (ruleset ? battle.ruleset === ruleset : true))

    console.log('Battle History [' + battleHistory.length + ']');

    console.log('Possible combination [' + battleResult.length + ']');
    return battleResult;
}

function compare(a, b) {
    const totA = a[9];
    const totB = b[9];
  
    let comparison = 0;
    if (totA < totB) {
      comparison = 1;
    } else if (totA > totB) {
      comparison = -1;
    }
    return comparison;
  }

const cardsIdsforSelectedBattles = (mana, ruleset, splinters, summoners, rank) => battlesFilterByManacap(mana, ruleset, summoners, rank)
    .then(x => {
        return x.map(
            (x) => {
                return [
                    x.summoner_id ? parseInt(x.summoner_id) : '',
                    x.monster_1_id ? parseInt(x.monster_1_id) : '',
                    x.monster_2_id ? parseInt(x.monster_2_id) : '',
                    x.monster_3_id ? parseInt(x.monster_3_id) : '',
                    x.monster_4_id ? parseInt(x.monster_4_id) : '',
                    x.monster_5_id ? parseInt(x.monster_5_id) : '',
                    x.monster_6_id ? parseInt(x.monster_6_id) : '',
                    summonerColor(x.summoner_id) ? summonerColor(x.summoner_id) : '',
                    x.tot ? parseInt(x.tot) : '',
                    x.ratio ? parseInt(x.ratio) : '',
                ]
            }
        ).filter(
            team => splinters.includes(team[7])
        ).sort(compare)
    })

const askFormation = function (matchDetails, rank) {
    const cards = matchDetails.myCards || basicCards;
    const mySummoners = getSummoners(cards,matchDetails.splinters);
    console.log('INPUT: ', matchDetails.mana, matchDetails.rules, matchDetails.splinters, cards.length)
    return cardsIdsforSelectedBattles(matchDetails.mana, matchDetails.rules, matchDetails.splinters, mySummoners, rank)
        .then(x => x.filter(
            x => availabilityCheck(cards, x))
            .map(element => element)//cards.cardByIds(element)
        )

}

const possibleTeams = async (matchDetails, rank) => {
    let possibleTeams = [];
    let mana = matchDetails.mana
    while (mana > 10) {
        console.log('check battles based on mana: ' + mana)
        possibleTeams = await askFormation(matchDetails, rank)
        if (possibleTeams.length > 0) {
            return possibleTeams;
        }

        if (mana > 50) {
            mana = 50;
        }
        else {
            mana--;
        }

    }
    return possibleTeams;
}

const mostWinningSummonerTankCombo = async (possibleTeams, matchDetails) => {
    const bestCombination = await battles.mostWinningSummonerTank(possibleTeams)
    console.log('BEST SUMMONER and TANK', bestCombination)
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1 && bestCombination.thirdBacklineWins > 1 && bestCombination.forthBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline && x[4] == bestCombination.bestThirdBackline && x[5] == bestCombination.bestForthBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1 && bestCombination.thirdBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline && x[4] == bestCombination.bestThirdBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1 && bestCombination.secondBacklineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline && x[3] == bestCombination.bestSecondBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1 && bestCombination.backlineWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank && x[2] == bestCombination.bestBackline)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1 && bestCombination.tankWins > 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner && x[1] == bestCombination.bestTank)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
    if (bestCombination.summonerWins >= 1) {
        const bestTeam = await possibleTeams.find(x => x[0] == bestCombination.bestSummoner)
        console.log('BEST TEAM', bestTeam)
        const summoner = bestTeam[0].toString();
        return [summoner, bestTeam];
    }
}

const teamSelection = async (possibleTeams, matchDetails, quest, favouriteDeck) => {
    let priorityToTheQuest = process.env.QUEST_PRIORITY === 'false' ? false : true;
    //TEST V2 Strategy ONLY FOR PRIVATE API
    if (process.env.API_VERSION == 2 && possibleTeams[0][8]) {
        // check dragons and remove the non playable:
        const removedUnplayableDragons = possibleTeams.filter(team=>team[7]!=='dragon' || matchDetails.splinters.includes(helper.teamActualSplinterToPlay(team? team.slice(0, 6) : team).toLowerCase()))
        //force favouriteDeck play:
        if(favouriteDeck && matchDetails.splinters.includes(favouriteDeck? favouriteDeck.toLowerCase() : favouriteDeck)) {
            const filteredTeams = removedUnplayableDragons.filter(team=>team[7]===favouriteDeck)
            console.log('play splinter:', favouriteDeck, 'from ', filteredTeams? filteredTeams.length : filteredTeams, 'teams')
            if(filteredTeams && filteredTeams.length >= 1 && filteredTeams[0][8]) {
                console.log('play deck:', filteredTeams[0])
                return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
            }
            console.log('No possible teams for splinter',favouriteDeck)
        }

        //check quest for private api V2:
        if(priorityToTheQuest && removedUnplayableDragons.length > 25 && quest && quest.total) {
            const left = quest.total - quest.completed;
            const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
            const filteredTeams = removedUnplayableDragons.filter(team=>team[7]===quest.splinter)
            console.log(left + ' battles left for the '+quest.splinter+' quest')
            console.log('play for the quest ',quest.splinter,'? ',questCheck)
            if(left > 0 && filteredTeams && filteredTeams.length >= 1 && splinters.includes(quest.splinter) && filteredTeams[0][8]) {
                console.log('PLAY for the quest with Teams size: ',filteredTeams.length, 'PLAY: ', filteredTeams[0])
                return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
            }
        }
        const filteredTeams = removedUnplayableDragons.filter(team=>matchDetails.splinters.includes(helper.teamActualSplinterToPlay(team? team.slice(0, 6) : team).toLowerCase()))
        console.log('play the most winning: ', filteredTeams[0])
        return { summoner: filteredTeams[0][0], cards: filteredTeams[0] };
    }
    

    //check if daily quest is not completed
    console.log('quest custom option set as:', process.env.QUEST_PRIORITY)
    if(priorityToTheQuest && possibleTeams.length > 25 && quest && quest.total) {
        const left = quest.total - quest.completed;
        const questCheck = matchDetails.splinters.includes(quest.splinter) && left > 0;
        const filteredTeams = possibleTeams.filter(team=>team[7]===quest.splinter)
        console.log(left + ' battles left for the '+quest.splinter+' quest')
        console.log('play for the quest ',quest.splinter,'? ',questCheck)
        if(left > 0 && filteredTeams && filteredTeams.length > 3 && splinters.includes(quest.splinter)) {
            console.log('PLAY for the quest with Teams size: ',filteredTeams.length)
            const res = await mostWinningSummonerTankCombo(filteredTeams, matchDetails);
            console.log('Play this for the quest:', res)
            if (res[0] && res[1]) {
                return { summoner: res[0], cards: res[1] };
            }
        }
    }

    //find best combination (most used)
    const res = await mostWinningSummonerTankCombo(possibleTeams, matchDetails);
    console.log('Dont play for the quest, and play this:', res)
    if (res[0] && res[1]) {
        return { summoner: res[0], cards: res[1] };
    }

    let i = 0;
    for (i = 0; i <= possibleTeams.length - 1; i++) {
        if (matchDetails.splinters.includes(possibleTeams[i][7]) && helper.teamActualSplinterToPlay(possibleTeams[i]) !== '' && matchDetails.splinters.includes(helper.teamActualSplinterToPlay(possibleTeams[i]? possibleTeams[i].slice(0, 6) : possibleTeams[i]).toLowerCase())) {
            console.log('Less than 25 teams available. SELECTED: ', possibleTeams[i]);
            const summoner = card.makeCardId(possibleTeams[i][0].toString());
            return { summoner: summoner, cards: possibleTeams[i] };
        }
        console.log('DISCARDED: ', possibleTeams[i])
    }
    throw new Error('NO TEAM available to be played.');
}

// (async () => {

//     initializedBattleHistory();

//     console.log(allBattleHistory.length);
// })();

module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;