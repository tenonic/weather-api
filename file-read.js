var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('cities.json')
});

lineReader.on('line', function (line) {
    var jsonLine = JSON.parse(line)
    if (jsonLine.name == 'Toronto') {
        console.log(line);
    }
});