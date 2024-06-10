const { Web3 } = require('web3');
const cron = require('node-cron');
const express = require('express');
const app = express();

const EthProvider = new Web3("https://mainnet.infura.io/v3/82168e75bee546c08eff6a5eeb1b2e5d");
const LayerEdgeProvider = new Web3("https://testnet-rpc.layeredge.io");
const FaucetAddress = '0xB50bC4F2a213e0DEa9D7B44bCBb5acF921c8A1a1';
const PrivateKey = '9c8eb6b23de894cd1e01f8ef2718d6ea2f3d7dfa9393719c64194e04d800f22c';

const gasLimit = 21000000; 
const gasPrice = LayerEdgeProvider.utils.toWei('20', 'gwei');
const value = LayerEdgeProvider.utils.toWei('0.0001', 'ether');

app.get('/', (req, res) => {
    res.send('Hello World');
})


app.get('/start', async(req, res) => {
    try {
        res.json({ message: 'started' });
        await runTask();
        res.json({ message: 'completed' });
    }
    catch (error) {
        console.error("Error executing task:", error);
        res.json({ message: 'failed' });
    }
});

const runTask = async () => {
    try {
        const latestBlockNumber = await EthProvider.eth.getBlockNumber();
        const latestBlockTransaction = (await EthProvider.eth.getBlock(latestBlockNumber)).transactions;
        for (let i = 0; i < latestBlockTransaction.length; i++) {
            console.log("Transaction Number: " + i);
            const address = (await EthProvider.eth.getTransaction(latestBlockTransaction[i])).from;
            const tx = {
                from: FaucetAddress,
                to: address,
                value: value,
                gas: gasLimit,
                gasPrice: gasPrice,
            };

            const signedTx = await LayerEdgeProvider.eth.accounts.signTransaction(tx, PrivateKey);
            const txReceipt = await LayerEdgeProvider.eth.sendSignedTransaction(signedTx.rawTransaction);
            console.log(txReceipt.transactionHash);
        }
    } catch (error) {
        console.error("Error executing task:", error);
    }
};

app.listen(3000, () => {
  console.log('Server is running on port 3000');
    });
