var rp = require('request-promise');

module.exports = {
    getWeatherXml: function (req, res, next) {
        console.log('getting weather xml');
        return rp("http://dd.weatheroffice.ec.gc.ca/citypage_weather/xml/" + req.params.provinceCode + "/" + req.params.cityCode + "_e.xml");
    }
}

