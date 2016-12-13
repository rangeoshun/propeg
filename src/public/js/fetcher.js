'use strict';

function uint8ArrayToHex (uintArray) {
  return uintArray.reduce((acc, n) => acc.concat(n > 15 ? n.toString(16) : `0${n.toString(16)}`), []);
}

const CHUNK_LENGTH = 2048;
const SOS = [0xFF, 0xDA];
const EOI = [0xFF, 0xD9];
const APP0 = [0xFF, 0xE0];

function arrayBufferToBase64 (uintArray) {
  return btoa(uintArray.reduce((acc, n) => acc.concat(String.fromCharCode(n)), ''));
}

function getByteRangeString (from, to) {
  if ((!from && from !== 0) || (!to && to !== 0)) {
    throw new Error(`From and to bytes are mandatory string. Got: ${from}, ${to}.`);
  }

  return `byte=${from}-${to}`;
}

function getHeaders (from, to) {
  if ((!from && from !== 0) || (!to && to !== 0)) {
    throw new Error(`From and to bytes are mandatory string. Got: ${from}, ${to}.`);
  }

  const headers = new Headers();

  headers.set(`Range`, getByteRangeString(from, to));
  headers.set(`Accept-Ranges`, `bytes`);

  return headers;
}

function getPartial (url, from, to) {
  if (!url || (!from && from !== 0) || (!to && to !== 0)) {
    throw new Error(`Url and from to bytes are mandatory string. Got: ${url}, ${from}, ${to}.`);
  }

  const headers = getHeaders(from, to);

  return fetch(url, {
      headers: headers
  })
  .then(response => response.arrayBuffer()
    .then((buffer => new Uint8Array(buffer)))
  );
}

function getPartialLoop (url, resolve, reject, _length, _imageIntArray, _SOSCount) {
  let imageIntArray = _imageIntArray || new Uint8Array();
  let SOSCount = _SOSCount || 0;
  let length = _length || 0;

  getPartial(url, length, length + CHUNK_LENGTH - 1)
    .then((intArray) => {
      const mergedImageIntArray = new Uint8Array(imageIntArray.length + intArray.length);
      mergedImageIntArray.set(imageIntArray);
      mergedImageIntArray.set(intArray, imageIntArray.length);

      length += CHUNK_LENGTH;

      if (hasMarker(intArray, APP0)) {
        getImageAspectRatio(intArray);
      }

      if (hasMarker(intArray, SOS)) {
        SOSCount++;
      } else if (hasMarker(intArray, EOI)) {
        resolve(mergedImageIntArray);
        return;
      }

      if (SOSCount < 3) {
        return getPartialLoop(url, resolve, reject, length, mergedImageIntArray, SOSCount);
      } else {
        resolve(mergedImageIntArray);
      }
    })
    .catch((err) => reject(err));
}

function spliceAspectRatio (intArray, index) {
  console.log(intArray[index + 9], intArray.slice(index, index + 31))
  return intArray.slice(index + 9, index + 9 + 4);
}

function getImageAspectRatio (intArray) {
  return intArray.reduce((dimensions, byte, index) => byte === APP0[0] && intArray[++index] === APP0[1] ? spliceAspectRatio(intArray, index) : dimensions, []);
}

function getImage (url) {
  if (!url) {
    throw new Error(`Url is mandatory string. Got: ${url}.`);
  }

  return new Promise((resolve, reject) => {
    getPartialLoop(url, resolve, reject);
  })
  .then((intArray) => `data:image/jpeg;base64,${arrayBufferToBase64(intArray)}`);
}

function hasMarker (intArray, marker) {
  return intArray.reduce((verdict, byte, index) => verdict || byte === marker[0] && intArray[index + 1] === marker[1], false);
}

module.exports = class Fetcher {

  constructor () {
    this.getImage = getImage;
  }
};
