const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const { sleepApp } = require('../utils/sleepApp');
const InvokePage = require('../pages/invokePage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Smart Contract Invoke feature test: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const invokePage = new InvokePage(app);

    beforeEach(async () => {
        await app.start();
        await invokePage.selectLanguageAndAgreeToTerms();
        await invokePage.setTestNode();
        await invokePage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('invoke contract with correct data', async () => {
        await invokePage.openSmartContract(1);
        await invokePage.navigateToSection('Invoke');
        await invokePage.fillInvokeContractForm({
            parameters: '"blah"',
            format: 'michelson',
            amount: 0,
            storageLimit: 600,
            gas: 15000,
            password: process.env.TZ1_PASSWORD,
            invoke: true,
        });
        await invokePage.assertPopUpAlert('Successfully started contract invocation.');
    });
});
