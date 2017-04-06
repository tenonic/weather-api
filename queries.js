var rq = require('./requests');
var db = require('./db-actions');

//var parseString = require('xml2js').parseString;

module.exports = {
    getWeatherData: function getWeatherData(req, res, next) {
        db.selectCityData(req.params.cityId)
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
                            db.updateCityData(req.params.cityId, new_exp_date, curDate, weatherData)
                                .then(() => {
                                    db.selectCityData(req.params.cityId).then(
                                        (data) => res.send(data.rows[0].current_conditions)
                                    )
                                });
                        })
                    } else {
                        res.send(data.rows[0].current_conditions)
                    }
                } else {
                    rq.getCurrentConditions(req, res).then(weatherData => {
                        var curDate = new Date();
                        var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));
                        db.insertCityData(req.params.cityId, req.params.cityName, req.params.countryName, new_exp_date, curDate, weatherData).then(() => {
                            //console.log('inserted');
                            db.selectCityData(req.params.cityId).then(
                                data => res.send(data.rows[0].current_conditions)
                            )
                        });
                    });
                }
            });



        // .catch(error => {
        //     // error;
        // });
    },

    getWeatherDataByGeo: function getWeatherDataByGeo(req, res, next) {
        console.log('---getWeatherDataByGeo---')
        rq.getConditionsByGeo(req, res).then(weatherData => {

            console.log(JSON.parse(weatherData).name);
            console.log(JSON.parse(weatherData).id);
            console.log(JSON.parse(weatherData).sys.country);
            console.log(req.params);

            var cityId = JSON.parse(weatherData).id.toString();
            var cityName = JSON.parse(weatherData).name;
            var countryName = JSON.parse(weatherData).sys.country;

            db.selectCityData(cityId)
                .then(data => {
                    console.log('then');
                    if (data.rowCount > 0) {
                        console.log('record found!');
                        var exp_date = data.rows[0].expiry_date;
                        console.log(exp_date);
                        if (new Date() > exp_date) {
                            console.log('time to update');
                            var id_upd = data.rows[0].id;
                            var curDate = new Date();
                            var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));
                            db.updateCityData(cityId, new_exp_date, curDate, weatherData)
                                .then(res.send(weatherData));
                        } else {
                            res.send(weatherData);
                        }
                    } else {
                        console.log('else');
                        var curDate = new Date();
                        var new_exp_date = new Date(curDate.setMinutes(curDate.getMinutes() + 5));
                        db.insertCityData(cityId, cityName, countryName, new_exp_date, curDate, weatherData).then(() => {
                            res.send(weatherData);
                        });
                    }
                });


            //todo: check if this city record is in db and update / insert accordingly
            // db.insertCityData(req, res, new_exp_date, curDate, weatherData).then(() => {
            //     console.log('---- getWeatherDataByGeo inserted ----');
            //     db.selectCityData(req, res).then(
            //         data => res.send(data.rows[0].current_conditions)
            //     )
            // });
        });
    },

    getCityData: function getCityData(req, res, next) {
        var lineReader = require('readline').createInterface({
            input: require('fs').createReadStream('cities.json')
        });

        var citiesFull = [];
        var citiesPartial = [];
        lineReader.on('line', function (line) {
            var jsonLine = JSON.parse(line);
            if (jsonLine.name.toLowerCase().indexOf(req.params.cityName.toLowerCase()) > -1) {
                citiesPartial.push({ "name": jsonLine.name, "country": jsonLine.country, "geo": jsonLine.coord, "cityId": jsonLine._id });
            }
            if (jsonLine.name.toLowerCase() === req.params.cityName.toLowerCase()) {
                citiesFull.push({ "name": jsonLine.name, "country": jsonLine.country, "geo": jsonLine.coord, "cityId": jsonLine._id });
            }
        }).on('close', () => {
            if (citiesFull.length > 0) {
                res.send(citiesFull);
            } else {
                res.send(citiesPartial)
            }
        });
    }
};