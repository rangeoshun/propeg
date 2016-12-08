function uint8ArrayToHex (uintArray) {
  return uintArray.reduce((acc, n) => acc.concat(n > 15 ? n.toString(16) : `0${n.toString(16)}`), []);
}

module.exports = class Fetcher {

  constructor () {
    // Construct...
  }

  arrayBufferToBase64 (uintArray) {
    const self = this;
    return btoa(uintArray.reduce((acc, n) => acc.concat(String.fromCharCode(n)), ''));
  }

  getByteRangeString (from, to) {
    if ((!from && from !== 0) || (!to && to !== 0)) {
        throw new Error(`From and to bytes are mandatory string. Got: ${from}, ${to}.`);
    }

    return `byte=${from}-${to}`;
  }

  getHeaders (from, to) {
    if ((!from && from !== 0) || (!to && to !== 0)) {
        throw new Error(`From and to bytes are mandatory string. Got: ${from}, ${to}.`);
    }

    const self = this;
    const headers = new Headers();

    headers.set(`Range`, self.getByteRangeString(from, to));
    headers.set(`Accept-Ranges`, `bytes`);

    return headers;
  }

  getPartial (url, from, to) {
    if (!url || (!from && from !== 0) || (!to && to !== 0)) {
        throw new Error(`Url and from to bytes are mandatory string. Got: ${url}, ${from}, ${to}.`);
    }

    const self = this;
    const headers = self.getHeaders(from, to);

    return fetch(url, {
        headers: headers
    })
    .then(response => response.arrayBuffer()
      .then((buffer => new Uint8Array(buffer)))
    );
  }

  getPartialLoop (url, resolve, reject, _length, _imageIntArray, _SOSCount) {
    const self = this;
    let imageIntArray = _imageIntArray || new Uint8Array();
    let SOSCount = _SOSCount || 0;
    let length = _length || 0;

    self.getPartial(url, length, length + self.chunkSizeLength - 1)
      .then((intArray) => {
        const mergedImageIntArray = new Uint8Array(imageIntArray.length + intArray.length);
        mergedImageIntArray.set(imageIntArray);
        mergedImageIntArray.set(intArray, imageIntArray.length);

        length += self.chunkSizeLength;

        if (self.hasSOSMarker(intArray)) {
          SOSCount++;
        } else if (self.hasEOIMarker(intArray)) {
          resolve(mergedImageIntArray);
          return;
        }

        console.log(SOSCount)

        if (SOSCount < 3) {
          return self.getPartialLoop(url, resolve, reject, length, mergedImageIntArray, SOSCount);
        } else {
          resolve(mergedImageIntArray);
        }
      })
      .catch((err) => reject(err));
  }

  get chunkSizeLength () {
    return 2048;
  }

  get SOSMarker () {
    return [0xFF, 0xDA];
  }

  get EOIMarker () {
    return [0xFF, 0xD9];
  }

  getImage (url) {
    if (!url) {
        throw new Error(`Url is mandatory string. Got: ${url}.`);
    }

    const self = this;

    return new Promise((resolve, reject) => {
      self.getPartialLoop(url, resolve, reject);
    })
    .then((intArray) => `data:image/jpeg;base64,${self.arrayBufferToBase64(intArray)}`);
  }

  hasEOIMarker (intArray) {
    const self = this;
    return intArray.join().indexOf(self.EOIMarker.join()) > -1;
  }

  hasSOSMarker (intArray) {
    const self = this;
    return intArray.join().indexOf(self.SOSMarker.join()) > -1;
  }
};
