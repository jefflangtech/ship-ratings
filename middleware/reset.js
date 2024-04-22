const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const { resetData } = require('../data/data.js');

const reset = (req, res, next) => {
  req.file = {
    path: req.body.filepath,
    originalname: req.body.filename,
    filename: req.body.fileuploadname
  };

  if (!req.body.resetFlag) {
    // console.log('Clearing the file from the server');
    // console.log('In the try');
    unlinkAsync(req.file.path)
      .then(() => {
        // console.log('File successfully deleted');
        return res.status(200).json({ type: req.body.csvDataType });
        next();
      })
      .catch((error) => {
        // console.error('Error in file deletion:', error);
        return next(error);
      });
  } else {
    resetData(req.body.csvDataType);
    next();
  }
};

module.exports = reset;