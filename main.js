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
  return { lat: data.lat, lon: data.lon };
}

function displayCurrentWeather(data) {
  const { temp, weather } = data.current;

  document.getElementById("cityName").innerText = data.timezone;
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

searchBtn.addEventListener("click", async () => {
  const location = locationInput.value;
  const geoResponse = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${location}&appid=${apiKey}`
  );
  const geoData = await geoResponse.json();

  if (geoData.length > 0) {
    const { lat, lon } = geoData[0];
    const weatherData = await fetchWeatherData(lat, lon);
    if (weatherData) {
      displayCurrentWeather(weatherData);
      displayForecast(weatherData.daily);
    }
  } else {
    alert("Location not found.");
  }
});

getApproximateLocation().then(async (location) => {
  const weatherData = await fetchWeatherData(location.lat, location.lon);
  if (weatherData) {
    displayCurrentWeather(weatherData);
    displayForecast(weatherData.daily);
  }
});
