
const cardsDetails = require("./data/cardsDetails.json");
const card = require("./cards")
const fetch = require("node-fetch");
const AbortController = require('abort-controller')
const controller = new AbortController();

// const teamIdsArray = [167, 192, 160, 161, 163, 196, '', 'fire'];

//cardColor = (id) => cardsDetails.find(o => o.id === id) ? cardsDetails.find(o => o.id === id).color : '';

const validDecks = ['Red', 'Blue', 'White', 'Black', 'Green']
const colorToDeck = { 'Red': 'Fire', 'Blue': 'Water', 'White': 'Life', 'Black': 'Death', 'Green': 'Earth' }

// const tes = teamIdsArray.forEach(id => {
//     console.log('DEBUG', id, cardColor(id))
//     if (validDecks.includes(cardColor(id))) {
//         return colorToDeck[cardColor(id)];
//     }
// })

const deckValidColor = (accumulator, currentValue) => validDecks.includes(card.color(currentValue)) ? colorToDeck[card.color(currentValue)] : accumulator;

const sleep = (ms) => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

const teamActualSplinterToPlay = (teamIdsArray) => teamIdsArray.reduce(deckValidColor, '')

const clickOnElement = async (page, selector, timeout=20000, delayBeforeClicking = 0) => {
	try {
        const elem = await page.waitForSelector(selector, { timeout: timeout });
		if(elem) {
			await sleep(delayBeforeClicking);
			console.log('Clicking element', selector);
			await elem.click();
			return true;
		}
    } catch (e) {
    }
	console.log('No element', selector, 'to be closed');
	return false;
}

const getElementText = async (page, selector, timeout=15000) => {
	const element = await page.waitForSelector(selector,  { timeout: timeout });
	const text = await element.evaluate(el => el.textContent);
	return text;
}

const getElementTextByXpath = async (page, selector, timeout=20000) => {
	const element = await page.waitForXPath(selector,  { timeout: timeout });
	const text = await element.evaluate(el => el.textContent);
	return text;
}

async function getOpponentBattleHistory(player) {
	console.log('Fetching opponent:', player)
	const battleHistory = await fetch('https://api2.splinterlands.com/battle/history?player=' + player)
	.then((response) => {
		if (!response.ok) {
			console.log('Network response was not ok');
			return [];
		}
		return response;
	})
	.then((battleHistory) => {
		return battleHistory.json();
	})
	.catch((error) => {
		const secondaryBatteInfo = fetch('https://api.splinterlands.io/battle/history?player=' + player)
		.then((response) => {
			if (!response.ok) {
				console.log('Network response was not ok');
				return [];
			}
			return response;
		})
		.then((secondaryBatteInfo) => {
			return secondaryBatteInfo.json();
		})
		.catch((error) => {
			console.error('There has been a problem with your fetch operation:', error);
			return [];
		});
		return secondaryBatteInfo;
	});

	return battleHistory.battles;
}

async function getPlayerEarnings(player = '') {
    const playerInfo = await fetch('https://api2.splinterlands.com/players/balances?username=' + player)
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
            const secondaryPlayerInfo = fetch('https://api.splinterlands.io/players/balances?username=' + player)
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
            });
            return secondaryPlayerInfo;
        });

    return playerInfo;
}

module.exports.teamActualSplinterToPlay = teamActualSplinterToPlay;
module.exports.clickOnElement = clickOnElement;
module.exports.getElementText = getElementText;
module.exports.getElementTextByXpath = getElementTextByXpath;
module.exports.getOpponentBattleHistory = getOpponentBattleHistory;
module.exports.getPlayerEarnings = getPlayerEarnings;
