CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  open_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  login_method TEXT NOT NULL DEFAULT 'chatgpt',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_signed_in TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_open_id ON users (open_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER,
  icon TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  currency TEXT NOT NULL DEFAULT 'TRY',
  city TEXT NOT NULL,
  district TEXT,
  neighborhood TEXT,
  latitude TEXT,
  longitude TEXT,
  images TEXT,
  property_type TEXT,
  rooms INTEGER,
  size INTEGER,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deleted')),
  is_featured INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON listings (status, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_listings_category_status ON listings (category_id, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_listings_city_status ON listings (city, status);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_listings_user_status ON listings (user_id, status);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  listing_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE (user_id, listing_id)
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS idx_favorites_user_listing ON favorites (user_id, listing_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  receiver_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_messages_sender_created ON messages (sender_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_messages_receiver_created ON messages (receiver_id, created_at DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_messages_listing ON messages (listing_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  reporter_id INTEGER NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_reports_status_created ON reports (status, created_at DESC);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS saved_searches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  filters TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  email_notifications INTEGER NOT NULL DEFAULT 0,
  last_notified_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_created ON saved_searches (user_id, created_at DESC);
--> statement-breakpoint
INSERT OR IGNORE INTO users (id, open_id, name, email, login_method, role, created_at, updated_at, last_signed_in) VALUES
  (2, 'sample-seller-2', 'Örnek Satıcı', NULL, 'sample', 'user', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z'),
  (3, 'sample-seller-3', 'Örnek Satıcı', NULL, 'sample', 'user', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z'),
  (4, 'sample-seller-4', 'Örnek Satıcı', NULL, 'sample', 'user', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z'),
  (5, 'sample-seller-5', 'Örnek Satıcı', NULL, 'sample', 'user', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z'),
  (6, 'sample-seller-6', 'Örnek Satıcı', NULL, 'sample', 'user', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z', '2026-09-01T08:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO categories (id, name, slug, parent_id, icon, display_order, is_active, created_at) VALUES
  (1, 'Emlak', 'emlak', NULL, 'home', 1, 1, '2026-09-01T08:00:00.000Z'),
  (2, 'Vasıta', 'vasita', NULL, 'car', 2, 1, '2026-09-01T08:00:00.000Z'),
  (3, 'Elektronik', 'elektronik', NULL, 'smartphone', 3, 1, '2026-09-01T08:00:00.000Z'),
  (4, 'Ev Eşyası', 'ev-esyasi', NULL, 'armchair', 4, 1, '2026-09-01T08:00:00.000Z'),
  (5, 'Diğer', 'diger', NULL, 'package', 5, 1, '2026-09-01T08:00:00.000Z');
--> statement-breakpoint
INSERT OR IGNORE INTO listings (id, user_id, category_id, title, description, price, city, district, neighborhood, latitude, longitude, images, property_type, rooms, size, is_featured, view_count, favorite_count, created_at, updated_at) VALUES
  (30005, 2, 1, 'Kadıköy Moda’da Deniz Manzaralı 3+1 Daire', 'Moda sahiline yürüme mesafesinde, geniş balkonlu örnek beta ilanı.', 7250000, 'İstanbul', 'Kadıköy', 'Moda', '40.9869', '29.0252', '["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80"]', 'Daire', 3, 145, 1, 248, 17, '2026-09-01T10:00:00.000Z', '2026-09-01T10:00:00.000Z'),
  (30006, 3, 1, 'Çankaya’da Site İçinde 2+1 Kiralık', 'Güvenlikli site, açık otopark ve merkezi konum için örnek beta ilanı.', 28500, 'Ankara', 'Çankaya', 'Ayrancı', '39.9075', '32.8602', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"]', 'Daire', 2, 95, 0, 94, 8, '2026-09-02T08:30:00.000Z', '2026-09-02T08:30:00.000Z'),
  (30007, 4, 1, 'Urla’da Bahçeli Müstakil Ev', 'Sessiz sokakta, geniş bahçeli örnek beta ilanı.', 9800000, 'İzmir', 'Urla', 'İskele', '38.3222', '26.7647', '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"]', 'Villa', 4, 220, 1, 176, 22, '2026-09-02T11:15:00.000Z', '2026-09-02T11:15:00.000Z'),
  (30008, 5, 2, '2019 Toyota Corolla Otomobil', 'Bakımlı aile arabası ve car aramaları için örnek beta ilanı.', 1050000, 'Bursa', 'Nilüfer', NULL, '40.1826', '29.0665', '["https://images.unsplash.com/photo-1623869675781-80aa31012a5a?auto=format&fit=crop&w=1200&q=80"]', 'Otomobil', NULL, NULL, 1, 132, 14, '2026-09-03T09:00:00.000Z', '2026-09-03T09:00:00.000Z'),
  (30009, 6, 2, 'Şehir İçi Temiz Motosiklet', 'Düşük kilometreli, günlük kullanıma uygun örnek beta ilanı.', 145000, 'Antalya', 'Muratpaşa', NULL, '36.8969', '30.7133', '["https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80"]', 'Motosiklet', NULL, NULL, 0, 61, 6, '2026-09-03T11:00:00.000Z', '2026-09-03T11:00:00.000Z'),
  (30010, 2, 3, 'Kutulu Akıllı Telefon', 'Garantisi devam eden, temiz kullanılmış örnek beta ilanı.', 28500, 'İstanbul', 'Üsküdar', NULL, '41.0247', '29.0177', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80"]', 'Telefon', NULL, NULL, 0, 88, 9, '2026-09-03T12:00:00.000Z', '2026-09-03T12:00:00.000Z'),
  (30011, 3, 3, 'Oyuncu Dizüstü Bilgisayar', '16 GB RAM ve güçlü ekran kartlı örnek beta ilanı.', 46500, 'Ankara', 'Yenimahalle', NULL, '39.9658', '32.8119', '["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1200&q=80"]', 'Bilgisayar', NULL, NULL, 0, 75, 7, '2026-09-03T13:00:00.000Z', '2026-09-03T13:00:00.000Z'),
  (30012, 4, 4, 'Ahşap Yemek Masası ve Sandalyeler', 'Altı kişilik sağlam takım için örnek beta ilanı.', 12000, 'İzmir', 'Karşıyaka', NULL, '38.4550', '27.1100', '["https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?auto=format&fit=crop&w=1200&q=80"]', 'Mobilya', NULL, NULL, 0, 49, 4, '2026-09-04T08:00:00.000Z', '2026-09-04T08:00:00.000Z'),
  (30013, 5, 4, 'Yeni Nesil Kahve Makinesi', 'Az kullanılmış ev eşyası örnek beta ilanı.', 7500, 'Bursa', 'Osmangazi', NULL, '40.1950', '29.0600', '["https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=80"]', 'Beyaz Eşya', NULL, NULL, 0, 36, 3, '2026-09-04T09:00:00.000Z', '2026-09-04T09:00:00.000Z'),
  (30014, 6, 5, 'Başlangıç Seviyesi Akustik Gitar', 'Kılıfıyla birlikte hobi ürünü örnek beta ilanı.', 6800, 'Antalya', 'Konyaaltı', NULL, '36.8700', '30.6400', '["https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"]', 'Hobi', NULL, NULL, 0, 42, 5, '2026-09-04T10:00:00.000Z', '2026-09-04T10:00:00.000Z');
--> statement-breakpoint
PRAGMA optimize;
