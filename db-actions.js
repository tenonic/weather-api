var pgp = require('pg-promise')();

var conString = process.env.DATABASE_URL
    || "postgres://nkbzizwzkuiokp:472a016ade0325eebbb97037b2f7ca4ec4285eb65e04bd919f8350c18adb36b2@ec2-54-243-187-133.compute-1.amazonaws.com:5432/dhcjqujfnq6mr?ssl=true";

var db = pgp(conString);

module.exports = {
    selectCityData: function (req, res, next) {
        return db.result("SELECT * FROM city_weather WHERE city_code = $1 AND province_code = $2 AND city_name = $3", [req.params.cityCode, req.params.provinceCode, req.params.cityName]);
    },

     updateCityData: function (req, res, new_exp_date, curDate, json) {
        return db.none("UPDATE city_weather SET expiry_date=($1), modified_date=($2), conditions=($3) " +
            "WHERE city_code = $4 AND province_code = $5 AND city_name = $6",
            [new_exp_date, curDate, json.siteData, req.params.cityCode, req.params.provinceCode, req.params.cityName])
    }
}