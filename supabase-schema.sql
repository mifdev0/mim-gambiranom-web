-- ============================================
-- MIM Gambiranom - Supabase Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Hero Settings (singleton row)
CREATE TABLE hero_settings (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title text NOT NULL DEFAULT 'Mendidik Generasi Qur''ani Berakhlak Mulia',
  highlight_text text NOT NULL DEFAULT 'Qur''ani',
  description text NOT NULL DEFAULT 'Sekolah Dasar Berbasis Agama di Desa Gambiranom, Kecamatan Kismantoro, Wonogiri. Menyelenggarakan pendidikan berlandaskan nilai-nilai Qur''an, mendampingi dan merangsang anak dalam pembelajaran baik di sekolah maupun di luar sekolah.',
  image_url text DEFAULT '/img/hero.jpg',
  updated_at timestamptz DEFAULT now()
);

INSERT INTO hero_settings (id) VALUES (1);

-- 2. Programs
CREATE TABLE programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  icon text NOT NULL DEFAULT 'bxs-book-reader',
  icon_color text NOT NULL DEFAULT 'green',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO programs (title, description, image_url, icon, icon_color, sort_order) VALUES
  ('Full Day School', 'Setelah proses belajar mengajar, siswa diberi materi ekstra kurikuler yang dapat mereka pilih sendiri.', '/img/fullday.jpg', 'bxs-book-reader', 'green', 1),
  ('Tahfidz Juz 30', 'Dari kelas 1, siswa diajarkan menghafal Al-Qur''an. Diharapkan menghafal minimal Juz 30 saat lulus.', '/img/tahfidz.jpg', 'bxs-book-open', 'blue', 2),
  ('Drumband', 'Membuat anak memiliki keberanian tampil di depan dan dilatih untuk mandiri serta konsentrasi.', '/img/drumband.jpg', 'bxs-music', 'amber', 3),
  ('Pramuka', 'Melatih ketangkasan, ketelitian serta kemandirian. Bekal siswa di kemudian hari.', '/img/pramuka.jpg', 'bxs-tree', 'rose', 4);

