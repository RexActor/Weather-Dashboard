// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid=d4d1be039064550a18e8a7809e249e51
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=d4d1be039064550a18e8a7809e249e51

var searchForm = $("#search-form");
var searchLocation = $("#search-input");

var historyCityList = [];

var apiKey = "d4d1be039064550a18e8a7809e249e51";
var queryLimit = 1;

var lon;
var lat;

getCityHistory();

$(document).on("click", ".search-button", function (event) {
  event.preventDefault();
  $("#today").empty();
  $("#forecast").empty();
  var cityName;
  if (!searchLocation.val()) {
    return;
  }
  //check if search button is clicked. if so then we generate history button
  if ($(this).attr("id") == "search-button") {
    if (historyCityList.includes(searchLocation.val()) == false) {
      generateHistoryButton(searchLocation.val());
      historyCityList.push(searchLocation.val());
      localStorage.setItem("locationHistory", JSON.stringify(historyCityList));
    }
    cityName = searchLocation.val();
  } else {
    cityName = $(this).attr("data-city");
    searchLocation.val(cityName);
  }
  console.log(historyCityList);

  var geoLocationQuery = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${queryLimit}&appid=${apiKey}`;
  fetch(geoLocationQuery)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      lon = data[0].lon;
      lat = data[0].lat;
      //   console.log(`Lon: ${lon} \nLat: ${lat}`);

      fetchWeather(lon, lat);
    });
});

function fetchWeather(lon, lat) {
  // https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={time}&appid={API key}
  var weatherQuery = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  console.log(weatherQuery);
  fetch(weatherQuery)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      var weatherData = data;
      var processedDate;
      for (var i = 0; i < weatherData.list.length; i++) {
        var date_text = weatherData.list[i].dt_txt;
        date_text = dayjs(date_text).format("DD/M/YYYY");
        var cityName = weatherData.city.name;

        var temp = weatherData.list[i].main.temp;
        var humidity = weatherData.list[i].main.humidity;
        var windSpeed = weatherData.list[i].wind.speed;
        var icon = weatherData.list[i].weather[0].icon;

        if (processedDate !== date_text) {
          generateWeatherCard(
            cityName,
            date_text,
            temp,
            humidity,
            windSpeed,
            icon,
            i
          );
          processedDate = date_text;
        }
      }
    });
}

function generateWeatherCard(
  cityName,
  date_text,
  temp,
  humidity,
  windSpeed,
  icon,
  itemIndex
) {
  //generating HTML Elements
  //http://openweathermap.org/img/w/{code}.png
  var header_text;
  var weatherCard = $("<div>");

  var cardBody = $("<div>");
  var cardH1 = $("<h1>");

  var tempItem = $("<span>");
  var windItem = $("<span>");
  var humidityItem = $("<span>");
  var iconImage = $("<img>");
  iconImage.attr("src", `http://openweathermap.org/img/w/${icon}.png`);

  tempItem.text(`Temp: ${temp} \xB0C`);
  windItem.text(`Wind: ${windSpeed} KPH`);
  humidityItem.text(`Humidity: ${humidity}  %`);

  if (itemIndex == 0) {
    weatherCard.addClass("card flex-grow-1");
    header_text = `${cityName} ${date_text}`;
    $("#today").append(weatherCard);
  } else {
    weatherCard.addClass("card col-md-2 flex-grow-1 ");
    header_text = date_text;
    $("#forecast").append(weatherCard);
  }

  cardH1.text(header_text);

  //assigning classes

  tempItem.addClass("card-text row mb-3");
  windItem.addClass("card-text row mb-3");
  humidityItem.addClass("card-text row mb-3");

  cardBody.addClass("card-body");

  //adding elements to page
  cardBody.append(cardH1);
  cardBody.append(iconImage);

  cardBody.append(tempItem);
  cardBody.append(windItem);
  cardBody.append(humidityItem);

  weatherCard.append(cardBody);
}

function generateHistoryButton(locationName) {
  var btn = $("<button>");
  btn.text(locationName);
  btn.addClass("btn btn-secondary mb-3 search-button");
  btn.attr("data-city", locationName);

  console.log(btn);
  $("#history").append(btn);
}

function getCityHistory() {
  historyCityList = JSON.parse(localStorage.getItem("locationHistory"));
  if (!historyCityList) {
    historyCityList = [];
  }
  if (historyCityList.length > 0) {
    for (var i = 0; i < historyCityList.length; i++) {
      generateHistoryButton(historyCityList[i]);
    }
  }
}
