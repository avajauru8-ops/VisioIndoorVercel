import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Cloud, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

export default function WidgetClima() {
  const [searchParams] = useSearchParams();
  const cidade = searchParams.get('cidade') || 'São Paulo';
  const estado = searchParams.get('estado') || 'SP';
  
  const [weather, setWeather] = useState({
    temp: 0,
    condition: 'Carregando...',
    humidity: '0%',
    wind: '0 km/h',
    isDay: 1
  });

  useEffect(() => {
    async function fetchWeather() {
       try {
         // Step 1: Geocoding (Open-Meteo Geocoding API)
         const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cidade)}&count=1&language=pt&format=json`);
         const geoData = await geoRes.json();
         
         if (!geoData.results || geoData.results.length === 0) {
            setWeather({ temp: 25, condition: 'Desconhecido', humidity: '50%', wind: '10 km/h', isDay: 1 });
            return;
         }
         
         const { latitude, longitude } = geoData.results[0];
         
         // Step 2: Weather (Open-Meteo)
         const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,wind_speed_10m&timezone=auto`);
         const weatherData = await weatherRes.json();
         const current = weatherData.current;
         
         let condition = 'Estável';
         if (current.precipitation > 0) condition = 'Chuvoso';
         else if (current.is_day === 1) condition = 'Ensolarado';
         else condition = 'Noite Clara';

         setWeather({
            temp: Math.round(current.temperature_2m),
            condition,
            humidity: `${current.relative_humidity_2m}%`,
            wind: `${Math.round(current.wind_speed_10m)} km/h`,
            isDay: current.is_day
         });

       } catch (err) {
         console.error(err);
         setWeather({ temp: 25, condition: 'Sem conexão', humidity: '--', wind: '--', isDay: 1 });
       }
    }
    fetchWeather();
  }, [cidade]);

  return (
    <div className={`w-screen h-screen ${weather.isDay ? 'bg-gradient-to-br from-sky-400 to-blue-600' : 'bg-gradient-to-br from-indigo-900 to-slate-900'} flex flex-col items-center justify-center text-white p-8`}>
       <h1 className="text-6xl font-bold mb-4 drop-shadow-lg">{cidade} - {estado}</h1>
       <div className="flex items-center gap-8 my-8 drop-shadow-lg">
          {weather.condition === 'Chuvoso' ? (
             <CloudRain className="w-48 h-48 text-blue-200" />
          ) : weather.isDay ? (
             <Sun className="w-48 h-48 text-yellow-300" />
          ) : (
             <Cloud className="w-48 h-48 text-slate-300" />
          )}
          <span className="text-9xl font-black">{weather.temp}°C</span>
       </div>
       <div className="text-4xl font-medium tracking-wide drop-shadow-md">
          {weather.condition}
       </div>
       <div className="flex gap-16 mt-12 text-3xl opacity-90 drop-shadow-md bg-black/20 px-12 py-6 rounded-3xl backdrop-blur-sm border border-white/10">
          <div className="flex items-center gap-4">
             <CloudRain className="w-10 h-10" />
             <span>Umidade: {weather.humidity}</span>
          </div>
          <div className="flex items-center gap-4">
             <Wind className="w-10 h-10" />
             <span>Vento: {weather.wind}</span>
          </div>
       </div>
    </div>
  );
}
