const assert = require('assert');

const TestPage = function () {
    this.windowCount = 1;
    this.pageTitle = 'Tezori';
    this.helloText = 'Hello from button!';
    this.buttonId = '#helloButton';
    this.textId = '#helloText';
    this.languageContinueButton = 'button=Continue';
    this.termsAgreeButton = 'button=I Agree';
    this.settingsButton = '#settingsButton';

    this.setApp = function (app) {
        this.app = app;
    };

    this.selectLanguageAndAgreeToTerms = async () => {
        await this.app.client.click(this.languageContinueButton);
        await this.app.client.click(this.termsAgreeButton);
    };

    this.goToSettings = async () => {
        await this.app.client.click(this.settingsButton);
    };

    this.goBackFromSetting = async () => {
        await this.app.client.click('span=Back to Login');
    };

    this.setTestNode = async () => {
        await this.goToSettings();
        await this.app.client.click('#settingsTestNodeButton');
        await this.app.client.click('div=Tezos Testnet (nautilus.cloud)');
        await this.goBackFromSetting();
    };

    this.openExistingWallet = async (password) => {
        await this.app.client.click('span=Open Existing Wallet');
        await this.app.client.click('#selectWalletButton');
        const walletFileName = await this.app.client.getText('#walletFileName');
        assert.equal(walletFileName, 'tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW.tezwallet');

        let buttonEnabled = await this.app.client.isEnabled('#openWalletButton');
        assert.equal(buttonEnabled, false);

        await this.app.client.addValue('#walletPassword input', password);

        buttonEnabled = await this.app.client.isEnabled('#openWalletButton');
        assert.equal(buttonEnabled, true);
        await this.app.client.click('#openWalletButton');
    };

    this.getWindowCount = async () => {
        return await this.app.client.waitUntilWindowLoaded().getWindowCount();
    };
    this.createNewWallet = async () => {
        await this.app.client.click('span=Create New Wallet');
        await this.app.client.click('#new-wallet-file-button');
        await this.app.client.setValue('#create-wallet-password', 'cryptonomic1');
        await this.app.client.setValue('#confirm-wallet-password', 'cryptonomic1');
        await this.app.client.click('span=Create Wallet');
    };

    this.getWindowCount = function () {
        return this.app.client.waitUntilWindowLoaded().getWindowCount();
    };

    this.getApplicationTitle = function () {
        return this.app.client.waitUntilWindowLoaded().getTitle();
    };

    this.clickButtonAndGetText = function () {
        return this.app.client.click(this.buttonId).getText(this.textId);
    };
};

module.exports = TestPage;
