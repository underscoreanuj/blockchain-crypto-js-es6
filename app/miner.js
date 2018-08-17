const Wallet = require('../wallet');
const Transaction = require('../wallet/transaction');

//final amalgamation of the entire functional units of the projet
class Miner {
  constructor(blockchain, transactionPool, wallet, p2pServer) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool;
    this.wallet = wallet;
    this.p2pServer = p2pServer;
  }

  //the most crucial part of the mining functionality
  //grabs transactions from the pool
  //then creates a block of those transactions
  //then tells the peer-to-peer server to sync the chains
  //clears the confirmed transactions from the transaction pool
  mine() {
    //get the valid transactions from the transaction pool
    const valid_transactions = this.transactionPool.validTransactions();
    //console.log(valid_transactions);

    //include a reward for the miner
    valid_transactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));

    //create a block consisting of the valid transactions
    const block = this.blockchain.addBlock(valid_transactions);

    //sync chains in the peer-to-peer server
    this.p2pServer.syncChains();

    //clear the transaction pool
    this.transactionPool.clear();

    //broadcast to every miner to clear their transaction pools
    this.p2pServer.broadcastClearTransactions();

    //we want other classes should be able to access the generated block from this transaction
    return block;
  }
}

module.exports = Miner;
