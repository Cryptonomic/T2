const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');

class BasePage {
    constructor(app) {
        this.app = app;
        this.windowCount = 1;
        this.pageTitle = 'Tezori';
        this.managerAddressSectionButton = '//*[@id="root"]/div/div[2]/div/div/div/div[1]';
        this.languageContinueButton = 'button=Continue';
        this.termsAgreeButton = 'button=I Agree';
        this.settingsButton = '[data-spectron="settings-button"]';
        this.updateTime = '[data-spectron="update-time"]';
        this.refreshButton = '[data-spectron="refresh-button"]';
        this.logOutButton = '[data-spectron="logout-button"]';
        this.popUpMessage = "[data-spectron='message-bar'] [data-spectron='message']";
        this.closePopUpButton = "[data-spectron='message-close']";

        this.openAppMainSection = async () => {
            await this.app.client.click(this.managerAddressSectionButton);
        };

        this.pushButton = async function (selectron) {
            await this.app.client.waitUntil(async () => (await this.app.client.isEnabled(selectron)) === true, {
                timeout: 5000,
                timeoutMsg: `expected button ${selectron} to be enabled`,
            });
            await this.app.client.click(selectron);
        };

        this.refreshApp = async () => {
            await this.app.client.click(this.refreshButton);
        };

        this.assertPopUpAlert = async (alertMessage) => {
            await this.app.client.waitForExist(this.popUpMessage, 1000 * 60 * 2);
            const alert = await this.app.client.getText(this.popUpMessage);
            await sleepApp(5000);
            assert.equal(true, alert.includes(alertMessage), `pop up: ${alert}`);
        };

        this.selectLanguageAndAgreeToTerms = async () => {
            await this.app.client.click(this.languageContinueButton);
            await this.app.client.click(this.termsAgreeButton);
        };

        this.goToSettings = async () => {
            await this.app.client.click(this.settingsButton);
        };

        this.logOutWallet = async () => {
            await this.app.client.click('[data-spectron="logout-button"]');
        };

        this.goBackFromSetting = async () => {
            await this.app.client.click('span=Back to Login');
        };

        this.setTestNode = async () => {
            await this.goToSettings();
            await this.app.client.click('[data-spectron="settings-test-node-button"]');
            await this.app.client.click('div=Tezos Testnet (nautilus.cloud)');
            await this.goBackFromSetting();
        };

        this.openExistingWallet = async (password) => {
            await this.app.client.waitForExist('span=Open Existing Wallet');
            await this.app.client.click('span=Open Existing Wallet');
            await this.app.client.click('[data-spectron="select-wallet-button"]');
            const walletFileName = await this.app.client.getText('[data-spectron="wallet-file-name"]');
            // assert.equal(walletFileName, 'tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet');
            let buttonEnabled = await this.app.client.isEnabled('[data-spectron="open-wallet-button"]');
            assert.equal(buttonEnabled, false);

            await this.app.client.addValue('[data-spectron="wallet-password"] input', password);
            await this.app.client.click('[data-spectron="open-wallet-button"]');
            await this.app.client.waitForExist('[data-spectron="address-block"] [data-spectron="address"] [data-spectron="amount"]', 30000);
        };

        this.getWindowCount = async () => {
            return await this.app.client.waitUntilWindowLoaded().getWindowCount();
        };

        this.getApplicationTitle = function () {
            return this.app.client.waitUntilWindowLoaded().getTitle();
        };

        this.clickButtonAndGetText = function () {
            return this.app.client.click(this.buttonId).getText(this.textId);
        };

        this.navigateToSection = async (sectionName) => {
            await this.app.client.click(`span=${sectionName}`);
        };

        this.openSignAndVerify = async () => {
            await this.app.client.click('div=Sign & Verify');
        };

        this.buttonEnabledFalse = async (selector) => {
            let buttonEnabled = await this.app.client.isEnabled(selector);
            assert.equal(buttonEnabled, false, `Button: ${selector} is enabled but shouldn't`);
        };

        this.assertClipBoard = async (text) => {
            const clipboardAddress = await this.app.electron.clipboard.readText();
            assert.equal(clipboardAddress, text, 'clipboard text different');
        };

        this.updateWallet = async () => {
            await this.app.click('[data-spectron="refersh-button"]');
            const updateDate = await this.app.getText('[data-spectron="update-time"]');
            const currentDate = moment().format('LT');
            assert.equal(updateDate, currentDate);
        };

        // transaction
        this.returnLastTransaction = async () => {
            const date = await this.app.client.getText('[data-spectron="transaction-date"]');
            const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            const type = await this.app.client.getText('[data-spectron="transaction-type"]');
            const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const address = addressOne[0] + addressTwo[0];
            const amount = await this.app.client.getText('[data-spectron="single-transaction"] [data-spectron="tezos-amount"]');

            let fee = 0;
            if (type === 'Sentto') {
                fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
            }
            const transactionData = {
                date: date,
                hour: hour[0],
                type: type[0],
                address: address,
                amount: amount[0],
                fee: fee[0],
            };
            return transactionData;
        };

        // tokens recieve
        this.returnLastTokenTransaction = async () => {
            const date = await this.app.client.getText('[data-spectron="transaction-date"]');
            const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
            const type = await this.app.client.getText('[data-spectron="transaction-type"]');
            const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
            const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
            const address = addressOne[0] + addressTwo[0];
            const amount = await this.app.client.getText('[data-spectron="tezos-amount"]');

            let fee = 0;
            if (type === 'Sentto') {
                fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
            }
            const transactionData = {
                date: date,
                hour: hour[0],
                type: type[0],
                address: address,
                amount: amount[0],
                fee: fee[0],
            };
            return transactionData;
        };
    }
}

module.exports = BasePage;
