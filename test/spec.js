const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const testPage = require('./page.spec');
const { electron } = require('process');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

// utility functions
const sleep = (time) => new Promise((r) => setTimeout(r, time));

// page object

const page = new testPage();

const fs = require('fs');

describe('Test Example', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            NODE_TEST: 'spectron',
        },
    });

    page.setApp(app);

    beforeEach(() => app.start());
    afterEach(() => app.stop());

    // it('Page title is correct', async () => {
    // 	const appTitle = await page.getApplicationTitle();
    // 	assert.equal(appTitle, page.pageTitle);
    // });

    // it('first test', async () => {
    //     await sleep (3000)
    //     const appTitle = await page.getApplicationTitle();
    //     assert.equal(appTitle, page.pageTitle);

    //     // await app.client.click('button=Continue');
    //     // await app.client.click('button=I Agree');
    //     await page.selectLanguageAndAgreeToTerms();
    //     await page.setTestNode();
    //     await page.openExistingWallet();

    //     await sleep(10000);
    // });
    it('Create new wallet', async () => {
        await sleep(3000);
        const appTitle = await page.getApplicationTitle();
        assert.equal(appTitle, page.pageTitle);
        await page.selectLanguageAndAgreeToTerms();
        await page.setTestNode();
        await page.createNewWallet();
        await sleep(3000);
        const addTitle = await app.client.getText('#title-add-an-account');
        assert.equal(addTitle, 'Add an Account', 'Wallet was created successful');
        // Remove the file from the src/
        fs.unlinkSync(`src/new.tezwallet`);
    });
});
