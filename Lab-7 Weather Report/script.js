
const form = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const message = document.getElementById("message");
const weatherCard = document.getElementById("weatherCard");

form.addEventListener("submit", function (event) {
    event.preventDefault();
    getWeather(cityInput.value.trim());
});

async function getWeather(city) {
    if (!city) return;

    message.hidden = false;
    message.textContent = "Fetching weather information...";
    weatherCard.hidden = true;

    try {
        // Step 1: Find the city's latitude and longitude.
        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Unable to contact the location service.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            throw new Error("City not found. Check the spelling.");
        }

        const location = geoData.results[0];

        // Step 2: Fetch current weather using the coordinates.
        const params = new URLSearchParams({
            latitude: location.latitude,
            longitude: location.longitude,
            current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code",
            timezone: "auto"
        });

        const weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast?" + params
        );

        if (!weatherResponse.ok) {
            throw new Error("Unable to retrieve weather information.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;

        // Step 3: Display the results.
        document.getElementById("cityName").textContent =
            [location.name, location.admin1, location.country]
                .filter(Boolean)
                .join(", ");

        document.getElementById("temperature").textContent =
            Math.round(current.temperature_2m);

        document.getElementById("feelsLike").textContent =
            Math.round(current.apparent_temperature) + " °C";

        document.getElementById("humidity").textContent =
            current.relative_humidity_2m + "%";

        document.getElementById("windSpeed").textContent =
            current.wind_speed_10m + " km/h";

        document.getElementById("description").textContent =
            getWeatherDescription(current.weather_code);

        document.getElementById("weatherIcon").textContent =
            getWeatherIcon(current.weather_code);

        document.getElementById("localTime").textContent =
            "Local time: " + current.time.replace("T", " ");

        weatherCard.hidden = false;
        message.hidden = true;

    } catch (error) {
        message.hidden = false;
        message.textContent =
            error.message || "Something went wrong. Please try again.";
    }
}

function getWeatherDescription(code) {
    if (code === 0) return "Clear sky";
    if ([1, 2, 3].includes(code)) return "Partly cloudy";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather conditions unavailable";
}

function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "🌤️";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "🌡️";
}

// Display a default city's weather when the page opens.
getWeather("Vijayawada");
