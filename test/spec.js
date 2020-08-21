const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const testPage = require('./page');
const { electron } = require('process');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');
const envVariables = path.join(baseDir, 'test/.env');

// load test sensitive data
require('dotenv').config({ path: envVariables });

// utility functions
const sleep = (time) => new Promise((r) => setTimeout(r, time));

// page object

const page = new testPage();

const fs = require('fs');
const { timeStamp } = require('console');

describe('Test Example', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    page.setApp(app);

    beforeEach(() => app.start());
    afterEach(() => app.stop());

    it('Page title is correct', async () => {
        const appTitle = await page.getApplicationTitle();
        assert.equal(appTitle, page.pageTitle);
    });

    it('App load only with one window', async () => {
        const windowNumber = await page.getWindowCount();
        assert.equal(windowNumber, 1);
    });

    it('Import Wallet', async () => {
        await page.selectLanguageAndAgreeToTerms();
        await page.setTestNode();
        await page.openExistingWallet(process.env.TZ1_PASSWORD);

        await sleep(10000);
    });

    it.skip('Create new wallet', async () => {
        await page.selectLanguageAndAgreeToTerms();
        await page.setTestNode();
        await page.createNewWallet();
        await sleep(3000);
        const addTitle = await app.client.getText('#title-add-an-account');
        assert.equal(addTitle, 'Add an Account', 'Wallet was created successful');

        // Remove the file from the src/
        fs.unlinkSync(`src/new.tezwallet`);
    });

    it('Balance banner shows proper info about account', async () => {
        // app present right account address
        const tezAddressOne = await app.client.getText('#addressInfo #tezosAddress span span:nth-child(1)');
        const tezAddressTwo = await app.client.getText('#addressInfo #tezosAddress span span:nth-child(2)');

        assert.equal(tezAddressOne, 'tz1');
        assert.equal(tezAddressTwo, '');

        //after clicking on key we see right data about address and keys
        await app.client.click('#keyButton');
        const address = await app.client.getText('#accountKeys #address');
        const publicKey = await app.client.getText('#accountKeys #publicKey');
        const secretMessage = await app.client.getText('#secretMessage');
        await app.client.click('#secretMessage');
        const secretKey = await app.client.getText('#accountKeys #secretKey');

        assert.equal(
            secretMessage,
            'Be careful when handling the unencrypted secret key. Anyone with your secret key has full access to your balance and can sign operations on your behalf! Click to reveal your secret key.'
        );
        assert.equal(address, 'tz1');
        assert.equal(publicKey, 'edpkvZc958x5rwS7aYfXTx4EdjnCQBbf8vbVd2hnnvjY1WxYvkX3V7');
        assert.equal(secretKey, 'ś');

        await app.client.click('#accountKeys #address svg');
        const clipboardAddress = await app.electron.clipboard.readText();
        assert.equal(clipboardAddress, 'tz1');
    });

    it.only('verify $ send happy path', async () => {
        await page.selectLanguageAndAgreeToTerms();
        await page.setTestNode();
        await page.openExistingWallet(process.env.TZ1_PASSWORD);

        await sleep(10000);

        await app.client.click('div=Sign & Verify');

        //assert if sign button is disabled
        await app.client.setValue('#micheline-input', 'My message');
        await sleep(3000);
        await app.client.click('#signButton');
        await sleep(3000);
        await app.client.click('#signatureValue svg');
        await app.client.switchWindow;
        // console.log(await app.client.getValue('#signatureValue input'));
        const clipboardAddress = await app.electron.clipboard.readText();
        assert.equal(clipboardAddress, 'edsigtxgcsZvjN6FLfwkvzrTgS3FbsjFnzvsu4crLA6Bg5Et4i2gJayrLW8wRT35rGPJdazVZsPRbZ4dpoi8owmqGmgEhrBnve7');
        await app
            .restart()
            .then(() => {
                process.env.WALLET_LOCATION = 'tz2_test.tezwallet';
            })
            .then(async () => {
                await page.selectLanguageAndAgreeToTerms();
                await page.setTestNode();
                await page.openExistingWallet(process.env.TZ2_PASSWORD);
            });
    });
});
