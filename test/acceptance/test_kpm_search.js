const assert = require('chai').assert,
    mockApi = new MockApi();

describe('kpm', () => {
    describe('/kpm search', () => {
        it('should respond with a message about no modules being found', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm search foooooobaaaarrrdoesntexistplease');
            const msg = (await argsPromise)[0].trim();
            assert.equal(msg, 'No modules found in the KPM table.');
        }).timeout(10000);

        it('should respond with a list of avalible modules', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm search');
            const msg = (await argsPromise)[0].trim();
            assert.isTrue(msg.startsWith('Modules found for your query:'));
            assert.notEqual(msg.indexOf('-'), msg.lastIndexOf('-'));
        }).timeout(10000);

        it('should respond with a filtered list of avalible modules', async() => {
            const argsPromise = mockApi.waitForResponseAsync();
            mockApi.mockSendToModules('/kpm search kpm');
            const msg = (await argsPromise)[0].trim();
            assert.isTrue(msg.startsWith('Modules found for your query:'));
            assert.isTrue(msg.contains('- kpm'));
            assert.equal(msg.indexOf('-'), msg.lastIndexOf('-'));
        }).timeout(10000);
    });
});
