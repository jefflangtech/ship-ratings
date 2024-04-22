const { isReady } = require('../data/data.js');

const verifyData = (req, res, next) => {
  console.log('In data check');
  if(!req.abortProcessing) {
    if(isReady()) {
      console.log('Data check ready');
    }
    else {
      req.websockets.broadcast(JSON.stringify({ message: 'Test message' }));
      return res.json({ 
        message: 'Incomplete data',
        status: 'True',
        filename: req.file.originalname,
        csvDataType: req.file.csvDataType,
        fileduplicate: req.file.fileduplicate 
      });
    }
  }
  next();
}

module.exports = verifyData;