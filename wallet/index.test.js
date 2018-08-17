const Wallet = require('./index');
const TransactionPool = require('./transaction-pool');
const Blockchain = require('../blockchain');
const { INITIAL_BALANCE } = require('../config');

//goal of these tests is to check if the create transaction method
//adds and updates transactions too in the transaction pool

//refer to block.test.js to understand what these jest functions do
describe('Wallet', () => {
  let wallet, tp, bc;

  beforeEach(() => {
    wallet = new Wallet();
    tp = new TransactionPool();
    bc = new Blockchain();
  });

  describe('creating a transaction', () => {
    let transaction, sendAmount, recipient;

    beforeEach(() => {
      sendAmount = 50;
      recipient = 'r4and0m-4ddr355';
      transaction = wallet.createTransaction(recipient, sendAmount, bc, tp);
    });

    describe('and doing the same transaction', () => {
      beforeEach(() => {
        //repeating the same transaction again
        wallet.createTransaction(recipient, sendAmount, bc, tp);
      });

      //expect that the send amount is doubled and subtracted from the wallet
      it('doubles the `sendAmount` subtracted from the wallet balance', () => {
        expect(transaction.outputs.find(output => output.address === wallet.public_key).amount)
        .toEqual(wallet.balance - sendAmount*2);
      });

      //expect that the sendAmount output object is created twice
      it('clones the `sendAmount` output for the recipient', () => {
        //filter here creates a new array of elements from given array that fall under a given criteria
        //map returns an array by performing the specified operation on each element
        //here we filter the transaction outputs that match the recipient and map them into an array of those amounts of transactions
        expect(transaction.outputs.filter(output => output.address === recipient)
        .map(output => output.amount)).toEqual([sendAmount, sendAmount]);
      });

    });

  });

  //tests for the calculateBalance() function
  describe('calculating balance', () => {
    let addBalance, repeatAdd, senderWallet;

    beforeEach(() => {
      senderWallet = new Wallet();
      addBalance = 100;
      repeatAdd = 3;
      //ensure addBalance*repeatAdd <= wallet's starting balance = 500

      //perform multiple transactions
      for(let i=0; i<repeatAdd; i++) {
        senderWallet.createTransaction(wallet.public_key, addBalance, bc, tp);
      }

      //for the calculateBalance() to work it will need a blockchain consisting of these transactions
      //so we create a block that consists of the transactions in the transactionPool
      bc.addBlock(tp.transactions)
    });

    //test that the balance corresponing the recipient's wallet is calculated properly
    it('calculates the balance for the blockchain transactions matching the recipient', () => {
      expect(wallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE + (addBalance*repeatAdd));
    });

    //test that the balance corresponing the sender's wallet is calculated properly
    it('calculates the balance for the blockchain transactions matching the sender', () => {
      expect(senderWallet.calculateBalance(bc)).toEqual(INITIAL_BALANCE - (addBalance*repeatAdd));
    });

    //tests for a more complex scenario where the recipient now conducts a transaction
    describe('and the recipient conducts a transaction', () => {
      let subtractBalance, recipientBalance;

      beforeEach(() => {
        //the goal is to add a set of transactions to the blockchain by the recipient this time
        //so we clear the transaction pool of previous transactions since they are alrady included into the blockchain
        tp.clear();
        subtractBalance = 60;
        recipientBalance = wallet.calculateBalance(bc);
        //this time the recipient wallet sends currency to the sender wallet
        wallet.createTransaction(senderWallet.public_key, subtractBalance, bc, tp);
        //now add a block to the blockchain containing the newly performed transactions
        bc.addBlock(tp.transactions);
      });

      //now we test the calculateBalance() when the sender performs another transaction
      describe('and the sender sends another transaction to the recipient', () => {
        beforeEach(() => {
          //clear the transaction pool for removing old processed transactions already added to the blockchain
          tp.clear();
          //create another transaction from the sender's wallet
          senderWallet.createTransaction(wallet.public_key, addBalance, bc, tp);
          bc.addBlock(tp.transactions);
        });

        //verify the recipient's balance
        it('calculates the recipient balance but only using transactions since its most recent one', () => {
          expect(wallet.calculateBalance(bc)).toEqual(recipientBalance - subtractBalance + addBalance);
        });

      });

    });

  });
});
