var rp = require('request-promise');
var APPID = '8f0ba1b68bf81d1dd5a8bae4d114626c';
var currentConditionsUrl = 'http://api.openweathermap.org/data/2.5/weather?'; 
var units = 'metric';

module.exports = {
    getCurrentConditions: function (req, res, next) {
        return rp(currentConditionsUrl + req.params.cityID + "&units=" + units + "APPID=" + APPID);
    }
}

