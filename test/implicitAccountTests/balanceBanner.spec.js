const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const { sleepApp } = require('../utils/sleepApp');
const BalanceBannerPage = require('../pages/balanceBannerPage');
const moment = require('moment');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Implicit account Balance Banner tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    const balanceBannerPage = new BalanceBannerPage(app);

    beforeEach(async () => {
        await app.start();
        await balanceBannerPage.selectLanguageAndAgreeToTerms();
        await balanceBannerPage.setTestNode();
        await balanceBannerPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('balance banner shows proper info about account', async () => {
        const fullTezAddress = await balanceBannerPage.retrieveAccountAddress();
        assert.equal(process.env.TZ1_ADDRESS, fullTezAddress, 'balance banner address is wrong');

        //check if addres is copy correctly
        await app.client.click(balanceBannerPage.copyAddressButton);
        await balanceBannerPage.assertClipBoard(process.env.TZ1_ADDRESS);
    });

    // it('balance banner shows proper info about account in key section', async () => {
    //     await balanceBannerPage.openKeySection();
    //     const keysValues = await balanceBannerPage.retrieveValuesFromKeySections();
    //     assert.equal(keysValues.secretMessage, balanceBannerPage.keySectionSecretMessageText, 'secret message exist in key section');
    //     assert.equal(keysValues.address, process.env.TZ1_ADDRESS, 'addres is incorrect');
    //     assert.equal(keysValues.publicKey, process.env.TZ1_PUBLIC_KEY, 'public key is incorrect');
    //     assert.equal(keysValues.secretKey, process.env.TZ1_SECRET_KEY, 'secret key is incorrect');

    //     await app.client.click(balanceBannerPage.keySectionAddressCopyButton);
    //     await balanceBannerPage.assertClipBoard(process.env.TZ1_ADDRESS);

    //     await balanceBannerPage.closeKeysSection();
    //     //assert if modal close properly
    //     await app.client.waitForExist(balanceBannerPage.keySectionCloseButton, 3000, true);
    // });

    // it('balance banner bell button shows correct info', async () => {
    //     await app.client.moveToObject(balanceBannerPage.bellButton);
    //     await app.client.waitForExist(balanceBannerPage.bellText, 2000);
    // });

    // it('balance banner is properly updated', async () => {
    //     const updateTime = await app.client.getText(balanceBannerPage.updateTime);
    //     const currentTime = moment().format('LT');
    //     assert.equal(updateTime.includes(currentTime), true, `update time wrong:${updateTime} != ${currentTime}`);
    // });
});
