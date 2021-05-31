const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');
const { sleepApp } = require('./utils/sleepApp');
const TokenPage = require('./pages/tokenPage');
const TransactionPage = require('./pages/transactionPage');
const BasePage = require('./pages/basePage');
const { password, tokenName, tokenAddress, tokenDestination, tokenAmount, tokenToContract, tokenSymbol } = require('./walletsData/testConfig.json');

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
        await tokenPage.openExistingWallet(password);
    });

    afterEach(() => app.stop());

    it('tokens Balance Banner shows right data', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(1500);
        const pageData = await tokenPage.retrieveTokenBalanceBannerData();
        assert.equal(pageData.title, tokenName);
        assert.equal(pageData.address, tokenAddress);
        assert.equal(pageData.addresInfo.includes('Token is active.'), true);
        assert.equal(pageData.addresInfo.includes('Total supply is'), true);
    });

    it('send tokens to proper recipient', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(1500);
        await tokenPage.navigateToSection('Send');
        await app.client.pause(500);
        await tokenPage.sendTokens({
            recipientAddress: tokenDestination,
            amount: tokenAmount,
            fee: 'Low',
            walletPassword: password,
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
            recipientAddress: tokenDestination,
            amount: tokenAmount,
            fee: 'Low',
            walletPassword: 'wrong',
            send: true,
        });
        await tokenPage.assertPopUpAlert('Incorrect password');
    });

    it('set recipients to smarty contract address', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(1500);
        await tokenPage.navigateToSection('Send');
        await tokenPage.sendTokens({
            recipientAddress: tokenToContract,
            send: false,
        });
        await app.client.pause(1000);
        await app.client.waitForExist(tokenPage.recipientInputAlert);
        const message = await app.client.getText(tokenPage.recipientInputAlert);
        assert.equal(message, 'This is a smart contract address. Please use interact with contracts button to transfer funds.', 'Incorrect message');
    });

    it('send tokens to proper recipient is visible in source account transaction', async () => {
        await tokenPage.openTokensPage();
        await app.client.click('[data-spectron="active-tokens"] div:nth-child(1)');
        await app.client.pause(1500);
        await tokenPage.navigateToSection('Send');
        await app.client.pause(500);
        await tokenPage.sendTokens({
            recipientAddress: tokenDestination,
            amount: tokenAmount,
            fee: 'Low',
            walletPassword: password,
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
        assert.equal(lastTransaction.address, tokenDestination);
        assert.equal(lastTransaction.amount, `-\n${tokenAmount.toFixed(2)} ${tokenSymbol}`);
    });
});
