const Block = require('./block');

class Blockchain {
  constructor() {
    //adding the genesis block as the starting block of the blockchain
    this.chain = [Block.genesis()];
  }

  addBlock(data) {
    //this.chain[this.chain.length - 1] = last block in the chain
    const block = Block.mineBlock(this.chain[this.chain.length - 1], data);
    this.chain.push(block);

    return block;
  }

//helps in testing and validation of incoming chains
//which is an important feature for supporting multiple simultaneous contributions
  isChainValid(chain) {
    //in javascript 2 different objects which are not referencing the original object are not equal
    //even if they have the same elements
    //hence we stringify them to compare

    //test if the given chain starts with the same genesis block
    if (JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

    //next we run validations on every element of the chain
    for (let i=1; i<chain.length; i++) {
      const block = chain[i];
      const last_block = chain[i-1];    //starting from the genesis block

      //validates that each block is pointed by its proper predecessor block
      //also velidates that the data isn't tampered
      //by comparing its hash value with its own hash for the block
      if (block.last_hash !== last_block.hash || block.hash !== Block.blockHash(block)) return false;
    }
    return true;
  }

//replace the current with the given chain provided it is valid
  replaceChain(new_chain) {

    //as per the longer-chain rule before validating a chain
    //we first validate that its length is larger than the current chain
    //the longest chain by rule will have the most valid blocks
    //which also fixes the problem of any previous forking issues
    if (new_chain.length <= this.chain.length) {
      console.log('Received chain is not longer the given chain.');
      return;
    } else if (!this.isChainValid(new_chain)) {
      console.log('Invalid chain received');
      return;
    }

    //if control flow reaches till here we indeed have received a valid chain
    //hence we replace the current chain with the new_chain
    console.log('replacing existing chain with the new chain');
    this.chain = new_chain;

  }

}

module.exports = Blockchain;
