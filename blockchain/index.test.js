const Blockchain = require('./index');
const Block = require('./block');

//refer to block.test.js to understand what these jest functions do
describe('Blockchain', () => {

  let block_chain, validation_chain;

  beforeEach(() => {
    //a new Blockchain instance is created before each unit test
    block_chain = new Blockchain();
    validation_chain = new Blockchain();
  });

  it('starts with genesis block', () => {
    expect(block_chain.chain[0]).toEqual(Block.genesis());
  });

  it('adds a new block', () => {
    const data = 'foo';
      block_chain.addBlock(data);
      expect(block_chain.chain[block_chain.chain.length - 1].data).toEqual(data);
  });

  it('validates a valid chain', () => {
    validation_chain.addBlock('foo');
    //toBe is a more conventional method to use for booleans
    expect(block_chain.isChainValid(validation_chain.chain)).toBe(true);
  });

  it('invalidates a chain with a corrupt genesis block', () => {
    validation_chain.chain[0].data = 'Bad Data';
    //we modify the genesis block and expect the validation method to return false
    expect(block_chain.isChainValid(validation_chain.chain)).toBe(false);
  });

  it('invalidates a corrupt chain', () => {
    //since validation_chain is a new Blockchain instance it will have only the genesis block
    validation_chain.addBlock('foo'); //this will be at position 1 in a 0 indexed array of blocks
    //we instantly modify the data yet the hash value still points at the original value 'foo'
    validation_chain.chain[0].data = 'not foo';
    //we corrupt the validation chain and expect the validation method to return false
    expect(block_chain.isChainValid(validation_chain.chain)).toBe(false);
  });
//**************Important**************
//here any changes in validation_chain in one of the it() methods is not reflected back
//hence the method above has no influence to the method below
  it('replaces a chain with a valid chain', () => {
    validation_chain.addBlock('goo');
    block_chain.replaceChain(validation_chain.chain);

    expect(block_chain.chain).toEqual(validation_chain.chain);
  });

  it('does not replace a chain with one with length less than or equal', () => {
    block_chain.addBlock('foo');  //heance length 2 while validation_chain still has length 1 (*)
    block_chain.replaceChain(validation_chain.chain);   //therefore it won't work

    expect(block_chain.chain).not.toEqual(validation_chain.chain);
  });

});
