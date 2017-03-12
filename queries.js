var pgp = require('pg-promise')();
var rq = require('./requests');
var db = require('./db-actions');

var parseString = require('xml2js').parseString;

module.exports = {
    getWeatherData: function getWeatherData(req, res, next) {
        db.selectCityData(req, res)
            .then(function (data) {
                if (data.rowCount > 0) {
                    console.log('record found!');
                    //console.log('SELECT data:', data);
                    var exp_date = data.rows[0].expiry_date;
                    console.log(exp_date);
                    if (new Date() > exp_date) {
                        console.log('time to update');
                        var id_upd = data.rows[0].id;
                        var curDate = new Date();
                        var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));
                        rq.getWeatherXml(req, res).then(xml => {
                            parseString(xml, function (err, json) {
                                db.updateCityData(req, res, new_exp_date, curDate, json)
                                    .then(db.selectCityData(req, res).then(
                                        (data) => res.send({results: data.rows[0]})
                                    ));
                            })
                        })
                    } else {
                        res.send({results: data.rows[0]})
                    }
                }
            });



        // .catch(error => {
        //     // error;
        // });
    }

};