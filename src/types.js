const files = require('concierge/files'),
    path = require('path'),
    p = path.join(__dirname, 'types');
let types;

module.exports = async(operation, selector, ...args) => {
    if (!types) {
        types = (await files.filesInDirectory(p)).map(f => require(path.join(p, f)));
    }

    for (let t of types) {
        let testResult = false;
        try {
            testResult = await t.typeTest(operation, selector);
        }
        catch(e) {}
        if (testResult) {
            return await t[operation].apply(this, args);
        }
    }
    throw new Error('No type exists to perform that operation.');
};
