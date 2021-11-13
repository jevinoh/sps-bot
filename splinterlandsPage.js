async function login(page, account, password) {
    try {
        console.log('Login user: ' + account )
        page.waitForSelector('#log_in_button > button').then(() => page.click('#log_in_button > button'))
        await page.waitForSelector('#email')
            .then(() => page.waitForTimeout(3000))
            .then(() => page.focus('#email'))
            .then(() => page.type('#email', account))
            .then(() => page.focus('#password'))
            .then(() => page.type('#password', password))

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
        await page.reload();
        await page.waitForTimeout(8000);
        throw new Error('Check that you used correctly username and posting key. (dont use email and password)');
    }
}

async function logout(page, account) {
    try {
        console.log('Logging out user: ' + account )
        await page.waitForSelector('#log_in_text').then(() => page.click('#log_in_text'));
        // let element1 = await page.waitForSelector('.dropdown-menu > li:nth-child(1) > a').then(() => page.click('.dropdown-menu > li:nth-child(1) > a'));
        // let element1 = await page.waitForSelector('.dropdown-menu > li:nth-child(1) > a')

        await page.waitForSelector('.dropdown-menu > li:nth-child(10) > a').then(() => page.click('.dropdown-menu > li:nth-child(10) > a'));

        // console.log(element1 ? 'Has element1!' : 'Failed to get element1');

        page.waitForTimeout(8000)
        await page.waitForSelector('#log_in_button > button')
            .then(() => page.waitForTimeout(3000))
    } catch (e) {
        throw new Error('Unable to logout user : ', account);
    }
}

async function delegateCard(page, userName, cardId) {
    try {
        await page.reload();
        await page.waitForTimeout(8000);
        const statusElement = 'table tr[card_id="' + cardId + '"] td[class="status"] span.active';
        let element = await page.$(statusElement);
        console.log(element ? 'Card is currently delegated' : 'Undelegated card');

        if(element)
        {
            throw new Error('Card is currently delgated');
        }
        else
        {
            await page.waitForTimeout(8000);
            const cardElement = 'table tr[card_id="'+ cardId + '"] td[class="check"] .card-checkbox';
            let element = await page.$(cardElement);
            console.log(element ? 'Has card!' : 'Failed to get card element');
    
            await page.waitForSelector(cardElement).then(() => page.click(cardElement));
    
            await page.waitForSelector('.card-list-container .header .buttons .lease.enabled')
                .then(() => page.click('.card-list-container .header .buttons .lease.enabled'))
                .then(() => page.waitForTimeout(3000))
                .then(() => page.focus('#recipient'))
                .then(() => page.type('#recipient', userName))
                .then(() => page.keyboard.press('Enter'))
                .then(() => page.waitForTimeout(8000))
    
            await page.waitForTimeout(8000);
        }

    } catch (e) {
        throw new Error('Unable to delegate card [' + cardId + ']' + ' to user: ' + userName);
    }
}

async function unDelegateCard(page, cardId) {
    try {
        await page.waitForTimeout(3000);

        const statusElement = 'table tr[card_id="' + cardId + '"] td[class="status"] span.active';
        let element = await page.$(statusElement);
        console.log(element ? 'Card is currently delegated' : 'Undelegated card');

        if(element)
        {
            await page.waitForSelector(statusElement)
            .then(() => page.click(statusElement))
            .then(() => page.waitForTimeout(2000))
            .then(() => page.keyboard.press('Enter'))
            .then(() => page.waitForTimeout(15000));
        }
        else
        {
            return;
        }

        await page.reload();
        await page.waitForTimeout(8000);

    } catch (e) {
        throw new Error('Unable to cancel delegation on card [' + cardId + ']');
    }
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
exports.logout = logout;
exports.delegateCard = delegateCard;
exports.unDelegateCard = unDelegateCard;
exports.checkMana = checkMana;
exports.checkMatchMana = checkMatchMana;
exports.checkMatchRules = checkMatchRules;
exports.checkMatchActiveSplinters = checkMatchActiveSplinters;
exports.splinterIsActive = splinterIsActive;