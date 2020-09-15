var searchList = JSON.parse(localStorage.getItem("previousSearch")) || ["Boston", "New York", "Philadelphia"]

renderButtons();
newCity(searchList[0])

$("#searchIt").on("click", function (event) {
    event.preventDefault();
    var newSubmit = $("#inputBox").val()
    newCity(newSubmit)
});

$("#pastSearches").on("click", function (event){
    event.preventDefault();
    var pastCity = $(event.target).text()
    newCity(pastCity)
})

function newCity(x) {
    x = x.trim()
    queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + x + "&appid=e8387dd0e718edd5bc59d2897185f69c";

    $.ajax({
        url: queryURL,
        method: "GET"
    }).error(function () {
        alert(x + " is not a valid entry")
    }).then(function (response) {
        console.log(response)
        if (response.message == "city not found") {
            alert(x + " is not a valid entry")
        } else {
            $("#currentName").text(response.name);
            makeButton(response.name)
            $("#currentDate").text(convertTime(response.dt));
            $("#currentLogo").attr("src", "https://openweathermap.org/img/wn/" + response.weather[0].icon + "@4x.png");
            $("#currentLogo").attr("alt", response.weather[0].main);
            $("#currentTemp").text(convertTemp(response.main.temp));
            $("#currentHumidity").text(response.main.humidity);
            $("#currentWind").text(convertSpeed(response.wind.speed));

            var cityLat = response.coord.lat;
            var cityLon = response.coord.lon;

            newQueryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + cityLat + "&lon=" + cityLon + "&exclude=current,hourly,minutely&appid=e8387dd0e718edd5bc59d2897185f69c"

            $.ajax({
                url: newQueryURL,
                method: "GET"
            }).then(function (response) {
                $("#currentUV").text(response.daily[0].uvi);
                $("#currentUV").attr("class" , "uvBad")
                if (response.daily[0].uvi < 7) {
                    $("#currentUV").attr("class" , "uvModerate")
                }
                if (response.daily[0].uvi < 3) {
                    $("#currentUV").attr("class" , "uvGood")
                }
                $("#forecast").empty();
                for (let i = 1; i < 6; i++) {
                    var fDate = convertTime(response.daily[i].dt)
                    var fTemp = convertTemp(response.daily[i].temp.day)
                    var fHumidity = response.daily[i].humidity
                    var fIcon = "https://openweathermap.org/img/wn/" + response.daily[i].weather[0].icon + "@2x.png"
                    var fAlt = response.daily[i].weather[0].main

                    currentDiv = $("<div>")
                    currentDiv.addClass("col forecastCards")
                    currentDiv.attr("id" , "FC" + i)
                    currentDiv.css("opacity" , "0");

                    var forecastH = $("<h5>")
                    forecastH.text(fDate)
                    currentDiv.append(forecastH)

                    var forecastImg = $("<img>")
                    forecastImg.attr("src", fIcon)
                    forecastImg.attr("alt", fAlt)
                    currentDiv.append(forecastImg)

                    var forecastP = $("<p>")
                    forecastP.html("Temp: " + fTemp + "&deg;F<br>Humidity: " + fHumidity + "%")
                    currentDiv.append(forecastP)

                    $("#forecast").append(currentDiv)
                }
                timerDisplay()

            });
        }
    });
}

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
function makeButton(x) {
    searchList.unshift(x);
    console.log(searchList)
    searchList = noDuplicates(searchList)
    console.log(searchList)
    searchList.splice(6);
    localStorage.setItem("previousSearch", JSON.stringify(searchList));
    renderButtons()
}
function noDuplicates(x) {
    let newArray = {};
    x.forEach(function(i) {
      if(!newArray[i]) {
        newArray[i] = true;
      }
    });
    return Object.keys(newArray);
  }
function doNothing() {
    console.log("I waited a sec")
}
function convertSpeed(x) {
    var mph = (x * 2.23694).toFixed(2)
    return mph
}
function convertTemp(x) {
    var fDegree = (Math.round(((x - 273.15) * 1.80 + 32) * 100)) / 100
    return fDegree
}
function convertTime(x) {
    var myDate = new Date(x * 1000);
    var fixedDate = (myDate.getMonth() + 1) + "/" + myDate.getDate() + "/" + myDate.getFullYear()
    return fixedDate
}