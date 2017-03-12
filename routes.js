const express = require('express');
const router = express.Router();
// var request = require("request");
// var parseString = require('xml2js').parseString;
// var dbActions = require('./dbActions');
var qer = require('./queries.js')
var rq = require('./requests');


/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});


// router.get('/weathercast/:provinceCode/:cityCode/:cityName', (req, res) => {
//     dbActions.checkAndUpdate(req, res);
// });

router.get('/weathercast/:provinceCode/:cityCode/:cityName', qer.getWeatherData);


module.exports = router;