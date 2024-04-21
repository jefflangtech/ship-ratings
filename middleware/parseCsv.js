const fs = require('fs');
const csv = require('csv-parser');
const { getHandlerforCsv } = require('../data/data.js');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);

const parseCsv = (req, res, next) => {

  if(!req.file) {
    return next(new Error('No file found'));
  }

  const filePath = req.file.path;
  console.log(req.file.filename);
  const results = [];

  const stream = fs.createReadStream(filePath)
    .pipe(csv({
      mapHeaders: ({ header }) => header.toLowerCase().replace(/^"|"$/g, '').replaceAll('-', '_').trim()
    }))
    .on('headers', (headers) => {
      req.csvHandler = getHandlerforCsv(headers);
      if(req.csvHandler.getData().length > 0) {
        req.abortProcessing = true;
      }
    })
    .on('data', (data) => {
      if(!req.abortProcessing) {
        results.push(data);
      }
    })
    .on('end', async () => {
      if(!req.abortProcessing) {
        // console.log('In the end clause, unlinking first file');
        req.csvHandler.setData(results);
        req.file.csvDataType = req.csvHandler.type;
        req.file.fileduplicate = false;
        unlinkAsync(req.file.path).then(() => {
          next();
        }).catch(err => {
          // console.error('Error deleting file', err);
          next(err);
        })
      }
      else {
        stream.on('close', () => {
          // console.log('In the else block, closing the stream');
          stream.destroy();
          return res.json({
            status: 'True',
            filename: req.file.originalname,
            csvDataType: req.csvHandler.type,
            fileuploadname: req.file.filename,
            filepath: req.file.path,
            fileduplicate: true
          });
        })
      }
    })
    .on('error', (err) => {
      if(!req.abortProcessing) {
        next(err);
      }
    });
};

module.exports = parseCsv;