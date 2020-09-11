const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const CreateWalletPage = require('./pages/createWallet');
const { sleepApp } = require('./utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe.only('Create Wallet Tests -> Import Fundraiser Wallet:', function () {
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

    it('Check the correct value and visibility of tooltips', async () => {
        await app.client.addValue('#tags-standard', `${process.env.phraseFromCreatedWallet15}`);
        await app.client.addValue('[data-spectron="home-address-fundraiser-password"] input', `${process.env.passwordFromCreatedAccount}`);
        await app.client.click('[data-spectron="show-hide-password"]');
        const showHidePwd = await app.client.getAttribute('[data-spectron="home-address-fundraiser-password"] input', 'type');
        assert.equal(showHidePwd, 'text', 'Fundraiser password is not visible');
        await createWalletPage.checkTooltipWithMove('[data-spectron="tooltip-home-address-fundraiser-password"]', 'p=Fundraiser Password');
        await app.client.addValue('[data-spectron="home-address-publish-key"] input', `${process.env.publicKeyFromCreatedAccount}`);
        await createWalletPage.checkTooltipWithMove('[data-spectron="tooltip-home-address-publish-key"]', 'p=Public key hash');
        await app.client.addValue('[data-spectron="fundraiser-email"] input', `${process.env.emailFromCreatedAccount}`);
        await createWalletPage.checkTooltipWithMove('[data-spectron="tooltip-fundraiser-email"]', 'p=Fundraiser Email Address');
        await app.client.addValue('[data-spectron="home-address-activation-code"] input', `${process.env.secretFromCreatedAccount}`);
        await createWalletPage.checkTooltipWithMove(
            '[data-spectron="tooltip-home-address-activation-code"]',
            'p=Activation Code (Optional if account was activated)'
        );
        await app.client.click('button=Import');
        await app.client.waitForExist(createWalletPage.getValueOfXtz, 10000);
        const getTextOfXtz = await app.client.getText(createWalletPage.getValueOfXtz);
        assert.equal(getTextOfXtz, '~57944.97\n', 'After import fundraiser wallet balance account is different than expected value for this account');
        createWalletPage.deleteCreatedWallet();
    });
});
