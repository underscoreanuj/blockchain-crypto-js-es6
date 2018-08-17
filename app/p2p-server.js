const Websocket = require('ws');

//we let the user specify the port in command line as P2P_PORT
//5001 serves as a default port if nothing is specified by user in command line
const P2P_PORT = process.env.P2P_PORT || 5001;
//****used as ====>               P2P_PORT=5002 npm run dev

//will check if a peers environment variable is created or not
//if an app is running a P2P server its address will be as follows = ws://localhost:5001
//and another app running running at = ws://localhost:5002
//so at the instant when 2 of these apps are running
//peers = ws://localhost:5001,ws://localhost:5002
//basically all addresses loaded and separated by commas
const peers = process.env.PEERS ? process.env.PEERS.split(',') : [];
//***used as HTTP_PORT=3002 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
//process.env.PEERS.split(',') returns an array of all peer's web socket addresses


//using type fields to differentiate the type of data sent over the sockets (chain, transaction)
const MESSAGE_TYPES = {
  chain: 'CHAIN',
  transaction: 'TRANSACTION',
  clear_transactions: 'CLEAR_TRANSACTIONS'
};

class P2pServer {
  //each peer will have its own blockchain which will be updated commonly
  //each peer will have its own transaction pool which will be updated commonly
  constructor(blockchain, transactionPool) {
    this.blockchain = blockchain;
    this.transactionPool = transactionPool
    this.sockets = [];  //will contain a list of connected web socket servers that end up connecting to this one
  }

  //will do the job of starting up the server
  listen() {
    //we create a web socket server we use the server class from Websocket module
    //it is shared and used statically
    //the params are passed as an object
    const server = new Websocket.Server({port: P2P_PORT});

    //this is an event listener which listens for incomming messages sent to the web socket server
    //second param is a callback which can be used to interact with the socket
    //by listening to connection events we can start up new sockets which are connected
    //                  the socket object is created as a result of interaction with the newly created socket
    server.on('connection', socket => this.connectSocket(socket));//rather than directly executing code we use a helper method

    this.connectToPeers();

    console.log(`Listening for peer-to-peer connections on: ${P2P_PORT}`);
  }

  //to connect later instances of the applications when specified
  connectToPeers() {
    //forEach allows us to run operations on each object in the array individually
    //so for each peer in peers we run a callback function
    peers.forEach(peer => {
      //each peer will be something like ws://localhost:5001
      //using this address we create a new web socket
      const socket = new Websocket(peer); //this will create a socket object
      //the server might not still be on at the peer address
      //so we perform an open event listener
      socket.on('open', () => this.connectSocket(socket));//this way we can run some code even if the server is started later
                                                          //even though we specify it as a peer first
    });
  }

  //appends newly connected sockets to the sockets list
  connectSocket(socket) {
    this.sockets.push(socket);
    console.log('socket connected');

    //handle message events
    this.messageHandler(socket);

    //send the chain to the given socket
    this.sendChain(socket)

  }

  //for handling messages from different sockets
  messageHandler(socket) {
    //an event handler that checks for messages, along with a 2nd param which gets populated by the callback
    socket.on('message', message =>{
      const data = JSON.parse(message); //the stringified JSON into a JS object into data
      //console.log('data', data);

      //switch the respective operations as per the MESSAGE_TYPES
      switch(data.type) {
        case MESSAGE_TYPES.chain:
          //update the associated blockchain
          this.blockchain.replaceChain(data.chain);
          break;

        case MESSAGE_TYPES.transaction:
          //update the associated transaction pool
          this.transactionPool.updateOrAddTransaction(data.transaction);
          break;

        case MESSAGE_TYPES.clear_transactions:
          //clear the transaction pool
          this.transactionPool.clear();
          break;
      }

    });
  }

  //helper function to send chain to the specified socket
  sendChain(socket) {
    //the param for send() is a string message
    //using MESSAGE_TYPES to specify the type of message being sent over the network
    socket.send(JSON.stringify({ type: MESSAGE_TYPES.chain, chain: this.blockchain.chain }));
  }

  //helper function to send transaction to the specified socket
  sendTransaction(socket, transaction) {
    //the param for send() is a string message
    //using MESSAGE_TYPES to specify the type of message being sent over the network
    //                                                            here the ES6 destruction suntax ensures that the transaction is mapped to a key with the same name
    socket.send(JSON.stringify({ type: MESSAGE_TYPES.transaction, transaction }));
  }

  //sends the updated blockchain of this current instance to all socket peers
  //we intend to sync every time a block is mined
  syncChains() {
    //sync all connected sockets
    this.sockets.forEach(socket => this.sendChain(socket));
  }

  //pass the newly created transaction to all other peers for their transaction pool to be updated
  broadcastTransaction(transaction) {
    //pass the new pool to each connected socket
    this.sockets.forEach(socket => this.sendTransaction(socket, transaction));
  }

  //clear the transactions on all connected peers
  broadcastClearTransactions() {
    //pass the clear command to each connected socket
    this.sockets.forEach(socket => socket.send(JSON.stringify({ type: MESSAGE_TYPES.clear_transactions })));
  }

}


module.exports = P2pServer;
