const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');
const { sleepApp } = require('./utils/sleepApp');
const TokenPage = require('./pages/tokenPage');
const TransactionPage = require('./pages/transactionPage');
const BasePage = require('./pages/basePage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Tokens main features tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const tokenPage = new TokenPage(app);
    const transactionPage = new TransactionPage(app);
    const basePage = new BasePage(app);

    beforeEach(async () => {
        await app.start();
        await basePage.passLandingSlides();
        await tokenPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('tokens Balance Banner shows right data', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(1500);
        const pageData = await tokenPage.retrieveTokenBalanceBannerData();
        assert.equal(pageData.title, 'Wrapped Tezos');
        assert.equal(pageData.address, 'KT1VYsVfmobT7rsMVivvZ4J8i3bPiqz12NaH');
        assert.equal(pageData.addresInfo.includes('Token is active.'), true);
        assert.equal(pageData.addresInfo.includes('Total supply is'), true);
    });

    it('send tokens to proper recipient', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(500);
        await tokenPage.navigateToSection('Send');
        await app.client.pause(500);
        await tokenPage.sendTokens({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 0.000001,
            fee: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: true,
        });
        await tokenPage.assertPopUpAlert('Successfully started token transaction.');
    });

    it('send tokens with wrong password', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await tokenPage.navigateToSection('Send');
        await app.client.pause(500);
        await tokenPage.sendTokens({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            fee: 'Low',
            walletPassword: 'wrong',
            send: true,
        });
        await tokenPage.assertPopUpAlert('Incorrect password');
    });

    it('set recipients to smarty contract address', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await tokenPage.navigateToSection('Send');
        await tokenPage.sendTokens({
            recipientAddress: 'KT1V4Vp7zhynCNuaBjWMpNU535Xm2sgqkz6M',
            send: false,
        });
        await app.client.pause(500);
        await app.client.waitForExist(tokenPage.recipientInputAlert);
        const message = await app.client.getText(tokenPage.recipientInputAlert);
        await app.client.pause(500);
        assert.equal(message, 'This is a smart contract address. Please use interact with contracts button to transfer funds.', 'Incorrect message');
    });

    it('send tokens to proper recipient is visible in source account transaction', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await tokenPage.navigateToSection('Send');
        await app.client.pause(500);
        await tokenPage.sendTokens({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 0.000001,
            fee: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: true,
        });

        const fee = await tokenPage.retrieveSelectedFeeValueBase();

        const transactionDate = moment().format('MMMM D, YYYY');

        await tokenPage.assertPopUpAlert('Successfully started token transaction.');
        await sleepApp(5000);
        await tokenPage.refreshApp();
        await tokenPage.navigateToSection('Transactions');
        let lastTransaction = await tokenPage.returnLastTransaction();

        assert.equal(lastTransaction.date, transactionDate);
        assert.equal(lastTransaction.type, 'Sentto');
        assert.equal(lastTransaction.hour, 'Pending...');
        assert.equal(lastTransaction.address, 'tz1byNFAcn7AAXJuw5uaarv2YwDkkm6Z6ZtG');
        assert.equal(lastTransaction.amount, '-\n0.00 wXTZ');
    });
});
