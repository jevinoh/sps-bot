async function login(page) {
    try {
        page.waitForSelector('#log_in_button > button').then(() => page.click('#log_in_button > button'))
        await page.waitForSelector('#email')
            .then(() => page.waitForTimeout(3000))
            .then(() => page.focus('#email'))
            .then(() => page.type('#email', process.env.ACCOUNT))
            .then(() => page.focus('#password'))
            .then(() => page.type('#password', process.env.PASSWORD))

            // .then(() => page.waitForSelector('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button', { visible: true }).then(() => page.click('#login_dialog_v2 > div > div > div.modal-body > div > div > form > div > div.col-sm-offset-1 > button')))
            .then(() => page.keyboard.press('Enter'))
            .then(() => page.waitForTimeout(5000))
            .then(() => page.reload())
            .then(() => page.waitForTimeout(5000))
            .then(() => page.reload())
            .then(() => page.waitForTimeout(3000))
            .then(async () => {
                await page.waitForSelector('#log_in_text', {
                        visible: true, timeout: 3000
                    })
                    .then(()=>{
                        console.log('logged in!')
                    })
                    .catch(()=>{
                        console.log('didnt login');
                        throw new Error('Didnt login');
                    })
                })
            .then(() => page.waitForTimeout(2000))
            .then(() => page.reload())
    } catch (e) {
        throw new Error('Check that you used correctly username and posting key. (dont use email and password)');
    }
}

async function delegateCard(page, userName) {
    // try {
        page.waitForTimeout(8000);
        // page.$eval('#G3-280-H629IGLBGW > check > card-checkbox', check => check.checked = true);
        // await page.waitForSelector('#G3-280-H629IGLBGW > check > card-checkbox');


        page.waitForSelector('#card_list__card-rows-table > tbody > G3-280-H629IGLBGW > check > G3-280-H629IGLBGW');

        await page.evaluate(() => {
          document.querySelector("#G3-280-H629IGLBGW > check > card-checkbox").parentElement.click();
        });

        // await page.evaluate(() => {
        //   let itemSelect = document.querySelector('#G3-280-H629IGLBGW > check > card-checkbox');
        //   itemSelect.click();
        // });

        await page.evaluate(() => {
            // document.querySelector('#buttons > btn_lease').parentElement.click();
            let leaseSelect = document.querySelector('#buttons > btn_lease');
            leaseSelect.click();
        });

        await page.waitForTimeout(3000);

        await page.waitForSelector('#dialog_container')
        .then(() => page.waitForTimeout(1000))
        .then(() => page.focus('#recipient'))
        .then(() => page.type('#recipient', userName))
        .then(() => page.keyboard.press('Enter'))
        .then(() => page.waitForTimeout(5000))
        .then(() => page.reload())
        .then(() => page.waitForTimeout(5000))
        .then(() => page.reload())
        .then(() => page.waitForTimeout(3000))
        .then(async () => {
            await page.waitForSelector('#G3-280-H629IGLBGW', {
                    visible: true, timeout: 3000
                })
                .then(()=>{
                    console.log('Card delegated to ', userName)
                })
                .catch(()=>{
                    console.log('Unable to delegate the card');
                    throw new Error('Unable to delegate G3-280-H629IGLBGW to ', userName);
                })
            })
        .then(() => page.waitForTimeout(2000))
        .then(() => page.reload())
    // } catch (e) {
    //     throw new Error('Check if the card URL is valid');
    // }
}



async function checkMana(page) {
    var manas = await page.evaluate(() => {
        var manaCap = document.querySelectorAll('div.mana-total > span.mana-cap')[0].innerText;
        var manaUsed = document.querySelectorAll('div.mana-total > span.mana-used')[0].innerText;
        var manaLeft = manaCap - manaUsed
        return { manaCap, manaUsed, manaLeft };
    });
    console.log('manaLimit', manas);
    return manas;
}

async function checkMatchMana(page) {
    const mana = await page.$$eval("div.col-md-12 > div.mana-cap__icon", el => el.map(x => x.getAttribute("data-original-title")));
    const manaValue = parseInt(mana[0].split(':')[1], 10);
    return manaValue;
}

async function checkMatchRules(page) {
    const rules = await page.$$eval("div.combat__rules > div.row > div>  img", el => el.map(x => x.getAttribute("data-original-title")));
    return rules.map(x => x.split(':')[0]).join('|')
}

async function checkOpponentBattleHistory(page) {
    // const rules = await page.$$eval("div.bio__name > div.bio__name__display > div>  img", el => el.map(x => x.getAttribute("data-original-title")));
    // const opponent = getElementText(page, 'bio__name__display', 15000);
    // var opponentName = await page.evaluate(() => {
    //     const opponent = document.querySelectorAll('div.bio__name > span.bio__name__display')[0].innerText;
    // });
    const opponentName =  await page.$eval('.bio__name .bio__name__display:nth-child(2)', el => { return el.innerText });
    const value = await page.evaluate(
        () => document.querySelectorAll('.bio__name .bio__name__display')[1].innerText
    );


    console.log('opponentName ', opponentName);
    console.log('opponentName2 ', value);
    return opponentName;
}

async function checkMatchActiveSplinters(page) {
    const splinterUrls = await page.$$eval("div.col-sm-4 > img", el => el.map(x => x.getAttribute("src")));
    return splinterUrls.map(splinter => splinterIsActive(splinter)).filter(x => x);
}

//UNUSED ?
const splinterIsActive = (splinterUrl) => {
    const splinter = splinterUrl.split('/').slice(-1)[0].replace('.svg', '').replace('icon_splinter_', '');
    return splinter.indexOf('inactive') === -1 ? splinter : '';
}

exports.login = login;
exports.checkMana = checkMana;
exports.checkMatchMana = checkMatchMana;
exports.checkMatchRules = checkMatchRules;
exports.checkOpponentBattleHistory = checkOpponentBattleHistory;
exports.checkMatchActiveSplinters = checkMatchActiveSplinters;
exports.delegateCard = delegateCard;
exports.splinterIsActive = splinterIsActive;