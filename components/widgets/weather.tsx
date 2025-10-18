import React, { useState } from 'react';
import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Calendar } from 'lucide-react';
import Header from '../sideHeader';

interface WeatherData {
  name: string;
  sys: { country: string };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: { speed: number };
  visibility: number;
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  dt_txt: string;
}

interface ForecastData {
  list: ForecastItem[];
}

export default function WeatherApp() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = "dc211a7b0f6949b26ee5dce832aeec60";

  const fetchWeather = async () => {
    if (!city.trim()) return;       

    setLoading(true);
    setError('');

    try {
      const [weatherRes, forecastRes] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`)
      ]);

      if (!weatherRes.ok || !forecastRes.ok) {
        throw new Error('City not found');
      }

      const weatherData = await weatherRes.json();
      const forecastData = await forecastRes.json();
      
      setWeather(weatherData);
      setForecast(forecastData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather');
      setWeather(null);
      setForecast(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchWeather();
    }
  };

  const getWeatherIcon = (main: string, size: string = 'w-20 h-20') => {
    switch (main.toLowerCase()) {
      case 'clear':
        return <Sun className={`${size} text-yellow-400`} />;
      case 'rain':
      case 'drizzle':
        return <CloudRain className={`${size} text-blue-400`} />;
      case 'clouds':
        return <Cloud className={`${size} text-gray-400`} />;
      default:
        return <Cloud className={`${size} text-gray-400`} />;
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-[1200px]">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Weather App
          </h1>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter city name..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition"
              />
              <button
                onClick={fetchWeather}
                disabled={loading}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-400 transition font-medium"
              >
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {weather && (
            <div className="space-y-6 ">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {weather.name}
                </h2>
                <h2>{weather.sys.country}</h2>
                <p className="text-gray-600 capitalize mt-1">
                  {weather.weather[0].description}
                </p>
              </div>

              <div className="flex justify-center">
                {getWeatherIcon(weather.weather[0].main)}
              </div>

              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800">
                  {Math.round(weather.main.temp)}°C
                </div>
                <div className="text-gray-600 mt-2">
                  Feels like {Math.round(weather.main.feels_like)}°C
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Wind className="w-5 h-5" />
                    <span className="font-medium text-sm">Wind</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {weather.wind.speed} m/s
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Droplets className="w-5 h-5" />
                    <span className="font-medium text-sm">Humidity</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {weather.main.humidity}%
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Gauge className="w-5 h-5" />
                    <span className="font-medium text-sm">Pressure</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {weather.main.pressure} hPa
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Eye className="w-5 h-5" />
                    <span className="font-medium text-sm">Visibility</span>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {(weather.visibility / 1000).toFixed(1)} km
                  </div>
                </div>
              </div>

              {forecast && forecast.list && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-800">3-Hour Forecast</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {forecast.list.slice(0, 8).map((item, index) => (
                      <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                        <div className="text-sm font-medium text-gray-600 mb-1">
                          {formatDate(item.dt)}
                        </div>
                        <div className="text-lg font-bold text-blue-600 mb-2">
                          {formatTime(item.dt)}
                        </div>
                        <div className="flex justify-center mb-2">
                          {getWeatherIcon(item.weather[0].main, 'w-10 h-10')}
                        </div>
                        <div className="text-2xl font-bold text-gray-800 text-center">
                          {Math.round(item.main.temp)}°C
                        </div>
                        <div className="text-xs text-gray-600 text-center mt-1 capitalize">
                          {item.weather[0].description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}