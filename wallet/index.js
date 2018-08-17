const ChainUtil = require('../chain-util');
const Transaction = require('./transaction');
const { INITIAL_BALANCE } = require('../config');

class Wallet {
  constructor() {
    this.balance = INITIAL_BALANCE;
    this.key_pair = ChainUtil.genKeyPair();
    //this.key_pair will have a function to return the public key separately
    this.public_key = this.key_pair.getPublic().encode('hex');
    //we encode the 256 bit key to shorten its length
  }

  toString() {
    return `Wallet
            Public Key  : ${this.public_key.toString()}
            Balance     : ${this.balance}`
  }

  //takes a hash representation of some data and return a signed value associated with the wallets key-pair
  //the reason of using hashed data is to fix a possibly large object within a specific number of bits
  sign(dataHash) {
    return this.key_pair.sign(dataHash);
  }
  //will do the job of generating new transactions based on a given recipient address and amount
  //it will also check if a transaction from this wallet already exists within a given transaction pool
  //if so it will update that in the incoming transaction pool object
  createTransaction(recipient, amount, blockchain, transactionPool) {
    //calculate the wallet's current balance
    this.balance = this.calculateBalance(blockchain);

    //check if the amount exceeds the wallet's current balance
    if (amount > this.balance) {
      console.log(`Amount: ${amount} exceeds the current balance: ${this.balance}`);
      return;
    }
    //check if a transaction of the given wallet already exists in the wallet
    //existingTransaction returns a transaction based upon a given public_key address if it exists in the pool
    let transaction = transactionPool.existingTransaction(this.public_key);

    //if transaction already exists in the pool
    if (transaction) {
      transaction.update(this, recipient, amount);
    } else {
      //if the transaction does not exist
      transaction = Transaction.newTransaction(this, recipient, amount);
    }
    //update the transaction pool accordingly
    transactionPool.updateOrAddTransaction(transaction);

    return transaction;
  }

  //calculate balance of the user's wallet
  calculateBalance(blockchain) {
    //initialise a balance variable with the wallet's current balance
    let balance = this.balance;

    //next we look at each transaction object that is contained within each of the blocks on the blockchain
    //we bascially extract all the transactions from the blocks in an array
    let transactions = [];

    //iterate over the chain for each block which contain a list of transactions
    //iterate over each block for each transaction within the block
    blockchain.chain.forEach(block => block.data.forEach(transaction => {
      transactions.push(transaction);
    }));

    //remember that the goal is to only sum up the amounts addressed to the wallet after it's most recent transaction
    //so we are interested into having the list of transactions created by this wallet
    //hence we create an array of transactions whose input was created by this wallet
    //here we filter the array of all transactions to get the required array
    const walletInputTransactions = transactions.filter(transaction => transaction.input.address === this.public_key);

    //to monitor the output transactions that occur after the most recent input transaction
    let startTime = 0;
    //the reason we initialise it with zero (if no input transaction is found we intend to look through all the transactions available whose timestamp > 0)

    //we are mainly interested in the most recent transaction this wallet created
    //to find the recent input transaction we use the reduce() function which will reduce an array based of the min & max condition provided
    //the condition in this case will continously reduce the array to collections of objects or one object
    //with the highest value of timestamp (using a ternary expression (?) )
    //the reduce will iterate the array two elements at a time
    //***we cannot reduce an array if it is empty
    if (walletInputTransactions.length > 0) {
      //this will eventually give us the most recent input transaction
      const recentInputTransaction = walletInputTransactions.reduce(
        (prev, current) => prev.input.timestamp > current.input.timestamp ? prev : current
      );
      //update the balance as per the recent input transactions
      balance = recentInputTransaction.outputs.find(output => output.address === this.public_key).amount;
      //update the startTime to the timestamp of the most recent input transaction
      startTime = recentInputTransaction.input.timestamp;
    }

    //every following output amount following the above input transaction will be added to the wallet's balance
    transactions.forEach(transaction => {
      //we only intend to calculate the balance from the transactions that occured after the startTime
      if (transaction.input.timestamp > startTime) {
        transaction.outputs.find(output => {
          //if the output is dedicated to this wallet
          if (output.address === this.public_key) {
            //add output amount to the wallet's balance
            balance += output.amount;
          }
        });
      }
    });

    //return the newly calculated balance
    return balance;
  }

  //this wallet is used to transact reward points
  static blockchainWallet() {
    const blockchainWallet = new this();
    blockchainWallet.address = 'blockchain-wallet';   //to uniquely identify the blockchain wallet
    return blockchainWallet;
  }

}

module.exports = Wallet;
