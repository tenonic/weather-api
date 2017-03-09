const express = require('express');
const router = express.Router();
var request = require("request");
var parseString = require('xml2js').parseString;
var pg = require('pg');

var conString = process.env.DATABASE_URL
    || "postgres://nkbzizwzkuiokp:472a016ade0325eebbb97037b2f7ca4ec4285eb65e04bd919f8350c18adb36b2@ec2-54-243-187-133.compute-1.amazonaws.com:5432/dhcjqujfnq6mr?ssl=true";


/* GET api listing. */
router.get('/', (req, res) => {
    res.send('api works');
});

router.get('/dbtest', (req, res) => {
    const data = { city_name: "jopa-city", conditions: 'raining' };
    pg.connect(conString, (err, client, done) => {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        } else {
            client.query('INSERT INTO city_weather(city_name, conditions) values($1, $2)',
                [data.city_name, data.conditions]);
            res.status(200);
            res.send('inserted');
        }
    });
});

router.get('/dbtest/:provinceCode/:cityCode/:cityName', (req, res) => {

    pg.connect(conString, (err, client, done) => {
        if (err) {
            done();
            console.log(err);
            return res.status(500).json({ success: false, data: err });
        } else {

            //todo: add cityName, provinceCode params
            client.query("SELECT * FROM city_weather WHERE city_code = $1 AND province_code = $2 AND city_name = $3",
                [req.params.cityCode, req.params.provinceCode, req.params.cityName], function (q_err, q_result) {
                    if (q_result.rowCount > 0) {
                        console.log('record found');
                        var exp_date = q_result.rows[0].expiry_date;
                        if (new Date() > exp_date) {
                            var id_upd = q_result.rows[0].id;
                            console.log('time to update');

                            //todo: update other columns

                            var curDate = new Date();
                            var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));

                            client.query("UPDATE city_weather SET expiry_date=($1)", [new_exp_date], function (q_er2, q_result2) {
                                res.send(q_result2);
                            });

                        } else {
                            console.log('not time to update yet');
                            //rows[0] ?
                            res.send(q_result.rows);
                        }

                    } else {
                        console.log('no records found, inserting')
                        //insert record from the weather api
                        request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml", function (error, response, body) {

                            var xml = body;

                            if (error) {
                                console.log('error on the request');

                            } else {

                                //todo: take out parsing into helper module
                                parseString(xml, function (err, json) {
                                    //console.log(json);
                                    var curDate = new Date();
                                    var expiryDate = new Date(curDate);
                                    expiryDate.setMinutes(curDate.getMinutes() + 5);
                                    client.query('INSERT INTO city_weather(city_name, city_code, province_code, conditions, created_date, modified_date, expiry_date)'
                                        + 'values($1, $2, $3, $4, $5, $6, $7)',
                                        [req.params.cityName, req.params.cityCode, req.params.provinceCode, json.siteData, curDate, curDate, expiryDate]);
                                    res.status(200);
                                    res.send(json.siteData);
                                });
                            }
                        });
                    }
                });
        }
    });
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


router.get('/Barrie', (req, res) => {

    console.log('barrie get');

    pg.connect(conString, function (err, client, done) {
        client.query('SELECT * FROM city_weather', function (err, result) {
            done();
            if (err)
            { console.error(err); res.send("Error " + err); }
            else {
                //console.log(result.rows) 
                res.send({ results: result.rows });
            }
        });
    });
    //res.send({ test: 'works' });
});


router.get('/weathercast/:cityId', function (req, res) {
    console.log('weathercast city route');
    request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/ON/" + req.params.cityId + "_e.xml", function (error, response, body) {
        var xml = body;

        // var json = parser.toJson(xml);
        // res.send(json);

        parseString(xml, function (err, result) {
            //console.log(result);
            //res.send(result.siteData.currentConditions[0].temperature[0]._);
            res.send(result.siteData);

        });
    });
});

router.get('/weathercast/:provinceCode/:cityCode', function (req, res) {
    console.log('weathercast province / city route');
    request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml", function (error, response, body) {
        var xml = body;

        parseString(xml, function (err, result) {
            console.log(result);
            res.send(result.siteData);

        });
    });
});

module.exports = router;