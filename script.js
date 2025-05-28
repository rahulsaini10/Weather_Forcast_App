document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const cityInput = document.getElementById('city-input');
  const searchBtn = document.getElementById('search-btn');
  const locationBtn = document.getElementById('location-btn');
  const celsiusBtn = document.getElementById('celsius-btn');
  const fahrenheitBtn = document.getElementById('fahrenheit-btn');
  const themeBtn = document.getElementById('theme-btn');
  const errorElement = document.getElementById('error-message');
  const loadingElement = document.getElementById('loading');
  const weatherContainer = document.getElementById('weather-container');
  const locationElement = document.getElementById('location');
  const coordinatesElement = document.getElementById('coordinates');
  const currentDateElement = document.getElementById('current-date');
  const currentTimeElement = document.getElementById('current-time');
  const weatherIcon = document.getElementById('weather-icon');
  const tempValue = document.getElementById('temp-value');
  const tempUnit = document.getElementById('temp-unit');
  const descriptionElement = document.getElementById('description');
  const humidityElement = document.getElementById('humidity');
  const windSpeedElement = document.getElementById('wind-speed');
  const pressureElement = document.getElementById('pressure');
  const visibilityElement = document.getElementById('visibility');
  const forecastElement = document.getElementById('forecast');
  
  // API Key
  const API_KEY = 'fe4f610d3235a6198e16985067d15dc6';
  
  // State variables
  let currentUnit = 'celsius';
  let currentWeatherData = null;
  let darkMode = false;

  // Initialize the app
  function init() {
    // Load saved preferences
    const savedUnit = localStorage.getItem('temperatureUnit');
    if (savedUnit) {
      currentUnit = savedUnit;
      updateUnitButtons();
    }
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      toggleTheme();
    }
    
    // Load last searched city if available
    const lastCity = localStorage.getItem('lastSearchedCity');
    if (lastCity) {
      cityInput.value = lastCity;
      fetchWeather(lastCity);
    } else {
      cityInput.value = '';
      fetchWeather('London');
    }
    
    // Update time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }

  // Theme toggle function
  function toggleTheme() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
    themeBtn.innerHTML = darkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }

  // Event Listeners
  searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
      fetchWeather(city);
    }
  });

  cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const city = cityInput.value.trim();
      if (city) {
        fetchWeather(city);
      }
    }
  });

  locationBtn.addEventListener('click', getLocationWeather);
  
  themeBtn.addEventListener('click', toggleTheme);

  celsiusBtn.addEventListener('click', () => {
    currentUnit = 'celsius';
    localStorage.setItem('temperatureUnit', 'celsius');
    updateUnitButtons();
    if (currentWeatherData) {
      displayWeather(currentWeatherData);
    }
  });

  fahrenheitBtn.addEventListener('click', () => {
    currentUnit = 'fahrenheit';
    localStorage.setItem('temperatureUnit', 'fahrenheit');
    updateUnitButtons();
    if (currentWeatherData) {
      displayWeather(currentWeatherData);
    }
  });

  function updateUnitButtons() {
    if (currentUnit === 'celsius') {
      celsiusBtn.classList.add('active');
      fahrenheitBtn.classList.remove('active');
      tempUnit.textContent = '°C';
    } else {
      celsiusBtn.classList.remove('active');
      fahrenheitBtn.classList.add('active');
      tempUnit.textContent = '°F';
    }
  }

  function updateDateTime() {
    const now = new Date();
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    currentDateElement.textContent = now.toLocaleDateString(undefined, options);
    currentTimeElement.textContent = now.toLocaleTimeString();
    
    // Update day/night mode based on time (optional - can be removed if using manual theme toggle)
    const hours = now.getHours();
    if (!localStorage.getItem('theme')) { // Only auto-update if user hasn't set a preference
      if (hours >= 18 || hours <= 6) {
        if (!darkMode) toggleTheme();
      } else {
        if (darkMode) toggleTheme();
      }
    }
  }

  function showLoading() {
    loadingElement.style.display = 'flex';
    weatherContainer.style.opacity = '0.5';
    weatherContainer.style.pointerEvents = 'none';
    errorElement.style.display = 'none';
  }

  function hideLoading() {
    loadingElement.style.display = 'none';
    weatherContainer.style.opacity = '1';
    weatherContainer.style.pointerEvents = 'auto';
  }

  function showError(message) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    weatherContainer.style.display = 'none';
    hideLoading();
  }

  function hideError() {
    errorElement.style.display = 'none';
    weatherContainer.style.display = 'flex';
  }

  async function fetchWeather(city) {
    showLoading();
    hideError();
    try {
      const currentWeather = await getCurrentWeather(city);
      const forecast = await getForecast(city);
      currentWeatherData = {
        ...currentWeather,
        forecast: forecast.list,
      };
      displayWeather(currentWeatherData);
      localStorage.setItem('lastSearchedCity', city);
    } catch (error) {
      showError(error.message);
    } finally {
      hideLoading();
    }
  }

  async function getCurrentWeather(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('City not found. Please try another location.');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async function getForecast(city) {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error('Could not fetch forecast data.');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  function displayWeather(data) {
    locationElement.textContent = `${data.name}, ${data.sys.country}`;
    coordinatesElement.textContent = `Lat: ${data.coord.lat.toFixed(2)}, Lon: ${data.coord.lon.toFixed(2)}`;
    
    const iconCode = data.weather[0].icon;
    weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    weatherIcon.style.display = 'block';
    
    const weatherMain = data.weather[0].main.toLowerCase();
    document.querySelector('.weather-icon').className = `weather-icon ${weatherMain}`;
    
    const tempCelsius = (data.main.temp - 273.15).toFixed(1);
    const tempFahrenheit = ((tempCelsius * 9) / 5 + 32).toFixed(1);
    tempValue.textContent = currentUnit === 'celsius' ? tempCelsius : tempFahrenheit;
    
    const weatherDesc = data.weather[0].description;
    descriptionElement.textContent = weatherDesc;
    
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    pressureElement.textContent = `${data.main.pressure} hPa`;
    
    if (data.visibility) {
      visibilityElement.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    } else {
      visibilityElement.textContent = 'N/A';
    }
    
    displayForecast(data.forecast);
  }

  function displayForecast(forecastData) {
    forecastElement.innerHTML = '';
    const dailyForecast = {};
    
    forecastData.forEach((item) => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString(undefined, { weekday: 'short' });
      
      if (!dailyForecast[day]) {
        dailyForecast[day] = {
          minTemp: Infinity,
          maxTemp: -Infinity,
          icon: item.weather[0].icon,
          description: item.weather[0].description,
        };
      }
      
      const temp = item.main.temp - 273.15;
      if (temp < dailyForecast[day].minTemp) {
        dailyForecast[day].minTemp = temp;
      }
      if (temp > dailyForecast[day].maxTemp) {
        dailyForecast[day].maxTemp = temp;
      }
    });
    
    const days = Object.keys(dailyForecast).slice(0, 5);
    days.forEach((day) => {
      const dayData = dailyForecast[day];
      const forecastItem = document.createElement('div');
      forecastItem.className = 'forecast-item';
      
      const minTemp = currentUnit === 'celsius' 
        ? dayData.minTemp.toFixed(0) 
        : ((dayData.minTemp * 9) / 5 + 32).toFixed(0);
      
      const maxTemp = currentUnit === 'celsius' 
        ? dayData.maxTemp.toFixed(0) 
        : ((dayData.maxTemp * 9) / 5 + 32).toFixed(0);
      
      forecastItem.innerHTML = `
        <div class="forecast-day">${day}</div>
        <div class="forecast-icon">
          <img src="https://openweathermap.org/img/wn/${dayData.icon}.png" alt="${dayData.description}">
        </div>
        <div class="forecast-temp">
          <span class="forecast-high">${maxTemp}°</span>
          <span class="forecast-low">${minTemp}°</span>
        </div>
      `;
      
      forecastElement.appendChild(forecastItem);
    });
  }

  function getLocationWeather() {
    if (!navigator.geolocation) {
      showError('Geolocation is not supported by your browser');
      return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
          );
          
          if (!response.ok) {
            throw new Error('Could not fetch weather for your location.');
          }
          
          const currentWeather = await response.json();
          const forecast = await getForecast(currentWeather.name);
          
          currentWeatherData = {
            ...currentWeather,
            forecast: forecast.list,
          };
          
          cityInput.value = currentWeather.name;
          displayWeather(currentWeatherData);
          localStorage.setItem('lastSearchedCity', currentWeather.name);
        } catch (error) {
          showError(error.message);
        } finally {
          hideLoading();
        }
      },
      (error) => {
        showError('Unable to retrieve your location. Please enable location services.');
        hideLoading();
      }
    );
  }
  
  // Initialize the app
  init();
});