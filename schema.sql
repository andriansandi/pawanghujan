-- Hapus tabel jika sudah ada (biar nggak error kalau reset)
DROP TABLE IF EXISTS location_logs;

-- Buat tabel untuk mencatat aktivitas pawang
CREATE TABLE location_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, -- Waktu otomatis
  lat REAL NOT NULL,                            -- Latitude (Angka desimal)
  lon REAL NOT NULL,                            -- Longitude (Angka desimal)
  location_name TEXT,                           -- Nama daerah (Cileunyi, dll)
  chance INTEGER,                               -- Persentase hujan (%)
  weather_type TEXT                             -- Tipe cuaca (storm, rain, clear)
);

-- (Opsional) Tambahkan index untuk mempercepat pencarian berdasarkan waktu
CREATE INDEX idx_timestamp ON location_logs(timestamp);