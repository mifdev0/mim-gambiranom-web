'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../adminPage.module.css';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Settings states
  const [schoolName, setSchoolName] = useState('');
  const [schoolTagline, setSchoolTagline] = useState('');
  const [address, setAddress] = useState('');
  const [workHours, setWorkHours] = useState('');
  const [phone, setPhone] = useState('');
  const [instagramPostUrl, setInstagramPostUrl] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from('site_settings').select('*');
      if (data) {
        data.forEach((s) => {
          if (s.key === 'school_name') setSchoolName(s.value);
          if (s.key === 'school_tagline') setSchoolTagline(s.value);
          if (s.key === 'address') setAddress(s.value);
          if (s.key === 'work_hours') setWorkHours(s.value);
          if (s.key === 'phone') setPhone(s.value);
          if (s.key === 'instagram_post_url') setInstagramPostUrl(s.value);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const updates = [
      { key: 'school_name', value: schoolName },
      { key: 'school_tagline', value: schoolTagline },
      { key: 'address', value: address },
      { key: 'work_hours', value: workHours },
      { key: 'phone', value: phone },
      { key: 'instagram_post_url', value: instagramPostUrl }
    ];

    try {
      const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' });
      if (error) throw error;
      showToast('Pengaturan umum berhasil disimpan!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat pengaturan...</p></div>;
  }

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
          <label>Nama Madrasah</label>
          <input
            type="text"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            placeholder="Contoh: MI Muhammadiyah Gambiranom"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Tagline Sekolah</label>
          <input
            type="text"
            value={schoolTagline}
            onChange={(e) => setSchoolTagline(e.target.value)}
            placeholder="Contoh: Mendidik Generasi Qur'ani yang Berakhlak Mulia"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Alamat Lengkap</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Tulis alamat dusun, RT, RW, desa, kecamatan..."
            required
          />
        </div>

        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Hari &amp; Jam Kerja</label>
            <input
              type="text"
              value={workHours}
              onChange={(e) => setWorkHours(e.target.value)}
              placeholder="Contoh: Senin - Sabtu, 07.00 - 14.00 WIB"
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Nomor HP / WhatsApp Kontak</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 081335138666"
              required
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Link Postingan Instagram Utama (Embed)</label>
          <input
            type="url"
            value={instagramPostUrl}
            onChange={(e) => setInstagramPostUrl(e.target.value)}
            placeholder="Contoh: https://www.instagram.com/p/DZPJUTgB2qm/"
          />
          <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>
            Masukkan URL postingan Instagram sekolah yang ingin ditampilkan sebagai unggulan di halaman depan.
          </p>
        </div>

        <button type="submit" className={`${styles.btnAction} ${styles.primary}`} disabled={saving}>
          {saving ? <><i className="bx bx-loader-alt bx-spin"></i> Menyimpan...</> : 'Simpan Pengaturan'}
        </button>
      </form>
    </div>
  );
}
