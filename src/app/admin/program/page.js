'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/imageConverter';
import styles from '../adminPage.module.css';

export default function AdminProgramPage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [icon, setIcon] = useState('bxs-book-reader');
  const [iconColor, setIconColor] = useState('green');
  const [sortOrder, setSortOrder] = useState(1);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setPrograms(data);
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
    setDescription('');
    setImageUrl('');
    setIcon('bxs-book-reader');
    setIconColor('green');
    setSortOrder(programs.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setImageUrl(p.image_url);
    setIcon(p.icon);
    setIconColor(p.icon_color);
    setSortOrder(p.sort_order);
    setModalOpen(true);
  };

  const handleUpload = async (e) => {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      let file = e.target.files[0];
      const MAX_SIZE = 2 * 1024 * 1024;
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
      const path = `programs/${Math.random().toString(36).substring(2)}.${ext}`;

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
      description,
      image_url: imageUrl,
      icon,
      icon_color: iconColor,
      sort_order: parseInt(sortOrder)
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('programs').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Ekstrakurikuler berhasil diupdate!', 'success');
      } else {
        const { error } = await supabase.from('programs').insert([payload]);
        if (error) throw error;
        showToast('Ekstrakurikuler berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      fetchPrograms();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus ekstrakurikuler ini?')) return;
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      showToast('Ekstrakurikuler berhasil dihapus.', 'success');
      fetchPrograms();
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
        <h3>Daftar Ekstrakurikuler</h3>
        <button onClick={handleOpenAdd} className={`${styles.btnAction} ${styles.primary}`}>
          <i className="bx bx-plus"></i> Tambah Ekstrakurikuler
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat ekstrakurikuler...</p></div>
      ) : programs.length === 0 ? (
        <div className={styles.emptyState}><i className="bx bx-info-circle"></i><p>Tidak ada ekstrakurikuler.</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Foto</th>
                <th>Nama Ekstrakurikuler</th>
                <th>Warna &amp; Icon</th>
                <th>Deskripsi</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((p) => (
                <tr key={p.id}>
                  <td>{p.sort_order}</td>
                  <td>
                    {p.image_url ? (
                      <img src={p.image_url} className={styles.thumb} alt={p.title} />
                    ) : (
                      <span style={{ color: 'var(--slate-400)' }}>Tidak ada</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[p.icon_color]}`}>
                      <i className={`bx ${p.icon}`} style={{ marginRight: '6px' }}></i>
                      {p.icon_color}
                    </span>
                  </td>
                  <td>{p.description}</td>
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
              <h3>{editingId ? 'Edit Ekstrakurikuler' : 'Tambah Ekstrakurikuler'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.btnCloseModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nama Ekstrakurikuler</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Tahfidz Juz 30"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Deskripsi</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan secara singkat mengenai ekstrakurikuler ini..."
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Icon (Class Boxicon)</label>
                    <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                      <option value="bxs-book-reader">Buku Terbuka (bxs-book-reader)</option>
                      <option value="bxs-book-open">Qur'an/Kitab (bxs-book-open)</option>
                      <option value="bxs-music">Musik/Drumband (bxs-music)</option>
                      <option value="bxs-tree">Pramuka/Tenda (bxs-tree)</option>
                      <option value="bxs-award">Award (bxs-award)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Warna Tema Icon</label>
                    <select value={iconColor} onChange={(e) => setIconColor(e.target.value)}>
                      <option value="green">Hijau (Green)</option>
                      <option value="blue">Biru (Blue)</option>
                      <option value="amber">Emas (Amber)</option>
                      <option value="rose">Merah (Rose)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Urutan Tampilan</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    min="1"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Foto Banner Ekstrakurikuler</label>
                  <div className={styles.uploadZone}>
                    {uploading ? (
                      <div className={styles.uploadSpinner}><i className="bx bx-loader-alt bx-spin"></i> Sedang mengupload...</div>
                    ) : (
                      <>
                        <i className="bx bx-cloud-upload"></i>
                        <p>Klik untuk pilih foto banner ekstrakurikuler</p>
                        <span className={styles.uploadHint}>Format: JPG, PNG, WebP • Maks. 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                      id="progFile"
                    />
                    <label htmlFor="progFile" style={{ cursor: uploading ? 'not-allowed' : 'pointer', position: 'absolute', inset: 0 }}></label>
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
