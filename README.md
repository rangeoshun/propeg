# propeg
**Note: This is a prototype only to demonstrate concept**

**Currently works in Chrome and Firefox only maybe others too, because of FetchAPI and ES6 syntax, IE and Edge are excluded.**

A client side partial image loader for network optimization using progressive jpeg.

Needs a server side support of `Range` HTTP header, to allow byte range requests. This is included, gulp will run this for you.

# usage

 - Clone repo
 - `> npm i` in root folder
 - `> npm i -g gulp` to install build tool
 - `> gulp`
 - Save one file, to trigger build on watch.

# and it goes something like this
`<img data-pro-src="[url://to.your/img]" />`
Magic from here on...

# show and tell

Works by loading only a selected number of scans, for displaying thumbnail or preview without having anouther copy of the file.

Current imlementation is crude, just fetching the image chunks until the given number of `SOS` markers are downloaded or an `EOI` is recieved, then adds the `data:image/jpeg;base64,...` as `src` for the requested `<img>`.

3 scan loaded on the left, full resolution normal load on right.

![alt tag](https://raw.githubusercontent.com/rangeoshun/propeg/master/readme-img.png)
