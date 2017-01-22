const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();

const cors = require('cors');
let corsOptions = {
    origin: 'https://schulcloud.github.io'
};
router.use(cors(corsOptions));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: false}));

const handleError = require('./utils/handleError');

router.options('/:toDoId', cors(corsOptions));

// GET /to-dos
router.get('/', function (req, res) {
    // TODO: implement
    handleError(res);
});

// POST /to-dos
router.post('/', function (req, res) {
    // TODO: implement
    handleError(res);
});

// PUT /to-dos/:toDoId
router.put('/:toDoId', function (req, res) {
    // TODO: implement
    handleError(res);
});

// DELETE /to-dos/:toDoId
router.delete('/:toDoId', function (req, res) {
    // TODO: implement
    handleError(res);
});

module.exports = router;
