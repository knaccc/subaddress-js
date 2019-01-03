# Monero Subaddress javascript utility

This library generates subaddresses.

To use, first find your public spend key and secret view key from your Monero wallet. In the GUI, these are available in the Settings->Seed & Keys area. In the CLI, open your wallet and use the commands `spendkey` and `viewkey` to find the keys.

Monero wallets can have multiple receiving addresses called subaddresses. These are organized into accounts. Each Monero account can have multiple subaddresses.

Subaddresses are unlinkable. This means that it is impossible for someone to look at two of your subaddresses and know that they both are addresses for the same wallet.

The first address of the first account is the same as the main wallet address.

## Example code

The following example will display the second subaddress (subaddress index 1) of the first account (account index 0) in the wallet.

```javascript
const subaddress = require('subaddress');

let publicSpendKeyHex = "c66e9ca904e1a8e7dd2f03f0297089da76eb462b26b8378edd0dfc7940ce9a30";
let privateViewKeyHex = "3d09263424487cbdc78d56e1f411ff1c171f84d756b736a2ced698011278d709";

let addr = subaddress.getSubaddress(privateViewKeyHex, publicSpendKeyHex, 0, 1);
console.log(addr);
```

## NPM package

To run the example code, you must have the node and npm packages installed.

If you are using Ubuntu, type:

```
sudo apt install nodejs npm
npm install subaddress
```

To run the example code, put it into a file called example.js and type:

```
node example.js
```

