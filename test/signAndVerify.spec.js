const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const SignAndVerifyPage = require('./pages/signAndVerifyPage');
const BaseApp = require('./pages/basePage');
const { sleepApp } = require('./utils/sleepApp');
const { address, password, signatureMessage, correctSignature, incorrectSignature } = require('./walletsData/testConfig.json');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Sign & Verify main features tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const signAndVerifyPage = new SignAndVerifyPage(app);
    const basePage = new BaseApp(app);

    beforeEach(async () => {
        await app.start();
        await basePage.passLandingSlides();
        await signAndVerifyPage.setTestNode();
        await signAndVerifyPage.openExistingWallet(password);
    });

    afterEach(() => app.stop());

    it('sign generate correct signature', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.signButton);
        await app.client.addValue('[data-spectron="wallet-password"] input', password);
        await signAndVerifyPage.createSignature({ message: signatureMessage, sign: true, copySignature: true });
        await signAndVerifyPage.assertClipBoard(correctSignature);
    });

    it('verify generate confirmed alert when signature matches message', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');

        await app.client.waitForExist(signAndVerifyPage.downVerifyButton);
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        await signAndVerifyPage.verifySignature({
            message: signatureMessage,
            address: address,
            signature: correctSignature,
            verify: true,
        });
        await app.client.waitForExist(signAndVerifyPage.confirmedAlert, 3000);
    });

    it('verify generate invalid alert when signature not match message', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        await signAndVerifyPage.verifySignature({
            message: signatureMessage,
            address: address,
            signature: incorrectSignature,
            verify: true,
        });
        await app.client.waitForExist(signAndVerifyPage.wrongAlert, 3000);
    });

    it('verify generate invalid alert when address is melformed', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        await signAndVerifyPage.verifySignature({
            message: signatureMessage,
            signature: correctSignature,
            verify: false,
        });

        const testData = [
            ['tz1', 'p=Addresses must be 36 characters long.'],
            // ['tz1bffffffffffffffffffffffffffffffff', "p=This account doesn't exist on the blockchain or has 0 balance.",],
            ['bla', 'p=Only tz1 (ed25519) address signatures can be validated at this time.'],
            ['tz1bffffffffffffffffffffffffffffffff38', 'p=Addresses must be 36 characters long.'],
        ];

        for (data of testData) {
            await signAndVerifyPage.verifySignature({
                address: data[0],
                verify: false,
            });
            await sleepApp(5000);
            await signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);
        }
    });
});
