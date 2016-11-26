const files = require('concierge/files'),
    path = require('path'),
    p = path.join(__dirname, 'types'),
    types = files.filesInDirectory(p).map(f => require(path.join(p, f)));

module.exports = (operation, selector, ...args) => {
    for (let t of types) {
        let testResult = false;
        try {
            testResult = t.typeTest(operation, selector);
        }
        catch(e) {}
        if (testResult) {
            return t[operation].apply(this, args);
        }
    }
    throw new Error('No type exists to perform that operation.');
};
