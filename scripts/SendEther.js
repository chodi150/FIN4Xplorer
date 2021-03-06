const HDWalletProvider = require('@truffle/hdwallet-provider');
const Tx = require('ethereumjs-tx').Transaction;
const Web3 = require('web3');
const config = require('../src/config/deployment-config.json');

const sendEther = (recipient, amount) => {
	let provider = new HDWalletProvider(config.MNEMONIC, 'http://127.0.0.1:7545');
	let web3 = new Web3(provider);
	let address = web3.currentProvider.addresses[0];
	let privateKey = Buffer.from(config.PRIVATE_KEY_OF_FAUCET_ACCOUNT, 'hex');

	//const abi = require('../src/build/contracts/Fin4DemoFaucet').abi;
	//const contract = new web3.eth.Contract(abi, '0xeAFCB3bad95Fc67385D51d9CD60119F227cc32dE');
	//let data = contract.methods.sendDrip('0xe975aF7AFAAe9E9e8aE7bd31A7FC10bB611Dd88A').encodeABI(); //.sendDrip('0xe975aF7AFAAe9E9e8aE7bd31A7FC10bB611Dd88A').encodeABI();

	web3.eth.getTransactionCount(address).then(count => {
		const rawTransaction = {
			from: address,
			//gasPrice: web3.utils.toHex(10000000000000),
			//gasLimit: web3.utils.toHex(210000),
			gas: 200000,
			to: recipient,
			value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')), //'0x0',
			network_id: 5777,
			//data: data,
			nonce: web3.utils.toHex(count)
		};

		var tx = new Tx(rawTransaction);
		tx.sign(privateKey);

		web3.eth.sendSignedTransaction('0x' + tx.serialize().toString('hex')).on('receipt', receipt => {
			console.log('Sent ' + amount + ' ETH to ' + recipient + ' from ' + address);
			process.exit(0);
		});
	});
};

export { sendEther };

// most helpful were:
// https://github.com/bitdegree/bitdegree-scholarships/blob/3ffbe6221ba69fd5501ecaef06ae2ecef64d8637/add-student.js
// https://medium.com/coinmonks/signing-and-making-transactions-on-ethereum-using-web3-js-1b5663207d63
