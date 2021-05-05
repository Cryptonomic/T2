const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const BasePage = require('./pages/basePage');
const { sleepApp } = require('./utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

describe('Settings: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // create basePage object
    const basePage = new BasePage(app);

    beforeEach(() => app.start());
    afterEach(() => app.stop());

    it('Change an language for different than English in landing page', async () => {
        await app.client.click('[data-spectron="lang-change"]');
        await app.client.click('[data-spectron="lang-option"] li:nth-child(4)');
        const getTextFromTitle = await app.client.getText('[data-spectron="lang-welcome"]');
        assert.equal(getTextFromTitle[0], 'Bienvenido a Tezori', 'Language was not fully changed');
    });

    it('Change an language for different than English from settings tab', async () => {
        await basePage.selectLanguageAndAgreeToTerms();
        await basePage.goToSettings();
        await app.client.click('[data-spectron="raw-for-language-menu"] div:nth-last-child(2)');
        await app.client.click('[role=menuitem]:nth-child(4)');
        await app.client.click('span=Volver a la billetera');
        const getTextFromButton = await app.client.getText('[data-spectron="create-wallet"]');
        assert.equal(getTextFromButton, 'Crear Una Nueva Billetera', 'Language was not fully changed');
    });

    it('Hardware Wallet Settings', async () => {
        const selectedPath = await app.client.getText('[data-spectron="selected-path"]');
        await basePage.selectLanguageAndAgreeToTerms();
        assert.equal(selectedPath, "Selected Path: 44'/1729'/0'/0'/0'", 'Default Path is not correctly visible');
        await basePage.goToSettings();
        await app.client.click('[data-spectron="derivation-path"]');
        await app.client.click('[role=listbox] li:nth-child(3)');
        await basePage.goBackFromSetting();
        const selectedPathAfterChange = await app.client.getText('[data-spectron="selected-path"]');
        assert.equal(selectedPathAfterChange, "Selected Path: 44'/1729'/0'/0'", 'Tezos Path is not correctly visible');
    });
});
