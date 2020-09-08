const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class SendPage extends BasePage {
    constructor(app) {
        super(app);
        this.sendRecipientAddressInput = '[data-spectron="recipient-address"] input';
        this.sendSendButton = '[data-spectron="send-bottom-button"]';
        this.sendAmountInput = '[data-spectron="send"] [data-spectron="amount"] input';
        this.sendConfirmationModal = '[data-spectron="send-confirmation-modal"]';
        this.sendConfirmationAmount = '[data-spectron="send-confirmation-modal"] [data-spectron="amount"]';
        this.sendConfrimationAddressPartOne = '[data-spectron="send-confirmation-modal"] [data-spectron="tezos-address"] span span:nth-child(1)';
        this.sendConfrimationAddressPartTwo = '[data-spectron="send-confirmation-modal"] [data-spectron="tezos-address"] span span:nth-child(2)';
        this.sendConfrimationButtonConfirm = 'button=Confirm';
        this.sendConfirmationWalletPassword = '[data-spectron="send-confirmation-modal"] [data-spectron="wallet-password"] input';
        this.sendMessage = "[data-spectron='message-bar'] [data-spectron='message']";
        this.sendUseMaxButton = '[data-spectron="use-max-button"]';
        this.sendRemainingBalance = '[data-spectron="remaining-balance"] [data-spectron="amount"]';
        this.sendFeeSection = '[data-spectron="fee-container"]';
        this.sendLowFee = 'ul li:nth-child(1)';
        this.sendMediumFee = 'ul li:nth-child(2)';
        this.sendHighFee = 'ul li:nth-child(3)';
        this.sendConfirmationFee = '[data-spectron="send-confirmation-modal"] [data-spectron="fee"]';
        this.selectedFeeValue = '[data-spectron="selected-fee-value"]';
        this.sendTotalAmount = '[data-spectron="total-amount"] span:nth-child(2)';
        this.sendRecipientInputAlert = '[data-spectron="recipient-address"] p';
        this.sendBurnSection = '[data-spectron="burn"]';
        this.sendBurnSectionButton = '[data-spectron="burn"] button span span';
        this.sendBurnSectionMessage = '[data-spectron="burn-message"]';

        this.changeFeeLevel = async (feeLevel, customFeeInt = undefined) => {
            await this.app.client.click(this.sendFeeSection);
            switch (feeLevel) {
                case 'Low':
                    await this.app.client.click(this.sendLowFee);
                    await sleepApp(1000);
                    const selectedFee = await this.app.client.getText(this.selectedFeeValue);
                    await sleepApp(2000);
                    assert.equal(selectedFee.includes('Low Fee'), true);
                    break;
                case 'Medium':
                    await this.app.client.click(this.sendMediumFee);
                    await sleepApp(1000);
                    break;
                case 'High':
                    await this.app.client.click(this.sendHighFee);
                    await sleepApp(1000);
                    break;
                case 'Custom':
                    await this.app.client.click('li=Custom');
                    if (customFeeInt) {
                        await this.app.client.setValue('[data-spectron="custom-fee-modal"] input', customFeeInt);
                    }
                    if (!customFeeInt) {
                        await this.buttonEnabledFalse('button=Set Custom Fee');
                    }
                    await this.app.client.click('button=Set Custom Fee');
                    const selectedFeeTwo = await this.app.client.getText(this.selectedFeeValue);
                    if (customFeeInt) {
                        assert.equal(selectedFeeTwo.includes(customFeeInt), true);
                    }
                    break;
                default:
                    await this.app.client.click(this.sendLowFee);
            }
        };

        this.fillSendForm = async ({ recipientAddress = undefined, feeLevel = undefined, customFeeInt = undefined, send = undefined, amount = undefined }) => {
            if (recipientAddress) {
                await this.app.client.setValue(this.sendRecipientAddressInput, recipientAddress);
                if (!amount) {
                    this.buttonEnabledFalse(this.sendSendButton);
                }
            }
            if (feeLevel) {
                await this.changeFeeLevel(feeLevel, customFeeInt);
                if (!recipientAddress || !recipientAddress) {
                    this.buttonEnabledFalse(this.sendSendButton);
                }
            }
            if (amount) {
                if (amount === 'Max') {
                    await app.client.click(this.sendUseMaxButton);
                } else {
                    await this.app.client.setValue(this.sendAmountInput, amount);
                }
                if (!recipientAddress) {
                    this.buttonEnabledFalse(this.sendSendButton);
                }
            }
            if (send) {
                await this.pushButton(this.sendSendButton);
            }
        };

        this.retriveSendConfirmationData = async () => {
            const amount = await this.app.client.getText(this.sendConfirmationAmount);
            const fee = await app.client.getText(this.sendConfirmationFee);
            const sourcePartOne = await this.app.client.getText(this.sendConfrimationAddressPartOne);
            const sourcePartTwo = await this.app.client.getText(this.sendConfrimationAddressPartTwo);
            const source = sourcePartOne[0] + sourcePartTwo[0];
            const destinationPartOne = await this.app.client.getText(this.sendConfrimationAddressPartOne);
            const destinationPartTwo = await this.app.client.getText(this.sendConfrimationAddressPartTwo);
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
                await this.app.client.setValue(this.sendConfirmationWalletPassword, password);
            }
            if (_confirm) {
                await this.pushButton(this.sendConfrimationButtonConfirm);
            }
        };
    }
}

module.exports = SendPage;
