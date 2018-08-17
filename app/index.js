const express = require('express');
const bodyParser = require('body-parser');
const Blockchain = require('../blockchain');  //fetches the index.js by default
const P2pServer = require('./p2p-server');
const Wallet = require('../wallet');          //fetches the index.js by default
const TransactionPool = require('../wallet/transaction-pool');
const Miner = require('./miner');

//if we run multiple instances of the application on the same computer
//we cannot use the same port number
//hence we let the user specify the port in command line as HTTP_PORT
//3001 serves as a default port if nothing is specified by user in command line
const HTTP_PORT = process.env.HTTP_PORT || 3001;
//****used as ====>               HTTP_PORT=3002 npm run dev

const app = express();    //creates an express application
const bc = new Blockchain();
const wallet = new Wallet();
const tp = new TransactionPool();
const p2pServer = new P2pServer(bc, tp);
const miner = new Miner(bc, tp, wallet, p2pServer);

//bodyParser.json() acts as a middleware method which allows us to receive json in post requests
app.use(bodyParser.json());

//get request
//1st param = endpoint (which starts with /)
//2nd param = arrow function with 2 params
//            (req, res) request, response
//            these objects are automatically filled in by express
app.get('/blocks', (req, res) => {
  //send the blockchain's chain in response
  res.json(bc.chain);
});

app.post('/mine', (req, res) => {
  //when user makes a post request bodyParser converts the data into req.body object
  //which can be used as data for the blocks
  const block = bc.addBlock(req.body.data);   //***assuming that in the json body there will be a data field
  //to confirm a successful post request
  console.log(`new block added: ${block.toString()}`);  //we use ES6 template string

  //we intend to sync all blockchains every time a block is mined
  p2pServer.syncChains();

  //to send back a confirmation about the post request along with current blockchain stats
  res.redirect('/blocks');
});

//returns the transaction pool
app.get('/transactions', (req, res) => {
  res.json(tp.transactions);
});

//handles adding transactions to the pool
app.post('/transact', (req, res) => {
  //use ES6 destruction syntax to extract the passed recipient address and amount from the request body
  const { recipient, amount } = req.body;
  //create a transaction using the local wallet instance along with the transaction pool
  const transaction = wallet.createTransaction(recipient, amount, bc, tp);
  //give the output of the transaction endpoint so the user can immediately see the newly processed transaction in the transaction pool

  //broadcast the newly created transaction to all other peers for their transaction pool to be updated
  p2pServer.broadcastTransaction(transaction);

  res.redirect('/transactions');
});

//handles mining of new transaction blocks
app.get('/mine-transactions', (req, res) => {
  const block = miner.mine();   //get the mined block, mined from the tansactions pool
  console.log(`New Block added : ${block.toString()}`);

  //for the user to see the added block along with the whole history of blocks in the blockchain
  res.redirect('/blocks');
});

//handles sharing of the public_key of the transaction wallet
app.get('/public-key', (req, res) => {
  //allows users to see thier public_key which they can share with others
  res.json({ public_key: wallet.public_key });
});

//to ensure the app is running
//1st param = port number to listen for requests
//2nd param (optional callback function) = arrow function to log a message once the server is running
app.listen(HTTP_PORT, () => console.log(`listening on port ${HTTP_PORT}`));   //we used ES6 template string here
p2pServer.listen();
