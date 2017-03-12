var conString = process.env.DATABASE_URL
    || "postgres://nkbzizwzkuiokp:472a016ade0325eebbb97037b2f7ca4ec4285eb65e04bd919f8350c18adb36b2@ec2-54-243-187-133.compute-1.amazonaws.com:5432/dhcjqujfnq6mr?ssl=true";

var pg = require('pg');
var request = require("request");
var parseString = require('xml2js').parseString;

module.exports = {
    checkAndUpdate: function (req, res) {
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

                                request("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml", function (error, response, body) {

                                    var xml = body;

                                    if (error) {
                                        console.log('error on the request');

                                    } else {
                                        parseString(xml, function (err, json) {
                                            client.query("UPDATE city_weather SET expiry_date=($1), modified_date=($2), conditions=($3)" +
                                                "WHERE city_code = $4 AND province_code = $5 AND city_name = $6",
                                                [new_exp_date, curDate, json.siteData, req.params.cityCode, req.params.provinceCode, req.params.cityName],
                                                function (q_er2, q_result2) {
                                                    if (q_er2) {
                                                        res.send('error on update');
                                                    }
                                                    console.log("updated", q_result2);
                                                    client.query("SELECT * FROM city_weather WHERE city_code = $1 AND province_code = $2 AND city_name = $3",
                                                        [req.params.cityCode, req.params.provinceCode, req.params.cityName], function (q_err3, q_result3) {
                                                            console.log("SELECT * FROM city_weather WHERE city_code = $1 AND province_code = $2 AND city_name = $3");
                                                            done();
                                                            if (q_err3) {
                                                                console.error(q_err3); res.send("Error " + q_err3);
                                                            } else {
                                                                //console.log(q_result3.rows)
                                                                res.send({ results: q_result3.rows });
                                                            }
                                                        });
                                                });

                                        });
                                    }
                                });

                            } else {
                                console.log('not time to update yet');
                                //rows[0] ?
                                res.send({ results: q_result.rows });
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
                                            [req.params.cityName, req.params.cityCode, req.params.provinceCode, json.siteData, curDate, curDate, expiryDate], function (q_err4, q_result4) {
                                                if (q_err4) {
                                                    res.send('error on INSERT');
                                                }
                                                console.log('inserted', q_result4);
                                                client.query("SELECT * FROM city_weather WHERE city_code = $1 AND province_code = $2 AND city_name = $3",
                                                    [req.params.cityCode, req.params.provinceCode, req.params.cityName], function (q_err5, q_result5) {
                                                        done();
                                                        if (q_err5)
                                                        { console.error(q_err5); res.send("Error " + q_err5); }
                                                        else {
                                                            //console.log(result.rows) 
                                                            res.send({ results: q_result5.rows });
                                                        }
                                                    });

                                            });
                                        // res.status(200);
                                        // res.send(json.siteData);
                                    });
                                }
                            });
                        }
                    });
            }
        });
    },

    getBarrie: function (req, res) {
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
    }

}