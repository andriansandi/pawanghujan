import React, { useState, useEffect, useRef } from 'react'
import { toaster, Pane, Text, majorScale } from 'evergreen-ui'
import { Zap, Umbrella, Cloud, Sun, Bird, CloudHail } from 'lucide-react'

// Import Komponen Hasil Refactor
import { SEO } from './components/SEO'
import { AudioControls } from './components/AudioControls'
import { WeatherDisplay } from './components/WeatherDisplay'
import { AudioDebugger } from './components/AudioDebugger'

import './App.css'

// --- ENVIRONMENT VARIABLES (Kunci Utama) ---
const GA_ID = import.meta.env.VITE_GA_ID || "G-NS06QPTCGY";
const R2_URL = import.meta.env.VITE_R2_URL;
const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const ENABLE_DEBUGGER = import.meta.env.VITE_ENABLE_DEBUGGER === 'true';

// --- TYPES (Wajib Ada) ---
type WeatherType = 'initial' | 'storm' | 'rain' | 'clear' | 'cloudy';

interface WeatherResponse {
  location: { name: string; region: string; };
  forecast: { forecastday: Array<{ day: { daily_chance_of_rain: number; }; }>; };
}

const App: React.FC = () => {
  const [weatherType, setWeatherType] = useState<WeatherType>('initial');
  const [loading, setLoading] = useState(false);
  const [chance, setChance] = useState(0);
  const [locationName, setLocationName] = useState('Lokasi Anda');
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [debugMode, setDebugMode] = useState(false);
  const [audioStatus, setAudioStatus] = useState<Record<string, string>>({
    rain: "idle", storm: "idle", clear: "idle", cloudy: "idle"
  });

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
        ref.current.oncanplaythrough = () => setAudioStatus(prev => ({ ...prev, [key]: "ready (buffered)" }));
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
          .then(() => setAudioStatus(prev => ({ ...prev, [key]: "playing" })))
          .catch(() => setAudioStatus(prev => ({ ...prev, [key]: "blocked by browser" })));
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
      // Menggunakan variabel ENV yang sudah didefinisikan di atas
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${lat},${lon}&days=1`);
      const data = await res.json() as WeatherResponse;
      const rainChance = data.forecast.forecastday[0].day.daily_chance_of_rain;

      setLocationName(data.location.name);
      setChance(rainChance);

      let type: WeatherType = 'clear';
      if (rainChance > 70) type = 'storm';
      else if (rainChance > 20) type = 'rain';
      else if (rainChance > 0) type = 'cloudy';

      setWeatherType(type);
      setIsPlaying(true);
    } catch {
      toaster.danger("Gagal memantau langit.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    Object.entries(audioRefs).forEach(([key, a]) => {
      if (a.current) {
        const originalVolume = a.current.volume;
        a.current.volume = 0;
        a.current.play().then(() => {
          a.current?.pause();
          a.current!.volume = originalVolume;
          setAudioStatus(prev => ({ ...prev, [key]: "unlocked ✅" }));
        }).catch(() => setAudioStatus(prev => ({ ...prev, [key]: "blocked ❌" })));
      }
    });

    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => { setLoading(false); toaster.warning("Izin lokasi ditolak."); }
    );
  };

  // --- STYLES CONFIG ---
  const styles = {
    storm: { bg: "#121212", title: "BADAI KAK!", color: "white", btn: "danger", icon: <Zap size={160} color="#FFD600" className="shake" />, desc: `Waspada badai petir di ${locationName}` },
    rain: { bg: "#E3F2FD", title: "BAWA PAYUNG", color: "#1A237E", btn: "warning", icon: <Umbrella size={160} color="#1E88E5" className="sway" />, desc: `Potensi hujan ${chance}% di ${locationName}` },
    cloudy: { bg: "#F0F4F8", title: "MENDUNG", color: "#37474F", btn: "none", icon: <Cloud size={160} color="#90A4AE" className="float" />, desc: `Langit berawan di ${locationName}` },
    clear: { bg: "#F1FBF7", title: "CERAH SEKALI", color: "#004D40", btn: "success", icon: (
      <Pane display="flex" justifyContent="center" alignItems="center">
        <Sun size={160} color="#FFB300" className="spin" />
        <Bird size={45} color="#2E7D32" style={{ marginLeft: -30, marginTop: -60 }} className="bird-fly" />
      </Pane>
    ), desc: `Cuaca cerah di ${locationName}, selamat beraktivitas!` },
    initial: { bg: "#FFFFFF", title: "Pawang Hujan", color: "#234361", btn: "none", icon: <CloudHail size={140} color="#696F8C" />, desc: "Ketuk tombol di bawah untuk memantau langit" }
  };

  const current = styles[weatherType];

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
        desc={current.desc}
        color={current.color}
        btnIntent={current.btn}
        loading={loading}
        onCheck={handleCheck}
      />

      <Pane position="absolute" bottom={majorScale(3)} zIndex={10}>
        <Text size={300} color={current.color} style={{ opacity: 0.5 }}>
          Created by <a href="https://linkedin.com/in/andriansandi" target="_blank" rel="noopener noreferrer" style={{ color: current.color, fontWeight: 700, textDecoration: 'none', borderBottom: `1.5px solid ${current.color}` }}>andriansandi</a>
        </Text>
      </Pane>

      {ENABLE_DEBUGGER && debugMode && (
        <AudioDebugger status={audioStatus} onForcePlay={playAudio} />
      )}
    </Pane>
  );
};

export default App;