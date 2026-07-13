'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/imageConverter';
import styles from '../adminPage.module.css';

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export default function EditHeroPage() {
  const [title, setTitle] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [heroImageMain, setHeroImageMain] = useState('');
  const [heroImageFloat1, setHeroImageFloat1] = useState('');
  const [heroImageFloat2, setHeroImageFloat2] = useState('');
  const [statValue, setStatValue] = useState(155);
  const [statLabel, setStatLabel] = useState('Siswa');
  const [statSubText, setStatSubText] = useState('Tahun Ajaran Aktif');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function getHeroSettings() {
      const { data } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (data) {
        setTitle(data.title || '');
        setHighlightText(data.highlight_text || '');
        setDescription(data.description || '');
        setImageUrl(data.image_url || '');
        setHeroImageMain(data.hero_image_main || '');
        setHeroImageFloat1(data.hero_image_float1 || '');
        setHeroImageFloat2(data.hero_image_float2 || '');
        setStatValue(data.stat_value ?? 155);
        setStatLabel(data.stat_label || 'Siswa');
        setStatSubText(data.stat_sub_text || 'Tahun Ajaran Aktif');
      }
      setLoadingData(false);
    }
    getHeroSettings();
  }, []);

  const uploadFile = async (file, folder) => {
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Math.random().toString(36).substring(2)}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('uploads').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleUploadFor = async (e, setter, folder) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      let file = e.target.files[0];
      if (file.size > MAX_SIZE) {
        showToast('Ukuran file terlalu besar! Maksimal 2MB.', 'error');
        return;
      }

      // Convert to WebP client-side
      try {
        file = await convertToWebP(file);
      } catch (convErr) {
        console.warn('Gagal konversi ke WebP, menggunakan file asli:', convErr);
      }

      const url = await uploadFile(file, folder);
      setter(url);
      showToast('File berhasil diupload! Klik "Simpan" untuk menyimpan.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('hero_settings')
        .update({
          title,
          highlight_text: highlightText,
          description,
          image_url: imageUrl,
          hero_image_main: heroImageMain,
          hero_image_float1: heroImageFloat1,
          hero_image_float2: heroImageFloat2,
          stat_value: parseInt(statValue),
          stat_label: statLabel,
          stat_sub_text: statSubText,
          updated_at: new Date()
        })
        .eq('id', 1);

      if (error) throw error;
      showToast('Pengaturan hero berhasil disimpan!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const UploadBlock = ({ label, hint, value, setter, inputId, folder }) => (
    <div className={styles.formGroup}>
      <label>{label}</label>
      {hint && <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginBottom: '8px' }}>{hint}</p>}
      <div className={styles.uploadZone}>
        {uploading ? (
          <div className={styles.uploadSpinner}><i className="bx bx-loader-alt bx-spin"></i> Sedang mengupload...</div>
        ) : (
          <>
            <i className="bx bx-cloud-upload"></i>
            <p>Klik untuk upload gambar baru</p>
            <span className={styles.uploadHint}>Format: JPG, PNG, WebP • Maks. 2MB</span>
          </>
        )}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleUploadFor(e, setter, folder)}
          disabled={uploading}
          style={{ display: 'none' }}
          id={inputId}
        />
        <label htmlFor={inputId} style={{ cursor: uploading ? 'not-allowed' : 'pointer', position: 'absolute', inset: 0 }}></label>
      </div>
      {value && (
        <div className={styles.previewWrap}>
          <img src={value} className={styles.previewImg} alt="Preview" />
          <code style={{ fontSize: '0.72rem', wordBreak: 'break-all', color: 'var(--slate-400)' }}>{value}</code>
        </div>
      )}
    </div>
  );

  if (loadingData) {
    return (
      <div className={styles.emptyState}>
        <i className="bx bx-loader-alt bx-spin"></i>
        <p>Memuat pengaturan hero...</p>
      </div>
    );
  }

  return (
    <div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : toast.type === 'error' ? styles.error : styles.info}`}>
          <i className={toast.type === 'success' ? 'bx bx-check-circle' : toast.type === 'error' ? 'bx bx-error-circle' : 'bx bx-info-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.adminForm} style={{ maxWidth: '900px' }}>

        {/* === KONTEN TEKS === */}
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green-700)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '10px' }}>
          <i className="bx bx-text" style={{ marginRight: '6px' }}></i> Konten Teks Hero
        </h4>

        <div className={styles.formGroup}>
          <label>Judul Utama (Title)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mendidik Generasi Qur'ani Berakhlak Mulia" required />
        </div>

        <div className={styles.formGroup}>
          <label>Kata Kunci Highlight (Akan berwarna Gold/Emas)</label>
          <input type="text" value={highlightText} onChange={(e) => setHighlightText(e.target.value)} placeholder="Qur'ani" required />
        </div>

        <div className={styles.formGroup}>
          <label>Deskripsi Paragraf</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tulis penjelasan singkat tentang sekolah..." required />
        </div>

        {/* === FOTO-FOTO === */}
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green-700)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: '36px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '10px' }}>
          <i className="bx bx-image" style={{ marginRight: '6px' }}></i> Foto-Foto Hero Section
        </h4>

        <UploadBlock
          label="Foto Background Utama (Latar Belakang)"
          hint="Gambar layar penuh di belakang hero section"
          value={imageUrl}
          setter={setImageUrl}
          inputId="heroUpBg"
          folder="hero"
        />

        <UploadBlock
          label="Foto Utama Besar (Kanan Atas)"
          hint="Foto besar yang tampil di sisi kanan hero, misal suasana kelas"
          value={heroImageMain}
          setter={setHeroImageMain}
          inputId="heroUpMain"
          folder="hero"
        />

        <div className={styles.formGrid}>
          <UploadBlock
            label="Foto Kecil Kiri Bawah"
            hint="Foto floating kecil di kiri bawah"
            value={heroImageFloat1}
            setter={setHeroImageFloat1}
            inputId="heroUpFloat1"
            folder="hero"
          />
          <UploadBlock
            label="Foto Kecil Kanan Atas"
            hint="Foto floating kecil di kanan atas"
            value={heroImageFloat2}
            setter={setHeroImageFloat2}
            inputId="heroUpFloat2"
            folder="hero"
          />
        </div>

        {/* === STATISTIK CARD === */}
        <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--green-700)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px', marginTop: '36px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '10px' }}>
          <i className="bx bx-bar-chart-alt-2" style={{ marginRight: '6px' }}></i> Kartu Statistik Melayang
        </h4>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Angka Statistik</label>
            <input type="number" value={statValue} onChange={(e) => setStatValue(e.target.value)} placeholder="155" min="0" required />
          </div>
          <div className={styles.formGroup}>
            <label>Label Statistik (setelah angka)</label>
            <input type="text" value={statLabel} onChange={(e) => setStatLabel(e.target.value)} placeholder="Siswa" required />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Sub-Teks Kecil (di bawah angka)</label>
          <input type="text" value={statSubText} onChange={(e) => setStatSubText(e.target.value)} placeholder="Tahun Ajaran Aktif" required />
        </div>

        <button type="submit" className={`${styles.btnAction} ${styles.primary}`} disabled={saving} style={{ marginTop: '12px' }}>
          {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Menyimpan...</> : 'Simpan Semua Perubahan'}
        </button>
      </form>
    </div>
  );
}
