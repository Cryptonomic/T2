const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const moment = require('moment');

const { sleepApp } = require('./utils/sleepApp')

const SendPage = require('./pages/sendPage');
const TransactionPage = require('./pages/transactionPage');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

// Problemy 
// -> po wyslaniu pojawia sie w receive napis function to a nie od razu typ Sent to
// -> nie mozna zmienic podatku, po wpisaniu go automatycznie, strona go zmienia i potem wraca do poprzedniej
// wartosci w podsumowaniu

describe('Implicit account Send tests: ', function () {
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
    const transactionPage = new TransactionPage(app)

    beforeEach(async () => {
        await app.start();
        await sendPage.selectLanguageAndAgreeToTerms();
        await sendPage.setTestNode();
        await sendPage.openExistingWallet(process.env.TZ1_PASSWORD);
    });

    afterEach(() => app.stop());

    it('transaction is visible in transactions section', async () => {
        await sendPage.navigateToSection("Send");

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            feeLevel: "LOW",
            send: true
        })

        const confirmationData = await sendPage.retriveSendConfirmationData()
        assert.equal(confirmationData.amount.slice(0, 1), "1")
        //assert.equal(confirmationData.fee.slice(0, -1), "0.049445") //fee is changing when there are more transactions
        assert.equal(confirmationData.source, process.env.TZ1_ADDRESS)
        assert.equal(confirmationData.destination, process.env.TZ2_ADDRESS)

        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: true
        })
        await app.client.waitForExist(sendPage.popUpMessage, 1000 * 60 * 2)
        const alert = await app.client.getText(sendPage.popUpMessage)
        assert.equal(alert, "Success! You sent 1 tz.");

        //-------------Check Transactions---------------------------------------
        const transactionDate = moment().format('MMMM D, YYYY')
        await sleepApp(5000);
        await sendPage.refreshApp()
        await sendPage.navigateToSection("Transactions");

        const lastTransaction = await transactionPage.returnLastTransaction()
        console.log(lastTransaction)
        // assert.equal(lastTransaction.date, transactionDate)
        // assert.equal(lastTransaction.hour, 'Pending...')
        // assert.equal(lastTransaction.type, 'INVOKED FUNCTIONof')
        // assert.equal(lastTransaction.address, process.env.TZ2_ADDRESS)
        // assert.equal(lastTransaction.amount, '1.000000\n')
        // assert.equal(lastTransaction.fee, feeFormatted) // Fee is changing so we check if its the same during flow
    })

    it('transaction is visible in transactions section in  destination transactions section', async () => {
        await sendPage.navigateToSection("Send");

        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 1,
            send: true
        })
        await sendPage.sendConfirmation({
            password: process.env.TZ1_PASSWORD,
            _confirm: true
        })
        await app.client.waitForExist(sendPage.popUpMessage, 1000 * 60 * 2)
        const alert = await app.client.getHTML(sendPage.popUpMessage)
        assert.equal(true, alert.includes("Success! You sent 1 tz."));

        //-----------check destination wallet--------------------------
        await sendPage.logOutWallet()
        await sendPage.openExistingWallet(process.env.TZ2_PASSWORD);
        await sleepApp(5000)

        lastTransaction = await transactionPage.returnLastTransaction()
        console.log(lastTransaction)

        assert.equal(lastTransaction.date, moment().format('MMMM D, YYYY'))
        assert.equal(lastTransaction.hour, 'Pending, expires in 64 blocks')
        assert.equal(lastTransaction.type, 'Invokedby')
        assert.equal(lastTransaction.amount, '1.000000\n')
        assert.equal(lastTransaction.address, 'tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4')
        assert.equal(lastTransaction.fee, undefined)
    })

    it('max amount works correctly', async () => {
        await sendPage.navigateToSection("Send");
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: "Max",
            send: false
        })
        const remainingBalance = await app.client.getHTML(sendPage.sendRemainingBalance);
        assert.equal(remainingBalance.includes("0.000001"), true)

    })

    it.only('total and remaning balance, fee works correctly', async () => {
        await sendPage.navigateToSection("Send");
        await app.client.setValue(sendPage.sendRecipientAddressInput, process.env.TZ2_ADDRESS);
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 15,
            feeLevel: "Low",
            send: false
        })
        await sleepApp(5000)
        console.log(await app.client.getHTML(sendPage.sendTotalAmount))
        // not working, balance state is unchaged when execute via Spectron!
    })

    it('sending to 0 amount address shows burn options', async () => {
        await sendPage.navigateToSection("Send");
        await sendPage.fillSendForm({
            recipientAddress: "tz1aA9pwaJY2VmRyH47ibubF4TGDLyLA8yEW",
            amount: 15,
            feeLevel: "Low",
            send: false
        })
        await app.client.waitUntilTextExists(
            sendPage.sendRecipientInputAlert, "This account doesn't exist on the blockchain or has 0 balance", 50000)
        await app.client.waitForExist(sendPage.sendBurnSection)
    })

    it('send to myself is not allowed', async () => {
        await sendPage.navigateToSection("Send");
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ1_ADDRESS,
            amount: 1,
            send: false
        })
        await app.client.waitUntilTextExists(
            sendPage.sendRecipientInputAlert, "You cannot send funds to yourself.", 50000)
        await sendPage.buttonEnabledFalse(sendPage.sendSendButton)
    })

    it('send 0 tezos is not allowed', async () => {
        await sendPage.navigateToSection("Send");
        await sendPage.fillSendForm({
            recipientAddress: process.env.TZ2_ADDRESS,
            amount: 0,
            send: false
        })
        await sendPage.buttonEnabledFalse(sendPage.sendSendButton)
    })
});
