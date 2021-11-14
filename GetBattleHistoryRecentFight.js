const fetch = require("node-fetch");
const fs = require('fs');

const distinct = (value, index, self) => {
    return self.indexOf(value) === index;
}

async function getPlayerating(player = '') {
    // console.log(player);
    const playerInfo = await fetch('https://api.splinterlands.io/players/details?name=' + player)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then((playerInfo) => {
            return playerInfo.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    const rating = playerInfo.rating
    const league = playerInfo.league

    if(rating >= 1000 && rating <= 1800 && league == 4)
    {
        userCounter++;
        console.error('userCounter [' + userCounter +'] ' + 'rating[' + rating +'] ' + 'league[' + league +']');
        return 1;
    }
    else
    {
        return 0;
    }
}

async function getBattleHistory(player = '', data = {}) {
    // console.log(player);
    const battles = await getPlayerating(player).then(async (result) =>
        {
            if(result == 1)
            {
                const battleHistory = await fetch('https://api.steemmonsters.io/battle/history?player=' + player)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response;
                })
                .then((battleHistory) => {
                    return battleHistory.json();
                })
                .catch((error) => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        
                return battleHistory.battles;
            }
            else
            {
                return [];
            }
        });


    return battles;
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

let battlesList = [];
let userNames = [];
let userNamesNew = [];
//const usersToGrab = ['jilleqxr43', 'berindon', 'aticha918', 'gynfreaks', 'jrobert0807', 'timetty', 'm2tz', 'amzb', 'brahma1103', 'xbu', 'marky020', 'mlock20', 'deaed2', 'mykie23', 'rich143441', 'oldhouse7', 'yoyoy', 'thomasdoan', 'xxq', 'ana0314','moondo', 'datdetde01', 'josaiah', 'markrafer2', 'jynx5515', 'krystelv', 'luzeny', 'krauzer9600', 'mulchdiggums', 'rjmm0825', 'priusgray', 'joeymac', 'wadiyaaa', 'kanzaik3n', 'gildan8888', 'wednesway', 'cludia', 'battousaipads', 'kup2o0fw', 'amtia41', 'lekoms', 'nelbiel', 'manut123', 'doomand', 'gibby222', 'agus2020', 'manterpogi', 'jo11boy', 'thonzkie', 'jeckjeck', 'superchennie', "rus48-bot", "jengley", "pippocollasso", "blumela", "azwa", "chocolegend04", "chambelier", "jepex", "phoenixfest", "urchintrader", "quirp", "remmyrae", "alricstormbringr", "rus32-bot", "lafona", "toycard", "cryptotaz", "brilliant-banjo", "rus23-bot", "takeru255", "funky-farm", "pk-for-people", "cultured-creek", "funnel", "rus19-bot", "naturelife", "limonad", "buff-buff", "kamuu", "chococandi", "ambulorbis", "jegewav", "luyz", "aaronli", "rus31-bot", "zgil", "enthef", "clm", "oksanastar", "rahulsingh25843", "boss90", "koolinate", "sm-navidad", "aano", "daymardance", "marcelo182", "likar", "makspowerbro17", "dexent", "kefer", "birthritual", "silverbug", "inversionista", "wayoutwest", "rus01-bot", "samruk", "crystalpacheco30", "yehak", "themanwecanblame", "betojose30", "stolik", "jatut", "enminers-19", "restinpeace", "a1492dc", "b0ga4", "joseph230", "smonbear", "sosop", "rus06-bot", "coffeeheater", "nobitaa", "xta", "xosem", "helcuras", "thesplinterland", "baduka", "exiledlegion", "dharanir", "hardingicefield", "realrj", "olvaus", "barsyk", "gigel6", "mister.arianthus", "elfy411", "mumma-monza", "mistakili", "hotterthanhell", "azaad", "bobokyaw", "xzg", "buldozor", "megaeoz", "shitsignals", "flamo", "tinamarr", "hirume", "smast", "nuclearmonk", "shaheerbari", "elpenyar", "louisianimal", "oksanauk", "theheat", "nepomuseno", "igor11123", "reoparker", "casimira", "elneno", "pialejoana", "olopezdeveloper2", "dazzling-dentist", "monster.free", "paypalhouse", "renypk", "flyerchen", "qqueenqueen", "splinterembassy", "cyberblock", "outlinez", "conme", "rizqyeka", "leebo86", "register50", "maddietel", "pataty69", "zenere", "musicgeek", "cryptonnja", "hevpleon", "dboontje", "brucutu2", "sumatranate", "mamaculo", "difools", "borodas", "paraguana", "tayler", "schubes", "sawcraz.art", "stephalt", "pi1", "go-kyo", "thallid", "kaeves4711", "votingpower", "crisangel", "gaeljosser", "thepalaceguard", "monstersforfree", "phat64", "madgold", "ceewye", "duppo", "juanos", "gast0n", "syedshakil", "bolachasmonster", "swordsoffreedom", "brandaswitch", "smonian", "lupee", "ajjec", "sgsgsg", "lets-rumble", "gleaming-glacier", "sparkofphoenix", "p-a", "olaexcel", "bepokic", "toto10", "carioca", "kitty-kitty", "ukprepper", "laughalittle2day", "markus.journey", "julian10", "zekans84", "jiuinfo", "sher10ck", "veteran-rus", "makogr4", "powermaster", "greddyforce", "elvinho", "minibaryl", "splinterlands-ru", "jussara", "dexy50", "lostkluster", "menclub", "andruto", "cerf", "feminineenergy", "yabapmatt", "theteoz", "wisejg", "jleonardorf", "tzukhan", "muchsteemsowow", "asadnaymur", "senat0r", "agoodaccount", "vjap55", "liuke99player", "amamless", "stefano.massari", "rus24-bot", "enminers-8", "gerisn", "rus18-bot", "mismon", "alliedforce", "be-inspired", "kumquat-cake", "vaca3", "tiburones", "mer1in", "rus14-bot", "clackity", "gigel1", "chocoshogun", "meins0815", "smhive", "conthong", "monsterpiadas", "rakison2", "gonk-droid", "fiat600", "faizan-ashraf", "blueskymin", "icegianter", "alureoftheearth", "krikblock", "velourex.play2", "city-of-berlin", "rus22-bot", "tanimus", "freedomteam2019", "rus35-bot", "karinapac", "sonki999", "bang0", "diebaasman", "yeman", "fotik", "rus09-bot", "cunigarro", "rus50-bot", "an-1", "enminers-21", "braz", "th12-egoista", "gioele13", "accountsdump", "stephavellaneda", "ishare", "kixon1993", "proto26", "vonefas", "dracosilver", "superbad", "pelayo", "vasigo", "daraly", "level1sm", "maheshbhai", "jferdous", "chocolegend01", "ducthanh", "rus41-bot", "nessos", "dismayedworld", "manmen", "zavala", "bulletmind", "jurajimmy", "sm-school", "alobiun", "drsun", "shepz1", "aaronli", "gigel4", "papeda-pizza", "ninjamike", "dwinf", "shvara", "jiheref", "boobie-trap", "dinklebot", "mcoinz79", "xplosive", "azw", "chocoluche", "rodchenko", "doom2", "ran.koree", "paredao", "quatre-raberba", "dredgenyor", "lime-soup", "jamzmie", "ksantoprotein", "mikan-milkshake", "pesterson", "thomasward9", "butanopropan", "jomeb", "untamedspirit", "transom", "khaled1997", "squatme", "labold", "feduk", "rus46-bot", "po2", "oryans.belt", "yitige", "seblak", "bimol", "idkpdx", "logika", "mctoph", "whizzkid", "clausewitz", "enminers-13", "cesarmorles", "zu-jyuva", "cryptosales", "rus29-bot", "hafizz", "megateo", "urgrant", "febil", "torachibi", "if-time", "cryplectibles", "francis228", "hanen", "thegamechain", "erikkartmen", "tezcatli", "danny23", "dflz17", "siong", "cryptissues", "chrstnv", "creationlogic", "bengiles", "belaz", "tepobib", "figaro001", "retirebygaming", "smoner", "itisfinished", "malric-inferno", "silverwinner", "howerot", "waterchasers", "rikyu", "tomy5", "ana-maria", "beco132", "orangelo-oatmeal", "soang", "bereg", "elukas", "atnep111", "civilengineer13", "wisdome", "rus15-bot", "tronhill", "tr77", "tyreen", "mi2", "khazbot", "scar1ett", "monsterfightclub", "divachev", "rearguard", "karlosjmp", "athira", "lucassgrfy", "andrenavarro", "coolepicguy123", "caritoos", "bobor", "lzh1703", "pauleniuks", "splinterland", "inventive-isle", "seens", "electru", "agridulce2", "cryp71x", "armenian-gull", "ronyparra", "chocolinda", "asadnaymur", "galdirea", "rus03-bot", "orange-pie", "anneadam", "derion", "w121212", "brumgunter", "habibabiba", "stolik", "hitono", "tyara", "stranniksenya", "clap-trap", "proteus", "therentaltest", "hausner", "mawichan04", "bronkong", "sebaf", "guerrillakills", "pokat", "burdjg", "krabik", "naythan", "iceweex", "chicoduro", "alex-alexander", "antithb", "winmaster1", "banktest", "verlaat", "chargeblock", "s77assistant", "greens-creek", "eyewitness", "xandr", "reversemagnetar", "lolq", "amelino", "nirat", "sxsy", "tibl", "parnter", "andrea01", "stairway2heaven", "rus49-bot", "emilius", "loperdt", "biplan", "lice", "softa", "genesis05", "trezeke", "sc-steemit", "bbdragon", "mad-moxxi", "makspowerbro7", "thevilspawn", "swarmee", "thevil", "chipman", "zhivchak003", "sanze", "brunay", "toffie", "rus38-bot", "pomelo-pancake", "greatbulloffire", "ryanrother", "koosventerza", "nelpa411", "boroznak", "limurg", "vvonderlander", "esteh", "lalong", "jwjqu.wam", "ywe", "chromiumone", "bakpao", "didara", "periods", "rus37-bot", "zoje", "alangrizz", "torbaap", "damaskinus", "pionerbank", "gamegiveaways", "sm-rules", "dmitriyyandreev", "enminers-6", "kelse", "rus33-bot", "azt", "thedragonwarrior", "adversus", "soulseeker-bcn", "cal2", "tortila", "splinterquest", "didara", "lolq", "realrj", "azt", "thedragonwarrior", "adversus", "soulseeker-bcn", "lapierre", "cal2", "galdirea", "hirume", "khalifaimaman", "stevescoins", "sm-skynet", "flyingkrak", "raste", "yousafharoonkhan", "adelinak", "soldieroffire", "normanrainbows", "gpiglioni", "rus30-bot", "szymonkus", "ywe", "clicktokill", "nivanger", "alextribeck100", "sketcher", "invest2learn", "bala-sm", "sagesigma", "therentaltest", "tagal", "makspowerbro10", "devo4ka", "rosew", "enminers-6", "kolxoz", "mortysanchez", "xum", "marinmex", "rus27-bot", "sxsy", "kristhall", "wasseir", "citron-cider", "momih", "xta", "rus11-bot", "tamer34", "minismallholding", "meheraj", "gigel4", "dilar", "makspowerbro5", "ig-100", "posty", "supercuota", "bzybyte", "erwinj888", "buckfourton", "amanfoi", "maloveg", "cadbane", "reavercois", "azq", "siviv", "rus13-bot", "madasaboxof", "valapop", "wxw", "cassidyandfranks", "cal3", "yeaho", "bazilik", "cryptocrusaders", "fenyrahma", "alexgamer", "ivansnz", "pomelo-pancake", "kamillaevd", "eirik", "oscaryayoy8", "imila", "sensful", "jznsamuel", "falen", "traveljack894", "nyswine", "wamele", "duun", "anttila", "rus43-bot", "aicu", "dobroman", "monstress", "notzna", "cryptomb", "makspowerbro13", "calwa", "jodzuone",'tungnguyenf8',' DMALINA',' bronzechicken2',' tiendung004',' tiendzung015',' velandan',' hyiponlinef',' tiendzung012',' rkps',' dgu-dgul',' quycmf8',' romapopov1190',' parladar',' watchpaper8320',' unan1',' lyannainferno2',' hamsterperson',' nicole-st',' nongru6',' proizvedenie',' korshack',' laskal',' cloudskyuiu',' ABUZER357',' myso',' cryptomonkeys-cc',' miningbees03',' peterlane',' malchick',' pauljencio',' ngoclinhmuoif6',' tiendzung019',' uyenniel',' blago1',' NELOANGELO',' august6314',' fedil',' locnguyenciu',' eclipsus',' thaihang12',' bola8',' camerayoosee202',' larinett',' titannichyip',' luubadaif7',' buteco',' tiendzung010',' fakemilka3',' DiegoTrinh',' lamtuanvu',' benderreborn',' ngoclinhf90',' okthen',' chryonex31',' linhnv010',' y327322408',' cameraxmeye104',' zazza77',' y325824613',' kaineki',' kimidoram8',' hidrante',' angelino114',' linhnv011',' trinhnguyenf98',' angela77',' dangthai123',' camerayoosee204',' nongru5',' fakemilka4',' buysomething1',' tiendzung014',' bynarang',' y376294831',' felix199810',' homa322',' hckfy197',' erwin.alcober',' ngochienmuoif1',' cryptomusk',' chanchanfi',' hantinf66',' yeuemffu',' banza',' monsterheaven',' lucidialcake',' monterarni',' irina456vl',' preta',' quantumexplorers',' mindingo',' MEDALOGON',' restongungui',' plavki',' cameraxmeye105',' jerry.van.lee',' karavan110803',' gribok',' jgkforork',' tiendzung011',' sixsamurai-fuuma']
// var usersToGrab = userNames;
var counter = 1;
var userCounter = 0;
const sleepingTime = 60000 * 2;

async function getBronzeLeaderBoard() {
    var users = [];
    const recentBattle = await fetch('https://api.steemmonsters.io/transactions/history?from_block=-1&limit=101&types=sm_battle,battle')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then((result) => {
            return result.json();
        })
        .catch((error) => {
            console.error('There has been a problem with your fetch operation:', error);
        });

    console.log('recentBattle size[' + recentBattle.length + ']');
    for (var i = 0; i < recentBattle.length; i++) {
        // append each person to our page
        if(!userNames.includes(recentBattle[i].player))
        {
            userNames.push(recentBattle[i].player);
        }

    }

    const battles = userNames.map(user =>
        getBattleHistory(user)
            .then(battles => battles.map(
                battle => {
                    const details = JSON.parse(battle.details);
                    if (details.type != 'Surrender') {
                        if (battle.winner && battle.winner == battle.player_1) {
                            if(!userNamesNew.includes(battle.player_1) && !userNames.includes(battle.player_1) && userNamesNew.length <= 500 )
                            {
                                userNamesNew.push(battle.player_1);
                            }
                            const monstersDetails = extractMonster(details.team1)
                            const info = extractGeneralInfo(battle)
                            return {
                                ...monstersDetails,
                                ...info,
                                battle_queue_id: battle.battle_queue_id_1,
                                player_rating_initial: battle.player_1_rating_initial,
                                player_rating_final: battle.player_1_rating_final,
                                winner: battle.player_1,
    
                            }
                        } else if (battle.winner && battle.winner == battle.player_2) {
                            if(!userNamesNew.includes(battle.player_2) && !userNames.includes(battle.player_2) && userNamesNew.length <= 500)
                            {
                                userNamesNew.push(battle.player_2);
                            }

                            const monstersDetails = extractMonster(details.team2)
                            const info = extractGeneralInfo(battle)
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
                userNames = [];
                userNames = userNamesNew;
                userNamesNew = [];
            })
    )


    // console.log(userNames);
    Promise.all(battles).then(() => {
        if(userCounter >= 100)
        {
            const cleanBattleList = battlesList.filter(x => x != undefined)
            var strFile = 'data/silverRank/history' + '_' + counter + '.json';
            console.log("json file [" + strFile + "]");
            fs.writeFile(strFile, JSON.stringify(cleanBattleList, null, 2), function (err) {
                if (err) {
                    console.log(err);
                }
            });
            counter++;
            battlesList = [];
            userCounter = 0;
        }

    })
    return users;
}

(async () => {

    while (counter < 50)
    {
        try {
            await getBronzeLeaderBoard();
            await console.log('Waiting for ', sleepingTime / 1000, ' to fetch new battle history');
            await new Promise(r => setTimeout(r, sleepingTime));
        }catch (e) {
            console.log('Routine error at: ', new Date().toLocaleString(), e)
        }
    }
})();