import React, { useState, useEffect, useRef } from 'react'
import { toaster, Pane, Text, majorScale } from 'evergreen-ui'

// Component
import { SEO } from './components/SEO'
import { AudioControls } from './components/AudioControls'
import { WeatherDisplay } from './components/WeatherDisplay'
import { AudioDebugger } from './components/AudioDebugger'

// Config & Types
import { weatherStyles } from './config/weatherStyles';
import type { WeatherType } from './config/weatherStyles';

// Services 
import { logLocation, fetchAIQuote } from './services/api'

import './App.css'

// --- ENVIRONMENT VARIABLES ---
const GA_ID = import.meta.env.VITE_GA_ID || "G-NS06QPTCGY";
const R2_URL = import.meta.env.VITE_R2_URL;
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const ENABLE_DEBUGGER = import.meta.env.VITE_ENABLE_DEBUGGER === 'true';

// --- TYPES ---
interface WeatherResponse {
  location: { name: string; region: string; };
  forecast: { forecastday: Array<{ day: { daily_chance_of_rain: number; }; }>; };
}

const App: React.FC = () => {
  // --- STATES ---
  const [weatherType, setWeatherType] = useState<WeatherType>('initial');
  const [loading, setLoading] = useState(false);
  const [chance, setChance] = useState(0);
  const [locationName, setLocationName] = useState('Lokasi Anda');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [aiQuote, setAiQuote] = useState<string>("");
  const [audioStatus, setAudioStatus] = useState<Record<string, string>>({
    rain: "idle", storm: "idle", clear: "idle", cloudy: "idle"
  });

  // Ambil konfigurasi visual berdasarkan state saat ini
  const current = weatherStyles[weatherType];

  // --- AUDIO LOGIC ---
  const createAudio = (file: string) => {
    const audio = new Audio(`${R2_URL}/sounds/${file}`);
    audio.preload = "auto";
    return audio;
  };

  const rainAudio = useRef(createAudio('light-rain.mp3'));
  const stormAudio = useRef(createAudio('heavy-rain.mp3'));
  const clearAudio = useRef(createAudio('forest-bird.mp3'));
  const cloudyAudio = useRef(createAudio('mountain-wind.mp3'));

  const audioRefs: Record<string, React.RefObject<HTMLAudioElement>> = {
    rain: rainAudio, storm: stormAudio, clear: clearAudio, cloudy: cloudyAudio
  };

  useEffect(() => {
    Object.entries(audioRefs).forEach(([key, ref]) => {
      if (ref.current) {
        ref.current.onplay = () => setAudioStatus(prev => ({ ...prev, [key]: "playing" }));
        ref.current.onpause = () => setAudioStatus(prev => ({ ...prev, [key]: "paused" }));
        ref.current.onerror = () => setAudioStatus(prev => ({ ...prev, [key]: "error/blocked" }));
        ref.current.oncanplaythrough = () => setAudioStatus(prev => ({ ...prev, [key]: "ready" }));
      }
    });
  }, []);

  useEffect(() => {
    Object.values(audioRefs).forEach(a => { if (a.current) a.current.muted = isMuted; });
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      Object.values(audioRefs).forEach(a => a.current?.pause());
    } else if (weatherType !== 'initial') {
      playAudio();
    }
  }, [isPlaying, weatherType]);

  const playAudio = () => {
    if (!isPlaying) return;
    Object.values(audioRefs).forEach(a => {
      a.current?.pause();
      if (a.current) a.current.currentTime = 0;
    });

    const start = (ref: React.RefObject<HTMLAudioElement>, key: string) => {
      if (ref.current) {
        ref.current.loop = true;
        ref.current.play()
          .catch(() => setAudioStatus(prev => ({ ...prev, [key]: "blocked" })));
      }
    };

    if (weatherType === 'rain') start(rainAudio, 'rain');
    else if (weatherType === 'storm') start(stormAudio, 'storm');
    else if (weatherType === 'clear') start(clearAudio, 'clear');
    else if (weatherType === 'cloudy') start(cloudyAudio, 'cloudy');
  };

  // --- WEATHER LOGIC ---
  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1`);
      const data = await res.json() as WeatherResponse;
      const rainChance = data.forecast.forecastday[0].day.daily_chance_of_rain;
      const city = data.location.name;

      setLocationName(city);
      setChance(rainChance);

      let type: WeatherType = 'clear';
      if (rainChance > 70) type = 'storm';
      else if (rainChance > 20) type = 'rain';
      else if (rainChance > 0) type = 'cloudy';

      // 1. Tampilkan UI Cuaca Dulu
      setWeatherType(type);
      setIsPlaying(true);

      // 2. Ambil AI Quote secara paralel agar tidak blocking UI
      fetchAIQuote(type, city).then(quote => setAiQuote(quote));

      // 3. Log ke D1
      logLocation({
        lat: lat,
        lon: lon,
        weather_type: type,
        location_name: city,
        chance: rainChance
      });

    } catch {
      toaster.danger("Gagal memantau langit.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    // Unlock audio context for mobile browsers
    Object.values(audioRefs).forEach(a => {
      if (a.current) {
        a.current.play().then(() => a.current?.pause()).catch(() => {});
      }
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => { setLoading(false); toaster.warning("Izin lokasi ditolak."); }
    );
  };

  return (
    <Pane
      display="flex" flexDirection="column" alignItems="center" justifyContent="center"
      height="100vh" width="100vw" backgroundColor={current.bg}
      position="relative" overflow="hidden" style={{ transition: 'background-color 0.8s ease' }}
    >
      <SEO title={weatherType === 'initial' ? 'Pawang Hujan' : `${current.title} | Pawang Hujan`} gaId={GA_ID} />

      {weatherType !== 'initial' && (
        <AudioControls 
          isPlaying={isPlaying} 
          isMuted={isMuted} 
          showDebugger={ENABLE_DEBUGGER}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onToggleMute={() => setIsMuted(!isMuted)}
          onToggleDebug={() => setDebugMode(!debugMode)}
        />
      )}

      <WeatherDisplay 
        icon={current.icon}
        title={current.title}
        desc={current.desc(locationName, chance)} // Panggil sebagai fungsi
        color={current.color}
        loading={loading}
        onCheck={handleCheck}
        aiQuote={aiQuote}
        btnIntent={current.btn} // Sekarang sudah sinkron
      />

      <Pane position="absolute" bottom={majorScale(3)} zIndex={10}>
        <Text size={300} color={current.color} style={{ opacity: 0.5 }}>
          Created by <a 
            href="https://linkedin.com/in/andriansandi" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: current.color, fontWeight: 700, textDecoration: 'none', borderBottom: `1.5px solid ${current.color}` }}
          >
            andriansandi
          </a>
        </Text>
      </Pane>

      {ENABLE_DEBUGGER && debugMode && (
        <AudioDebugger status={audioStatus} onForcePlay={playAudio} />
      )}
    </Pane>
  );
};

export default App;