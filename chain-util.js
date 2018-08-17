const EC = require('elliptic').ec;
//.ec is an inner module of elliptic which stands for elliptic cryptography
//the EC const here refers to a class
//whose constructor takes a string as an argument to specify the type of curve based cryptography to use
//***bit-coin secp256k1
//secp256k1 => standards of efficient cryptography, prime, 256 bits, Koblitz(mathematician), 1st implementation
//the version 1 of this module is based upon timestamp
const uuidV1 = require('uuid/v1');
const ec = new EC('secp256k1');
const SHA256 = require('crypto-js/sha256')

class ChainUtil {
  //ec has its own key-pair generator function
  static genKeyPair() {
    return ec.genKeyPair();
    //the genKeyPair() function is valid but is using a dependency brorand (generates random numbers)
    //which assumes and expects us to be running the function in browser context
    //but for testing purpose we will be running the code in node
    //so to fix this, go to the package.json and add this
    //"jest": {
    //  "testEnvironment": "node"
    //},
  }

  //return a unique id for a transaction
  static id() {
    return uuidV1();
  }

  //generates a hash of passed data
  static hash(data) {
    return SHA256(JSON.stringify(data)).toString();
  }

  //verify each transaction input
  //1st param = public_key used for verification
  //2nd param = signature which is to be verified
  //3rd param = dataHash represents the data we intend to find as a result of decrypting the signature using the public key
  static verifySignature(public_key, signature, dataHash) {
    //elliptic (ec) provides a key object which has a verify method
    //which returns true/false
    return ec.keyFromPublic(public_key, 'hex').verify(dataHash, signature);
    //here ec is returning the derived key by using the public_key decoded into hex (since stored as hex encoding)
  }
}


module.exports = ChainUtil;
