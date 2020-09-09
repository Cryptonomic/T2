const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');
const { sleepApp } = require('./utils/sleepApp');
const SmartContractsPage = require('./pages/smartContractsPage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

describe('Smart Contract main features tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const smartContractsPage = new SmartContractsPage(app);

    beforeEach(async () => {
        await app.start();
        await smartContractsPage.selectLanguageAndAgreeToTerms();
        await smartContractsPage.setTestNode();
        await smartContractsPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it.skip('create new contract works properly', async () => {
        const contract = [
            { prim: 'parameter', args: [{ prim: 'string' }] },
            { prim: 'storage', args: [{ prim: 'string' }] },
            { prim: 'code', args: [[{ prim: 'CAR' }, { prim: 'NIL', args: [{ prim: 'operation' }] }, { prim: 'PAIR' }]] },
        ];

        await app.client.click(smartContractsPage.addDelegationContractButton);

        await app.client.click('[dataSpectron="understand-check"]');
        await app.client.click('[dataSpectron="dont-message"]');
        await app.client.click('[data-spectron="proceed-button"]');
        await app.client.click('span=Deploy a New Contract');
        await smartContractsPage.fillDeployContractForm({
            smartContract: contract,
            storage: '{ "string": "hello" }',
            storageLimit: 600,
            gas: 20000,
            type: 'micheline',
            password: process.env.TZ1_PASSWORD,
            deploy: true,
        });
        await sleepApp(6000);
    });
});
