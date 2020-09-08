const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');
const { sleepApp } = require('./utils/sleepApp');
const TokenPage = require('./pages/tokenPage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

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

    beforeEach(async () => {
        await app.start();
        await tokenPage.selectLanguageAndAgreeToTerms();
        await tokenPage.setTestNode();
        await tokenPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('tokens Balance Banner shows right data', async () => {
        await tokenPage.navigetToTokenSection('Token Sample');
        const pageData = await tokenPage.retrieveTokenBalanceBannerData();
        assert.equal(pageData.title, 'Token Sample');
        assert.equal(pageData.addres, 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2');
        assert.equal(pageData.addresInfo.includes('Token is active.'), true);
        assert.equal(pageData.addresInfo.includes('Total supply is'), true);
        // assert.equal(pageData.addresInfo.includes("2 001 140,000030."), true);
    });

    it('send tokens to proper recipient', async () => {
        await tokenPage.navigetToTokenSection('Token Sample');
        await tokenPage.navigateToSection('Send');
        await tokenPage.sendTokens({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            fee: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: true,
        });
        await tokenPage.assertPopUpAlert('Successfully started token transaction.');
    });

    it('send tokens with wrong password', async () => {
        await tokenPage.navigetToTokenSection('Token Sample');
        await tokenPage.navigateToSection('Send');
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
        await tokenPage.navigetToTokenSection('Token Sample');
        await tokenPage.navigateToSection('Send');
        await tokenPage.sendTokens({
            recipientAddress: 'KT1HzQofKBxzfiKoMzGbkxBgjis2mWnCtbC2',
            send: false,
        });
        await app.client.waitForExist(tokenPage.tokenRecipientInputAlert);
        const alertMessge = 'This is a smart contract address. Please use interact with contracts button to transfer funds.';
        await app.client.waitUntilTextExists(tokenPage.tokenRecipientInputAlert, alertMessge, 6000);
    });

    it.skip('last transaction is not dublicated in transaction section - verify hours', async () => {
        await tokenPage.navigetToTokenSection('Token Sample');
        await tokenPage.navigateToSection('Transactions');
        const lastTransactionsHoursList = await tokenPage.app.client.getText('[data-spectron="transaction-date-hour"]');
        assert.equal(lastTransactionsHoursList[0] !== lastTransactionsHoursList[1], true);
    });

    it('send tokens to proper recipient is visible in source account transaction', async () => {
        await tokenPage.navigetToTokenSection('Token Sample');
        await tokenPage.navigateToSection('Send');
        await tokenPage.sendTokens({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            fee: 'Low',
            walletPassword: process.env.TZ1_PASSWORD,
            send: true,
        });

        const fee = await app.client.getText(tokenPage.selectedFeeValue);
        const splitFee = fee.split(' ');
        const retrievedFee = parseFloat(splitFee[2]);

        const transactionDate = moment().format('MMMM D, YYYY');

        await tokenPage.assertPopUpAlert('Successfully started token transaction.');
        await sleepApp(5000);
        await tokenPage.refreshApp();
        await tokenPage.navigateToSection('Transactions');
        let lastTransaction = await tokenPage.returnLastTransaction();

        assert.equal(lastTransaction.date, transactionDate);
        assert.equal(lastTransaction.type, 'Sentto');
        assert.equal(lastTransaction.hour, 'Pending...');
        assert.equal(lastTransaction.address, 'tz1YXRdYAbNhwd5Vx1hhP2kt8JWAW6WD16Uq');
        assert.equal(lastTransaction.amount, '-\n1,000000 TKS');
        assert.equal(lastTransaction.fee, retrievedFee); // Fee is changing!
    });
});
