const path = require('path');

exports.mochaHooks = {
    beforeAll() {
        // construct paths
        const baseDir = path.join(__dirname, '..');
        const envVariables = path.join(baseDir, 'test/.env');

        // load evironment variables
        require('dotenv').config({ path: envVariables });
    }
};