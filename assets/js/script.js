// https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid=d4d1be039064550a18e8a7809e249e51
// http://api.openweathermap.org/geo/1.0/direct?q=London&limit=5&appid=d4d1be039064550a18e8a7809e249e51
$(document).ready(function () {
  var searchForm = $("#search-form");
  var searchLocation = $("#search-input");

  //array to store history city names
  var historyCityList = [];

  //API key for openweatherMap
  var apiKey = "88fbdc0b313db9e97cf8d5dffe66d4b9";

  //query limit
  var queryLimit = 1;

  //lon & lat variables
  var lon;
  var lat;

  //check if there is already cities stored in local storage
  getCityHistory();
  //checks for any clicks in document. if clicked element with class name search-button we execute function
  $(document).on("click", ".search-button", function (event) {
    //prevent default action
    event.preventDefault();
    //clearing parent elements if they have already data populated
    $("#today").empty();
    $("#forecast").empty();
    var cityName;
    //   checks if provided any value in input field. if not then return back from function
    if (!searchLocation.val()) {
      return;
    }
    //check if search button is clicked. if so then we generate history button
    if ($(this).attr("id") == "search-button") {
      //checks if array contains input value to ensure unique values in array, if not then saves item in array
      if (historyCityList.includes(searchLocation.val()) == false) {
        //generate history city button
        generateHistoryButton(searchLocation.val());
        //push cityname in array
        historyCityList.push(searchLocation.val());
        //store array in local storage
        localStorage.setItem(
          "locationHistory",
          JSON.stringify(historyCityList)
        );
      }
      cityName = searchLocation.val();
    } else {
      cityName = $(this).attr("data-city");
      searchLocation.val(cityName);
    }

    var geoLocationQuery = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=${queryLimit}&appid=${apiKey}`;
    //execute fetch function for query
    fetch(geoLocationQuery)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        lon = data[0].lon;
        lat = data[0].lat;
        //   console.log(`Lon: ${lon} \nLat: ${lat}`);
        //execute fetchWeather function with lon, lat values
        fetchWeather(lon, lat);
      });
  });

  function fetchWeather(lon, lat) {
    // https://api.openweathermap.org/data/3.0/onecall/timemachine?lat={lat}&lon={lon}&dt={time}&appid={API key}
    var weatherQuery = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(weatherQuery)
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
        var weatherData = data;
        //variable to store dates to ensure only one card per date is displayed
        //due that api returns daily cards with 3h interval
        var processedDate;
        for (var i = 0; i < weatherData.list.length; i++) {
          var date_text = weatherData.list[i].dt_txt;
          date_text = dayjs(date_text).format("DD/M/YYYY");
          var cityName = weatherData.city.name;

          var temp = weatherData.list[i].main.temp;
          var humidity = weatherData.list[i].main.humidity;
          var windSpeed = weatherData.list[i].wind.speed;
          var iconCode = weatherData.list[i].weather[0].icon;
          //checks if processedDate (previous card) is not the same as current date, we generate weather card
          if (processedDate !== date_text) {
            generateWeatherCard(
              cityName,
              date_text,
              temp,
              humidity,
              windSpeed,
              iconCode,
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
    iconCode,
    itemIndex
  ) {
    //generating HTML Elements

    var header_text;
    var weatherCard = $("<div>");

    var cardBody = $("<div>");
    var cardH1 = $("<h1>");

    var tempItem = $("<span>");
    var windItem = $("<span>");
    var humidityItem = $("<span>");
    var iconImage = $("<img>");

    //http://openweathermap.org/img/w/{code}.png
    iconImage.attr("src", `https://openweathermap.org/img/w/${iconCode}.png`);

    tempItem.text(`Temp: ${temp} \xB0C`);
    windItem.text(`Wind: ${windSpeed} KPH`);
    humidityItem.text(`Humidity: ${humidity}  %`);

    //if item have index 0 it means it's current weather forecast which one is being displayed as main
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

  //history button generation function
  function generateHistoryButton(locationName) {
    var btn = $("<button>");
    btn.text(locationName);
    btn.addClass("btn btn-secondary mb-3 search-button");
    btn.attr("data-city", locationName);

    $("#history").append(btn);
  }

  //local storage history check
  function getCityHistory() {
    historyCityList = JSON.parse(localStorage.getItem("locationHistory"));

    // if there are no stored cities in local storage. then we set empty array
    if (!historyCityList) {
      historyCityList = [];
      return;
    }
    // if there are stored cities in local storage, we loop through every item in array and generate button in history field
    if (historyCityList.length > 0) {
      for (var i = 0; i < historyCityList.length; i++) {
        generateHistoryButton(historyCityList[i]);
      }
    }
  }
});
