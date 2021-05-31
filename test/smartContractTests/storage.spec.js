const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const { sleepApp } = require('../utils/sleepApp');
const StoragePage = require('../pages/storagePage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Smart Contract Storage feature test: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const storagePage = new StoragePage(app);

    beforeEach(async () => {
        await app.start();
        await storagePage.selectLanguageAndAgreeToTerms();
        await storagePage.setTestNode();
        await storagePage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('correct data are visible in storage section', async () => {
        const correctStorageConent = 'task';

        await storagePage.openSmartContract(1);
        await storagePage.navigateToSection('Storage');
        const storageContent = await storagePage.retrieveStorageContent();
        assert.equal(storageContent, correctStorageConent, `storage content is wrong: ${storageContent} should be ${correctStorageConent}`);
    });
});
