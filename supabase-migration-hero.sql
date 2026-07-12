-- ============================================
-- MIM Gambiranom - Hero Section Migration
-- Tambah kolom untuk foto floating & statistik
-- Jalankan di Supabase SQL Editor
-- ============================================

ALTER TABLE hero_settings
  ADD COLUMN IF NOT EXISTS hero_image_main text DEFAULT '/img/classroom.jpg',
  ADD COLUMN IF NOT EXISTS hero_image_float1 text DEFAULT '/img/tahfidz.jpg',
  ADD COLUMN IF NOT EXISTS hero_image_float2 text DEFAULT '/img/drumband.jpg',
  ADD COLUMN IF NOT EXISTS stat_value int DEFAULT 155,
  ADD COLUMN IF NOT EXISTS stat_label text DEFAULT 'Siswa',
  ADD COLUMN IF NOT EXISTS stat_sub_text text DEFAULT 'Tahun Ajaran Aktif';
