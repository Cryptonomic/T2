const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const SignAndVerifyPage = require('./pages/signAndVerifyPage');
const BaseApp = require('./pages/basePage');
const { sleepApp } = require('./utils/sleepApp');

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
        await signAndVerifyPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('sign generate correct signature', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.signButton);
        const message = 'My message';
        await app.client.addValue('[data-spectron="wallet-password"] input', process.env.TZ1_PASSWORD);
        await signAndVerifyPage.createSignature({ message: message, sign: true, copySignature: true });
        await signAndVerifyPage.assertClipBoard(process.env.TZ1_SIGNATURE);
    });

    it('verify generate confirmed alert when signature matches message', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');

        await app.client.waitForExist(signAndVerifyPage.downVerifyButton);
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        const message = 'My message';
        await signAndVerifyPage.verifySignature({
            message: message,
            address: process.env.TZ1_ADDRESS,
            signature: process.env.TZ1_SIGNATURE,
            verify: true,
        });
        await app.client.waitForExist(signAndVerifyPage.confirmedAlert, 3000);
    });

    it('verify generate invalid alert when signature not match message', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        const message = 'My message';
        const wrongSignature = 'edsigu57kEW5gzskhJb6DdbesMcw6LLRpp6vX6CscEmRRrnCSYUBGXCZKoVGmNdnq29ecvdUW6rxbS31u9FeGfzk9KLMxbEUYqa';
        await signAndVerifyPage.verifySignature({
            message: message,
            address: process.env.TZ1_ADDRESS,
            signature: wrongSignature,
            verify: true,
        });
        await app.client.waitForExist(signAndVerifyPage.wrongAlert, 3000);
    });

    it('verify generate invalid alert when address is melformed', async () => {
        await signAndVerifyPage.openSignAndVerify();
        await signAndVerifyPage.navigateToSection('Verify');
        signAndVerifyPage.buttonEnabledFalse(signAndVerifyPage.downVerifyButton);

        const message = 'My message';
        await signAndVerifyPage.verifySignature({
            message: message,
            signature: process.env.TZ1_SIGNATURE,
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
