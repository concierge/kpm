const assert = require('chai').assert,
    mockApi = new MockApi();

describe('kpm', () => {
    describe('/kpm', () => {
        it('should respond with kpm usage help', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm');
            const args = await argsPromise;

            const msg = args[0].split('\n').map(m => m.trim());
            assert.isTrue(msg[0].startsWith('Invalid usage of KPM'));
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
                'stop',
                'help'
            ];
            for (let e of expected) {
                assert.isTrue(!!msg.find(m => m.startsWith(`- ${e}`)));
            }
        });
    });
});
