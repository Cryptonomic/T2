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

    before(() => app.start());
    after(() => app.stop());

    // it('Page title is correct', async () => {
    // 	const appTitle = await page.getApplicationTitle();
    // 	assert.equal(appTitle, page.pageTitle);
    // });

    it('first test', async () => {
        const appTitle = await page.getApplicationTitle();
        assert.equal(appTitle, page.pageTitle);

        // await app.client.click('button=Continue');
        // await app.client.click('button=I Agree');
        await page.selectLanguageAndAgreeToTerms();
        await page.setTestNode();
        await page.openExistingWallet();

        await sleep(10000);
    });
});
