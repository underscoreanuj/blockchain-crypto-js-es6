const ChainUtil = require('../chain-util');
const { MINING_REWARD } = require('../config');   //using ES6 destruction syntax to grab the MINING_REWARD

class Transaction {
  constructor() {
    //unique id for a transaction
    this.id = ChainUtil.id();
    this.input = null;
    //contains details about the amount and destination of transaction
    //another output is a transaction to self which determines the remaining amount of balance
    this.outputs = [];
  }

  //facilitates simultaneous transactions to different address in a single go
  update(senderWallet, recipient, amount) {
    //find a previously generated output of a transaction
    const senderOutput = this.outputs.find(output => output.address === senderWallet.public_key);

    //check for balance underflow
    //senderOutput.amount = current wallet balance
    if (amount > senderOutput.amount) {
      console.log(`Amount : ${amount} exceeds the balance.`);   //ES6 template string
      return;
    }

    //update the current wallet balance
    senderOutput.amount = senderOutput.amount - amount;
    //update the optputs array
    this.outputs.push({ amount, address: recipient });
    //since the optputs array is changed the original signature is not valid any more
    //so we need to update the signature
    Transaction.signTransaction(this, senderWallet);

    //return the newly updated transaction instance
    return this;

  }

  //helper function to process transaction either general/reward
  static transactionWithOutputs(senderWallet, outputs) {
    const transaction = new this();
    //push the spread elements of the outputs
    transaction.outputs.push(...outputs);
    //sign the transaction after the output is created
    Transaction.signTransaction(transaction, senderWallet);

    return transaction;
  }

  static newTransaction(senderWallet, recipient, amount) {
    //check if amount to send is not more than available balance
    if (amount > senderWallet.balance) {
      //using ES6 template string to log an error message
      console.log(`Amount: ${amount} exceeds your current balance (${senderWallet.balance}).`);
      return;
    }

    //process the transaction using the helper function
    return Transaction.transactionWithOutputs(senderWallet,
      [{ amount: senderWallet.balance - amount, address: senderWallet.public_key },
      { amount, address: recipient }]);
  }

  //transact reward currency to the miner's wallet from the blockchain wallet
  static rewardTransaction(minerWallet, blockchainWallet) {
    return Transaction.transactionWithOutputs(blockchainWallet,
    [{ amount: MINING_REWARD, address: minerWallet.public_key }]);
    //                        address: to whom the reward is going to
  }


  //generates the input object for a transaction
  //1st param = transaction object to create the input for
  //2nd param = senderWallet which will have the public_key along with the signing ability to generate the sign
  static signTransaction(transaction, senderWallet) {
    transaction.input = {
      timestamp: Date.now(),
      amount: senderWallet.balance,
      address: senderWallet.public_key,
      signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
    }
  }

  //verifies transaction by validating the signature against the dataHash as per the public_key
  static verifyTransaction(transaction) {
    //1st param = public_key
    //2nd param = signature
    //3rd param = dataHash
    return ChainUtil.verifySignature(
      transaction.input.address,
      transaction.input.signature,
      ChainUtil.hash(transaction.outputs)
    );
  }

}


module.exports = Transaction;
