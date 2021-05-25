const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const ReceivePage = require('../pages/receivePage');
const { sleepApp } = require('../utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Implicit account Receive tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    const receivePage = new ReceivePage(app);

    beforeEach(async () => {
        await app.start();
        await receivePage.selectLanguageAndAgreeToTerms();
        await receivePage.setTestNode();
    });

    afterEach(() => app.stop());

    // it.only('section present right receive address', async () => {
    //     await receivePage.openExistingWallet(process.env.TZ1_PASSWORD);
    //     await receivePage.navigateToSection('Receive');

    //     const recieveAddress = await receivePage.receiveReceiveAddress();
    //     assert.equal(recieveAddress, process.env.TZ1_ADDRESS);

    //     //check if addres is copy correctly
    //     await app.client.click(receivePage.receiveCopyButton);
    //     await receivePage.assertClipBoard(process.env.TZ1_ADDRESS);
    // });
});
