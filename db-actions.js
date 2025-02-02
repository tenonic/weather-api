var pgp = require('pg-promise')();

var conString = process.env.DATABASE_URL
    || "postgres://nkbzizwzkuiokp:472a016ade0325eebbb97037b2f7ca4ec4285eb65e04bd919f8350c18adb36b2@ec2-54-243-187-133.compute-1.amazonaws.com:5432/dhcjqujfnq6mr?ssl=true";

var db = pgp(conString);

module.exports = {
    selectCityData: function (cityId) {
        console.log(typeof(cityId));
        console.log('selecting data', cityId);
        var result = db.result("SELECT * FROM city_weather WHERE city_id=$1", [cityId]);
        return result;
    },

    updateCityData: function (cityId, new_exp_date, curDate, json) {
        return db.none("UPDATE city_weather SET expiry_date=($1), modified_date=($2), current_conditions=($3) " +
            "WHERE city_id = $4",
            [new_exp_date, curDate, json, cityId])
    },

    insertCityData: function (cityId, cityName, countryName, new_exp_date, curDate, json) {
        console.log('inserting');
        return db.none('INSERT INTO city_weather(city_id, current_conditions, created_date, modified_date, expiry_date, city_name, country)'
            + 'values($1, $2, $3, $4, $5, $6, $7)',
            [cityId, json, curDate, curDate, new_exp_date, cityName, countryName])
    },

     insertCityData2: function (cityId, cityName, countryName, res, new_exp_date, curDate, json) {
        console.log('inserting 2...');
        return db.none('INSERT INTO city_weather(city_id, current_conditions, created_date, modified_date, expiry_date, city_name, country)'
            + 'values($1, $2, $3, $4, $5, $6, $7)',
            [cityId, json, curDate, curDate, new_exp_date, cityName, countryName])
    }
    
}