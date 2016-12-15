'use strict';

const Fetcher = require('./fetcher');

window.fetcher = new Fetcher();
//window.onload = function () {
    document.querySelectorAll('img[data-pro-src]').forEach((imgElem) => {
        window.fetcher.getImage(imgElem.dataset.proSrc, (b64Img) => imgElem.src = b64Img)
          .catch(() => imElem.src = imgElem.dataset.proSrc)
          .then();
    });
//}
