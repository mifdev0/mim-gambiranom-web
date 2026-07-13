'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { convertToWebP } from '@/lib/imageConverter';
import styles from '../adminPage.module.css';

export default function AdminGuruPage() {
  const [guru, setGuru] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [initial, setInitial] = useState('');
  const [gradientClass, setGradientClass] = useState('gc1');
  const [photoUrl, setPhotoUrl] = useState('');
  const [isKepala, setIsKepala] = useState(false);
  const [bio, setBio] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [uploading, setUploading] = useState(false);

  const gradientOptions = [
    { label: 'Blue Navy (gc1)', value: 'gc1' },
    { label: 'Warm Gold (gc2)', value: 'gc2' },
    { label: 'Deep Purple (gc3)', value: 'gc3' },
    { label: 'Teal Green (gc4)', value: 'gc4' },
    { label: 'Rose Gold (gc5)', value: 'gc5' },
    { label: 'Soft Sky Blue (gc6)', value: 'gc6' },
    { label: 'Lime Olive (gc7)', value: 'gc7' },
    { label: 'Spiced Amber (gc8)', value: 'gc8' },
    { label: 'Emerald Cyan (gc9)', value: 'gc9' },
    { label: 'Violet Lavender (gc10)', value: 'gc10' },
    { label: 'Pink Magenta (gc11)', value: 'gc11' },
  ];

  useEffect(() => {
    fetchGuru();
  }, []);

  async function fetchGuru() {
    try {
      const { data, error } = await supabase
        .from('guru')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setGuru(data);
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
    setName('');
    setPosition('');
    setInitial('');
    setGradientClass('gc1');
    setPhotoUrl('');
    setIsKepala(false);
    setBio('');
    setSortOrder(guru.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (g) => {
    setEditingId(g.id);
    setName(g.name);
    setPosition(g.position);
    setInitial(g.initial);
    setGradientClass(g.gradient_class);
    setPhotoUrl(g.photo_url || '');
    setIsKepala(g.is_kepala);
    setBio(g.bio || '');
    setSortOrder(g.sort_order);
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
      const path = `guru/${Math.random().toString(36).substring(2)}.${ext}`;

      const { error } = await supabase.storage.from('uploads').upload(path, file);
      if (error) throw error;

      const { data } = supabase.storage.from('uploads').getPublicUrl(path);
      setPhotoUrl(data.publicUrl);
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
      name,
      position,
      initial,
      gradient_class: isKepala ? 'gc-kepala' : gradientClass,
      photo_url: photoUrl || null,
      is_kepala: isKepala,
      bio: isKepala ? bio : null,
      sort_order: parseInt(sortOrder)
    };

    try {
      // If setting as Kepala, unset others as Kepala first
      if (isKepala) {
        await supabase.from('guru').update({ is_kepala: false }).neq('id', editingId || '00000000-0000-0000-0000-000000000000');
      }

      if (editingId) {
        const { error } = await supabase.from('guru').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Profil guru berhasil diupdate!', 'success');
      } else {
        const { error } = await supabase.from('guru').insert([payload]);
        if (error) throw error;
        showToast('Profil guru berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      fetchGuru();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus guru ini dari daftar?')) return;
    try {
      const { error } = await supabase.from('guru').delete().eq('id', id);
      if (error) throw error;
      showToast('Profil guru berhasil dihapus.', 'success');
      fetchGuru();
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
        <h3>Staf &amp; Pengajar</h3>
        <button onClick={handleOpenAdd} className={`${styles.btnAction} ${styles.primary}`}>
          <i className="bx bx-plus"></i> Tambah Profil Guru
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat profil...</p></div>
      ) : guru.length === 0 ? (
        <div className={styles.emptyState}><i className="bx bx-info-circle"></i><p>Daftar guru masih kosong.</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Foto</th>
                <th>Nama Guru / Gelar</th>
                <th>Jabatan</th>
                <th>Inisial</th>
                <th>Peran Utama</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {guru.map((g) => (
                <tr key={g.id}>
                  <td>{g.sort_order}</td>
                  <td>
                    {g.photo_url ? (
                      <img src={g.photo_url} className={styles.thumb} style={{ borderRadius: '50%', width: '40px', height: '40px' }} alt={g.name} />
                    ) : (
                      <div className={`${styles.thumb} ${styles[g.gradient_class]}`} style={{ borderRadius: '50%', width: '40px', height: '40px', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 'bold' }}>
                        {g.initial}
                      </div>
                    )}
                  </td>
                  <td style={{ fontWeight: 600 }}>{g.name}</td>
                  <td>{g.position}</td>
                  <td style={{ fontWeight: 500 }}>{g.initial}</td>
                  <td>
                    {g.is_kepala ? (
                      <span className={`${styles.badge} ${styles.green}`}>Kepala Sekolah</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.blue}`}>Guru / Staf</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleOpenEdit(g)} className={`${styles.btnRow} ${styles.edit}`}>
                        <i className="bx bx-edit-alt"></i>
                      </button>
                      <button onClick={() => handleDelete(g.id)} className={`${styles.btnRow} ${styles.delete}`}>
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
              <h3>{editingId ? 'Edit Profil Guru' : 'Tambah Guru Baru'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.btnCloseModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nama Lengkap &amp; Gelar</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Ngaisah, M.Pd.I"
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Jabatan / Peran</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Contoh: Guru Kelas 1 / Kepala Sekolah"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Inisial Huruf (Avatar)</label>
                    <input
                      type="text"
                      value={initial}
                      onChange={(e) => setInitial(e.target.value)}
                      placeholder="Contoh: SN"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="isKepalaSchool"
                    checked={isKepala}
                    onChange={(e) => setIsKepala(e.target.checked)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <label htmlFor="isKepalaSchool" style={{ margin: 0, cursor: 'pointer' }}>
                    Atur sebagai Kepala Sekolah / Pimpinan
                  </label>
                </div>

                {isKepala && (
                  <div className={styles.formGroup}>
                    <label>Sambutan / Bio Kepala Sekolah</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tulis visi/sambutan singkat pimpinan..."
                      required={isKepala}
                    />
                  </div>
                )}

                <div className={styles.formGrid}>
                  {!isKepala && (
                    <div className={styles.formGroup}>
                      <label>Background Gradient Avatar (Bila Tanpa Foto)</label>
                      <select value={gradientClass} onChange={(e) => setGradientClass(e.target.value)}>
                        {gradientOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className={styles.formGroup} style={{ gridColumn: isKepala ? 'span 2' : 'auto' }}>
                    <label>Urutan Urutan Tampilan</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Foto Guru (Opsional)</label>
                  <div className={styles.uploadZone}>
                    {uploading ? (
                      <div className={styles.uploadSpinner}><i className="bx bx-loader-alt bx-spin"></i> Sedang mengupload...</div>
                    ) : (
                      <>
                        <i className="bx bx-cloud-upload"></i>
                        <p>Klik untuk pilih foto guru (Rasio 1:1 disarankan)</p>
                        <span className={styles.uploadHint}>Format: JPG, PNG, WebP • Maks. 2MB</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleUpload}
                      disabled={uploading}
                      style={{ display: 'none' }}
                      id="guruFile"
                    />
                    <label htmlFor="guruFile" style={{ cursor: uploading ? 'not-allowed' : 'pointer', position: 'absolute', inset: 0 }}></label>
                  </div>
                  {photoUrl && (
                    <div className={styles.previewWrap}>
                      <img src={photoUrl} className={styles.previewImg} style={{ borderRadius: '50%', width: '80px', height: '80px' }} alt="Preview" />
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
