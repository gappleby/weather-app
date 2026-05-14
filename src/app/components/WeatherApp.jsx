'use client';

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import Card from "./Card";
import Search from "./Search";
import ForecastStrip from "./ForecastStrip";
import LocationClock from "./LocationClock";
import LocationDate from "./LocationDate";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY;
const VALID_UNITS = ['metric', 'imperial'];

const getIcon = (weatherMain) => {
    const iconMap = {
        Rain: "./rain.svg",
        Mist: "./mist.svg",
        Snow: "./snow.svg",
        Wind: "./wind.svg",
        Clear: "./clear.svg",
        Clouds: "./clouds.svg",
        Drizzle: "./drizzle.svg",
    };
    return iconMap[weatherMain] || './clear.svg';
};

const getIconFromWMO = (code) => {
    if (code === 0)  return './clear.svg';
    if (code <= 3)   return './clouds.svg';
    if (code <= 48)  return './mist.svg';
    if (code <= 55)  return './drizzle.svg';
    if (code <= 67)  return './rain.svg';
    if (code <= 77)  return './snow.svg';
    if (code <= 82)  return './rain.svg';
    if (code <= 86)  return './snow.svg';
    return './rain.svg';
};

const pad = (n) => String(n).padStart(2, '0');

const formatHour = (timeStr) => {
    const h = parseInt(timeStr.split('T')[1]);
    if (h === 0)  return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
};


export default function WeatherApp() {
    const searchParams = useSearchParams();
    const queryCityParam = searchParams.get('city');
    const queryUnitsParam = searchParams.get('units');
    const units = VALID_UNITS.includes(queryUnitsParam) ? queryUnitsParam : 'metric';
    const apiKey = searchParams.get('openweathermapapi') || API_KEY;
    const parseBool = (val) => !['false', 'f', 'n'].includes((val ?? '').toLowerCase());
    const showTime = parseBool(searchParams.get('showtime'));
    const showDate = parseBool(searchParams.get('showdate'));
    const showForecast = parseBool(searchParams.get('showforecast'));
    const tempUnit = units === 'metric' ? '°C' : '°F';
    const windUnit = units === 'metric' ? 'm/s' : 'mph';

    const [city, setCity] = useState(queryCityParam || 'melbourne,au');
    const [weatherData, setWeatherData] = useState(null);
    const [forecastItems, setForecastItems] = useState(null);
    const [utcOffsetSeconds, setUtcOffsetSeconds] = useState(null);
    const [locationMeta, setLocationMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const fetchWeatherData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const weatherRes = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${apiKey}`
            );
            setWeatherData(weatherRes.data);
            const { lat, lon } = weatherRes.data.coord;
            const omTempUnit = units === 'metric' ? 'celsius' : 'fahrenheit';
            const forecastRes = await axios.get(
                `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode&forecast_days=2&timezone=auto&temperature_unit=${omTempUnit}`
            );

            const { utc_offset_seconds, hourly, timezone } = forecastRes.data;
            setUtcOffsetSeconds(utc_offset_seconds);
            setLocationMeta({ timezone, country: weatherRes.data.sys.country });
            const cityNow = new Date(Date.now() + utc_offset_seconds * 1000);
            const currentHourStr = `${cityNow.getUTCFullYear()}-${pad(cityNow.getUTCMonth() + 1)}-${pad(cityNow.getUTCDate())}T${pad(cityNow.getUTCHours())}:00`;
            const idx = hourly.time.indexOf(currentHourStr);
            const start = idx >= 0 ? idx + 1 : 0;

            setForecastItems(
                hourly.time.slice(start, start + 6).map((t, i) => ({
                    dt: t,
                    time: formatHour(t),
                    temp: Math.round(hourly.temperature_2m[start + i]),
                    icon: getIconFromWMO(hourly.weathercode[start + i]),
                    description: '',
                }))
            );
        } catch (err) {
            setError("Unable to fetch weather data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [city, units, apiKey])

    useEffect(() => {
        fetchWeatherData();
        const id = setInterval(fetchWeatherData, 60 * 60 * 1000);
        return () => clearInterval(id);
    }, []);

    const handleInputChange = (e) => { setCity(e.target.value); }

    const handleSearchClick = () => {
        if (city) { fetchWeatherData(); }
        else { setError("Please enter a city name."); }
    };

    return (
        <section className="relative bg-gradient-to-br from-[#87CEFA] to-[#0A1628] px-responsive-x py-responsive-y flex flex-col justify-center gap-5 rounded-2xl sm:gap-8 text-center h-full w-full">
            {showDate && locationMeta && <LocationDate timezone={locationMeta.timezone} country={locationMeta.country} />}
            {showTime && utcOffsetSeconds !== null && <LocationClock utcOffsetSeconds={utcOffsetSeconds} />}
            {!queryCityParam && <Search onInputChange={handleInputChange} onSearchClick={handleSearchClick} />}
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {weatherData && (
                <>
                    <Card
                        isTemp={true}
                        value={`${weatherData.main.temp}${tempUnit}`}
                        text={weatherData.name}
                        alt={weatherData.weather[0].description}
                        src={getIcon(weatherData.weather[0].main)} // Icon directly from OpenWeatherMap
                    />
                    <div className="flex justify-around mt-5 sm:gap-20">
                        <Card isWind={false} value={`${weatherData.main.humidity}%`} />
                        <Card isWind={true} value={`${weatherData.wind.speed} ${windUnit}`} />
                    </div>
                    {showForecast && forecastItems && <ForecastStrip forecasts={forecastItems} tempUnit={tempUnit} />}
                </>
            )}
        </section>
    );
}