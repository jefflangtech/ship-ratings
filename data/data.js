// Data storage objects
const csvData = {
  addresses: {
    expectedHeaders: ['name', 'address1', 'address2', 'city', 'state', 'zip_code', 'country_code', 'ship_from_flag'],
    data: [],
    ready: false,
    setData(data) {
      this.data = data;
      if(this.verifyAddresses()) {
        this.ready = true;
      }
    },
    getData() {
      return this.data;
    },
    resetData() {
      this.data = [];
    },
    verifyAddresses() {
      if(this.data.length === 0) {
        throw new Error('Empty data array');
      }
      let ship_from = false;
      this.data.forEach(address => {
        if(address.ship_from_flag === 'T' && ship_from === false) {
          ship_from = true;
        }
        else if(address.ship_from_flag === 'T') {
          throw new Error('Multiple ship-from addresses');
        }
      });
      return ship_from;
    },
    validateHeaders(headers) {
      return this.expectedHeaders.every(header => headers.includes(header));
    }
  },
  packages: {
    expectedHeaders: ['name', 'length', 'width', 'height', 'dim_units', 'weight', 'weight_units'],
    data: [],
    ready: false,
    setData(data) {
      this.data = data;
      this.ready = true;
    },
    getData() {
      return this.data;
    },
    resetData() {
      this.data = [];
    },
    validateHeaders(headers) {
      return this.expectedHeaders.every(header => headers.includes(header));
    }
  }
};

function determineType(headers) {
  for(let type in csvData) {
    if(csvData[type].validateHeaders(headers)) {
      return type;
    }
  }
  throw new Error('Invalid CSV format');
}

function getHandlerforCsv(headers) {
  try {
    const type = determineType(headers);
    return { 
      type: type,
      setData: csvData[type].setData.bind(csvData[type]),
      getData: csvData[type].getData.bind(csvData[type]) 
    };
  }
  catch(err) {
    console.log(`CSV parse error: ${err}`);
  }
  return;
}

function isReady() {
  return csvData.addresses.ready && csvData.packages.ready;
}

function getData(type) {
  return csvData[type].data;
}

function resetData(type) {
  if(type) {
    csvData[type].resetData();
  }
  else {
    csvData.forEach(dataType => dataType.resetData());
  }
}

module.exports = { 
  getHandlerforCsv, 
  isReady, 
  getData, 
  resetData 
};