let http = require('http')
let fs = require('fs')
let url = require('url')
let qs = require('querystring')
let port = 80

http
  .createServer((req, res) => {
    if (req.method === 'POST') {
      let theUrl = url.parse( req.url )
      let queryObj = qs.parse( theUrl.query )
      fs.appendFile('./scores/scores.txt', ',' + Object.keys(queryObj))
      console.log( Object.keys(queryObj))

      res.writeHead(200)
      res.end()
      return
    }
    let parseUrl = url.parse(req.url).pathname
    if (parseUrl === '/') {
      fs.readFile('index.html', (err, data) => {
        if (err)
          console.log(err)

        res.writeHead(200, {
          'Content-Type': 'text/html'
        })
        res.write(data)
        res.end()
      })
    } else if (parseUrl === '/stats'){
      fs.readFile('./scores/scores.txt', 'utf8',(err, data) => {
        if(err)
          console.log(err)

        let  ndata = data.split(',').filter(n => n != '')
        console.log(ndata, typeof (ndata))
        res.writeHead(200)
        res.write(data)
        res.end()
      })
    } else if (parseUrl === '/js/jquery-2.2.4.min.js') {
      fs.readFile('./js' + '/jquery-2.2.4.min.js', (err, data) => {
        if (err)
          console.log(err)

        res.writeHead(200, {
          'Content-Type': 'application/javascript'
        })
        res.write(data)
        res.end()
      })
    } else if (parseUrl === '/js/spaceDefenderGame.js') {
      fs.readFile('./js' + '/spaceDefenderGame.js', (err, data) => {
        if (err)
          console.log(err)

        res.writeHead(200, {
          'Content-Type': 'application/javascript'
        })
        res.write(data)
        res.end()
      })
    } else if (parseUrl === '/css/styles.css') {
      fs.readFile('.' + '/css/styles.css', (err, data) => {
        if (err)
          console.log(err)

        res.writeHead(200, {
          'Content-Type': 'text/css'
        })
        res.write(data)
        res.end()
      })
    } else {
      fs.readFile('.' + parseUrl, (err, data) => {
        if (err) {
          res.writeHead(404)
          res.write('404 File not found')
          res.end()
          return
        }

        res.writeHead(200)
        res.write(data)
        res.end()
      })
    }
    //console.log(parseUrl)

  })
  .listen(port)

console.log(`Server listening on port: ${port}`)