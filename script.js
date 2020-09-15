// look previous search list in local storage, if not found return generic array

var searchList = JSON.parse(localStorage.getItem("previousSearch")) || ["Boston", "New York", "Philadelphia"]

// render buttons and last city upon loading the site

renderButtons();
newCity(searchList[0])

// if new term is searched, run the newCity function with the input box value

$("#searchIt").on("click", function (event) {
    event.preventDefault();
    var newSubmit = $("#inputBox").val()
    newCity(newSubmit)
});

// if user clicks a city from the previous searches, load that city

$("#pastSearches").on("click", function (event) {
    event.preventDefault();
    var pastCity = $(event.target).text()
    newCity(pastCity)
})

// function for calling new cities

function newCity(x) {

    // trim the input and incorporate it into the weather API url

    x = x.trim()
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + x + "&appid=e8387dd0e718edd5bc59d2897185f69c";

    $.ajax({
        url: queryURL,
        method: "GET"

        // if there is an error, let the user know

    }).error(function () {
        alert(x + " is not a valid entry")

        // if no error, do this

    }).then(function (response) {
        console.log(response)

        // set the current weather data

        $("#currentName").text(response.name);
        makeButton(response.name)
        $("#currentDate").text(convertTime(response.dt));
        $("#currentLogo").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@4x.png");
        $("#currentLogo").attr("alt", response.weather[0].main);
        $("#currentTemp").text(convertTemp(response.main.temp));
        $("#currentHumidity").text(response.main.humidity);
        $("#currentWind").text(convertSpeed(response.wind.speed));

        // retrieve the coordinates of the city and input them into a new API url for forecast data

        var cityLat = response.coord.lat;
        var cityLon = response.coord.lon;

        newQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLon + "&exclude=current,hourly,minutely&appid=e8387dd0e718edd5bc59d2897185f69c"

        $.ajax({
            url: newQueryURL,
            method: "GET"
        }).then(function (response) {

            // set UV index, determine its quality, and give it a color accordingly

            $("#currentUV").text(response.daily[0].uvi);
            $("#currentUV").attr("class", "uvBad")
            if (response.daily[0].uvi < 7) {
                $("#currentUV").attr("class", "uvModerate")
            }
            if (response.daily[0].uvi < 3) {
                $("#currentUV").attr("class", "uvGood")
            }

            // empty the forecast list and fill it with the new forcast data

            $("#forecast").empty();
            for (let i = 1; i < 6; i++) {

                // forcast variables

                var fDate = convertTime(response.daily[i].dt)
                var fTemp = convertTemp(response.daily[i].temp.day)
                var fHumidity = response.daily[i].humidity
                var fIcon = "https://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png"
                var fAlt = response.daily[i].weather[0].main

                // create a empty div and give it classes, an id, and make it invisible

                currentDiv = $("<div>")
                currentDiv.addClass("col forecastCards")
                currentDiv.attr("id", "FC" + i)
                currentDiv.css("opacity", "0");

                // add the date

                var forecastH = $("<h5>")
                forecastH.text(fDate)
                currentDiv.append(forecastH)

                // add the weather image

                var forecastImg = $("<img>")
                forecastImg.attr("src", fIcon)
                forecastImg.attr("alt", fAlt)
                currentDiv.append(forecastImg)

                // add the temp and humidity for that day

                var forecastP = $("<p>")
                forecastP.html("Temp: " + fTemp + "&deg;F<br>Humidity: " + fHumidity + "%")
                currentDiv.append(forecastP)

                // append it to the forcast section

                $("#forecast").append(currentDiv)
            }

            // make the last three forcasts the same width as the first to ensure they remain identical when pushed to a new line

            $("#FC5").css("max-width", $("#FC1").outerWidth());
            $("#FC4").css("max-width", $("#FC1").outerWidth());
            $("#FC3").css("max-width", $("#FC1").outerWidth());

            // make all the forcasts fade in one at a time 

            timerDisplay()

        });

    });
}

// when the window is resized, continue to make the last three forcasts the same width as the first to ensure they remain identical when pushed to a new line

$(window).resize(function () {
    $("#FC5").css("max-width", $("#FC1").outerWidth());
    $("#FC4").css("max-width", $("#FC1").outerWidth());
    $("#FC3").css("max-width", $("#FC1").outerWidth());
});

// consecutively fade in each forcast for a pleasant loading animation (every .1 seconds, fade in a forcast from 0 to 1 in .5 seconds)

function timerDisplay() {
    var indexN = 0
    var timerInterval = setInterval(function () {
        indexN++;
        $("#FC" + indexN).fadeTo(500, 1);
        if (indexN === 5) {
            clearInterval(timerInterval);
        }
    }, 100);
}

// render the past searches in order on the side panel

function renderButtons() {
    $("#pastSearches").empty();
    console.log("clear")
    for (let i = 0; i < searchList.length; i++) {
        newLi = $("<li>");
        newLi.addClass("list-group-item btn");
        newLi.text(searchList[i]);
        $("#pastSearches").append(newLi);
    }
}

// add to the past searches

function makeButton(x) {

    // prepend the most recent search
    searchList.unshift(x);
    // remove duplicates
    searchList = noDuplicates(searchList)
    // keep only the 5 most recent searches
    searchList.splice(6);
    // update local storage with the new list
    localStorage.setItem("previousSearch", JSON.stringify(searchList));
    // render new list
    renderButtons()
}

// function for removing duplicates

function noDuplicates(x) {
    // make a new object
    let newObj = {};
    // for each item in the array, determine if it is in the new object. if it does not appear, add it with the value true (the value does not matter much)
    x.forEach(function (item) {
        if (!newObj[item]) {
            newObj[item] = true;
        }
    });
    // return an array made of the object's keys (the original array items that did not repeat)
    return Object.keys(newObj);
}

// convert speed from m/s to mph

function convertSpeed(x) {
    var mph = (x * 2.23694).toFixed(2)
    return mph
}

// convert Kelvin to Fahrenheit

function convertTemp(x) {
    var fDegree = (Math.round(((x - 273.15) * 1.80 + 32) * 100)) / 100
    return fDegree
}

// convert the Unix time to a readble date in MM/DD/YYYY format
function convertTime(x) {
    var myDate = new Date(x * 1000);
    var fixedDate = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()
    return fixedDate
}