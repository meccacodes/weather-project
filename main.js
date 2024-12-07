const apiKey = "3f88d5f8bbfa8eb651ea5f78d37f3578";
const currentWeatherDiv = document.getElementById("currentWeather");
const forecastDiv = document.getElementById("forecast");
const searchBtn = document.getElementById("searchBtn");
const locationInput = document.getElementById("locationInput");

async function fetchWeatherData(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${apiKey}&units=imperial`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
  }
}

async function getApproximateLocation() {
  const response = await fetch("http://ip-api.com/json");
  const data = await response.json();
  return { lat: data.lat, lon: data.lon, name: data.city };
}

function displayCurrentWeather(data, cityName) {
  const { temp, weather } = data.current;

  document.getElementById("cityName").innerText = cityName;
  document.getElementById("temperature").innerText = `${temp.toFixed(1)}°F`;
  document.getElementById("weatherDescription").innerText =
    weather[0].description;
  document.getElementById(
    "weatherIcon"
  ).src = `http://openweathermap.org/img/wn/${weather[0].icon}.png`;
}

function displayForecast(daily) {
  forecastDiv.innerHTML = "";
  daily.slice(1, 6).forEach((day) => {
    const date = new Date(day.dt * 1000);
    const options = { weekday: "long" };
    const dayName = date.toLocaleDateString("en-US", options);
    const { temp, weather } = day;
    forecastDiv.innerHTML += `
          <div class="col forecast-card">
              <div class="card">
                  <div class="card-body text-center">
                      <h3>${dayName}</h3>
                      <p>${temp.day.toFixed(1)}°F</p>
                      <p>${weather[0].description}</p>
                      <img src="http://openweathermap.org/img/wn/${
                        weather[0].icon
                      }.png" alt="${weather[0].description}">
                  </div>
              </div>
          </div>`;
  });
}

function isValidZipCode(zip) {
  if (zip.length === 5) {
    return zip.split("").every((char) => char >= "0" && char <= "9");
  } else if (zip.length === 10) {
    return (
      zip[5] === "-" &&
      zip
        .slice(0, 5)
        .split("")
        .every((char) => char >= "0" && char <= "9") &&
      zip
        .slice(6)
        .split("")
        .every((char) => char >= "0" && char <= "9")
    );
  }
  return false;
}

function isValidZipCode(zip) {
  if (zip.length === 5) {
    return zip.split("").every((char) => char >= "0" && char <= "9");
  } else if (zip.length === 10) {
    return (
      zip[5] === "-" &&
      zip
        .slice(0, 5)
        .split("")
        .every((char) => char >= "0" && char <= "9") &&
      zip
        .slice(6)
        .split("")
        .every((char) => char >= "0" && char <= "9")
    );
  }
  return false;
}

searchBtn.addEventListener("click", async () => {
  const location = locationInput.value;
  let geoUrl;

  if (isValidZipCode(location)) {
    geoUrl = `https://api.openweathermap.org/geo/1.0/zip?zip=${location}&appid=${apiKey}`;
  } else {
    geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${apiKey}`;
  }

  try {
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    let lat, lon, name;
    if (Array.isArray(geoData) && geoData.length > 0) {
      ({ lat, lon, name } = geoData[0]);
    } else if (geoData.lat && geoData.lon) {
      ({ lat, lon, name } = geoData);
    } else {
      throw new Error("Location not found");
    }

    const weatherData = await fetchWeatherData(lat, lon);
    if (weatherData) {
      displayCurrentWeather(weatherData, name);
      displayForecast(weatherData.daily);
    }
  } catch (error) {
    console.error("Error:", error);
    alert(error.message);
  }
});

getApproximateLocation().then(async (location) => {
  const weatherData = await fetchWeatherData(location.lat, location.lon);
  if (weatherData) {
    displayCurrentWeather(weatherData, location.name);
    displayForecast(weatherData.daily);
  }
});
