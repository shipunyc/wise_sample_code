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


const createWallet = async (userId) => {
  console.log('===Running createWallet===');

  const json = {
    userId: userId
  };

  const jsonSigned = addSignature(json, apiSecret);

  try {
    const text = await rp.post({
      uri: url + '/api/v1/createWallet',
      headers: {
        'X-WISDOM-APIKEY': apiKey
      }
    }).form(jsonSigned);

    console.log(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}

const createTemporaryWallet = async (userId, duration, notificationUrl, reference) => {
  console.log('===Running createTemporaryWallet===');

  const json = {
    userId: userId,
    duration: duration,
    notificationUrl: notificationUrl,
    reference: reference
  };

  const jsonSigned = addSignature(json, apiSecret);

  try {
    const text = await rp.post({
      uri: url + '/api/v1/createTemporaryWallet',
      headers: {
        'X-WISDOM-APIKEY': apiKey
      }
    }).form(jsonSigned);

    console.log(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}

const getWalletInfo = async (userId) => {
  console.log('===Running getWalletInfo===');

  const query = 'userId=' + userId + '&symbol=WISDOM';

  const querySigned = addSignature(query, apiSecret);

  try {
    const text = await rp.get({
      uri: url + '/api/v1/getWalletInfo?' + querySigned,
      headers: {
        'X-WISDOM-APIKEY': apiKey
      }
    });

    console.log(text);

    return JSON.parse(text);
  } catch (e) {
    console.log(e.statusCode, e.error);
  }
}




const run = async() => {
  await createWallet('a1');
  await createWallet('a2');
  await createTemporaryWallet('a1', 300, 'http://localhost', 'reference1');
  await createTemporaryWallet('a2', 360, 'http://localhost', 'reference2');
  await getWalletInfo('a1');
  await getWalletInfo('a2');

  console.log('Before running step 2, please manually deposit 1000 WISDOM to wallet a1.');
}


run();