-- 3. Prestasi / Berita
CREATE TABLE prestasi (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  image_url text,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

INSERT INTO prestasi (title, content, image_url, is_featured) VALUES
  ('Edukasi Virus Covid-19', 'Siswa-siswi MI Muhammadiyah Gambiranom aktif berpartisipasi dalam program edukasi kesehatan dan pencegahan virus Covid-19 di lingkungan sekolah dan masyarakat sekitar.', '/img/prestasi.jpg', true);

-- 4. Testimoni
CREATE TABLE testimoni (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Wali Murid',
  content text NOT NULL,
  avatar_initial text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO testimoni (name, role, content, avatar_initial, sort_order) VALUES
  ('Maharani', 'Wali Murid', 'Tidak salah saya menyekolahkan anak saya ke MI Gambiranom. Selain materi umum, materi agama juga diajarkan dengan baik. Budi pekertinya juga diajarkan dengan baik.', 'M', 1),
  ('Nadia Rahma', 'Wali Murid', 'Awalnya saya agak pesimis bahwa madrasah ini berbeda dengan sekolah lainnya. Ternyata ekspektasi saya meleset jauh. Madrasah ini dapat membuktikan kehebatannya.', 'N', 2),
  ('Raychel', 'Wali Murid', 'Madrasah dulu dipandang sebelah mata. Kini madrasah sudah semakin di depan dan lebih baik. Saya tidak menyesal menyekolahkan anak saya di madrasah ini.', 'R', 3);

-- 5. Data Madrasah
CREATE TABLE data_madrasah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value int NOT NULL,
  sub_text text,
  icon text NOT NULL DEFAULT 'bxs-group',
  icon_class text NOT NULL DEFAULT 'di-1',
  sort_order int NOT NULL DEFAULT 0
);

INSERT INTO data_madrasah (label, value, sub_text, icon, icon_class, sort_order) VALUES
  ('Guru', 12, '3 guru S2 dan 9 guru S1', 'bxs-user-detail', 'di-1', 1),
  ('Siswa', 155, 'Terdiri dari 7 rombel', 'bxs-group', 'di-2', 2),
  ('Ruang Kelas', 7, 'Sesuai Standar Nasional', 'bxs-building-house', 'di-3', 3);

-- 6. Guru
CREATE TABLE guru (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  initial text NOT NULL,
  gradient_class text NOT NULL DEFAULT 'gc1',
  photo_url text,
  is_kepala boolean DEFAULT false,
  bio text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

INSERT INTO guru (name, position, initial, gradient_class, is_kepala, bio, sort_order) VALUES
  ('Siti Ngaisah, M.Pd.I', 'Kepala Madrasah', 'SN', 'gc-kepala', true, 'Memimpin MI Muhammadiyah Gambiranom dengan visi menjadikan madrasah yang unggul dalam pendidikan umum dan agama, mencetak generasi Qur''ani yang berakhlak mulia.', 0),
  ('Larso, M.Pd', 'Guru Kelas 6', 'L', 'gc1', false, NULL, 1),
  ('Muqorobin, S.Pd.I', 'Guru Kelas 5', 'M', 'gc2', false, NULL, 2),
  ('Sukidi, M.Pd', 'Guru Kelas 4', 'S', 'gc3', false, NULL, 3),
  ('Isnaeni, S.Pd.I', 'Guru Kelas 3', 'I', 'gc4', false, NULL, 4),
  ('M Rudi, S.Pd.I', 'Guru Kelas 2A', 'MR', 'gc5', false, NULL, 5),
  ('Siti Juariyah, S.Pd.I', 'Guru Kelas 2B', 'SJ', 'gc6', false, NULL, 6),
  ('Watik, S.Pd.I', 'Guru Kelas 1', 'W', 'gc7', false, NULL, 7),
  ('Zuriono Eko A, S.Pd', 'Guru PENJAS', 'ZE', 'gc8', false, NULL, 8),
  ('Khamdani AM', 'Guru PAI', 'K', 'gc9', false, NULL, 9),
  ('Cahyaning R', 'Guru Mulok', 'CR', 'gc10', false, NULL, 10),
  ('Lailina RC', 'Guru PAI', 'LR', 'gc11', false, NULL, 11);

-- 7. Site Settings (key-value)
CREATE TABLE site_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

INSERT INTO site_settings (key, value) VALUES
  ('address', 'Dusun Gambiran, RT 02 RW 01, Desa Gambiranom, Kismantoro, Wonogiri'),
  ('work_hours', 'Senin - Sabtu, 07.00 - 14.00 WIB'),
  ('phone', '081335138666'),
  ('school_name', 'MI Muhammadiyah Gambiranom'),
  ('school_tagline', 'Mendidik Generasi Qur''ani yang Berakhlak Mulia');

-- ============================================
-- Row Level Security (RLS)
-- Public can read, only authenticated can write
-- ============================================

ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE prestasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimoni ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_madrasah ENABLE ROW LEVEL SECURITY;
ALTER TABLE guru ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read hero" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Public read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read prestasi" ON prestasi FOR SELECT USING (true);
CREATE POLICY "Public read testimoni" ON testimoni FOR SELECT USING (true);
CREATE POLICY "Public read data" ON data_madrasah FOR SELECT USING (true);
CREATE POLICY "Public read guru" ON guru FOR SELECT USING (true);
CREATE POLICY "Public read settings" ON site_settings FOR SELECT USING (true);

-- Anon write policies (admin auth handled by NextAuth, Supabase just stores data)
CREATE POLICY "Anon write hero" ON hero_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write programs" ON programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write prestasi" ON prestasi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write testimoni" ON testimoni FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write data" ON data_madrasah FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write guru" ON guru FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon write settings" ON site_settings FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Storage Bucket for uploads
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('uploads', 'uploads', true);

CREATE POLICY "Public read uploads" ON storage.objects FOR SELECT USING (bucket_id = 'uploads');
CREATE POLICY "Anon upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'uploads');
CREATE POLICY "Anon update uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'uploads');
CREATE POLICY "Anon delete uploads" ON storage.objects FOR DELETE USING (bucket_id = 'uploads');
