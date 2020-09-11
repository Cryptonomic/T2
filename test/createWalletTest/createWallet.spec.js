const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const CreateWalletPage = require('../pages/createWallet');
const fs = require('fs');
const { sleepApp } = require('./utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe.only('Create Wallet:', function () {
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

    beforeEach(() => app.start());
    afterEach(() => app.stop());

    it('Create new wallet and delete the file', async () => {
        await createWalletPage.basicConfiguration();
        await createWalletPage.createNewWallet();
        createWalletPage.deleteCreatedWallet();
    });

    it('Create new wallet from link', async () => {
        await createWalletPage.basicConfiguration();
        await app.client.click('[data-spectron="create-wallet-link"]');
        await app.client.waitForExist('div=Your wallet information will be saved to your computer. It will be encrypted with a password that you set.');
    });
});
