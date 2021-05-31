const assert = require('assert');
const moment = require('moment');
const { sleepApp } = require('../utils/sleepApp');
const BasePage = require('./basePage');

class SignAndVerifyPage extends BasePage {
    constructor(app) {
        super(app);
        this.signButton = '[data-spectron="sign-button"]';
        this.textArea = '[data-spectron="micheline-input"] textarea:nth-child(1)';
        this.signatureInput = '[data-spectron="signature-input"] input';
        this.addressInput = '[data-spectron="address-input"] input';
        this.signatureCopyButton = '[data-spectron="signature-value"] [data-spectron="copy-button"]';
        this.downVerifyButton = '[data-spectron="verify-button-down"] button';
        this.confirmedAlert = 'div=Signature confirmed';
        this.wrongAlert = 'div=Invalid signature';

        this.clickSignButton = async () => {
            await this.pushButton(this.signButton);
        };

        this.copySignature = async () => {
            await this.app.client.click(this.signatureCopyButton);
        };

        this.createSignature = async ({ message = undefined, sign = true, copySignature = undefined }) => {
            if (message) {
                await this.app.client.setValue(this.textArea, message);
            }
            if (sign) {
                await this.clickSignButton();
            }
            if (copySignature) {
                await this.app.client.waitForExist(this.signatureCopyButton);
                await this.copySignature();
            }
        };

        this.verifySignature = async ({ message = undefined, signature = undefined, address = undefined, verify = true }) => {
            if (message) {
                await app.client.setValue(this.textArea, message);
            }
            if (signature) {
                await app.client.setValue(this.signatureInput, signature);
            }
            if (address) {
                await app.client.setValue(this.addressInput, address);
            }
            if (verify) {
                await this.pushButton(this.downVerifyButton);
            }
        };
    }
}

module.exports = SignAndVerifyPage;
