import React from 'react'
import { Pane } from 'evergreen-ui'
import { Zap, Umbrella, Cloud, Sun, Bird, CloudHail } from 'lucide-react'

export type WeatherType = 'initial' | 'storm' | 'rain' | 'clear' | 'cloudy';

interface WeatherStyle {
  bg: string;
  title: string;
  color: string;
  btn: "danger" | "warning" | "success" | "none";
  icon: React.ReactNode;
  desc: (location: string, chance?: number) => string; // Kita ubah jadi fungsi agar dinamis
}

export const weatherStyles: Record<WeatherType, WeatherStyle> = {
  storm: {
    bg: "#121212",
    title: "BADAI KAK!",
    color: "#FFFFFF",
    btn: "danger",
    icon: <Zap size={160} color="#FFD600" className="shake" />,
    desc: (location) => `Waspada badai petir di ${location}`
  },
  rain: {
    bg: "#E3F2FD",
    title: "BAWA PAYUNG",
    color: "#1A237E",
    btn: "warning",
    icon: <Umbrella size={160} color="#1E88E5" className="sway" />,
    desc: (location, chance) => `Potensi hujan ${chance}% di ${location}`
  },
  cloudy: {
    bg: "#F0F4F8",
    title: "MENDUNG",
    color: "#37474F",
    btn: "none",
    icon: <Cloud size={160} color="#90A4AE" className="float" />,
    desc: (location) => `Langit berawan di ${location}`
  },
  clear: {
    bg: "#F1FBF7",
    title: "CERAH SEKALI",
    color: "#004D40",
    btn: "success",
    icon: (
      <Pane display="flex" justifyContent="center" alignItems="center">
        <Sun size={160} color="#FFB300" className="spin" />
        <Bird size={45} color="#2E7D32" style={{ marginLeft: -30, marginTop: -60 }} className="bird-fly" />
      </Pane>
    ),
    desc: (location) => `Cuaca cerah di ${location}, selamat beraktivitas!`
  },
  initial: {
    bg: "#FFFFFF",
    title: "Pawang Hujan",
    color: "#234361",
    btn: "none",
    icon: <CloudHail size={140} color="#696F8C" />,
    desc: () => "Ketuk tombol di bawah untuk memantau langit"
  }
};