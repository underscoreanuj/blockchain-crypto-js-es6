# blockchain-cryptocurrency

This is a primitive aproach towards the development of a blockchain based model of a cryptocurrency.
Made in JavaScript(ES6).
The Code is well documented within the comments so as to help understand what is it that a given line of code does.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them

```
Node.js
```
go to : https://nodejs.org/en/download/

```
Postman
```
go to : https://www.getpostman.com/apps

### Installing

A step by step series of examples that tell you have to get the app running

Download the project

```
Download the project from github and put it inside a folder
```

Open the project

```
Install the required npm packages as per the package.json by using -> $ npm-install-all
```

Run the project

```
First run -> $ npm run test
This makes sure all things are working properly.
Now,
    To span multiple peers do the following :-
    1.  First peer (open terminal in the project folder)      -> npm run dev
        (Listening for peer-to-peer connections on: 5001
         listening on port 3001)
    2.  Second peer (open new terminal in the project folder)  -> HTTP_PORT=3002 P2P_PORT=5002 PEERS=ws://localhost:5001 npm run dev
        (Listening for peer-to-peer connections on: 5002
          listening on port 3002
          socket connected)
    3.  Third peer (open new terminal in the project folder)  -> HTTP_PORT=3003 P2P_PORT=5003 PEERS=ws://localhost:5001,ws://localhost:5002 npm run dev
        (Listening for peer-to-peer connections on: 5003
          listening on port 3003
          socket connected)
          
    In the same you can connect multiple peers to the network.
    
```

## Running the tests

  Once up and running you can use Postman to send GET and POST requests as follows :-
  1.  GET - localhost:3002/public-key       
  	(gets the public key of 3002 which serves as its wallet address)
      	*result -> 
```	
      {
        "public_key": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
      }
```      
  2.  POST -  localhost:3002/transact       
  	(with the given transaction amount send it to 3002's wallet)
       *with a raw json as follows
```      
       {
	        "recipient": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56",
	        "amount": "30"
        }
```
        
        *result ->   (I sent 2 times)
	
```	
        [
             {
               "id": "b40ce900-a1ce-11e8-b0ea-054e3fe31919",
               "input": {
                    "timestamp": 1534476981067,
                    "amount": 500,
                    "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56",
                    "signature": {
                        "r": "ec6a44850fb03310325dae481a22706f64a7c2e6ac50039d49e7f3825ba824ff",
                        "s": "48c2a8e3bb6694f09f23abdc361f041cb59f226bf3954415414f3f619d164bd3",
                        "recoveryParam": 0
                    }
               },
                "outputs": [
                    {
                       "amount": 440,
                       "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                   },
                    {
                        "amount": "30",
                        "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                   },
                   {
                       "amount": "30",
                       "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                    }
                ]
            }
        ]
```	
        
  3.  GET - localhost:3001/transactions         (Fetches the transaction pool)
      result ->
```      
      [
            {
                "id": "b40ce900-a1ce-11e8-b0ea-054e3fe31919",
                "input": {
                    "timestamp": 1534476981067,
                    "amount": 500,
                    "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56",
                    "signature": {
                        "r": "ec6a44850fb03310325dae481a22706f64a7c2e6ac50039d49e7f3825ba824ff",
                        "s": "48c2a8e3bb6694f09f23abdc361f041cb59f226bf3954415414f3f619d164bd3",
                        "recoveryParam": 0
                    }
                },
                "outputs": [
                    {
                        "amount": 440,
                        "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                    },
                    {
                        "amount": "30",
                        "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                    },
                    {
                        "amount": "30",
                        "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                    }
                ]
            }
        ]
```	

  4.  GET - localhost:3001/mine-transactions         (Mines the transactions in the transaction pool; if verified adds them to the blockchain)  
      result ->
```      
      [
            {
                "timestamp": "Genesis time",
                "last_hash": "------",
                "hash": "f1r57-h45h",
                "data": [],
                "nonce": 0,
                "difficulty": 3
            },
            {
                "timestamp": 1534477223911,
                "last_hash": "f1r57-h45h",
                "hash": "0013013861b76793df73991503fa26bcaabe535f13f8c3e2bc58556c0f2b8418",
                "data": [
                    {
                        "id": "b40ce900-a1ce-11e8-b0ea-054e3fe31919",
                        "input": {
                            "timestamp": 1534476981067,
                            "amount": 500,
                            "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56",
                            "signature": {
                                "r": "ec6a44850fb03310325dae481a22706f64a7c2e6ac50039d49e7f3825ba824ff",
                                "s": "48c2a8e3bb6694f09f23abdc361f041cb59f226bf3954415414f3f619d164bd3",
                                "recoveryParam": 0
                            }
                        },
                        "outputs": [
                            {
                                "amount": 440,
                                "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                            },
                            {
                                "amount": "30",
                                "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                            },
                            {
                                "amount": "30",
                                "address": "0421f258e4a366028e1500fe972555f269b61d261fa71e96f554412768fa497a42b6e77dcf67b240e9c3da426129c44b20ce6785787e4529856270b7d42d9ced56"
                            }
                        ]
                    },
                    {
                        "id": "45f77e70-a1cf-11e8-bcca-51cc72624383",
                        "input": {
                            "timestamp": 1534477223895,
                            "amount": 500,
                            "address": "045a6bb0294ffcb87fda5c70758cd2ae1eaea7dc84ff6d2465c46db592dd66431530c6525523ab981beeeba788fcc532475fa8a2f135039d74af409d75595c8ce7",
                            "signature": {
                                "r": "f2830224d43c03a3b7512d0f02d5b5daacb7e9fea9008fc9b69fc2dfa1076c79",
                                "s": "2c43a89585046c4af88779701458fe6920a01425b96368f615b4f665bfb1e724",
                                "recoveryParam": 1
                            }
                        },
                        "outputs": [
                            {
                                "amount": 3,
                                "address": "0420155bce3196f8a5151da7f0b16256d1b07a4c90ff2bbfa8c760cbcc391bd7ba0ddae61b4903d581680db48bcad1a82d20dc0b8d675bea7edc26a43e6a81d8b0"
                            }
                        ]
                    }
                ],
                "nonce": 128,
                "difficulty": 2
            }
        ]
```	
        
## Built With

* [Node.js](https://nodejs.org/) - Development framework
* [Postman](https://www.getpostman.com/) - Testing framework

## Acknowledgments

* Hat tip to anyone who's code was used
* Inspiration
* etc
* email me if any querries : anujsingh9710@gmail.com
