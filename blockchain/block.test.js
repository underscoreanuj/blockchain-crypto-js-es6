const Block = require('./block');

//we use a jest function jest to perform testing
//1st param is a description
//2nd param of describe is a callback arrow function which executes the testing procedure
//the function contains a series of test that jest will execute once it finds describe
describe('Block', () => {

//creating variables accessible within the entire describe block
  let data, last_block, block;

//rather than creating an instance for each and every unit test
//we use another special jest function
//allows us to run the same code before each unit test that follow it
  beforeEach(() => {
    data = 'bar';
    last_block = Block.genesis();
    block = Block.mineBlock(last_block, data);
    //***the mining here is done using the genesis block with the timestamp = 'Genesis time'
    //hence mining takes more than 3 secs as a result at the end the the difficulty drops
  });

//for unit testing we use another jest function
//1st param is a description of the test we are execute
//2nd param again is a callback arrow function which performs the test
  it('sets the `data` to match the given input', () => {
    //we use another jest function
    //expect takes an object or any other peice of data as 1st param
    //next we chain methods so as to tell it what we expect it to be
    //we expect our data to match the input
    //hence we chain it with toEqual
    expect(block.data).toEqual(data);
    //so this test expects that the block created has the same data as the input data
  });
            //`data` implies it is a special variable within the string

  it('sets the `last_hash` to match the hash of the last block', () => {
    expect(block.last_hash).toEqual(last_block.hash);
    //here we expect the hash of the last block to be equal to the last_hash of the given block
  });

  //we test that the mining function generates a hash with as many leading zeros as the DIFFICULTY
  it('generates a hash that matches the difficulty constraints', () => {
    expect(block.hash.substring(0, block.difficulty)).toEqual('0'.repeat(block.difficulty));
    //console.log(block.toString());
    //***the mining here is done using the genesis block with the timestamp = 'Genesis time'
    //hence mining takes more than 3 secs as a result at the end the the difficulty drops
    //therefore instead of using the DIFFICULTY const we use the block's difficulty
  });

//validation of the difficulty adjusting method
  it('lowers the difficulty for slowly mined blocks', () => {
    //intentionally adding an extra time of 1 hour to indicate the slow MINE_RATE
    //hence the difficulty is expected to drop by one
    expect(Block.adjustDifficulty(block, block.timestamp + 360000)).toEqual(block.difficulty - 1);
  });

  it('raises the difficulty for quickly mined blocks', () => {
    //here the difficulty is expected to increment by one
    expect(Block.adjustDifficulty(block, block.timestamp + 1)).toEqual(block.difficulty + 1);
  });

});
