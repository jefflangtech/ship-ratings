/*  
 * Next on the list:
 * 1. websockets could be moved so the connection is only opened after 
 *    dataReadyCheck - not urgent
 * 2. processData should call on other modules like ups, fedex, usps, etc
 * 3. UI needs to update after both files uploaded so that the client does 
 *    change anything while data is processing
 * 4. How should the returned csv file be constructed in memory?
 * 5. websocket message for file download and then close connection
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);

const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const websockets = require('./services/websockets');

websockets.setupWebSocket(server);

const upload = require('./middleware/upload');
const parseCsv = require('./middleware/parseCsv');
const verifyData = require('./middleware/dataReadyCheck');
const processData = require('./middleware/processData');
const reset = require('./middleware/reset');

const port = process.env.PORT;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use((req, res, next) => {
  req.websockets = websockets;
  next();
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/templates', (req, res) => {
  const templatesDir = path.join(__dirname, 'public', 'templates');
  fs.readdir(templatesDir, (err, files) => {
    if (err) {
      res.sendStatus(500);
      return;
    }
    res.json(files);
  })
})



const router = express.Router();

// ROUTES
router.post('/upload', upload.single('file'), parseCsv, verifyData, processData, (req, res) => {
  if (!res.headersSent) {
    res.json({
      status: 'True',
      filename: req.file.originalname,
      csvDataType: req.file.csvDataType,
      fileduplicate: req.file.fileduplicate
    });
  }
});

router.post('/upload-confirmation', reset, parseCsv, processData, (req, res) => {
  if (!res.headersSent) {
    res.status(200).json({ type: req.body.csvDataType });
  }
});


app.use('/', router);

server.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});