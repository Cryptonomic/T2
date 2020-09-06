const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');
const DelegationContractPage = require('./pages/delegationContractPage');
const { sleepApp } = require('./utils/sleepApp')

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

//BUG -> jak wysłałem wszystkie przez withdraw to nic nie zostało i w transaction jesty ze 0 tz wyszlo...
//automat wyswietla kontrakty w odwrotnej kolejnosci...
//jak skasowac kontrakt?
//wysylanie hajsu do kontraktu z glownego jest gas exhausted operation
//withdraw hajsu jest jako 0 i invoiked function na glownej stronie...



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

    it('withdraw works correctly', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract)
        await sleepApp(2000)
        await delegationContractPage.navigateToSection('Withdraw')
        await delegationContractPage.fillWithdrawForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: "Custom",
            withdraw: true
        })
        await app.client.waitForExist(delegationContractPage.popUpMessage, 1000 * 60 * 2)
        const alert = await app.client.getHTML(delegationContractPage.popUpMessage)
        assert.equal(true, alert.includes("Successfully started contract invocation."));
    });

    it('withdraw shows worning', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract)
        await sleepApp(2000)
        await delegationContractPage.navigateToSection('Withdraw')
        const warningText = await app.client.getText(delegationContractPage.delegationContractWithdrawWarning)
        assert.equal(warningText, "To withdraw funds back to your manager account, tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4, please select a fee of at least 0.005 XTZ and ensure you have at least that amount in your manager account to cover the transaction.");
    });

    it('deposit works correctly', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract)
        await sleepApp(2000)
        await delegationContractPage.navigateToSection('Deposit')
        await delegationContractPage.fillDepositForm({
            amount: 1,
            walletPassword: process.env.TZ1_PASSWORD,
            fee: "Custom",
            withdraw: true
        })
        await app.client.waitForExist(delegationContractPage.popUpMessage, 1000 * 60 * 2)
        const alert = await app.client.getHTML(delegationContractPage.popUpMessage)
        assert.equal(true, alert.includes("Successfully started contract invocation."));
    });

    it('deposit shows worning', async () => {
        //open first delegation contract
        await app.client.click(delegationContractPage.firstDelegationContract)
        await sleepApp(2000)
        await delegationContractPage.navigateToSection('Deposit')
        const warningText = await app.client.getText(delegationContractPage.delegationContractDepositWarning)
        assert.equal(warningText, "Transfer balance from the manager account at tz1cLSKms3WtRAy8SYha2ZXFDuhAEXc6CSG4.");
    });
});
