function showTime() {
     var date = new Date();
     var h = date.getHours(); // 0 - 23
     var m = date.getMinutes(); // 0 - 59
     var session = " AM";

     if (h == 0) {
          h = 12;
     }

     if (h > 12) {
          h = h - 12;
          session = " PM";
     }

     h = (h < 10) ? "0" + h : h;
     m = (m < 10) ? "0" + m : m;

     var time = h + ":" + m + session;
     document.getElementById("MyClockDisplay").innerText = time;
     document.getElementById("MyClockDisplay").textContent = time;

     setTimeout(showTime, 1000);

}

showTime();


(function ($) {

     $(document).ready(function () {

          var $city = $('.js-city'),
               $country = $('.js-country'),
               $temperature = $('.js-temp'),
               $temperatureUnit = $('.js-temp-unit'),
               $weather = $('.js-weather'),
               $weatherIcon = $('.js-weather-icon');

          $.getJSON('https://ipinfo.io', function () {}).done(function (geoJSON) {

               var city = geoJSON.city,
                    country = geoJSON.country,
                    openWeatherAPPID = '57d6d3575458519af4e1386b34a7ac48',
                    openWeatherURL = '//api.openweathermap.org/data/2.5/weather?q=' + city + ',' + country + '&appid=' + openWeatherAPPID;

               $city.text(city);
               $country.text(country);

               $.getJSON(openWeatherURL, function () {}).done(function (weatherJSON) {

                    var kelvin = weatherJSON.main.temp,
                         farenheit = kelvinToFarenheit(kelvin),
                         celcius = kelvinToCelcius(kelvin),
                         weather = weatherJSON.weather[0].main,
                         icon = weatherJSON.weather[0].icon;

                    $temperature.text(celcius);
                    $weather.text(weather);
                    $weatherIcon.html(function () {
                         return '<img src="http://openweathermap.org/img/w/' + icon + '.png" alt="Weather Icon">';
                    });

                    $temperatureUnit.on('click', function (e) {
                         e.preventDefault();
                         var $this = $(this);
                         if ($this.text() === 'F') {
                              $this.text('C');
                              $temperature.text(celcius);
                         } else {
                              $this.text('F');
                              $temperature.text(farenheit);
                         }
                    });

               });
          });

     });

     function kelvinToFarenheit(kelvin) {
          return parseInt((kelvin - 273.15) * (9 / 5) + 32, 10);
     }

     function kelvinToCelcius(kelvin) {
          return parseInt(kelvin - 273.15, 10);
     }

})(jQuery);