import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css'; // Ensure you have a separate CSS file for styling

// Import weather icons
import { WiDaySunny, WiCloudy, WiDayCloudy, WiRain, WiSnow, WiFog, WiThunderstorm, WiShowers } from 'weather-icons-react';

const WeatherApp = () => {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState({});
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch initial weather data for a default location on component mount (optional)
    fetchWeather('London');
  }, []);

  const fetchWeather = async (loc) => {
    try {
      const API_KEY = '32c872b51d09bc3c9470582b1797651c';// from openweather website
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${API_KEY}&units=metric`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${loc}&appid=${API_KEY}&units=metric`;

      console.log(`Fetching weather for location: ${loc}`);
      const [weatherResponse, forecastResponse] = await Promise.all([
        axios.get(weatherUrl),
        axios.get(forecastUrl)
      ]);

      console.log('Weather data received:', weatherResponse.data);
      console.log('Forecast data received:', forecastResponse.data);

      setWeather(weatherResponse.data);
      setError('');

      // Extract and process forecast data
      processForecast(forecastResponse.data);

    } catch (err) {
      console.error('Error fetching weather data:', err.response ? err.response.data : err.message);
      setError('Unable to fetch weather data. Please check the location.');
    }
  };

  const processForecast = (data) => {
    // Extract relevant data for next 7 days
    const dailyForecasts = data.list.reduce((acc, forecast) => {
      const date = new Date(forecast.dt * 1000); // Convert timestamp to date
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });

      // Only include forecasts for next 7 days
      if (!acc[dayOfWeek]) {
        acc[dayOfWeek] = {
          temperature: forecast.main.temp,
          icon: forecast.weather[0].icon,
        };
      }

      return acc;
    }, {});

    setForecast(dailyForecasts);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (location) {
      fetchWeather(location);
    }
  };

  const handleCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (err) => {
        console.error('Error getting current location:', err);
        setError('Unable to retrieve your location.');
      }
    );
  };

  const getWeatherIcon = (weatherId) => {
    // Map weather condition codes to corresponding icons using Weather Icons library (wi)
    if (weatherId >= 200 && weatherId < 300) {
      return <WiThunderstorm size={64} color='#007bff' />;
    } else if (weatherId >= 300 && weatherId < 400) {
      return <WiShowers size={64} color='#007bff' />;
    } else if (weatherId >= 500 && weatherId < 600) {
      return <WiRain size={64} color='#007bff' />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <WiSnow size={64} color='#007bff' />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <WiFog size={64} color='#007bff' />;
    } else if (weatherId === 800) {
      return <WiDaySunny size={64} color='#007bff' />;
    } else if (weatherId === 801 || weatherId === 802) {
      return <WiDayCloudy size={64} color='#007bff' />;
    } else if (weatherId === 803 || weatherId === 804) {
      return <WiCloudy size={64} color='#007bff' />;
    } else {
      return <WiDaySunny size={64} color='#007bff' />;
    }
  };

  return (
    <div className="weather-app">
      <h1>Weather App</h1>
      <form onSubmit={handleLocationSubmit}>
        <input
          type="text"
          placeholder="Enter location (e.g., city name)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button type="submit">Get Weather</button>
      </form>
      <button className="current-location-btn" onClick={handleCurrentLocation}>Use Current Location</button>
      {error && <p className="error">{error}</p>}
      {weather && (
        <div className="weather-info">
          <h2>{weather.name}</h2>
          <p>{weather.weather[0].description}</p>
          <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
          <p>Humidity: {weather.main.humidity}%</p>
          <p>Wind Speed: {weather.wind.speed} m/s</p>
          <div className="weather-icon">{getWeatherIcon(weather.weather[0].id)}</div>
        </div>
      )}
      <div className="forecast-section">
        <h2>7-Day Forecast</h2>
        <div className="forecast-boxes">
          {Object.keys(forecast).map((dayOfWeek) => (
            <div key={dayOfWeek} className="forecast-box">
              <h3>{dayOfWeek}</h3>
              <p><strong>Temp:</strong> {forecast[dayOfWeek].temperature}°C</p>
              <img src={`https://openweathermap.org/img/wn/${forecast[dayOfWeek].icon}.png`} alt="Weather Icon" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherApp;
