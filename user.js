const fetch = require("node-fetch");
const basicCards = require('./data/basicCards'); //phantom cards available for the players but not visible in the api endpoint

const AbortController = require('abort-controller')

const controller = new AbortController();
const timeout = setTimeout(() => {
	controller.abort();
}, 5000);

async function getPlayerCards(username){
  const cardList = fetch(`https://api2.splinterlands.com/cards/collection/${username}`,
            { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
            .then(x => x && x.json())
            .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to == null || x.delegated_to == username).map(card => card.card_detail_id) : '')
            .then(advanced => {
              const cardSet = new Set(advanced);
              const uniqueCards = [...cardSet];

              const allCards = uniqueCards.concat(basicCards)
              return allCards;
              })
            .catch(e=> {
              console.log('Error: game-api.splinterlands did not respond trying api.slinterlands... ');
              clearTimeout(timeout);
              const cardListBak = fetch(`https://api.splinterlands.io/cards/collection/${username}`,
                { "credentials": "omit", "headers": { "accept": "application/json, text/javascript, */*; q=0.01" }, "referrer": `https://splinterlands.com/?p=collection&a=${username}`, "referrerPolicy": "no-referrer-when-downgrade", "body": null, "method": "GET", "mode": "cors" })
                .then(x => x && x.json())
                .then(x => x['cards'] ? x['cards'].filter(x=>x.delegated_to == null || x.delegated_to == username).map(card => card.card_detail_id) : '')
                .then(advanced => {
                  const cardSet = new Set(advanced);
                  const uniqueCards = [...cardSet];
                  const allCards = uniqueCards.concat(basicCards)
                  return allCards;
                  })
                .catch(e => {
                  console.log('Unable to fetch user\'s card, will try to fetch again: ',e);
                })
                .finally(() => clearTimeout(timeout))
              return cardListBak
            })
            .finally(() => clearTimeout(timeout))
  return cardList;
}

// async function getCards() {
//   const myCards = await getPlayerCards('dhanylicious') //split to prevent email use
//   return myCards;
// } 

// (async () => {
//   const cards = await getCards();

//   console.log(cards.length)
//   console.log(cards)

// })();
module.exports.getPlayerCards = getPlayerCards;