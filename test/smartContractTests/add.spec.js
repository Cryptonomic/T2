const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
// const SmartContractsPage = require('../pages/smartContractsPage');
const BasePage = require('../pages/basePage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

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
    const basePage = new BasePage(app);

    // beforeEach(async () => {
    //     await app.start();
    //     await basePage.selectLanguageAndAgreeToTerms();
    //     await basePage.setTestNode();
    //     await basePage.openExistingWallet(process.env.TZ1_PASSWORD);
    // });

    afterEach(() => app.stop());

    // it('create new contract works properly', async () => {
    //     const contract =
    //         '[{"prim": "parameter","args": [{"prim": "string"}]},\r\
    //         {"prim": "storage", "args": [{"prim": "string"}]},\n\
    //         {"prim": "code",\n\
    //          "args": [\n\
    //           [{"prim": "CAR"},\n\
    //            {"prim": "NIL",\n\
    //             "args": [{"prim": "operation"}]},\n\
    //            {"prim": "PAIR"}]]}]';

    //     await basePage.pushCreateSmartContractButton();
    //     await basePage.acceptTestNodeWarningDuringSmartContractCreation();
    //     await basePage.startDeployingsmartContract();

    //     await basePage.fillDeployContractForm({
    //         smartContract: contract,
    //         storage: '{ "string": "hello" }',
    //         storageLimit: 600,
    //         gas: 20000,
    //         type: 'micheline',
    //         password: process.env.TZ1_PASSWORD,
    //         deploy: true,
    //     });
    //     await sleepApp(6000);
    //     basePage.assertPopUpAlert('Successfully started contract deployment.');
    //     // sprawdzic czy liczba kontraktow sie zwiększyła
    // });
});
