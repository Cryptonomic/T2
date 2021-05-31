const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const BasePage = require('./pages/basePage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Base app param tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const basePage = new BasePage(app);

    beforeEach(() => app.start());
    afterEach(() => app.stop());

    it('app title is correct', async () => {
        const appTitle = await basePage.getApplicationTitle();
        assert.equal(appTitle, basePage.pageTitle);
    });

    it('app loads only with one window', async () => {
        const windowNumber = await basePage.getWindowCount();
        assert.equal(windowNumber, 1);
    });
});
