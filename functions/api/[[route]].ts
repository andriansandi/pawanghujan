import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'

// Definisikan tipe untuk Environment (Binding D1)
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.post('/log-location', async (c) => {
  try {
    // Ambil data dengan type safety
    const { lat, lon, location_name, chance, weather_type } = await c.req.json<{
      lat: number;
      lon: number;
      location_name: string;
      chance: number;
      weather_type: string;
    }>();

    // Inisialisasi DB dari binding
    const db = c.env.DB;

    // Eksekusi Query
    await db.prepare(
      "INSERT INTO location_logs (lat, lon, location_name, chance, weather_type) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(lat, lon, location_name, chance, weather_type)
    .run();

    return c.json({ success: true, message: "Logged to D1" });
  } catch (e: any) {
    return c.json({ success: false, error: e.message }, 500);
  }
})

// Handler untuk Cloudflare Pages
export const onRequest = handle(app)