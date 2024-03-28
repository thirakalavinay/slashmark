const locationInput = document.getElementById('locationInput');
const searchBtn = document.getElementById('searchBtn');
const detectLocationBtn = document.getElementById('detectLocationBtn');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastContainer = document.getElementById('forecastContainer');

// Replace 'YOUR-API-KEY-HERE' with your OpenWeatherMap API key
const apiKey = '26b6e4c649cdf920697db89238ce5fa5';
const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

searchBtn.addEventListener('click', () => {
    const location = locationInput.value.trim();
    if (location !== '') {
        getWeatherData(location);
    }
});

detectLocationBtn.addEventListener('click', () => {
    // Detect live location
    navigator.geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            getWeatherDataByCoordinates(latitude, longitude);
        },
        error => {
            console.error('Error getting geolocation:', error);
        }
    );
});

function getWeatherData(location) {
    // Fetch current weather data
    fetch(`${weatherApiUrl}?q=${location}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            alert('Oops..!Location not found.!!');
        });

    // Fetch 5-day forecast data
    fetch(`${forecastApiUrl}?q=${location}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

function getWeatherDataByCoordinates(latitude, longitude) {
    // Fetch current weather data using coordinates
    fetch(`${weatherApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            displayCurrentWeather(data);
        })
        .catch(error => {
            console.error('Error fetching current weather:', error);
            alert('Location not found..!');
        });

    // Fetch 5-day forecast data using coordinates
    fetch(`${forecastApiUrl}?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            displayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

function displayCurrentWeather(data) {
    const { name, main, wind, humidity } = data;
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${name}</h2>
        <p>Temperature: ${(main.temp - 273.15).toFixed(2)}°C</p>
        <p>Wind: ${wind.speed} m/s</p>
        <p>Humidity: ${main.humidity}%</p>
    `;
}

function displayForecast(data) {
    const currentDate = new Date();
    const nextFiveDays = new Array(5).fill().map((_, index) => {
        const nextDay = new Date(currentDate.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
        return nextDay.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
    });

    // Filter the forecast for the next 5 days, excluding the current day
    const uniqueForecasts = {};
    const forecasts = data.list.filter(forecast => {
        const forecastDate = forecast.dt_txt.split(' ')[0];
        if (nextFiveDays.includes(forecastDate) && forecastDate !== currentDate.toISOString().split('T')[0] && !uniqueForecasts[forecastDate]) {
            uniqueForecasts[forecastDate] = true;
            return true;
        }
        return false;
    });

    forecastContainer.innerHTML = `
        <h2>Next 5 Days</br>Forecast</h2>
    `;
    forecasts.forEach(forecast => {
        const date = new Date(forecast.dt_txt);
        const formattedDate = date.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric', year: 'numeric' });
        const forecastCard = document.createElement('div');
        forecastCard.className = 'forecast-card';
        forecastCard.innerHTML = `
            <p>Date: ${formattedDate}</p>
            <p>Temperature: ${(forecast.main.temp - 273.15).toFixed(2)}°C</p>
            <p>Wind: ${forecast.wind.speed} m/s</p>
            <p>Humidity: ${forecast.main.humidity !== undefined ? forecast.main.humidity + '%' : 'N/A'}</p>
        `;
        forecastContainer.appendChild(forecastCard);
    });
}
