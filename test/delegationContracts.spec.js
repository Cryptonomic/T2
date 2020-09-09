const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const DelegationContractPage = require('./pages/delegationContractPage');
const { sleepApp } = require('./utils/sleepApp');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

describe('Delegation Contracts main features: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const delegationContractPage = new DelegationContractPage(app);

    beforeEach(async () => {
        await app.start();
        await delegationContractPage.selectLanguageAndAgreeToTerms();
        await delegationContractPage.setTestNode();
        await delegationContractPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('withdraw present right success popup', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Withdraw');
        await delegationContractPage.fillWithdrawForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            customFeeInt: 0.005,
            withdraw: true,
        });
        await delegationContractPage.assertPopUpAlert('Successfully started contract invocation.');
    });

    it('withdraw present right incorrect password popup', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Withdraw');
        await delegationContractPage.fillWithdrawForm({
            amount: 1,
            walletPassword: 'wrong',
            withdraw: true,
        });
        await delegationContractPage.assertPopUpAlert('Incorrect password');
    });

    it('withdraw use max count correctly', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Withdraw');
        await delegationContractPage.fillWithdrawForm({
            amount: 'Max',
            withdraw: false,
        });

        const contractAmount = await app.client.getText(delegationContractPage.delegationContractBalanceAmount);
        const contractAmountFormatted = parseFloat(contractAmount.slice(1));

        const amount = await app.client.getValue(delegationContractPage.delegationRecipientAddressInput);
        assert.equal(`${contractAmountFormatted - 0.000001}`, amount);
    });

    it('withdraw shows correct worning', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Withdraw');
        const warningText = await app.client.getText(delegationContractPage.delegationContractWithdrawWarning);
        assert.equal(
            warningText,
            'To withdraw funds back to your manager account, tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4, please select a fee of at least 0.005 XTZ and ensure you have at least that amount in your manager account to cover the transaction.'
        );
    });

    it('deposit present right success popup', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Deposit');
        await delegationContractPage.fillDepositForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            withdraw: true,
        });
        await delegationContractPage.assertPopUpAlert('Successfully started contract invocation.');
    });

    it('deposit shows worning', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Deposit');
        const warningText = await app.client.getText(delegationContractPage.delegationContractDepositWarning);
        assert.equal(warningText, 'Transfer balance from the manager account at tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4.');
    });

    it('withdraw increase level of tzx in general account', async () => {
        this.timeout = 1000 * 60 * 5;
        const selectedAmount = 1;
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Withdraw');
        await delegationContractPage.fillWithdrawForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            customFeeInt: 0.005,
            withdraw: true,
        });

        await sleepApp(3000);
        await app.client.click(delegationContractPage.closePopUpButton);

        //-----check if Menager Address balance changes-----------

        //go to main ballance banner
        await delegationContractPage.openAppMainSection();

        //check first transaction value
        const transationAmounts = await app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-amount"]');
        //check if tezos amont increase by one
        let oldTezosValue = await app.client.getText('[data-spectron="address-info"] span:nth-child(3)');
        let newTezosValue = parseFloat(oldTezosValue.replace('~', '')) + selectedAmount;
        await sleepApp(1000 * 60 * 1);
        await delegationContractPage.refreshApp();
        await app.client.waitUntilTextExists('[data-spectron="address-info"] span:nth-child(3)', `~${newTezosValue}`, 1000 * 60 * 5);
    });

    it('deposit decrease level of tzx in account', async () => {
        this.timeout = 1000 * 60 * 5;
        const selectedAmount = 1;
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await delegationContractPage.navigateToSection('Deposit');
        await delegationContractPage.fillDepositForm({
            amount: selectedAmount,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: 'Custom',
            withdraw: true,
        });

        await sleepApp(3000);
        await app.client.click(delegationContractPage.closePopUpButton);

        //-----check if Menager Address balance changes-----------

        //go to main ballance banner
        await delegationContractPage.openAppMainSection();

        //check first transaction value
        const transationAmounts = await app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-amount"]');
        //check if tezos amont increase by one
        let oldTezosValue = await app.client.getText('[data-spectron="address-info"] span:nth-child(3)');
        let newTezosValue = parseFloat(oldTezosValue.replace('~', '')) - selectedAmount;
        await sleepApp(1000 * 60 * 1);
        await delegationContractPage.refreshApp();
        await app.client.waitUntilTextExists('[data-spectron="address-info"] span:nth-child(3)', `~${newTezosValue}`, 1000 * 60 * 5);
    });
});
