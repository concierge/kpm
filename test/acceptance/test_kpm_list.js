const assert = require('chai').assert,
    mockApi = new MockApi();

describe('kpm', () => {
    describe('/kpm list', () => {
        it('should respond with a list of installed modules', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm list');
            const args = await argsPromise;

            const msg = args[0].trim();
            assert.isTrue(/^Installed KPM modules are:(\s+- \S+)*\s+- kpm(\s+- \S+)*$/m.test(msg));
        });
    });
});
