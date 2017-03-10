const express = require('express');
const router = express.Router();
var request = require("request");
var parseString = require('xml2js').parseString;
var dbActions = require('./dbActions.js');



/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

// router.get('/dbtest', (req, res) => {
//     const data = { city_name: "jopa-city", conditions: 'raining' };
//     pg.connect(conString, (err, client, done) => {
//         if (err) {
//             done();
//             console.log(err);
//             return res.status(500).json({ success: false, data: err });
//         } else {
//             client.query('INSERT INTO city_weather(city_name, conditions) values($1, $2)',
//                 [data.city_name, data.conditions]);
//             res.status(200);
//             res.send('inserted');
//         }
//     });
// });

router.get('/weathercast/:provinceCode/:cityCode/:cityName', (req, res) => {
    dbActions.checkAndUpdate(req, res);

});

router.get('/dbinsert/:provinceCode/:cityCode/:cityName', (req, res) => {

    pg.connect(conString, (err, client, done) => {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        } else {
            //todo: need to check if cityName and cityCode
            request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml", function (error, response, body) {
                console.log('right');
                var xml = body;

                if (error) {
                    console.log('error on the request');

                } else {

                    //todo: take out parsing into helper module
                    parseString(xml, function (err, result) {
                        //console.log(result);
                        var curDate = new Date();
                        var expiryDate = new Date(curDate);
                        expiryDate.setMinutes(curDate.getMinutes() + 5);
                        client.query('INSERT INTO city_weather(city_name, city_code, province_code, conditions, created_date, modified_date, expiry_date) values($1, $2, $3, $4, $5, $6, $7)',
                            [req.params.cityName, req.params.cityCode, req.params.provinceCode, result.siteData, curDate, curDate, expiryDate]);
                        res.status(200);
                        res.send(result.siteData);

                        //todo: take out the db actions to a db module

                        // const results = [];
                        // const query = client.query("SELECT * FROM city_weather WHERE city_code = 's0000415'");
                        // // Stream results back one row at a time
                        // query.on('row', (row) => {
                        //     results.push(row);
                        // });
                        // // After all data is returned, close connection and return results
                        // query.on('end', () => {
                        //     done();
                        //     res.send(results);
                        // });

                    });
                }
            });
        }
    });



});


// router.get('/Barrie', (req, res) => {
//     console.log('barrie cond');
//     dbActions.getBarrie(req, res);

   
//     //res.send({ test: 'works' });
// });


// router.get('/weathercast/:cityId', function (req, res) {
//     console.log('weathercast city route');
//     request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/ON/" + req.params.cityId + "_e.xml", function (error, response, body) {
//         var xml = body;

//         // var json = parser.toJson(xml);
//         // res.send(json);

//         parseString(xml, function (err, result) {
//             //console.log(result);
//             //res.send(result.siteData.currentConditions[0].temperature[0]._);
//             res.send(result.siteData);

//         });
//     });
// });

// router.get('/weathercast/:provinceCode/:cityCode', function (req, res) {
//     console.log('weathercast province / city route');
//     request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml", function (error, response, body) {
//         var xml = body;

//         parseString(xml, function (err, result) {
//             console.log(result);
//             res.send(result.siteData);

//         });
//     });
// });

module.exports = router;