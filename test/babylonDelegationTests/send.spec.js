const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');

const { sleepApp } = require('../utils/sleepApp');

const SendPage = require('../pages/sendPage');
const TransactionPage = require('../pages/transactionPage');

// construct paths
const baseDir = path.join(__dirname, '..', '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

const envVariables = path.join(baseDir, 'test/.env');
// load evironment variables
require('dotenv').config({ path: envVariables });

describe('Babylon Delegation Send tests: ', function () {
    this.timeout(500000);

    const app = new Application({
        path: electronBinary,
        args: [baseDir],
        env: {
            WEB_CLIENT: 'spectron',
        },
    });

    // page object
    const sendPage = new SendPage(app);
    const transactionPage = new TransactionPage(app);

    beforeEach(async () => {
        await app.start();
        await sendPage.selectLanguageAndAgreeToTerms();
        await sendPage.setTestNode();
        await sendPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('send shows right message after sending tzx', async () => {
        await sendPage.openDelegationContract(1);
        await sendPage.navigateToSection('Send');

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            feeLevel: 'High',
            send: true,
        });

        const retrievedFee = await sendPage.retrieveSelectedFeeValueBase();

        const confirmationData = await sendPage.retriveSendConfirmationData();
        assert.equal(confirmationData.amount.slice(0, 1), '1');
        assert.equal(confirmationData.fee.slice(0, -1), retrievedFee, 'fee incorrect');
        assert.equal(confirmationData.source, 'KT1MiHyTCjTyQhUAjHhHR8FbF6CndcykTABK');
        assert.equal(confirmationData.destination, process.env.TZ2_ADDRESS);

        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: false,
        });

        await sleepApp(5000);
    });

    it('send shows right message after sending tzx', async () => {
        await sendPage.openDelegationContract(1);
        await sendPage.navigateToSection('Send');

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            feeLevel: 'High',
            send: true,
        });

        const retrievedFee = await sendPage.retrieveSelectedFeeValueBase();

        const confirmationData = await sendPage.retriveSendConfirmationData();
        assert.equal(confirmationData.amount.slice(0, 1), '1');
        assert.equal(confirmationData.fee.slice(0, -1), retrievedFee, 'fee incorrect');
        assert.equal(confirmationData.source, 'KT1MiHyTCjTyQhUAjHhHR8FbF6CndcykTABK');
        assert.equal(confirmationData.destination, process.env.TZ2_ADDRESS);

        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: true,
        });

        await sendPage.assertPopUpAlert('\nSuccess! You sent 1 tz.');
    });

    it('max amount works correctly', async () => {
        await app.client.click(delegationContractPage.firstDelegationContract);
        await sleepApp(2000);
        await sendPage.navigateToSection('Send');
        await sendPage.fillSendForm({
            amount: 'Low',
            send: false,
        });
        const remainingBalance = await app.client.getHTML(sendPage.remainingBalance);
        assert.equal(remainingBalance.includes('0.000001'), true);
    });

    it('total and remaning balance, fee works correctly', async () => {
        await sendPage.navigateToSection('Send');
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 15,
            feeLevel: 'High',
            send: false,
        });
        const retrievedFee = await sendPage.retrieveSelectedFeeValueBase();
        const retrievedFeePlusTotal = parseFloat(retrievedFee) + 15;

        const total = await app.client.getText(sendPage.totalAmount);
        const retrievedTotal = total.slice(0, -2);
        assert.equal(retrievedTotal, retrievedFeePlusTotal, 'fee + amounnt incorrect');
    });

    it.skip('total, fee works correctly for custom fee', async () => {
        await sendPage.navigateToSection('Send');

        //assertion inside finction not allowed to choice empty custom fee
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 15,
            feeLevel: 'Custom',
            send: false,
        });
    });

    it('sending to 0 amount address shows burn message and amount', async () => {
        await sendPage.navigateToSection('Send');
        await sendPage.fillSendForm({
            recipientAddress: 'tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW',
            amount: 15,
            feeLevel: 'Low',
            send: false,
        });
        await app.client.waitUntilTextExists(sendPage.recipientInputAlert, "This account doesn't exist on the blockchain or has 0 balance", 50000);
        await app.client.waitForExist(sendPage.burnSection);

        await app.client.moveToObject(sendPage.burnSectionButton);
        await sleepApp(3000);
        const burnMessage = await app.client.getText(sendPage.burnSectionMessage);
        assert.equal(
            burnMessage,
            'The recipient address you entered has a zero balance. Sending funds to an empty Manager address (tz1,2,3) requires a one-time 0.257 XTZ burn fee.'
        );
    });

    it('send to myself is not allowed', async () => {
        await sendPage.navigateToSection('Send');
        await sendPage.fillSendForm({
            recipientAddress: 'KT1MiHyTCjTyQhUAjHhHR8FbF6CndcykTABK',
            amount: 1,
            send: false,
        });
        await app.client.waitUntilTextExists(sendPage.recipientInputAlert, 'You cannot send funds to yourself.', 50000);
        await sendPage.buttonEnabledFalse(sendPage.sendBottomButton);
    });

    it('send 0 tezos is not allowed', async () => {
        await sendPage.navigateToSection('Send');
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 0,
            send: false,
        });
        await sendPage.buttonEnabledFalse(sendPage.sendBottomButton);
    });

    it.skip('transaction is visible in transactions section', async () => {
        await sendPage.navigateToSection('Send');

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            feeLevel: 'LOW',
            send: true,
        });
        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: true,
        });
        await sendPage.assertPopUpAlert('\nSuccess! You sent 1 tz.');

        const retrievedFee = await sendPage.retrieveSelectedFeeValueBase();

        //-------------Check Transactions---------------------------------------
        const transactionDate = moment().format('MMMM D, YYYY');
        await sleepApp(5000);
        await sendPage.refreshApp();
        await sendPage.navigateToSection('Transactions');

        const lastTransaction = await transactionPage.returnLastTransaction();
        assert.equal(lastTransaction.date, transactionDate);
        assert.equal(lastTransaction.hour, 'Pending...');
        assert.equal(lastTransaction.type, 'Sentto');
        assert.equal(lastTransaction.address, process.env.TZ2_ADDRESS);
        assert.equal(lastTransaction.amount, '1.000000\n');
        assert.equal(lastTransaction.fee, retrievedFee); // Fee is changing so we check if its the same during flow
    });

    it.skip('transaction is visible in transactions section in  destination transactions section', async () => {
        await sendPage.navigateToSection('Send');

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            send: true,
        });
        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: true,
        });
        await app.client.waitForExist(sendPage.popUpMessage, 1000 * 60 * 2);
        const alert = await app.client.getHTML(sendPage.popUpMessage);
        assert.equal(true, alert.includes('Success! You sent 1 tz.'));

        //-----------check destination wallet--------------------------
        await sendPage.logOutWallet();
        await sendPage.openExistingWallet(process.env.TZ2_PASSWORD);
        await sleepApp(5000);

        lastTransaction = await transactionPage.returnLastTransaction();

        assert.equal(lastTransaction.date, moment().format('MMMM D, YYYY'));
        assert.equal(lastTransaction.hour, 'Pending, expires in 64 blocks');
        assert.equal(lastTransaction.type, 'Invokedby');
        assert.equal(lastTransaction.amount, '1.000000\n');
        assert.equal(lastTransaction.address, 'tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4');
        assert.equal(lastTransaction.fee, undefined);
    });
});
