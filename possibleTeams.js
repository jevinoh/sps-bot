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
const battleDirectory = ['./data/battleHistoryWavesmith/','./data/bronzeRankLow/', './data/bronzeRank/', './data/silverRank/'];
var battleHistoryWavesmith = [];
var battleHistoryBronzeLow = [];
var battleHistoryBronze = [];
var battleHistorySilver = [];

const battleHistoryCombination = require('./data/bronzeRankBattleData/combinedDataBronze.json')
const battleHistoryCombinationRankOne = require('./data/bronzeRankBattleData/combinedDataBronzeOne.json')

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
                battleHistoryWavesmith = battleHistoryWavesmith.concat(jsonFile);
            }
            else if(x == 1)
            {
                battleHistoryBronzeLow = battleHistoryBronzeLow.concat(jsonFile);
            }
            else if(x == 2)
            {
                battleHistoryBronze = battleHistoryBronze.concat(jsonFile);
            }
            else if(x == 3)
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

    if(rank == 0)
    {
        battleHistory = battleHistoryWavesmith
    }
    else if(rank == 1 || rank == 2)
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

const battlesFilterLosingCombo = async (userMatchDetails) => {

    const userCards = userMatchDetails.myCards;
    let battleResult = battleHistoryCombinationRankOne.filter(
                            battle =>
                                battle.summoner_id == userMatchDetails.summoner &&
                                battle.monster_1_id == userMatchDetails.cards[0] &&
                                battle.monster_2_id == userMatchDetails.cards[1] &&
                                battle.monster_3_id == userMatchDetails.cards[2] &&
                                battle.monster_4_id == userMatchDetails.cards[3] &&
                                battle.monster_5_id == userMatchDetails.cards[4] &&
                                battle.monster_6_id == userMatchDetails.cards[5] &&
                                battle.mana_cap == userMatchDetails.mana &&
                                (userMatchDetails.ruleset ? battle.ruleset === userMatchDetails.ruleset : true));

    if(battleResult.length == 1)
    {
        const team = battleResult[0].antiCombo.filter(
            combo => basicCards.includes(combo.summoner_id) &&
            userCards.includes(combo.monster_1_id) &&
            userCards.includes(combo.monster_2_id) &&
            userCards.includes(combo.monster_3_id) &&
            userCards.includes(combo.monster_4_id) &&
            userCards.includes(combo.monster_5_id));

        // console.log(team);

        // In case it returns multiple combo, choose always the first one since it
        // occurs multiple times
        if(team.length >= 1)
        {
            console.log('from battleHistoryCombinationRankOne')
            let selectedCards = [
                team[0].summoner_id ? parseInt(team[0].summoner_id) : '',
                team[0].monster_1_id ? parseInt(team[0].monster_1_id) : '',
                team[0].monster_2_id ? parseInt(team[0].monster_2_id) : '',
                team[0].monster_3_id ? parseInt(team[0].monster_3_id) : '',
                team[0].monster_4_id ? parseInt(team[0].monster_4_id) : '',
                team[0].monster_5_id ? parseInt(team[0].monster_5_id) : '',
                team[0].monster_6_id ? parseInt(team[0].monster_6_id) : '',
                summonerColor(team[0].summoner_id) ? summonerColor(team[0].summoner_id) : '',
                team[0].tot ? parseInt(team[0].tot) : '',
                team[0].ratio ? parseInt(team[0].ratio) : '',
            ]
            return {
                summoner: (team[0].summoner_id ? parseInt(team[0].summoner_id) : '').toString(),
                cards: selectedCards
            }
        }

    }
    else
    {
        battleResult = battleHistoryCombination.filter(
                        battle =>
                            battle.summoner_id == userMatchDetails.summoner &&
                            battle.monster_1_id == userMatchDetails.cards[0] &&
                            battle.monster_2_id == userMatchDetails.cards[1] &&
                            battle.monster_3_id == userMatchDetails.cards[2] &&
                            battle.monster_4_id == userMatchDetails.cards[3] &&
                            battle.monster_5_id == userMatchDetails.cards[4] &&
                            battle.monster_6_id == userMatchDetails.cards[5] &&
                            battle.mana_cap == userMatchDetails.mana &&
                            (userMatchDetails.ruleset ? battle.ruleset === userMatchDetails.ruleset : true));

        if(battleResult.length == 1)
        {
            const team = battleResult[0].antiCombo.filter(
                combo => basicCards.includes(combo.summoner_id) &&
                userCards.includes(combo.monster_1_id) &&
                userCards.includes(combo.monster_2_id) &&
                userCards.includes(combo.monster_3_id) &&
                userCards.includes(combo.monster_4_id) &&
                userCards.includes(combo.monster_5_id));

            // In case it returns multiple combo, choose always the first one since it
            // occurs multiple times
            if(team.length >= 1)
            {
                console.log('from battleHistoryCombination')
                let selectedCards = [
                    team[0].summoner_id ? parseInt(team[0].summoner_id) : '',
                    team[0].monster_1_id ? parseInt(team[0].monster_1_id) : '',
                    team[0].monster_2_id ? parseInt(team[0].monster_2_id) : '',
                    team[0].monster_3_id ? parseInt(team[0].monster_3_id) : '',
                    team[0].monster_4_id ? parseInt(team[0].monster_4_id) : '',
                    team[0].monster_5_id ? parseInt(team[0].monster_5_id) : '',
                    team[0].monster_6_id ? parseInt(team[0].monster_6_id) : '',
                    summonerColor(team[0].summoner_id) ? summonerColor(team[0].summoner_id) : '',
                    team[0].tot ? parseInt(team[0].tot) : '',
                    team[0].ratio ? parseInt(team[0].ratio) : '',
                ]
                return {
                    summoner: (team[0].summoner_id ? parseInt(team[0].summoner_id) : '').toString(),
                    cards: selectedCards
                }
            }

        }
    }
    
    return [];
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

const getTeamBasedOpponentHistory = function (battleHistory, opponent, matchDetails) {
    for(var x = 0; x < battleHistory.length; x++)
    {
        const battle = battleHistory[x]
        const details = JSON.parse(battle.details);
        let monstersDetails;
        const info = extractGeneralInfo(battle);
 
        if(details.type != 'Surrender' && opponent == details.team1.player)
        {
            monstersDetails = extractMonster(details.team1)
            if(matchDetails.mana == info.mana_cap &&
               matchDetails.rules == info.ruleset &&
               matchDetails.splinters.includes(summonerColor(monstersDetails.summoner_id)))
            {
                const userMatchDetails = {
                    mana: matchDetails.mana,
                    ruleset: matchDetails.rules,
                    summoner: monstersDetails.summoner_id,
                    cards: [monstersDetails.monster_1_id,
                            monstersDetails.monster_2_id,
                            monstersDetails.monster_3_id,
                            monstersDetails.monster_4_id,
                            monstersDetails.monster_5_id,
                            monstersDetails.monster_6_id
                    ],
                    myCards: matchDetails.myCards
                }
                const possibleTeam = possibleAntiComboTeams(userMatchDetails)
                return possibleTeam;
            }
        }
        else if(details.type != 'Surrender' && opponent == details.team2.player)
        {
            monstersDetails = extractMonster(details.team2)
            if(matchDetails.mana == info.mana_cap &&
               matchDetails.rules == info.ruleset &&
               matchDetails.splinters.includes(summonerColor(monstersDetails.summoner_id)))
            {
                const userMatchDetails = {
                    mana: matchDetails.mana,
                    ruleset: matchDetails.rules,
                    summoner: monstersDetails.summoner_id,
                    cards: [monstersDetails.monster_1_id,
                            monstersDetails.monster_2_id,
                            monstersDetails.monster_3_id,
                            monstersDetails.monster_4_id,
                            monstersDetails.monster_5_id,
                            monstersDetails.monster_6_id
                    ],
                    myCards: matchDetails.myCards
                }
                const possibleTeam = possibleAntiComboTeams(userMatchDetails)
                return possibleTeam;
            }
        }



    }
    return [];
}

const possibleAntiComboTeams = async (userMatchDetails) => {
    const possibleTeam = battlesFilterLosingCombo(userMatchDetails)
    return possibleTeam;
}

const possibleTeams = async (matchDetails, rank) => {
    console.log('Checking battle history on rank: ', rank);
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

// const basicCards = require('./data/basicCards');

// (async () => {

//     const userMatchDetails = {
//         mana: 28,
//         ruleset: 'Heavy Hitters',
//         summoner: 49,
//         cards: [140, 50, 51, 52, 141, 139],
//         myCards: basicCards
//     }

//     let team = await possibleAntiComboTeams(userMatchDetails)
    
//     console.log('my team ' + team);
// })();

module.exports.possibleTeams = possibleTeams;
module.exports.teamSelection = teamSelection;
module.exports.possibleAntiComboTeams = possibleAntiComboTeams;
module.exports.getTeamBasedOpponentHistory = getTeamBasedOpponentHistory;