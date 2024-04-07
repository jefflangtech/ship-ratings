const multer = require('multer');
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: function (req, file, cb) {
    if(file.mimetype !== 'text/csv') {
        return cb(new Error('File type mismatch: CSV file required'), false);
    }
    cb(null, true);
  }
});

module.exports = upload;