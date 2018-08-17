const Transaction = require('./transaction');

//the main motive of this class is to craete
//a pool of unconfirmed transactions yet to be mined and added to the blockchain
class TransactionPool {
  constructor() {
    //holds a list of transactions
    this.transactions = [];
  }

  //adds an incoming transaction to the transaction pool
  updateOrAddTransaction(transaction) {
    //since we support the ability to update existing transactions
    //there is a possibility that we may recieve a transaction object that already exists
    //hence we look at the existing pool to find any redundant transaction
    let transactionWithId = this.transactions.find(t => t.id === transaction.id);
    //if no existing transaction exists in the pool transactionWithId will be undefined

    //if the transaction already exists replace the previous transaction with the new one
    if (transactionWithId) {
      this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
    }else {
      //if the transaction received is completely new append it to the transactions pool
      this.transactions.push(transaction);
    }
  }

  //returns a transaction from the pool that was created using the given public_key
  existingTransaction(public_key) {
    //if not found it will return undefined
    return this.transactions.find(t => t.input.address === public_key);
  }

  //return set of valid transactions from the pool which meet the following conditions
  // 1. its total output amount matches the original balance specified in the input amount
  //    i.e. when an individual creates a transaction the amount at the begining in the input should equal how much they sent along with remaining balance in the output
  //         this prevents from people sending themselves more currency than allowed or less currency than expected
  // 2. the signature of every transaction should be verified to ensure that the data has not been corrupted after it was signed by the sender
  validTransactions() {
    //based upon the conditions we filter the transaction pool
    return this.transactions.filter(transaction => {
      const outputTotal = transaction.outputs.reduce((total, output) => {
        return parseInt(total) + parseInt(output.amount);
      }, 0);
      //console.log(outputTotal);

      if (transaction.input.amount !== outputTotal) {
        console.log(`Invalid transaction from ${transaction.input.address}`);
        return;
      }

      if (!Transaction.verifyTransaction(transaction)) {
        console.log(`Invalid signature from ${transaction.input.address}`);
        return;
      }

      return transaction;
    });
  }

  //clear the transaction pool from confirmed transactions
  clear() {
    //set the transactions array to be an empty one
    this.transactions = [];
  }

}

module.exports = TransactionPool;
