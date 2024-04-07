const { isReady, getData } = require('../data/data.js');

const processCsv = (req, res, next) => {
  if(isReady()) {
    console.log('Data check ready');
    console.log(getData('addresses'));
    console.log(getData('packages'));
  }
  else {
    console.log('Missing data');
  }
  next();
}

module.exports = processCsv;