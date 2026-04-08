import React, { useState } from 'react'
import { 
  Pane, Heading, Text, Button, majorScale, toaster 
} from 'evergreen-ui'
import { Cloud, Umbrella, Zap, Sun, Bell, MapPin } from 'lucide-react'
import './App.css'

// --- DEFINISI TYPE ---
type WeatherType = 'initial' | 'storm' | 'rain' | 'clear';

interface StyleConfig {
  bg: string;
  intent: "none" | "danger" | "warning" | "success";
  title: string;
  icon: React.ReactNode;
  desc: string;
}

interface WeatherResponse {
  location: {
    name: string;
    region: string;
  };
  forecast: {
    forecastday: Array<{
      day: {
        daily_chance_of_rain: number;
      };
    }>;
  };
}

const App: React.FC = () => {
  const [weatherType, setWeatherType] = useState<WeatherType>('initial');
  const [loading, setLoading] = useState<boolean>(false);
  const [chance, setChance] = useState<number>(0);
  const [locationName, setLocationName] = useState<string>('Lokasi Anda');

  // --- FUNGSI LOG KE D1 ---
  // Kita taruh di luar agar lebih rapi
  const logLocationToD1 = async (lat: number, lon: number, data: WeatherResponse, rainChance: number) => {
    const API_URL = import.meta.env.VITE_API_URL;
    
    if (!API_URL) {
      console.error("API_URL tidak ditemukan di environment!");
      return;
    }

    try {
      await fetch(`${API_URL}/log-location`, { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat,
          lon,
          location_name: data.location.name,
          chance: rainChance,
          weather_type: rainChance > 50 ? "Hujan" : "Cerah/Berawan",
        }),
      });
      console.log("Log tersimpan via Worker!");
    } catch (err) {
      console.error("Gagal log ke D1:", err);
    }
  };

  const fetchWeather = async (lat: number, lon: number): Promise<void> => {
    setLoading(true);
    try {
      const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
      
      const res = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=1`);

      if (!res.ok) throw new Error("Gagal mengambil data cuaca");

      const data = (await res.json()) as WeatherResponse; 

      const rainChance = data.forecast.forecastday[0].day.daily_chance_of_rain;
      setLocationName(data.location.name);
      setChance(rainChance);

      let newType: WeatherType = 'clear';
      if (rainChance > 70) newType = 'storm';
      else if (rainChance > 25) newType = 'rain';
      
      setWeatherType(newType);

      // --- PANGGIL FUNGSI LOG DI SINI ---
      await logLocationToD1(lat, lon, data, rainChance);

    } catch (err: any) {
      console.error(err.message);
      toaster.danger("Pawang gagal memantau langit.", {
        description: "Coba lagi beberapa saat ya!",
        duration: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (): void => {
    if (!navigator.geolocation) {
      setLoading(false);
      toaster.warning("Gagal akses lokasi.", {
        description: "Browser kamu tidak mendukung GPS.",
      });
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error: GeolocationPositionError) => {
        console.error(error.message);
        setLoading(false);
        toaster.warning("Gagal akses lokasi.", {
          description: "Pastikan izin GPS di browser kamu sudah aktif.",
        });
      }
    );
  };

  const styles: Record<WeatherType, StyleConfig> = {
    storm: { 
      bg: "#FEF6F6", 
      intent: "danger", 
      title: "WAJIB JAS HUJAN!", 
      icon: <Zap size={150} color="#D14343" className="animate-storm" />, 
      desc: "Hujan deras/badai terdeteksi." 
    },
    rain: { 
      bg: "#FFFBEC", 
      intent: "warning", 
      title: "BAWA PAYUNG", 
      icon: <Umbrella size={150} color="#D9822B" className="animate-rain" />, 
      desc: `Ada potensi hujan ${chance}% di ${locationName}.` 
    },
    clear: { 
      bg: "#F7FFFD", 
      intent: "success", 
      title: "AMAN, GASPOL!", 
      icon: <Sun size={150} color="#47B881" className="animate-spin-slow" />, 
      desc: `Langit ${locationName} cerah.` 
    },
    initial: { 
      bg: "#F5F7F9", 
      intent: "none", 
      title: "Pawang Hujan", 
      icon: <Cloud size={120} color="#696f8c" />, 
      desc: "Cek cuaca berdasarkan lokasi GPS kamu." 
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
      padding={majorScale(4)}
      style={{ transition: 'all 0.5s ease' }}
    >
      <Pane 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        marginTop="auto"
        marginBottom={majorScale(10)} 
        width="100%"
        maxWidth={500}
      >
        <Pane marginBottom={majorScale(1)}>
          {current.icon}
        </Pane>

        <Heading size={1000} textAlign="center" fontWeight={900} marginBottom={majorScale(2)}>
          {current.title}
        </Heading>

        <Text size={600} color="muted" textAlign="center">
          {current.desc}
        </Text>
      </Pane>

      <Pane 
        width="100%" 
        maxWidth={360} 
        marginBottom={majorScale(4)}
      >
        <Button 
          appearance="primary" 
          intent={current.intent}
          height={72} 
          width="100%" 
          iconBefore={MapPin}
          isLoading={loading}
          onClick={handleCheck}
          borderRadius={20}
          fontSize={20}
          fontWeight="bold"
        >
          {weatherType === 'initial' ? 'CEK LOKASI SAYA' : 'UPDATE LAGI'}
        </Button>

        <Button 
          marginTop={majorScale(3)}
          appearance="minimal" 
          iconBefore={Bell} 
          width="100%"
          onClick={() => Notification.requestPermission()}
        >
          Aktifkan Notifikasi Pagi
        </Button>
      </Pane>

      <Text marginTop="auto" marginBottom={majorScale(2)} color="muted" size={300}>
        Created by <a href="https://linkedin.com/in/andriansandi" target="_blank" rel="noopener noreferrer">andriansandi</a>
      </Text>
    </Pane>
  );
};

export default App;