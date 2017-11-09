const express = require('express')
const fs = require('fs')
const path = require('path')
const app = express()
const multer = require('multer')
const bodyParser = require('body-parser')

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json())

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'))
})

//START: UPLOAD FILE BRANCH
const storage = multer.diskStorage({
  destination: function(req, file, callback) {
    callback(null, "")
  },
  filename: function(req, file, callback) {
    //callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    callback(null, "sample.mp4")
  }
})

const upload = multer({
  storage: storage
}).array("videoUploader", 3) //Field name and max count

app.get("/upload", function(req, res) {
  res.sendFile(__dirname + "/upload.html")
})
app.post("/api/Upload", function(req, res) {
  upload(req, res, function(err) {
    if(err) {
      return res.end("Something went wrong!")
    }
    return res.end("File uploaded sucessfully!")
  })
})
//START: UPLOAD FILE BRANCH

//START: GET VIDEO FROM SERVER AND STREAM TO CLIENT
 app.get('/video', function(req, res) {
  const path = 'sample.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
})
//END: GET VIDEO FROM SERVER AND STREAM TO CLIENT

app.listen(3000, function () {
  console.log('Listening on port 3000!')
})
