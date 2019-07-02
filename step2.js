'use strict';
  
require('babel-register')

const crypto = require('crypto');
const rp = require('request-promise-native');

const url = 'http://api.blockchainsolution.co';


const addSignature = (jsonOrQuery, secret) => {
  if (typeof jsonOrQuery === "string") {
    const signature = crypto.createHmac(
      'sha256', secret).update(jsonOrQuery).digest('hex');

    return jsonOrQuery + '&signature=' + signature;
  } else {
    const query = Object.keys(jsonOrQuery).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(jsonOrQuery[key]);
    }).join('&');

    jsonOrQuery['signature'] = crypto.createHmac(
        'sha256', secret).update(query).digest('hex');

    return jsonOrQuery;
  }
};


const apiKey = 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A';
const apiSecret = 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j';


const transferBalance = async (fromUserId, toUserId, amount) => {
  console.log('===Running transferBalance===');

  const json = {
    fromUserId: fromUserId,
    toUserId: toUserId,
    symbol: 'WISE',
    quantity: amount
  };
  
  const jsonSigned = addSignature(json, apiSecret);

  try {
    const text = await rp.post({
      uri: url + '/api/v1/reduceBalance',
      headers: {
        'X-WISE-APIKEY': apiKey
      }
    }).form(jsonSigned);

    console.log(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}


const withdraw = async (fromUserId, toAddress, amount) => {
  console.log('===Running withdraw===');

  const json = {
    userId: fromUserId,
    symbol: 'WISE',
    to: toAddress,
    quantity: amount
  };
  
  const jsonSigned = addSignature(json, apiSecret);

  try {
    const text = await rp.post({
      uri: url + '/api/v1/withdraw',
      headers: {
        'X-WISE-APIKEY': apiKey
      }
    }).form(jsonSigned);

    console.log(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}


const getTransactions = async () => {
  console.log('===Running getTransactions===');

  const query = 'userId=1&symbol=WISE&includeWithdraws=true&includeDeposits=true&includeReduces=true&includeAdds=true&limit=10&offset=0';

  const querySigned = addSignature(query, apiSecret);

  try {
    const text = await rp.get({
      uri: url + '/api/v1/getTransactions?' + querySigned,
      headers: {
        'X-WISE-APIKEY': apiKey
      }
    });

    console.log(text);

    return JSON.parse(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}


const run = async() => {
  await transferBalance(1, 2, 500);
  await withdraw(1, '0x77D3aA05402640487e4be0D31142DE83d45d134B', 200);
  await getTransactions();
}


run();
