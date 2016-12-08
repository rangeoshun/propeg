/// <reference path="../../../typings/main.d.ts" />
const Fetcher = require('./fetcher');
window.fetcher = new Fetcher();
window.onload = function () {
    document.querySelectorAll('img[data-pro-src]').forEach((imgElem) => {
        window.fetcher.getImage(imgElem.dataset.proSrc).then((b64Img) => {
            imgElem.src = b64Img;
        });
    });
}
