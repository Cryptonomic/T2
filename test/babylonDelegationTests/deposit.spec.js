const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const DepositPage = require('../pages/depositPage');
const { sleepApp } = require('../utils/sleepApp');
const TransactionPage = require('../pages/transactionPage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Delegation Contracts deposit main features: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const depositPage = new DepositPage(app);
    const transactionPage = new TransactionPage(app);

    beforeEach(async () => {
        await app.start();
        await depositPage.selectLanguageAndAgreeToTerms();
        await depositPage.setTestNode();
        await depositPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('deposit happy path', async () => {
        //open first delegation contract
        await depositPage.openDelegationContract(1);
        await depositPage.navigateToSection('Transactions');
        await transactionPage.waitUntilPendingTransactionFinished();
        await depositPage.navigateToSection('Deposit');
        await depositPage.fillDepositForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            withdraw: true,
        });

        await depositPage.assertPopUpAlert('Successfully started contract invocation.');
        await depositPage.navigateToSection('Transactions');
    });

    it('deposit shows worning', async () => {
        //open first delegation contract
        await depositPage.openDelegationContract(1);
        await depositPage.navigateToSection('Deposit');
        const warningText = await app.client.getText(depositPage.depositWarning);
        assert.equal(warningText, 'Transfer balance from the manager account at tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4.');
    });

    it('deposit decrease level of tzx in account', async () => {
        this.timeout = 1000 * 60 * 5;
        const selectedAmount = 1;
        //open first delegation contract
        await depositPage.openDelegationContract(1);
        await depositPage.navigateToSection('Deposit');
        await depositPage.fillDepositForm({
            amount: selectedAmount,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            withdraw: true,
        });

        await sleepApp(3000);
        await app.client.click(depositPage.closePopUpButton);

        //-----check if Menager Address balance changes-----------

        //go to main ballance banner
        await depositPage.openAppMainSection();

        //check if tezos amont increase by one
        let oldTezosValue = await app.client.getText('[data-spectron="address-info"] span:nth-child(3)');
        let newTezosValue = parseFloat(oldTezosValue.replace('~', '')) - selectedAmount;
        await sleepApp(1000 * 60 * 1);
        await depositPage.refreshApp();
        await app.client.waitUntilTextExists('[data-spectron="address-info"] span:nth-child(3)', `~${newTezosValue}`, 1000 * 60 * 5);
    });
});
