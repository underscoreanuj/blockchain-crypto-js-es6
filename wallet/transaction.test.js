const Transaction = require('./transaction');
const Wallet = require('./index')
const{ MINING_REWARD } = require('../config');

//refer to block.test.js to understand what these jest functions do
describe('Transaction', () => {
  let transaction, wallet, recipient, amount;

  beforeEach(() => {
    wallet = new Wallet();
    amount = 50;
    recipient = 'r3c1p13nt';
    transaction = Transaction.newTransaction(wallet, recipient, amount);
  });

  it('outputs the `amount` subtracted from the wallet balance', () => {
    //here we use the find() method which returns the first element that passes
    //the condition (***first*** output object that matches the wallet's public_key)
    //outputs here is an array that holds data for various transactions in a wallet
    expect(transaction.outputs.find(output => output.address === wallet.public_key).amount)
    .toEqual(wallet.balance - amount);
  });

  it('outputs the `amount` added to the recipient', () => {
    //basically checks that the amount received by the recipient is equal to the transaction amount
    expect(transaction.outputs.find(output => output.address === recipient).amount)
    .toEqual(amount);
  });

  //makes sure the input object within the transaction has an amount which matches the balance of the wallet
  it('inputs the balance of the wallet', () => {
    expect(transaction.input.amount).toEqual(wallet.balance);
  });

  //validates a valid transaction by using the verifyTransaction method
  it('validates a valid transaction', () => {
    expect(Transaction.verifyTransaction(transaction)).toBe(true);
  });

  //invalidates a corrupt transaction
  it('invalidates a corrupt transaction', () => {
    //intentionally corrupting the transaction
    transaction.outputs[0].amount = 50000;
    expect(Transaction.verifyTransaction(transaction)).toBe(false);
  });

  describe('transacting an amount more than the wallet balance', () => {
    beforeEach(() => {
      amount = 50000;
      transaction = Transaction.newTransaction(wallet, recipient, amount);
    });

    it('does not process the transaction', () => {
      //since the transaction is not processed in this case we expect the transaction variable to be undefined
      expect(transaction).toEqual(undefined);
    });

  });
  //run tests for a newly updated transaction
  describe('updating a transaction', () => {
    let nextAmount, nextRecipient;

    beforeEach(() => {
      nextAmount = 20;
      nextRecipient = 'n3x1-4ddr355';
      transaction = transaction.update(wallet, nextRecipient, nextAmount);
    });

    //checks whether the nextAmount is also subtracted from the sender's wallet
    //notice the use of ES6 template string here allows us to use ' within the statements
    it(`subtracts the next amount from the sender's wallet`, () => {
      expect(transaction.outputs.find(output => output.address === wallet.public_key).amount)
      .toEqual(wallet.balance - amount - nextAmount);
    });

    //checks that a new outputs is created for an updated transaction
    //such that the outputs which matches the next recipient also matches the next amount
    it('outputs an amount for the next recipient', () => {
      expect(transaction.outputs.find(output => output.address === nextRecipient).amount)
      .toEqual(nextAmount);
    });

  });

  //test reward transactions
  describe('creating a reward transaction', () => {
    beforeEach(() => {
      transaction = Transaction.rewardTransaction(wallet, Wallet.blockchainWallet());
    });

    //checks if the reward is generate for the miner's wallet
    //notice the use of ES6 template string to facilitate easy use of '
    it(`reward the miner's wallet`, () => {
      //expects the reward transaction generated has a value equal to the MINING_REWARD
      expect(transaction.outputs.find(output => output.address  === wallet.public_key).amount)
      .toEqual(MINING_REWARD);
    });
  });

});
