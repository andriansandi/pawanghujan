import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { 
  Pane, Heading, Text, Button, majorScale, toaster, Badge
} from 'evergreen-ui'
import { 
  Umbrella, Zap, Sun, MapPin, Bird, CloudHail, Cloud, 
  Volume2, VolumeX, Play, Pause, Bug
} from 'lucide-react'
import './App.css'

const GA_ID = import.meta.env.VITE_GA_ID || "G-NS06QPTCGY";

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
  
  // --- DEBUGGER STATES ---
  const [debugMode, setDebugMode] = useState(false);
  const [audioStatus, setAudioStatus] = useState<Record<string, string>>({
    rain: "idle", storm: "idle", clear: "idle", cloudy: "idle"
  });

  const R2_URL = import.meta.env.VITE_R2_URL; 

  // --- AUDIO PRELOAD SETUP ---
  const createAudio = (file: string) => {
    const audio = new Audio(`${R2_URL}/sounds/${file}`);
    audio.preload = "auto"; // Preload via JS
    return audio;
  };

  const rainAudio = useRef(createAudio('light-rain.mp3'));
  const stormAudio = useRef(createAudio('heavy-rain.mp3'));
  const clearAudio = useRef(createAudio('forest-bird.mp3'));
  const cloudyAudio = useRef(createAudio('mountain-wind.mp3'));

  const audioRefs: Record<string, React.RefObject<HTMLAudioElement>> = {
    rain: rainAudio, storm: stormAudio, clear: clearAudio, cloudy: cloudyAudio
  };

  // Setup listeners untuk debug status
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
          .catch(err => {
            console.error(err);
            setAudioStatus(prev => ({ ...prev, [key]: "blocked by browser" }));
          });
      }
    };

    if (weatherType === 'rain') start(rainAudio, 'rain');
    else if (weatherType === 'storm') start(stormAudio, 'storm');
    else if (weatherType === 'clear') start(clearAudio, 'clear');
    else if (weatherType === 'cloudy') start(cloudyAudio, 'cloudy');
  };

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1`);
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
    // MOBILE FIX & WARM-UP: Unlock Audio Context on first tap
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

  const styles = {
    storm: { 
      bg: "#121212", title: "BADAI KAK!", color: "white", btn: "danger",
      icon: <Zap size={160} color="#FFD600" className="shake" strokeWidth={1.5} />,
      desc: `Waspada badai petir di ${locationName}`
    },
    rain: { 
      bg: "#E3F2FD", title: "BAWA PAYUNG", color: "#1A237E", btn: "warning",
      icon: <Umbrella size={160} color="#1E88E5" className="sway" strokeWidth={1.5} />,
      desc: `Potensi hujan ${chance}% di ${locationName}`
    },
    cloudy: {
      bg: "#F0F4F8", title: "MENDUNG", color: "#37474F", btn: "none",
      icon: <Cloud size={160} color="#90A4AE" className="float" strokeWidth={1.5} />,
      desc: `Langit berawan di ${locationName}`
    },
    clear: { 
      bg: "#F1FBF7", title: "CERAH SEKALI", color: "#004D40", btn: "success",
      icon: (
        <Pane display="flex" justifyContent="center" alignItems="center">
          <Sun size={160} color="#FFB300" className="spin" strokeWidth={1.5} />
          <Bird size={45} color="#2E7D32" style={{ marginLeft: -30, marginTop: -60 }} className="bird-fly" strokeWidth={1.5} />
        </Pane>
      ),
      desc: `Cuaca cerah di ${locationName}, selamat beraktivitas!`
    },
    initial: { 
      bg: "#FFFFFF", title: "Pawang Hujan", color: "#234361", btn: "none",
      icon: <CloudHail size={140} color="#696F8C" strokeWidth={1} />,
      desc: "Ketuk tombol di bawah untuk memantau langit"
    }
  };

  const current = styles[weatherType];

  return (
    <Pane
      display="flex" flexDirection="column" alignItems="center" justifyContent="center"
      height="100vh" width="100vw" backgroundColor={current.bg}
      position="relative" overflow="hidden" style={{ transition: 'background-color 0.8s ease' }}
    >
      <Helmet>
        <title>{weatherType === 'initial' ? 'Pawang Hujan' : `${current.title} | Pawang Hujan`}</title>
        <meta name="description" content="Cek cuaca dengan gaya anak senja yang puitis." />
        
        {/* PRELOAD STRATEGY (High Priority) */}
        <link rel="preload" href={`${R2_URL}/sounds/light-rain.mp3`} as="audio" />
        <link rel="preload" href={`${R2_URL}/sounds/heavy-rain.mp3`} as="audio" />
        <link rel="preload" href={`${R2_URL}/sounds/forest-bird.mp3`} as="audio" />
        <link rel="preload" href={`${R2_URL}/sounds/mountain-wind.mp3`} as="audio" />

        {/* Google Analytics 4 */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}></script>
        <script>{`window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${GA_ID}');`}</script>
      </Helmet>

      {/* 🎧 FLOATING AUDIO CONTROLS (TOP) */}
      {weatherType !== 'initial' && (
        <Pane position="fixed" top={majorScale(4)} display="flex" gap={majorScale(2)} zIndex={100}>
          <Pane display="flex" gap={majorScale(1)} padding={majorScale(1)} backgroundColor="rgba(0,0,0,0.7)" borderRadius={40} style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Button onClick={() => setIsPlaying(!isPlaying)} appearance="minimal" borderRadius="50%" height={48} width={48} className="audio-control-btn">
              {isPlaying ? <Pause color="white" size={24} /> : <Play color="white" size={24} />}
            </Button>
            <Button onClick={() => setIsMuted(!isMuted)} appearance="minimal" borderRadius="50%" height={48} width={48} className="audio-control-btn">
              {isMuted ? <VolumeX color="white" size={24} /> : <Volume2 color="white" size={24} />}
            </Button>
          </Pane>
          <Button onClick={() => setDebugMode(!debugMode)} appearance="minimal" borderRadius="50%" height={48} width={48} backgroundColor="rgba(0,0,0,0.4)" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
             <Bug color="white" size={20} />
          </Button>
        </Pane>
      )}

      {/* 📦 CONTENT CONTAINER */}
      <Pane display="flex" flexDirection="column" alignItems="center" textAlign="center" zIndex={10} padding={majorScale(4)} width="100%" maxWidth={480}>
        <Pane marginBottom={majorScale(5)} style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}>
          {current.icon}
        </Pane>
        <Heading size={900} fontWeight={900} color={current.color} style={{ letterSpacing: '-0.05em', lineHeight: 1, textTransform: 'uppercase' }}>{current.title}</Heading>
        <Text size={600} marginTop={majorScale(2)} color={current.color} style={{ opacity: 0.7, fontWeight: 500, letterSpacing: '-0.01em', maxWidth: '85%' }}>{current.desc}</Text>
        <Button marginTop={majorScale(8)} onClick={handleCheck} isLoading={loading} iconBefore={MapPin} height={64} paddingX={majorScale(5)} appearance="primary" intent={current.btn} borderRadius={20} fontSize={18} fontWeight={700} style={{ boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}>CEK LOKASI SAYA</Button>
      </Pane>

      {/* 📝 FOOTER */}
      <Pane position="absolute" bottom={majorScale(3)} zIndex={10}>
        <Text size={300} color={current.color} style={{ opacity: 0.5 }}>
          Created by <a href="https://linkedin.com/in/andriansandi" target="_blank" rel="noopener noreferrer" style={{ color: current.color, fontWeight: 700, textDecoration: 'none', borderBottom: `1.5px solid ${current.color}` }}>andriansandi</a>
        </Text>
      </Pane>

      {/* 🛠️ DEBUGGER PANEL */}
      {debugMode && (
        <Pane position="fixed" bottom={majorScale(10)} right={majorScale(2)} backgroundColor="rgba(0,0,0,0.9)" padding={majorScale(2)} borderRadius={8} zIndex={1000} width={220}>
          <Text color="white" size={300} fontWeight="bold" display="block" marginBottom={8}>Audio Debug Status:</Text>
          {Object.entries(audioStatus).map(([name, status]) => (
            <Pane key={name} display="flex" justifyContent="space-between" marginBottom={4}>
              <Text color="#aaa" size={300}>{name}:</Text>
              <Badge color={status.includes("playing") || status.includes("ready") ? "green" : status.includes("blocked") ? "red" : "neutral"}>{status}</Badge>
            </Pane>
          ))}
          <Button size="small" marginTop={8} width="100%" onClick={() => playAudio()}>Force Play Current</Button>
        </Pane>
      )}
    </Pane>
  );
};

export default App;