'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/imageConverter';
import styles from '../adminPage.module.css';

export default function AdminPrestasiPage() {
  const [prestasi, setPrestasi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPrestasi();
  }, []);

  async function fetchPrestasi() {
    try {
      const { data, error } = await supabase
        .from('prestasi')
        .select('*')
        .order('created_at', { ascending: false });
      if (data) setPrestasi(data);
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

  const handleOpenAdd = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setImageUrl('');
    setIsFeatured(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setContent(p.content);
    setImageUrl(p.image_url);
    setIsFeatured(p.is_featured);
    setModalOpen(true);
  };

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];
      const MAX_SIZE = 2 * 1024 * 1024; // 2MB
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

      const ext = file.name.split('.').pop();
      const path = `prestasi/${Math.random().toString(36).substring(2)}.${ext}`;

      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      setImageUrl(data.publicUrl);
      showToast('File berhasil diupload! Klik "Simpan" untuk menyimpan.', 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title,
      content,
      image_url: imageUrl,
      is_featured: isFeatured,
      updated_at: new Date()
    };

    try {
      // If setting this to featured, we need to turn off featured on all other rows first
      if (isFeatured) {
        await supabase.from('prestasi').update({ is_featured: false }).neq('id', editingId || '00000000-0000-0000-0000-000000000000');
      }

      if (editingId) {
        const { error } = await supabase.from('prestasi').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Prestasi berhasil diupdate!', 'success');
      } else {
        const { error } = await supabase.from('prestasi').insert([payload]);
        if (error) throw error;
        showToast('Prestasi berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      fetchPrestasi();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus prestasi ini?')) return;
    try {
      const { error } = await supabase.from('prestasi').delete().eq('id', id);
      if (error) throw error;
      showToast('Prestasi berhasil dihapus.', 'success');
      fetchPrestasi();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : toast.type === 'error' ? styles.error : styles.info}`}>
          <i className={toast.type === 'success' ? 'bx bx-check-circle' : toast.type === 'error' ? 'bx bx-error-circle' : 'bx bx-info-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h3>Daftar Prestasi</h3>
        <button onClick={handleOpenAdd} className={`${styles.btnAction} ${styles.primary}`}>
          <i className="bx bx-plus"></i> Tambah Prestasi
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat data...</p></div>
      ) : prestasi.length === 0 ? (
        <div className={styles.emptyState}><i className="bx bx-info-circle"></i><p>Belum ada postingan prestasi.</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Foto</th>
                <th>Judul Prestasi</th>
                <th>Detail/Edukasi</th>
                <th>Status Utama (Featured)</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {prestasi.map((p) => (
                <tr key={p.id}>
                  <td>
                    {p.image_url ? (
                      <img src={p.image_url} className={styles.thumb} alt={p.title} />
                    ) : (
                      <span style={{ color: 'var(--slate-400)' }}>Tidak ada</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.content}</td>
                  <td>
                    {p.is_featured ? (
                      <span className={`${styles.badge} ${styles.green}`}>Ditampilkan di Hero</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.amber}`}>Arsip</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleOpenEdit(p)} className={`${styles.btnRow} ${styles.edit}`}>
                        <i className="bx bx-edit-alt"></i>
                      </button>
                      <button onClick={() => handleDelete(p.id)} className={`${styles.btnRow} ${styles.delete}`}>
                        <i className="bx bx-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {modalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit Prestasi' : 'Tambah Prestasi'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.btnCloseModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Judul Prestasi / Kegiatan</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Edukasi Virus Covid-19"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Detail Konten / Penjelasan</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis deskripsi prestasi secara mendalam..."
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isFeaturedChk"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="isFeaturedChk" style={{ margin: 0, cursor: 'pointer' }}>
                    Tampilkan sebagai prestasi utama (Featured di halaman depan)
                  </label>
                </div>

                <div className={styles.formGroup}>
                  <label>Foto Dokumentasi</label>
                  <div className={styles.uploadZone}>
                    {uploading ? (
                      <div className={styles.uploadSpinner}><i className="bx bx-loader-alt bx-spin"></i> Sedang mengupload...</div>
                    ) : (
                      <>
                        <i className="bx bx-cloud-upload"></i>
                        <p>Klik untuk pilih foto dokumentasi</p>
                        <span className={styles.uploadHint}>Format: JPG, PNG, WebP • Maks. 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                      id="prestasiFile"
                    />
                    <label htmlFor="prestasiFile" style={{ cursor: uploading ? 'not-allowed' : 'pointer', position: 'absolute', inset: 0 }}></label>
                  </div>
                  {imageUrl && (
                    <div className={styles.previewWrap}>
                      <img src={imageUrl} className={styles.previewImg} alt="Preview" />
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" onClick={() => setModalOpen(false)} className={`${styles.btnAction} ${styles.secondary}`}>
                  Batal
                </button>
                <button type="submit" className={`${styles.btnAction} ${styles.primary}`}>
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
