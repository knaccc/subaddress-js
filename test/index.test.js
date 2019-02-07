const subaddress = require('../index');

const mnemonic = 'vary ambush western rafts session laboratory jerseys napkin muffin exult tolerant ' +
    'efficient ensign fewest sulking wonders pledge alerts acquire tubes rogue outbreak lifestyle lopped pledge';

const privSpendKey = '8d8c8eeca38ac3b46aa293fd519b3860e96b5f873c12a95e3e1cdeda0bac4903';
const pubSpendKeyHex = 'f8631661f6ab4e6fda310c797330d86e23a682f20d5bc8cc27b18051191f16d7';

const privViewKeyHex = '99c57d1f0f997bc8ca98559a0ccc3fada3899756e63d1516dba58b7e468cfc05';
const pubViewKeyHex = '4a1535063ad1fee2dabbf909d4fd9a873e29541b401f0944754e17c9a41820ce';

const address = '4B33mFPMq6mKi7Eiyd5XuyKRVMGVZz1Rqb9ZTyGApXW5d1aT7UBDZ89ewmnWFkzJ5wPd2SFbn313vCT8a4E2Qf4KQH4pNey';


const subs = {
    account: {
        '0': {
            'index': {
                '1': '8C5zHM5ud8nGC4hC2ULiBLSWx9infi8JUUmWEat4fcTf8J4H38iWYVdFmPCA9UmfLTZxD43RsyKnGEdZkoGij6csDeUnbEB',
                '256': '883z7xonbVBGXpsatJZ53vcDiXQkrkTHUHPxrdrHXiPnZY8DMaYJ7a88C5ovncy5zHWkLc2cQ2hUoaKYCjFtjwFV4vtcpiF'
            }
        },
        '256': {
            'index': {
                '1': '87X4ksVMRv2UGhHcgVjY6KJDjqP9S4zrCNkmomL1ziQVeZXF3RXbAx7i2rRt3UU5eXDzG9TWZ6Rk1Fyg6pZrAKQCNfLrSne',
                '256': '86gYdT7yqDJUXegizt1vbF3YKz5qSYVaMB61DFBDzrpVEpYgDbmuXJbXE77LQfAygrVGwYpw8hxxx9DRTiyHAemA8B5yBAq'
            }
        }
    }
};


describe('monero subaddress tests', () => {

    test('should generate the right address for account 0 with index 1', async () => {
        const genAddr = subaddress.getSubaddress(privViewKeyHex, pubSpendKeyHex, 0, 1);
        expect(genAddr).toEqual(subs.account['0'].index['1']);
    });

    test('should generate the right address for account 0 with index 256', async () => {
        const genAddr = subaddress.getSubaddress(privViewKeyHex, pubSpendKeyHex, 0, 256);
        expect(genAddr).toEqual(subs.account['0'].index['256']);
    });

    test('should generate the right address for account 256 with index 1', async () => {
        const genAddr = subaddress.getSubaddress(privViewKeyHex, pubSpendKeyHex, 256, 1);
        expect(genAddr).toEqual(subs.account['256'].index['1']);
    });

    test('should generate the right address for account 256 with index 256', async () => {
        const genAddr = subaddress.getSubaddress(privViewKeyHex, pubSpendKeyHex, 256, 256);
        expect(genAddr).toEqual(subs.account['256'].index['256']);
    });
});