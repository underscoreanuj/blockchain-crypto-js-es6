const TransactionPool = require('./transaction-pool');
const Transaction = require('./transaction');
const Wallet = require('./index');
const Blockchain = require('../blockchain');


//refer to block.test.js to understand what these jest functions do
describe('TransactionPool', () => {
  let tp, wallet, transaction, bc;

  beforeEach(() => {
    tp = new TransactionPool();
    wallet = new Wallet();
    bc = new Blockchain();
    transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
  });

  //tests that the transaction pool adds the transaction to itself
  it('adds a transaction to the pool', () => {
    expect(tp.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
  });

  //tests that the transaction gets updated in the pool
  it('updates a transaction in the pool', () => {
    //kepp a copy of the old transaction to compare updates
    let oldTransaction = JSON.stringify(transaction);
    const newTransaction = transaction.update(wallet, 'n3w-4ddr355', 10);
    tp.updateOrAddTransaction(transaction);
    //now we find the transaction in the updated pool
    //whose id matches the newTransaction id and expect its stringify version to be different than oldTransaction
    expect(JSON.stringify(tp.transactions.find(t => t.id === newTransaction.id)))
    .not.toEqual(oldTransaction);
  });

  //verify that the transaction pool is cleared upon processing
  it('clears transactions', () => {
    tp.clear();
    //expect the transactions array of the pool to be an empty array
    expect(tp.transactions).toEqual([]);
  });

  //verify that valid transactions are filtered from the transaction pool
  describe('mixing valid and corrupt transactions', () => {
    let valid_transactions;

    beforeEach(() => {
      //spreading in the transactions from the pool to create an array of only valid transactions
      //the spread operator (...) takes each element of the transactions onject and adds them to the array
      valid_transactions = [...tp.transactions]

      //if we are at an even number in the loop we corrupt the transaction
      for (let i=0; i<6; i++) {
        //create a new wallet instance to create a new transaction
        wallet = new Wallet();
        transaction = wallet.createTransaction('r4nd-4ddr355', 30, bc, tp);
        //check if i is even, if so we corrupt the transaction
        if (i%2 == 0) {
          transaction.input.amount = 999999;
        } else {
          //since we are not corrupting this transaction add it to the validTransactions array
          valid_transactions.push(transaction);
        }
      }
    });

    //differnetiate between valid and corrupt transactions
    it('shows a difference between valid and corrupt transactions', () => {
      expect(JSON.stringify(tp.transactions)).not.toEqual(JSON.stringify(valid_transactions))
    });

    //makes sure that the validTransactions() method returns a transactions pool equal to the valid_transactions array
    it('grabs valid transactions', () => {
      expect(tp.validTransactions()).toEqual(valid_transactions);
    });

  });

});
