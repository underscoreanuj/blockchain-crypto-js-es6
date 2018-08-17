const DIFFICULTY = 3;
const MINE_RATE = 3000; //3 seconds
const INITIAL_BALANCE = 500; //every wallet starts with an initial balance of 500
const MINING_REWARD = 3;   //a minimum value to be rewarded for transaction confirmation

module.exports = { DIFFICULTY, MINE_RATE, INITIAL_BALANCE, MINING_REWARD };  //here we are using the ES6 destruction syntax
                                  //to automatically set a key by name
                                  //and use that value automatically by only writing it once within the object
