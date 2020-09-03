const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const testPage = require('./createWalletHelpers');
const fs = require('fs');

// const clipboard = require('electron-clipboard-extended')

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

const { timeStamp } = require('console');
const { type } = require('os');

describe('Create Wallet Tests', function () {
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

    it('Create new wallet', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        page.deleteCreatedWallet();
    });

    it('Create new wallet from link', async () => {
        await page.basicConfiguration();
        await app.client.click('[data-spectron="create-wallet-link"]');
        await app.client.waitForExist('div=Your wallet information will be saved to your computer. It will be encrypted with a password that you set.');
    });

    it('Import Fundraiser Wallet', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.addValue('#tags-standard', `${process.env.phraseFromCreatedWallet15}`);
        await app.client.addValue('[data-spectron="home-address-fundraiser-password"] input', `${process.env.passwordFromCreatedAccount}`);
        await app.client.click('[data-spectron="show-hide-password"]');
        const showHidePwd = await app.client.getAttribute('[data-spectron="home-address-fundraiser-password"] input', 'type');
        assert.equal(showHidePwd, 'text', 'Fundraiser password is not visible');
        await page.checkTooltipWithMove('[data-spectron="tooltip-home-address-fundraiser-password"]', 'p=Fundraiser Password');
        await app.client.addValue('[data-spectron="home-address-publish-key"] input', `${process.env.publicKeyFromCreatedAccount}`);
        await page.checkTooltipWithMove('[data-spectron="tooltip-home-address-publish-key"]', 'p=Public key hash');
        await app.client.addValue('[data-spectron="fundraiser-email"] input', `${process.env.emailFromCreatedAccount}`);
        await page.checkTooltipWithMove('[data-spectron="tooltip-fundraiser-email"]', 'p=Fundraiser Email Address');
        await app.client.addValue('[data-spectron="home-address-activation-code"] input', `${process.env.secretFromCreatedAccount}`);
        await page.checkTooltipWithMove('[data-spectron="tooltip-home-address-activation-code"]', 'p=Activation Code (Optional if account was activated)');
        await app.client.click('button=Import');
        await app.client.waitForExist('span=Transactions', 5000);
        // assert for ~57944.97 xtz
        const getValueOfTxz = await app.client.getText(page.getValueOfTxz);
        assert.equal(getValueOfTxz, '~57944.97', 'After import fundraiser wallet balance account is different than expected value for this account');
        page.deleteCreatedWallet();
    });

    it('Create a New Account - compare seed phrase', async () => {
        const buttonNext = 'button=Next';
        const buttonCreate = 'button=Create Account';
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Create a New Account');
        await app.client.click('span=Copy Seed Phrase');
        fs.writeFileSync('./test/temporaryFiles/clipboard.txt', await app.electron.clipboard.readText());
        await app.client.click(buttonNext);
        await page.getCompareWord(page.getValueFromFirstInputKeyPhrase, page.setValueInFirstInputKeyPhrase);
        await page.getCompareWord(page.getValueFromSecondInputKeyPhrase, page.setValueInSecondInputKeyPhrase);
        await page.getCompareWord(page.getValueFromThirdInputKeyPhrase, page.setValueInThirdInputKeyPhrase);
        await page.getCompareWord(page.getValueFromFourthInputKeyPhrase, page.setValueInFourthInputKeyPhrase);
        await app.client.waitForEnabled(buttonNext).click(buttonNext);
        await app.client.waitForExist(buttonCreate).click(buttonCreate);
        // assert for 0 xtz
        const getValueOfTxz = await app.client.getText(page.getValueOfTxz);
        assert.equal(getValueOfTxz, '~0.00', 'After create a new account from phrase key balance account is higher than 0.00 xtz');
        page.deleteCreatedPhraseKey();
        page.deleteCreatedWallet();
    });

    it('Create a New Account - generate another seed phrase', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Create a New Account');
        const getSeedPhrase = await app.client.getText('[data-spectron="phase-column"]');
        await app.client.click('span=Generate Another Seed Phrase');
        const getNewSeedPhrase = await app.client.getText('[data-spectron="phase-column"]');
        assert.notStrictEqual(getSeedPhrase, getNewSeedPhrase, 'Phrase is the same, newly generated phase are not visible on the board');
    });

    it('Create a New Account - compare seed phrase - invalid data', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Create a New Account');
        await app.client.click('button=Next');
        await page.getErrorMessageFromSeedInput(page.setValueInFirstInputKeyPhrase);
        await page.getErrorMessageFromSeedInput(page.setValueInSecondInputKeyPhrase);
        await page.getErrorMessageFromSeedInput(page.setValueInThirdInputKeyPhrase);
        await page.getErrorMessageFromSeedInput(page.setValueInFourthInputKeyPhrase);
    });

    it('Create a New Account - compare seed phrase - refresh the input', async () => {
        const buttonNext = 'button=Next';
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Create a New Account');
        await app.client.click(buttonNext);
        const getNumber = await page.getNumberFromFieldSeedInput(page.getValueFromFirstInputKeyPhrase);
        await app.client.click('span=Back to Seed Phrase');
        await app.client.click(buttonNext);
        await sleep(300);
        const getNumberAfterRefresh = await page.getNumberFromFieldSeedInput(page.getValueFromFirstInputKeyPhrase);
        assert.notEqual(getNumber, getNumberAfterRefresh, 'Phrase in input are not refresh after re-entering the form');
    });

    // Automatically wallet do not restore at all
    it('Restore from backup - private key', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Private Key');
        await app.client.setValue('#custom-input', `${process.env.secretRestoreKey}`);
        await app.client.click('button=Restore');
        await sleep(4000);
        // assert for ~29411.74 xtz
        const getValueOfTxz = await app.client.getText(page.getValueOfTxz);
        assert.equal(
            getValueOfTxz,
            '~29411.74',
            'After restore the account from private key balance account is different than expected value for this account'
        );
        page.deleteCreatedWallet();
    });

    it('Restore from backup - private key "Wrong key"', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Private Key');
        await app.client.setValue('#custom-input', 'abc');
        await app.client.click('button=Restore');
        const errorMessage = await app.client.isVisible('div=Error');
        assert(errorMessage, true);
    });

    // Does not pass, issue regarding the restore from seed phrase
    it('Restore from backup - seed phrase', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Seed Phrase');
        await app.client.setValue('#tags-standard', `${process.env.phraseFromCreatedWallet15}`);
        await sleep(400);
        await app.client.click('button=Restore');
        await sleep(4000);
        const loginTransactionButton = await app.client.isVisible('button=Transactions');
        assert(loginTransactionButton, true);
        page.deleteCreatedWallet();
    });

    it('Restore from backup - seed phrase "Account does not exist"', async () => {
        await page.basicConfiguration();
        await page.createNewWallet();
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Seed Phrase');
        await app.client.setValue('#tags-standard', `${process.env.phraseInactive}`);
        await app.client.click('button=Restore');
        await sleep(4000);
        const errorAccountDoesNotExist = await app.client.isVisible('div=The account does not exist.');
        assert(errorAccountDoesNotExist, true, 'Account can be restored from the not exist phrase');
    });
});
