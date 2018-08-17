const ChainUtil = require('../chain-util');

//we use the ES6 destruction syntax to grab the object shared in config.js
const { DIFFICULTY, MINE_RATE } = require('../config');

class Block {
  //the nonce value is used in computing the hash value with as many leading zeros as the DIFFICULTY
  //the difficulty param is used to monitor and manipulate the MINE_RATE
  constructor(timestamp, last_hash, hash, data, nonce, difficulty) {
    this.timestamp = timestamp;
    this.last_hash = last_hash;
    this.hash = hash;
    this.data = data;
    this.nonce = nonce;
    //the difficulty is calculated as per the MINE_RATE but we use the default value for the first block
    this.difficulty = difficulty || DIFFICULTY;
  }

//for the prpose of debugging
  toString() {
    //printing data using ES6 template string
    return `Block -
            Timestamp   : ${this.timestamp}
            Last Hash   : ${this.last_hash.substring(0, 10)}
            Hash        : ${this.hash.substring(0, 10)}
            Nonce       : ${this.nonce}
            Difficulty  : ${this.difficulty}
            Data        : ${this.data}`;
  }

//a static identifier allows a common function to all instances of class
//      such that we can simply call them using the class name
//      (calling a static function from an object causes a crash)

//for creation of the genesis block
//(the very first block with no predecessor which acts as a predecessor for the first block)
  static genesis() {
    //                                              the default nonce value = 0
    return new this('Genesis time', '------', 'f1r57-h45h', [], 0, DIFFICULTY);
  }

  static mineBlock(last_block, data) {

    const last_hash = last_block.hash;

    //since the difficulty of the last block is used as a reference for the current block's difficulty
    //we use ES6 destruction syntax to declare a local difficulty variable
    //that is assigned to the difficulty key variable in the last_block
    let { difficulty } = last_block;

    //we intend the hash value to have the same number of leading zeros as the DIFFICULTY
    //hence we run a loop incrementing nonce value untill the required type of hash is produced
    let timestamp, hash, nonce = 0;
    do {
      nonce++;
      timestamp = Date.now();     //returns the number of milliseconds that have passed since 1 Jan 1970
      difficulty = Block.adjustDifficulty(last_block, timestamp);
      hash = Block.hash(timestamp, last_hash, data, nonce, difficulty);
    } while (hash.substring(0, difficulty) !== '0'.repeat(difficulty));

    return new this(timestamp, last_hash, hash, data, nonce, difficulty);
  }

//SHA-256 (Secure-Hash-Algorithm 256 bits of hash(32-byte))
//one way function (can-not be inverted to get the hashed value)

  static hash(timestamp, last_hash, data, nonce, difficulty) {
    return ChainUtil.hash(`${timestamp}${last_hash}${data}${nonce}${difficulty}`).toString();   //combining all data using ES6 template string
                                                  //the toString is used since SHA256 returns an object
                                                  //this toString is from core.js of the crypto-js directory
  }

//we use this function for chain validation in blockchain.js isChainValid
  static blockHash(block) {
    //using ES6 destruction variable to assign the respective values inside the block object
    const {timestamp, last_hash, data, nonce, difficulty} = block;
    return Block.hash(timestamp, last_hash, data, nonce, difficulty);
  }

//we use this to adjust the difficulty for controlling the MINE_RATE
  static adjustDifficulty(last_block, timestamp) {
    let { difficulty } = last_block;

    //console.log(last_block.timestamp+MINE_RATE);
    //changes the difficulty based of the block that was mined before it along with the current timestamp
    //                                                 if      mined quickly : mined slowly
    difficulty = last_block.timestamp + MINE_RATE > timestamp ? difficulty+1 : difficulty-1;
    //console.log(difficulty);

    return difficulty;
  }

}

module.exports = Block;
