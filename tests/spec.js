const assert = require('assert');
const path = require('path');
const { Application } = require('spectron');

// construct paths
const baseDir = path.join(__dirname, '..');
const electronBinary = path.join(baseDir, 'node_modules', '.bin', 'electron');

// utility functions
const sleep = (time) => new Promise((r) => setTimeout(r, time));

describe('Test', function() {
	this.timeout(500000);

	const app = new Application({
		path: electronBinary,
		args: [ baseDir ]
	});

	before(() => app.start());
	after(() => app.stop());

	it('first test', async () => {
		const count = await app.client.getWindowCount();
		app.client.click('body > div:nth-child(5) > div.sc-pAMbm.fjUOob > div > div.sc-qanuI.dNwPNE > button');
		// await sleep(30000);
		app.client.click(
			'body > div:nth-child(5) > div.sc-pLxQr.YKbbj > div > div.sc-pmiWo.hxiPWe > button.sc-fzozJi.iBEmWG.sc-qWRQj.eEaJsF'
		);
		const header = await app.client.getText('h1.sc-pYZcj');
		assert.equal(header, 'Tezori');
		app.client.click('#root > div > div.sc-qYTrh.kyvMPh > button:nth-child(3) > div');
		app.client.click(
			'#root > div > div.sc-pmlFt.gkWgml > div.sc-qOubn.dNrgvj > div.sc-pIHGs.krMVWn > div > div > div > div'
		);
		app.client.click(
			'#menu- > div.MuiPaper-root.MuiMenu-paper.MuiPopover-paper.MuiPaper-elevation8.MuiPaper-rounded > ul > li:nth-child(3) > div > div'
		);
		app.client.click('#root > div > div.sc-pmlFt.gkWgml > div.sc-puGGo.bGFVdM > button > span');
		// await sleep(30000);
		app.client.click(
			'#root > div > div.sc-psEpA.bdrbgN > div.sc-pjtZy.bZfyjH > section.sc-qQLmQ.gGVzbe > div:nth-child(2) > button.MuiButtonBase-root.MuiFab-root.sc-oTDAo.iPLCIH.MuiFab-extended.MuiFab-secondary > span.MuiFab-label'
		);
	});
});
