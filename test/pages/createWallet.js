const assert = require('assert');
const fs = require('fs');
const path = require('path');
const BasePage = require('./basePage');

class CreateWalletPage extends BasePage {
    constructor(app) {
        super(app);
        this.createWalletPassword = '[data-spectron="create-wallet-password"]';
        this.confirmWalletPassword = '[data-spectron="confirm-wallet-password"]';
        this.setValueInFirstInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-last-child(n+4) input';
        this.setValueInSecondInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-last-child(2n+3) input';
        this.setValueInThirdInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-child(3) input';
        this.setValueInFourthInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-child(4) input';
        this.getValueFromFirstInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-last-child(n+4)';
        this.getValueFromSecondInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-last-child(2n+3)';
        this.getValueFromThirdInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-child(3)';
        this.getValueFromFourthInputKeyPhrase = '[data-spectron="valid-format-container-seed-input"] div:nth-child(4)';
        this.getValueOfXtz = '[data-spectron="address-info"] span:nth-child(3)';
        this.buttonNext = 'button=Next';

        this.createNewWallet = async () => {
            await this.app.client.click('span=Create New Wallet');
            await this.app.client.click('[data-spectron="new-file-button"]');
            const checkWallet = await this.app.client.getText('[data-spectron="new-wallet-file-name"]');
            assert(checkWallet, 'new.tezwalllet', 'New wallet does not upload correctly');

            await this.app.client.setValue(`${this.createWalletPassword} input`, `${process.env.TZ2_PASSWORD}`);
            const correctPassword = await this.app.client.getText('[data-spectron="error-create-wallet-password"]');
            assert.equal(correctPassword, 'You got it!', 'Password is not strong enough');

            await this.app.client.click('[data-spectron="visibility-create-wallet-password"]');
            const attributeOfCreatePasswordField = await this.app.client.getAttribute(`${this.createWalletPassword} input`, 'type');
            assert.equal(attributeOfCreatePasswordField, 'text', 'Create Wallet Password Field is not visible');

            await this.app.client.setValue(`${this.confirmWalletPassword} input`, `${process.env.TZ2_PASSWORD}`);
            const correctConfirmPassword = await this.app.client.getText('[data-spectron="error-confirm-wallet-password"]');
            assert.equal(correctConfirmPassword, 'Passwords Match!', 'Passwords are not the same');

            await this.app.client.click('[data-spectron="visibility-confirm-wallet-password"]');
            const attributeOfConfirmPasswordField = await this.app.client.getAttribute(`${this.confirmWalletPassword} input`, 'type');
            assert.equal(attributeOfConfirmPasswordField, 'text', 'Confirm Wallet Password Field is not visible');

            await this.app.client.click('span=Create Wallet');
            const addTitle = await this.app.client.getText('[data-spectron="title-add-an-account"]');
            assert.equal(addTitle, 'Add an Account', 'Wallet was created successful');
        };

        this.deleteCreatedWallet = function () {
            return fs.unlinkSync(`./test/temporaryFiles/new.tezwallet`);
        };

        this.deleteCreatedPhraseKey = function () {
            return fs.unlinkSync(`./test/temporaryFiles/clipboard.txt`);
        };

        this.basicConfiguration = async () => {
            const appTitle = await this.getApplicationTitle();
            assert.equal(appTitle, this.pageTitle);
            await this.selectLanguageAndAgreeToTerms();
            await this.setTestNode();
        };

        this.checkTooltipWithMove = async (selector, tooltip) => {
            await this.app.client.moveToObject(selector);
            await this.app.client.waitForExist(tooltip, 7000);
        };

        this.getErrorMessageFromSeedInput = async (selector) => {
            await this.app.client.addValue(selector, 'abc');
            await this.app.client.waitForExist('p=Invalid word, please check again!', 5000);
            await this.app.client.clearElement(selector);
        };

        this.getNumberFromFieldSeedInput = async (selector) => {
            const getTextFromField = await this.app.client.getText(selector);
            const getNumberFromField = getTextFromField.replace(/\D/g, '');
            return getNumberFromField;
        };

        this.getCompareWord = async (selectorText, selectorValue) => {
            const getTextFromField = await this.app.client.getText(selectorText);
            const getNumberFromField = getTextFromField.replace(/\D/g, '');
            fs.readFile('./test/temporaryFiles/clipboard.txt', 'utf8', async (err, data) => {
                if (getNumberFromField.length === 1) {
                    const start = data.indexOf(getNumberFromField) + 3;
                    const sliceValue = data.slice(start);
                    const getKeyFromFile = sliceValue.slice(sliceValue, sliceValue.indexOf(' '));
                    await this.app.client.addValue(selectorValue, getKeyFromFile);
                } else if (getNumberFromField.length === 2) {
                    const start = data.indexOf(getNumberFromField) + 4;
                    const sliceValue = data.slice(start);
                    const getKeyFromFile = sliceValue.slice(sliceValue, sliceValue.indexOf(' '));
                    this.app.client.addValue(selectorValue, getKeyFromFile);
                }
            });
        };
    }
}

module.exports = CreateWalletPage;
