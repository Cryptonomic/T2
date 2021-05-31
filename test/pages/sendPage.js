const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class SendPage extends BasePage {
    constructor(app) {
        super(app);
        this.recipientAddressInput = '[data-spectron="recipient-address"] input';
        this.sendBottomButton = '[data-spectron="send-bottom-button"]';
        this.amountInput = '[data-spectron="send"] [data-spectron="amount"] input';
        this.confirmationModal = '[data-spectron="send-confirmation-modal"]';
        this.confirmationAmount = '[data-spectron="send-confirmation-modal"] [data-spectron="amount"]';
        this.confrimationAddressPartOne = '[data-spectron="send-confirmation-modal"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.confrimationAddressPartOne = '[data-spectron="send-confirmation-modal"] [data-spectron="tezos-address"] span span:nth-child(2)';
        this.confrimationButtonConfirm = 'button=Confirm';
        this.confirmationWalletPassword = '[data-spectron="send-confirmation-modal"] [data-spectron="wallet-password"] input';
        this.sendMessage = "[data-spectron='message-bar'] [data-spectron='message']";
        this.sendUseMaxButton = '[data-spectron="use-max-button"]';
        this.remainingBalance = '[data-spectron="remaining-balance"] [data-spectron="amount"]';
        this.totalAmount = '[data-spectron="total-amount"] span:nth-child(2)';
        this.recipientInputAlert = '[data-spectron="recipient-address"] p';
        this.burnSection = '[data-spectron="burn"]';
        this.burnSectionButton = '[data-spectron="burn"] button span span';
        this.burnSectionMessage = '[data-spectron="burn-message"]';

        this.fillSendForm = async ({ recipientAddress = undefined, feeLevel = undefined, customFeeInt = undefined, send = undefined, amount = undefined }) => {
            if (recipientAddress) {
                await this.app.client.setValue(this.recipientAddressInput, recipientAddress);
                if (!amount) {
                    this.buttonEnabledFalse(this.sendBottomButton);
                }
            }
            if (feeLevel) {
                await this.changeFeeLevelBASE(feeLevel, customFeeInt);
                if (!recipientAddress || !recipientAddress) {
                    this.buttonEnabledFalse(this.sendBottomButton);
                }
            }
            if (amount) {
                if (amount === 'Max') {
                    await this.app.client.click(this.sendUseMaxButton);
                } else {
                    await this.app.client.setValue(this.amountInput, amount);
                }
                if (!recipientAddress) {
                    this.buttonEnabledFalse(this.sendBottomButton);
                }
                await sleepApp(5000);
            }
            if (send) {
                await this.pushButton(this.sendBottomButton);
            }
        };

        this.retriveSendConfirmationData = async () => {
            const amount = await this.app.client.getText(this.confirmationAmount);
            const fee = await app.client.getText(this.sendConfirmationFee);
            const sourcePartOne = await this.app.client.getText(this.confrimationAddressPartOne);
            const sourcePartTwo = await this.app.client.getText(this.confrimationAddressPartOne);
            const source = sourcePartOne[0] + sourcePartTwo[0];
            const destinationPartOne = await this.app.client.getText(this.confrimationAddressPartOne);
            const destinationPartTwo = await this.app.client.getText(this.confrimationAddressPartOne);
            const destination = destinationPartOne[1] + destinationPartTwo[1];
            const confirmationData = {
                amount: amount.slice(0, 1),
                fee: fee.slice(0, -1),
                source: source,
                destination: destination,
            };
            return confirmationData;
        };

        this.sendConfirmation = async ({ password = undefined, _confirm = true }) => {
            if (password) {
                await this.app.client.setValue(this.confirmationWalletPassword, password);
            }
            if (_confirm) {
                await this.pushButton(this.confrimationButtonConfirm);
            }
        };
    }
}

module.exports = SendPage;
