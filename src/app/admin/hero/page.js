'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../adminPage.module.css';

export default function EditHeroPage() {
  const [title, setTitle] = useState('');
  const [highlightText, setHighlightText] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    async function getHeroSettings() {
      const { data, error } = await supabase
        .from('hero_settings')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (data) {
        setTitle(data.title);
        setHighlightText(data.highlight_text);
        setDescription(data.description);
        setImageUrl(data.image_url);
      }
    }
    getHeroSettings();
  }, []);

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('Pilih file gambar untuk diupload.');
      }
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `hero_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
      showToast('Gambar berhasil diupload!', 'success');
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
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : styles.error}`}>
          <i className={toast.type === 'success' ? 'bx bx-check-circle' : 'bx bx-error-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className={styles.adminForm}>
        <div className={styles.formGroup}>
          <label>Judul Utama (Title)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Mendidik Generasi Qur'ani Berakhlak Mulia"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Kata Kunci Highlight (Akan berwarna Gold/Emas)</label>
          <input
            type="text"
            value={highlightText}
            onChange={(e) => setHighlightText(e.target.value)}
            placeholder="Qur'ani"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Deskripsi Paragraf</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tulis penjelasan singkat tentang sekolah..."
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Foto Background Hero</label>
          <div className={styles.uploadZone}>
            <i className="bx bx-cloud-upload"></i>
            <p>{uploading ? 'Sedang mengunggah...' : 'Klik untuk upload gambar baru'}</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
              id="heroImageInput"
            />
            <label htmlFor="heroImageInput" style={{ cursor: 'pointer', position: 'absolute', inset: 0 }}></label>
          </div>

          {imageUrl && (
            <div className={styles.previewWrap}>
              <img src={imageUrl} className={styles.previewImg} alt="Hero Preview" />
              <div>
                <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>URL Gambar Saat Ini:</p>
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>{imageUrl}</code>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className={`${styles.btnAction} ${styles.primary}`} disabled={saving}>
          {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Menyimpan...</> : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  );
}
