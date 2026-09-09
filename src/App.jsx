import { useEffect, useState } from "react";
import WeatherBackground from "./components/WeatherBackground";
import {
  convertTemperature,
  getHumidityValue,
  getVisibilityValue,
  getWindDirection,
} from "./components/Helper";
import {
  HumidityIcon,
  WindIcon,
  VisibilityIcon,
  SunriseIcon,
  SunsetIcon,
} from "./components/Icons";
import WeatherChat from "./components/WeatherChat";

const App = () => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState("");
  const [suggestion, setSuggestion] = useState([]);
  const [unit, setUnit] = useState("C");
  const [error, setError] = useState("");

  const API_KEY = "f0a3aae04dec2f55a6dd08256e2ab06c";

  useEffect(() => {
    if (city.trim().length >= 3 && !weather) {
      const timer = setTimeout(() => fetchSuggestions(city), 500);

      return () => clearTimeout(timer);
    }

    setSuggestion([]);
  }, [city, weather]);

  const fetchSuggestions = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`,
      );

      res.ok ? setSuggestion(await res.json()) : setSuggestion([]);
    } catch {
      setSuggestion([]);
    }
  };

  const fetchWeatherData = async (url, name = "") => {
    setError("");
    setWeather(null);

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error((await response.json()).message || "City not Found");
      }

      const data = await response.json();

      setWeather(data);
      setCity(name || data.name);
      setSuggestion([]);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!city.trim()) {
      return setError("Please enter a valid city name.");
    }

    await fetchWeatherData(
      `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`,
    );
  };

  const getWeatherCondition = () =>
    weather && {
      main: weather.weather[0].main,
      isDay:
        Date.now() / 1000 > weather.sys.sunrise &&
        Date.now() / 1000 < weather.sys.sunset,
    };

  return (
    <div className="min-h-screen">
      <WeatherBackground condition={getWeatherCondition()} />

      <div
        className={`flex flex-col items-center p-6 min-h-screen ${
          !weather ? "justify-center" : ""
        }`}
      >
        {/* =====================================================
      INITIAL SEARCH PAGE
  ====================================================== */}

        {!weather && (
          <div
            className="weather-search-card bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8
      max-w-md text-white w-full border border-white/30 relative z-10"
          >
            <h1 className="text-4xl font-extrabold text-center mb-6">
              Weather GPT
            </h1>

            <form onSubmit={handleSearch} className="flex flex-col relative">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter City or Country (min 3 letters)"
                className="mb-4 p-3 rounded border border-white bg-transparent text-white placeholder-white focus:outline-none
                focus:border-blue-300 transition duration-300"
              />

              {suggestion.length > 0 && (
                <div className="absolute top-12 left-0 right-0 bg-black/40 backdrop-blur-md shadow-md rounded z-10">
                  {suggestion.map((s) => (
                    <button
                      type="button"
                      key={`${s.lat}-${s.lon}`}
                      onClick={() =>
                        fetchWeatherData(
                          `https://api.openweathermap.org/data/2.5/weather?lat=${s.lat}&lon=${s.lon}&appid=${API_KEY}&units=metric`,
                          `${s.name}, ${s.country}${
                            s.state ? `, ${s.state}` : ""
                          }`,
                        )
                      }
                      className="block hover:bg-blue-700 bg-transparent px-4 py-2 text-sm text-left w-full
                      transition-colors"
                    >
                      {s.name}, {s.country}
                      {s.state && `, ${s.state}`}
                    </button>
                  ))}
                </div>
              )}

              <button
                type="submit"
                className="bg-purple-700 hover:bg-blue-700 text-white font-semibold py-2 px-4
                rounded transition-colors"
              >
                Get Weather
              </button>
            </form>

            {error && <p className="text-red-400 text-center mt-4">{error}</p>}
          </div>
        )}

        {/* =====================================================
            AFTER CITY SEARCH - WEATHER APP
        ====================================================== */}

        {weather && (
          <>
            <div
              className="weather-display-card bg-transparent backdrop-filter backdrop-blur-md rounded-xl shadow-2xl p-8
              max-w-4xl text-white w-full border border-white/30 relative z-10"
            >
              <h1 className="text-4xl font-extrabold text-center mb-6">
                Weather App
              </h1>

              <div className="mt-6 text-center transition-opacity duration-500">
                {/* New Search */}
                <button
                  onClick={() => {
                    setWeather(null);
                    setCity("");
                  }}
                  className="mb-4 bg-purple-900 hover:bg-blue-700 text-white font-semibold py-1 px-3
                  rounded transition-colors"
                >
                  New Search
                </button>

                {/* City + Unit */}
                <div className="flex justify-between items-center">
                  <h2 className="text-3xl font-bold">{weather.name}</h2>

                  <button
                    onClick={() => setUnit((u) => (u === "C" ? "F" : "C"))}
                    className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-1 px-3 rounded
                    transition-colors"
                  >
                    &deg;{unit}
                  </button>
                </div>

                {/* Weather Icon */}
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt={weather.weather[0].description}
                  className="mx-auto my-4 animate-bounce"
                />

                {/* Temperature */}
                <p className="text-4xl">
                  {convertTemperature(weather.main.temp, unit)} &deg;{unit}
                </p>

                <p className="capitalize">{weather.weather[0].description}</p>

                {/* =================================================
                    WEATHER DETAILS
                ================================================= */}

                <div className="grid grid-cols-3 gap-6 mt-8 max-w-2xl mx-auto">
                  {/* Humidity */}
                  <div className="flex flex-col items-center justify-center">
                    <HumidityIcon />

                    <p className="mt-2 font-semibold">Humidity</p>

                    <p className="text-sm">
                      {weather.main.humidity}% (
                      {getHumidityValue(weather.main.humidity)})
                    </p>
                  </div>

                  {/* Wind */}
                  <div className="flex flex-col items-center justify-center">
                    <WindIcon />

                    <p className="mt-2 font-semibold">Wind</p>

                    <p className="text-sm">
                      {weather.wind.speed} m/s{" "}
                      {weather.wind.deg !== undefined
                        ? `(${getWindDirection(weather.wind.deg)})`
                        : ""}
                    </p>
                  </div>

                  {/* Visibility */}
                  <div className="flex flex-col items-center justify-center">
                    <VisibilityIcon />

                    <p className="mt-2 font-semibold">Visibility</p>

                    <p className="text-sm">
                      {getVisibilityValue(weather.visibility)}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    SUNRISE / SUNSET
                ================================================= */}

                <div className="grid grid-cols-2 gap-10 mt-8 max-w-md mx-auto">
                  {/* Sunrise */}
                  <div className="flex flex-col items-center justify-center">
                    <SunriseIcon />

                    <p className="mt-2 font-semibold">Sunrise</p>

                    <p className="text-sm">
                      {new Date(weather.sys.sunrise * 1000).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  {/* Sunset */}
                  <div className="flex flex-col items-center justify-center">
                    <SunsetIcon />

                    <p className="mt-2 font-semibold">Sunset</p>

                    <p className="text-sm">
                      {new Date(weather.sys.sunset * 1000).toLocaleTimeString(
                        "en-GB",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Feels Like + Pressure */}
                <div className="mt-8 text-sm">
                  <p>
                    <strong>Feels Like:</strong>{" "}
                    {convertTemperature(weather.main.feels_like, unit)} &deg;
                    {unit}
                  </p>

                  <p>
                    <strong>Pressure:</strong> {weather.main.pressure} hPa
                  </p>
                </div>
              </div>
            </div>

            {/* =====================================================
                WEATHERGPT
            ====================================================== */}

            <div className="w-full max-w-4xl relative z-10">
              <WeatherChat weather={weather} />
            </div>

            {error && (
              <p className="text-red-400 text-center mt-4 relative z-10">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default App;
