const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class DelegationContractPage extends BasePage {
    constructor(app) {
        super(app);
        this.delegationRecipientAddressInput = '[data-spectron="withdraw"] [data-spectron="amount"] input';
        this.delegationContractBalanceAmount = '[data-spectron="address-info"] span:nth-child(3)';
        this.delegationcontractFeeSection = '[data-spectron="fee-container"]';
        this.delegationcontractLowFee = 'ul li:nth-child(1)';
        this.delegationcontractMediumFee = 'ul li:nth-child(2)';
        this.delegationcontractHighFee = 'ul li:nth-child(3)';
        this.selectedFeeValue = '[data-spectron="selected-fee-value"]';
        this.delegationcontractSendBottomButton = '[data-spectron="token-send-bottom-button"]';
        this.delegationcontractWalletPassword = '[data-spectron="password-input"] input';
        this.delegationcontractRecipientInputAlert = '[data-spectron="token-recipient-address"] p';

        this.firstDelegationContract = '[data-spectron="address-block"] [data-spectron="address"]:nth-child(3)';
        this.delegationContractWithdrawWarning = '[data-spectron="withdraw-warning"]';
        this.delegationContractDepositWarning = '[data-spectron="deposit-warning"]';

        this.retrieveTokenBalanceBannerData = async () => {
            const tokenPageTitle = await this.app.client.getText('[data-spectron="token-name"]');
            const addressPartOne = await this.app.client.getText(
                '[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(1)'
            );
            const addressPartTwo = await this.app.client.getText(
                '[data-spectron="token-balance-banner"] [data-spectron="tezos-address"] span span:nth-child(2)'
            );
            const tokenAddress = addressPartOne + addressPartTwo;
            const tokenAddressInfo = await this.app.client.getText('[data-spectron="token-address-info"]');
            const ballanceBannerInfo = {
                title: tokenPageTitle,
                addres: tokenAddress,
                addresInfo: tokenAddressInfo,
            };
            return ballanceBannerInfo;
        };

        this.changeFeeLevel = async (feeLevel, customFeeInt = undefined) => {
            await this.app.client.click(this.delegationcontractFeeSection);
            await sleepApp(2000);
            switch (feeLevel) {
                case 'Low':
                    await this.app.client.click(this.delegationcontractLowFee); // take lowest fee
                    await sleepApp(2000);
                    const selectedFeeOne = await this.app.client.getText(this.selectedFeeValue);
                    assert.equal(selectedFeeOne.includes('Low Fee'), true);
                    break;
                case 'Medium':
                    await this.app.client.click(this.delegationcontractMediumFee);
                    await sleepApp(2000);
                    break;
                case 'High':
                    await this.app.client.click(this.delegationcontractHighFee);
                    await sleepApp(2000);
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
                    sleepApp(2000);
                    const selectedFeeTwo = await this.app.client.getText(this.selectedFeeValue);
                    if (customFeeInt) {
                        assert.equal(selectedFeeTwo.includes(customFeeInt), true);
                    }
                    break;
                default:
                    await this.app.client.click(this.delegationcontractLowFee);
            }
        };

        this.fillWithdrawForm = async ({ amount = undefined, fee = undefined, customFeeInt = undefined, walletPassword = undefined, withdraw = true }) => {
            if (amount) {
                if (amount === 'Max') {
                    await this.app.client.click('div=Use Max');
                } else {
                    await this.app.client.setValue('[data-spectron="withdraw"] [data-spectron="amount"] input', amount);
                    await this.buttonEnabledFalse('[data-spectron="withdraw-bottom-button"]');
                }
            }
            if (fee) {
                await this.changeFeeLevel(fee, customFeeInt);
                await this.buttonEnabledFalse('[data-spectron="withdraw-bottom-button"]');
            }
            if (walletPassword) {
                await this.app.client.setValue('[data-spectron="wallet-password"] input', walletPassword);
                if (!amount) {
                    await this.buttonEnabledFalse('[data-spectron="withdraw-bottom-button"]');
                }
            }
            if (withdraw) {
                await this.pushButton('[data-spectron="withdraw-bottom-button"]');
            }
        };

        this.fillDepositForm = async ({ amount = undefined, fee = undefined, customFeeInt = undefined, walletPassword = undefined, withdraw = true }) => {
            if (amount) {
                await this.app.client.setValue('[data-spectron="deposit"] [data-spectron="amount"] input', amount);
                await this.buttonEnabledFalse('[data-spectron="deposit-bottom-button"]');
            }
            if (fee) {
                await this.changeFeeLevel(fee, customFeeInt);
                await this.buttonEnabledFalse('[data-spectron="deposit-bottom-button"]');
            }
            if (walletPassword) {
                await this.app.client.setValue('[data-spectron="wallet-password"] input', walletPassword);
                if (!amount) {
                    await this.buttonEnabledFalse('[data-spectron="deposit-bottom-button"]');
                }
            }
            if (withdraw) {
                await this.pushButton('[data-spectron="deposit-bottom-button"]');
            }
        };

        // recieve
        // this.returnLastTransaction = async () => {
        //     const date = await this.app.client.getText('[data-spectron="transaction-date"]');
        //     const hour = await this.app.client.getText('[data-spectron="transaction-date-hour"]');
        //     const type = await this.app.client.getText('[data-spectron="transaction-type"]');
        //     const addressOne = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(1)');
        //     const addressTwo = await this.app.client.getText('[data-spectron="transaction"] [data-spectron="tezos-address"] span span:nth-child(2)');
        //     const address = addressOne[0] + addressTwo[0];
        //     const amount = await this.app.client.getText('[data-spectron="tezos-amount"]');

        //     let fee = 0;
        //     if (type === 'Sentto') {
        //         fee = await this.app.client.getText('[data-spectron="fee"] span:nth-child(2)');
        //     }
        //     const transactionData = {
        //         date: date,
        //         hour: hour[0],
        //         type: type[0],
        //         address: address,
        //         amount: amount[0],
        //         fee: fee[0]
        //     };
        //     return transactionData;
        // };
    }
}

module.exports = DelegationContractPage;
