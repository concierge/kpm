const assert = require('chai').assert,
    mockApi = new MockApi();

describe('kpm', () => {
    describe('/kpm help', () => {
        it('should respond with detailed kpm usage help', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm help');
            const args = await argsPromise;

            const msg = args[0].split('\n');
            assert.lengthOf(msg.filter(m => m.startsWith('\t')), 11);
            const expected = [
                'install',
                'uninstall',
                'update',
                'list',
                'search',
                'config',
                'reload',
                'load',
                'unload',
                'start',
                'stop'
            ];
            for (let e of expected) {
                assert.isTrue(!!msg.find(m => m.startsWith(e)), `Did not find ${e} in "/kpm help"`);
            }
        });

        it('should respond with detailed kpm usage help only for list', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm help list');
            const args = await argsPromise;

            const msg = args[0].split('\n').map(m => m.trim());
            assert.lengthOf(msg, 3);
            assert.equal(msg[0], 'list');
            assert.equal(msg[1], '--------------------');
            assert.equal(msg[2], 'Lists all modules that have been installed using KPM.');
        });
    });
});
