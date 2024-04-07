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
  const results = [];

  fs.createReadStream(filePath)
    .pipe(csv({
      mapHeaders: ({ header }) => header.toLowerCase().replace(/^"|"$/g, '').replaceAll('-', '_').trim()
    }))
    .on('headers', (headers) => {
      req.csvHandler = getHandlerforCsv(headers);
    })
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      req.csvHandler.setData(results);
      await unlinkAsync(req.file.path);
      next();
    })
    .on('error', (err) => {
      next(err);
    });
};

module.exports = parseCsv;