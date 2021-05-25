const glob = require('glob');
const path = require('path');
const fs = require('fs-extra');

const writeCoverageReport = (coverage) => {
    const outputFile = path.resolve(process.cwd(), 'coverage/coverage-main.json');
    fs.outputJsonSync(outputFile, coverage);
};

// Load all source files to get accurate coverage data
const loadSourceCode = () => {
    const intrumentedCode = path.join(__dirname);

    glob(`${intrumentedCode}/**/*.js`, {
        sync: true,
    })
        .filter((f) => !f.includes('node_modules'))
        .forEach((file) => require(path.resolve(file)));
};

after(() => {
    if (process.env.NODE_ENV === 'test_main') {
        loadSourceCode();
        // console.log('aa', (global).__coverage__)
        writeCoverageReport(global.__coverage__);
    }
});
