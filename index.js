require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { StringDecoder } = require('string_decoder')
const parse = require('./parser')

const app = express()
const upload = multer()
const decoder = new StringDecoder('utf8');

// setup cors
const whitelist = process.env.WHITELIST ? process.env.WHITELIST.split(',') : []
const corsOptions = {
    origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true
}
app.use(cors(corsOptions))

app.post('/upload', upload.single('srt'), function (req, res, next) {
    const srt = decoder.write(req.file.buffer)
    const result = parse(srt, "data/stop.txt");
    res.json(result)
});

const port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("Start listenning on port", port)
})