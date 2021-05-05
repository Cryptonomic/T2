const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const CreateWalletPage = require('../pages/createWallet');
const fs = require('fs');
const { sleepApp } = require('../utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe.only('Create Wallet Tests  -> Create a new account:', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // createWalletPage object
    const createWalletPage = new CreateWalletPage(app);

    beforeEach(async () => {
        await app.start();
        await createWalletPage.basicConfiguration();
        await createWalletPage.createNewWallet();
    });
    afterEach(() => app.stop());

    const buttonCreate = 'button=Create Account';

    it('Compare seed phrase', async () => {
        await app.client.click('div=Create a New Account');
        await app.client.click('span=Copy Seed Phrase');
        fs.writeFileSync('./test/temporaryFiles/clipboard.txt', await app.electron.clipboard.readText());
        await app.client.click(createWalletPage.buttonNext);
        await createWalletPage.getCompareWord(createWalletPage.getValueFromFirstInputKeyPhrase, createWalletPage.setValueInFirstInputKeyPhrase);
        await createWalletPage.getCompareWord(createWalletPage.getValueFromSecondInputKeyPhrase, createWalletPage.setValueInSecondInputKeyPhrase);
        await createWalletPage.getCompareWord(createWalletPage.getValueFromThirdInputKeyPhrase, createWalletPage.setValueInThirdInputKeyPhrase);
        await createWalletPage.getCompareWord(createWalletPage.getValueFromFourthInputKeyPhrase, createWalletPage.setValueInFourthInputKeyPhrase);
        await app.client.waitForEnabled(createWalletPage.buttonNext).click(createWalletPage.buttonNext);
        await app.client.waitForExist(buttonCreate).click(buttonCreate);
        await app.client.waitForExist(createWalletPage.getValueOfXtz, 10000);
        const getTextOfXtz = await app.client.getText(createWalletPage.getValueOfXtz);
        assert.equal(getTextOfXtz, '~0.00\n', 'After create a new account from phrase key balance account is higher than 0.00 xtz');
        createWalletPage.deleteCreatedPhraseKey();
        createWalletPage.deleteCreatedWallet();
    });

    it('Generate another seed phrase', async () => {
        await app.client.click('div=Create a New Account');
        const getSeedPhrase = await app.client.getText('[data-spectron="phase-column"]');
        await app.client.click('span=Generate Another Seed Phrase');
        const getNewSeedPhrase = await app.client.getText('[data-spectron="phase-column"]');
        assert.notStrictEqual(getSeedPhrase, getNewSeedPhrase, 'Phrase is the same, newly generated phase are not visible on the board');
    });

    it('Compare seed phrase - invalid data', async () => {
        await app.client.click('div=Create a New Account');
        await app.client.click(createWalletPage.buttonNext);
        await createWalletPage.getErrorMessageFromSeedInput(createWalletPage.setValueInFirstInputKeyPhrase);
        await createWalletPage.getErrorMessageFromSeedInput(createWalletPage.setValueInSecondInputKeyPhrase);
        await createWalletPage.getErrorMessageFromSeedInput(createWalletPage.setValueInThirdInputKeyPhrase);
        await createWalletPage.getErrorMessageFromSeedInput(createWalletPage.setValueInFourthInputKeyPhrase);
    });

    it('Compare seed phrase - refresh the input', async () => {
        await app.client.click('div=Create a New Account');
        await app.client.click(createWalletPage.buttonNext);
        const getNumber = await createWalletPage.getNumberFromFieldSeedInput(createWalletPage.getValueFromFirstInputKeyPhrase);
        await app.client.click('span=Back to Seed Phrase');
        await app.client.click(createWalletPage.buttonNext);
        await sleepApp(300);
        const getNumberAfterRefresh = await createWalletPage.getNumberFromFieldSeedInput(createWalletPage.getValueFromFirstInputKeyPhrase);
        assert.notEqual(getNumber, getNumberAfterRefresh, 'Phrase in input are not refresh after re-entering the form');
    });
});
