interface LogData {
  lat: number;
  lon: number;
  weather_type: string;
  location_name: string;
  chance: number;
}

const API_URL = import.meta.env.VITE_API_URL;

export const logLocation = async (data: LogData) => {
  if (!API_URL) return;

  try {
    const response = await fetch(`${API_URL}/log-location`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        ...data,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.warn("API log-location merespons dengan error");
    }
  } catch (err) {
    // Kita silent error agar tidak mengganggu pengalaman user
    console.error("Network error saat mencatat log lokasi:", err);
  }
};