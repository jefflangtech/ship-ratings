/**
 * Next:
 * Both files can be uploaded, checked, and the printed to the server console
 * There are no real indicators to the UI yet, that would be good
 * ProcessCsv middleware is where things are at. I think iterating over the
 * items, and then over the addresses, making a query to the ship API for each
 * service type (as is allowed by the API) and filling out the return csv
 * data rows is really the next big task
 */


require('dotenv').config();
const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const upload = require('./middleware/upload');
const parseCsv = require('./middleware/parseCsv');
const processData = require('./middleware/processData');
const reset = require('./middleware/reset');

const port = process.env.PORT;


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/templates', (req, res) => {
    const templatesDir = path.join(__dirname, 'public', 'templates');
    fs.readdir(templatesDir, (err, files) => {
        if(err) {
            res.sendStatus(500);
            return;
        }
        res.json(files);
    })
})



const router = express.Router();

// ROUTES
router.post('/upload', upload.single('file'), parseCsv, processData, (req, res) => {
    if(!res.headersSent) {
        res.json({ 
            status: 'True',
            filename: req.file.originalname,
            csvDataType: req.file.csvDataType,
            fileduplicate: req.file.fileduplicate
        });
    }
});

router.post('/upload-confirmation', reset, parseCsv, (req, res) => {
    res.json({ message: 'Complete'});
});


app.use('/', router);

app.listen(port, () => {
    console.log(`Listening on port: ${port}`);
});