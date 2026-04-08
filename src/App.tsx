import React, { useState, useEffect, useRef } from 'react'
import { 
  Pane, Heading, Text, Button, majorScale, toaster
} from 'evergreen-ui'
import { 
  Umbrella, Zap, Sun, MapPin, Bird, CloudHail, Cloud, 
  Volume2, VolumeX, Play, Pause 
} from 'lucide-react'
import './App.css'

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

  // Ganti URL ini dengan URL Bucket Cloudflare R2 kamu
  const R2_URL = import.meta.env.VITE_R2_URL; 

  // Referensi Audio sesuai file di R2
  const rainAudio = useRef(new Audio(`${R2_URL}/sounds/light-rain.mp3`));
  const stormAudio = useRef(new Audio(`${R2_URL}/sounds/heavy-rain.mp3`));
  const clearAudio = useRef(new Audio(`${R2_URL}/sounds/forest-bird.mp3`));
  const cloudyAudio = useRef(new Audio(`${R2_URL}/sounds/mountain-wind.mp3`));

  const allAudios = [rainAudio, stormAudio, clearAudio, cloudyAudio];

  // --- AUDIO CONTROL LOGIC ---
  useEffect(() => {
    allAudios.forEach(a => { if (a.current) a.current.muted = isMuted; });
  }, [isMuted]);

  useEffect(() => {
    if (!isPlaying) {
      allAudios.forEach(a => a.current.pause());
    } else {
      playAudio();
    }
  }, [isPlaying]);

  const playAudio = () => {
    if (!isPlaying) return;
    allAudios.forEach(a => {
      a.current.pause();
      a.current.currentTime = 0;
    });

    const start = (ref: React.RefObject<HTMLAudioElement>) => {
      if (ref.current) {
        ref.current.loop = true;
        ref.current.play().catch(() => {});
      }
    };

    if (weatherType === 'rain') start(rainAudio);
    else if (weatherType === 'storm') start(stormAudio);
    else if (weatherType === 'clear') start(clearAudio);
    else start(cloudyAudio);
  };

  useEffect(() => {
    playAudio();
  }, [weatherType]);

  // --- FETCH WEATHER DATA ---
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
      toaster.danger("Gagal memantau langit. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude)
    );
  };

  // --- THEME & UI CONFIG (Sangat Diperbarui) ---
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
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      width="100vw"
      backgroundColor={current.bg}
      position="relative"
      overflow="hidden"
      style={{ transition: 'background-color 0.8s ease' }}
    >
      {/* 📦 CONTENT CONTAINER (Hierarki Tipografi Baru) */}
      <Pane 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        textAlign="center" 
        zIndex={10}
        padding={majorScale(4)}
        width="100%"
        maxWidth={480}
      >
        <Pane marginBottom={majorScale(5)} style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.05))' }}>
          {current.icon}
        </Pane>
        
        <Heading 
          size={900} 
          fontWeight={900} 
          color={current.color}
          style={{ 
            letterSpacing: '-0.05em', 
            lineHeight: 1,
            textTransform: 'uppercase'
          }}
        >
          {current.title}
        </Heading>
        
        <Text 
          size={600} 
          marginTop={majorScale(2)} 
          color={current.color} 
          style={{ 
            opacity: 0.7,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            maxWidth: '85%'
          }}
        >
          {current.desc}
        </Text>

        <Button
          marginTop={majorScale(8)}
          onClick={handleCheck}
          isLoading={loading}
          iconBefore={MapPin}
          height={64}
          paddingX={majorScale(5)}
          appearance="primary"
          intent={current.btn}
          borderRadius={20}
          fontSize={18}
          fontWeight={700}
          style={{
            boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
        >
          CEK LOKASI SAYA
        </Button>
      </Pane>

      {/* 🎧 FLOATING AUDIO CONTROLS (Pembaruan UI Hover) */}
      {weatherType !== 'initial' && (
        <Pane 
          position="fixed" 
          bottom={majorScale(12)} 
          display="flex" 
          gap={majorScale(2)}
          padding={majorScale(1)}
          backgroundColor="rgba(0,0,0,0.7)"
          borderRadius={40}
          style={{ backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
          zIndex={100}
        >
          <Button 
            onClick={() => setIsPlaying(!isPlaying)} 
            appearance="minimal" 
            borderRadius="50%" 
            height={48} 
            width={48}
            className="audio-control-btn"
            display="flex"
            justifyContent="center"
          >
            {isPlaying ? <Pause color="white" size={24} /> : <Play color="white" size={24} />}
          </Button>
          <Button 
            onClick={() => setIsMuted(!isMuted)} 
            appearance="minimal" 
            borderRadius="50%" 
            height={48} 
            width={48}
            className="audio-control-btn"
            display="flex"
            justifyContent="center"
          >
            {isMuted ? <VolumeX color="white" size={24} /> : <Volume2 color="white" size={24} />}
          </Button>
        </Pane>
      )}

      {/* 📝 FOOTER (Link ke LinkedIn kamu) */}
      <Pane 
        position="absolute" 
        bottom={majorScale(3)} 
        zIndex={10}
      >
        <Text size={300} color={current.color} style={{ opacity: 0.5 }}>
          Created by{' '}
          <a 
            href="https://linkedin.com/in/andriansandi" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              color: current.color, 
              fontWeight: 700, 
              textDecoration: 'none',
              borderBottom: `1.5px solid ${current.color}`
            }}
          >
            andriansandi
          </a>
        </Text>
      </Pane>
    </Pane>
  );
};

export default App;