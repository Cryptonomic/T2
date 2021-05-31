const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const CreateWalletPage = require('../pages/createWallet');
const { sleepApp } = require('../utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

describe.only('Create Wallet Tests -> Restore from backup', function () {
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

    // Automatically wallet do not restore at all
    it('Private key', async () => {
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Private Key');
        await app.client.setValue('#custom-input', `${process.env.secretRestoreKey}`);
        await app.client.click('button=Restore');
        await sleepApp(4000);
        await app.client.waitForExist(createWalletPage.getValueOfXtz, 10000);
        const getTextOfXtz = await app.client.getText(createWalletPage.getValueOfXtz);
        assert.equal(
            getTextOfXtz,
            '~29411.74\n',
            'After restore the account from private key balance account is different than expected value for this account'
        );
        createWalletPage.deleteCreatedWallet();
    });

    it('Private key "Wrong key"', async () => {
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Private Key');
        await app.client.setValue('#custom-input', 'abc');
        await app.client.click('button=Restore');
        const errorMessage = await app.client.isVisible('div=Error');
        assert(errorMessage, true);
    });

    // Does not pass, issue regarding the restore from seed phrase
    it('Seed phrase', async () => {
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Seed Phrase');
        await app.client.setValue('#tags-standard', `${process.env.phraseFromCreatedWallet15}`);
        await sleepApp(400);
        await app.client.click('button=Restore');
        await sleepApp(4000);
        const loginTransactionButton = await app.client.isVisible('button=Transactions');
        assert(loginTransactionButton, true, 'Wallet can not be restored from seed');
        createWalletPage.deleteCreatedWallet();
    });

    it('Seed phrase "Account does not exist"', async () => {
        await app.client.click('div=Restore from Backup');
        await app.client.click('div=Seed Phrase');
        await app.client.setValue('#tags-standard', `${process.env.phraseInactive}`);
        await app.client.click('button=Restore');
        await sleepApp(4000);
        const errorAccountDoesNotExist = await app.client.isVisible('div=The account does not exist.');
        assert(errorAccountDoesNotExist, true, 'Account can be restored from the not exist phrase');
    });
});
