var rq = require('./requests');
var db = require('./db-actions');

//var parseString = require('xml2js').parseString;

module.exports = {
    getWeatherData: function getWeatherData(req, res, next) {
        db.selectCityData(req, res)
            .then(data => {
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
                        rq.getCurrentConditions(req, res).then(weatherData => {
                            console.log(weatherData);
                            db.updateCityData(req, res, new_exp_date, curDate, weatherData)
                                .then(() => {
                                    db.selectCityData(req, res).then(
                                        (data) => res.send(data.rows[0])
                                    )
                                });
                        })
                    } else {
                        res.send(data.rows[0])
                    }
                } else {
                    rq.getCurrentConditions(req, res).then(weatherData => {
                        var curDate = new Date();
                        var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));
                        db.insertCityData(req, res, new_exp_date, curDate, weatherData).then(() => {
                            //console.log('inserted');
                            db.selectCityData(req, res).then(
                                data => res.send(data.rows[0])
                            )
                        }

                        );
                    });
                }
            });



        // .catch(error => {
        //     // error;
        // });
    },

    getCityData: function getCityData(req, res, next) {
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('cities.json')
        });

        var cities = [];
        lineReader.on('line', function (line) {
            var jsonLine = JSON.parse(line);
            if (jsonLine.name.toLowerCase() === req.params.cityName.toLowerCase()) {
                cities.push({ "name": jsonLine.name, "country": jsonLine.country, "geo": jsonLine.coord, "cityId": jsonLine._id });
            }
        }).on('close', () => {
            res.send(cities);
        });


    }

};