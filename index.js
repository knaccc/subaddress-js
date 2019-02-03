const BN = require('bn.js');
const elliptic = require('elliptic');
const keccak = require('keccak');
const Buffer = require('safe-buffer').Buffer;

const ed25519 = new require('elliptic').eddsa('ed25519');

const cnBase58 = (function () {
  var b58 = {};
  var alphabet_str = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  var alphabet = [];
  for (var i = 0; i < alphabet_str.length; i++) {
    alphabet.push(alphabet_str.charCodeAt(i));
  }
  var encoded_block_sizes = [0, 2, 3, 5, 6, 7, 9, 10, 11];
  var alphabet_size = alphabet.length;
  var full_block_size = 8;
  var full_encoded_block_size = 11;

  function hextobin(hex) {
    if (hex.length % 2 !== 0) throw "Hex string has invalid length!";
    var res = new Uint8Array(hex.length / 2);
    for (var i = 0; i < hex.length / 2; ++i) {
      res[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return res;
  }

  function bintostr(bin) {
    var out = [];
    for (var i = 0; i < bin.length; i++) {
      out.push(String.fromCharCode(bin[i]));
    }
    return out.join("");
  }

  function uint8_be_to_64(data) {
    if (data.length < 1 || data.length > 8) {
      throw "Invalid input length";
    }
    var res = new BN(0);
    var twopow8 = new BN(2).pow(new BN(8));
    var i = 0;
    switch (9 - data.length) {
    case 1:
        res = res.add(new BN(data[i++]));
    case 2:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 3:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 4:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 5:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 6:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 7:
        res = res.mul(twopow8).add(new BN(data[i++]));
    case 8:
        res = res.mul(twopow8).add(new BN(data[i++]));
        break;
    default:
        throw "Impossible condition";
    }
    return res;
  }

  b58.encode_block = function (data, buf, index) {
    if (data.length < 1 || data.length > full_encoded_block_size) {
      throw "Invalid block length: " + data.length;
    }
    var num = uint8_be_to_64(data);
    var i = encoded_block_sizes[data.length] - 1;
    while (num.cmp(new BN(0)) === 1) {
      var remainder = num.mod(new BN(alphabet_size));
      num = num.div(new BN(alphabet_size));
      buf[index + i] = alphabet[remainder.toNumber()];
      i--;
    }
    return buf;
  };

  b58.encode = function (hex) {
    var data = hextobin(hex);
    if (data.length === 0) {
      return "";
    }
    var full_block_count = Math.floor(data.length / full_block_size);
    var last_block_size = data.length % full_block_size;
    var res_size = full_block_count * full_encoded_block_size + encoded_block_sizes[last_block_size];

    var res = new Uint8Array(res_size);
    var i;
    for (i = 0; i < res_size; ++i) {
      res[i] = alphabet[0];
    }
    for (i = 0; i < full_block_count; i++) {
      res = b58.encode_block(data.subarray(i * full_block_size, i * full_block_size + full_block_size), res, i * full_encoded_block_size);
    }
    if (last_block_size > 0) {
      res = b58.encode_block(data.subarray(full_block_count * full_block_size, full_block_count * full_block_size + last_block_size), res, full_block_count * full_encoded_block_size)
    }
    return bintostr(res);
  };

  return b58;
})();

function fastHash(hex) {
  return keccak('keccak256').update(Buffer.from(hex, 'hex')).digest('hex');
}

const l = new BN(2).pow(new BN(252)).add(new BN("27742317777372353535851937790883648493", 10));
function hashToScalar(hex) {
  let h = fastHash(hex);
  let s = elliptic.utils.intFromLE(h);
  s = s.umod(l);
  return s;
}

function pointToHex(p) {
  return elliptic.utils.toHex(ed25519.encodePoint(p, 'hex'));
}

function pad(n, s) {
    let res = n+"";
    while (res.length < s) res = res + "0";
    return res;
}

function swapEndianess(n) {    
    let ns = n.toString(16)                 // translate to hexadecimal notation
    ns = ns.replace(/^(.(..)*)$/, "0$1");   // add a leading zero if needed    
    let arr = ns.match(/../g);              // split number in groups of two
    arr.reverse();                          // reverse the groups
    let ns2= arr.join("");                  // join the groups back together
    ns2 = pad(ns2, 8);                      // pad to with 8 leading zeros
    
    return ns2;
}


function asciiToHex(str)
{
  var a = [];
  for (var n = 0, l = str.length; n < l; n ++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    if(hex.length==1) hex = '0' + hex;
    a.push(hex);
  }
  return a.join('');
}

const PUBLIC_ADDRESS_PREFIX_HEX = '12';
const PUBLIC_SUBADDRESS_PREFIX_HEX = '2a';
const SUBADDR_HEX = asciiToHex('SubAddr') + '00';

function getSubaddressPublicSpendKeyPoint(privateViewKeyBytes, publicSpendKeyBytes, accountIndex, subaddressIndex) {

  let data = SUBADDR_HEX + privateViewKeyBytes + swapEndianess(accountIndex) + swapEndianess(subaddressIndex);
  let m = hashToScalar(data);
  let M = ed25519.curve.g.mul(m);
  let B = ed25519.decodePoint(publicSpendKeyBytes);
  let D = B.add(M);

  return D;
}

function getSubaddress(privateViewKeyHex, publicSpendKeyHex, accountIndex, subaddressIndex) {

  let addressPrefix;
  let C, D;

  if(accountIndex==0 && subaddressIndex==0) {
    addressPrefix = PUBLIC_ADDRESS_PREFIX_HEX;
    D = ed25519.decodePoint(publicSpendKeyHex);
    C = ed25519.curve.g.mul(elliptic.utils.intFromLE(privateViewKeyHex));
  }
  else {
    addressPrefix = PUBLIC_SUBADDRESS_PREFIX_HEX;
    D = getSubaddressPublicSpendKeyPoint(privateViewKeyHex, publicSpendKeyHex, accountIndex, subaddressIndex);
    C = D.mul(elliptic.utils.intFromLE(privateViewKeyHex));
  }

  let hex = addressPrefix + pointToHex(D) + pointToHex(C);
  let checksumHex = fastHash(hex).substring(0, 8);
  hex += checksumHex;
  return cnBase58.encode(hex);

}

module.exports = {getSubaddress: getSubaddress};


