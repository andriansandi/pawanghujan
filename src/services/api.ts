interface LogData {
  lat: number;
  lon: number;
  weather_type: string;
  location_name: string;
  chance: number;
}

interface AIQuoteResponse {
  success: boolean;
  quote: string;
  error?: string;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

export const fetchAIQuote = async (weather: string, location: string): Promise<string> => {
  if (!API_URL || !API_KEY) return "Langit sedang bercerita...";

  try {
    const response = await fetch(`${API_URL}/get-quote`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Pawang-Key': API_KEY 
      },
      body: JSON.stringify({ weather, location }),
    });

    const data = await response.json() as AIQuoteResponse;
    return data.quote || "Fallback quote...";
  } catch (err) {
    console.error("AI Quote Error:", err);
    return "Mungkin rintik hujan lebih puitis dari kata-kata.";
  }
};


export const logLocation = async (data: LogData) => {
  if (!API_URL || !API_KEY) return;

  try {
    const response = await fetch(`${API_URL}/log-location`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Pawang-Key': API_KEY
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