(function () {
  // WMO weather code → [emoji, label]
  var CODES = {
    0:  ['☀️',  'Clear skies'],
    1:  ['🌤️', 'Mainly clear'],
    2:  ['⛅',  'Partly cloudy'],
    3:  ['☁️',  'Overcast'],
    45: ['🌫️', 'Fog'],
    48: ['🌫️', 'Freezing fog'],
    51: ['🌦️', 'Light drizzle'],
    53: ['🌦️', 'Drizzle'],
    55: ['🌧️', 'Heavy drizzle'],
    61: ['🌧️', 'Light rain'],
    63: ['🌧️', 'Rain'],
    65: ['🌧️', 'Heavy rain'],
    71: ['🌨️', 'Light snow'],
    73: ['🌨️', 'Snow'],
    75: ['❄️',  'Heavy snow'],
    77: ['🌨️', 'Snow grains'],
    80: ['🌦️', 'Light showers'],
    81: ['🌧️', 'Showers'],
    82: ['⛈️', 'Heavy showers'],
    85: ['🌨️', 'Snow showers'],
    86: ['❄️',  'Heavy snow showers'],
    95: ['⛈️', 'Thunderstorm'],
    96: ['⛈️', 'Thunderstorm'],
    99: ['⛈️', 'Thunderstorm'],
  };

  function weatherInfo(code) {
    return CODES[code] || ['🌡️', 'Unknown'];
  }

  function render(temp, feelsLike, code, city) {
    var info = weatherInfo(code);
    var emoji = info[0], condition = info[1];
    document.getElementById('weather-widget').innerHTML =
      '<p class="wc-label">Where you are</p>' +
      '<div class="wc-main">' +
        '<span class="wc-emoji">' + emoji + '</span>' +
        '<span class="wc-temp">' + Math.round(temp) + '°F</span>' +
      '</div>' +
      '<p class="wc-condition">' + condition + '</p>' +
      '<p class="wc-feels">Feels like ' + Math.round(feelsLike) + '°F</p>' +
      (city ? '<p class="wc-location">' + city + '</p>' : '');
  }

  function renderError(msg) {
    document.getElementById('weather-widget').innerHTML =
      '<p class="wc-label">Weather</p>' +
      '<p class="wc-loading">' + msg + '</p>';
  }

  function fetchCity(lat, lon) {
    return fetch(
      'https://nominatim.openstreetmap.org/reverse?lat=' + lat + '&lon=' + lon + '&format=json',
      { headers: { 'Accept-Language': 'en' } }
    )
      .then(function (r) { return r.json(); })
      .then(function (d) {
        var a = d.address || {};
        return a.city || a.town || a.village || a.county || null;
      })
      .catch(function () { return null; });
  }

  function fetchWeather(lat, lon) {
    return fetch(
      'https://api.open-meteo.com/v1/forecast' +
      '?latitude=' + lat + '&longitude=' + lon +
      '&current=temperature_2m,apparent_temperature,weather_code' +
      '&temperature_unit=fahrenheit'
    ).then(function (r) {
      if (!r.ok) throw new Error('bad response');
      return r.json();
    });
  }

  if (!navigator.geolocation) {
    renderError('Geolocation not available.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      Promise.all([fetchWeather(lat, lon), fetchCity(lat, lon)])
        .then(function (results) {
          var c = results[0].current;
          render(c.temperature_2m, c.apparent_temperature, c.weather_code, results[1]);
        })
        .catch(function () { renderError('Could not load weather.'); });
    },
    function () { renderError('Enable location to see your weather ☀️'); },
    { timeout: 8000 }
  );
})();
