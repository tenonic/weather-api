const express = require('express');
const router = express.Router();
var qer = require('./queries.js')


/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});


// router.get('/weathercast/:provinceCode/:cityCode/:cityName', (req, res) => {
//     dbActions.checkAndUpdate(req, res);
// });

router.get('/currentConditions/:cityId/:cityName/:countryName', qer.getWeatherData);
router.get('/currentConditions/:lat/:lon', qer.getWeatherDataByGeo);
router.get('/cityData/:cityName', qer.getCityData);



module.exports = router;