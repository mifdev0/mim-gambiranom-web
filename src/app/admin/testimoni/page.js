'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../adminPage.module.css';

export default function AdminTestimoniPage() {
  const [testimoni, setTestimoni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Wali Murid');
  const [content, setContent] = useState('');
  const [avatarInitial, setAvatarInitial] = useState('');
  const [rating, setRating] = useState(5);
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    fetchTestimoni();
  }, []);

  async function fetchTestimoni() {
    try {
      const { data, error } = await supabase
        .from('testimoni')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setTestimoni(data);
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
    setRole('Wali Murid');
    setContent('');
    setAvatarInitial('');
    setRating(5);
    setSortOrder(testimoni.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingId(t.id);
    setName(t.name);
    setRole(t.role);
    setContent(t.content);
    setAvatarInitial(t.avatar_initial);
    setRating(t.rating || 5);
    setSortOrder(t.sort_order);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      role,
      content,
      avatar_initial: avatarInitial || name.charAt(0).toUpperCase(),
      rating: parseInt(rating),
      sort_order: parseInt(sortOrder)
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('testimoni').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Testimoni berhasil diupdate!', 'success');
      } else {
        const { error } = await supabase.from('testimoni').insert([payload]);
        if (error) throw error;
        showToast('Testimoni berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      fetchTestimoni();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus testimoni ini?')) return;
    try {
      const { error } = await supabase.from('testimoni').delete().eq('id', id);
      if (error) throw error;
      showToast('Testimoni berhasil dihapus.', 'success');
      fetchTestimoni();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div>
      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.success : styles.error}`}>
          <i className={toast.type === 'success' ? 'bx bx-check-circle' : 'bx bx-error-circle'}></i>
          <span>{toast.message}</span>
        </div>
      )}

      <div className={styles.pageHeader}>
        <h3>Testimoni Wali Murid</h3>
        <button onClick={handleOpenAdd} className={`${styles.btnAction} ${styles.primary}`}>
          <i className="bx bx-plus"></i> Tambah Testimoni
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat testimoni...</p></div>
      ) : testimoni.length === 0 ? (
        <div className={styles.emptyState}><i className="bx bx-info-circle"></i><p>Belum ada testimoni.</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Inisial</th>
                <th>Wali Murid (Nama)</th>
                <th>Hubungan / Peran</th>
                <th>Bintang</th>
                <th>Isi Testimoni</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {testimoni.map((t) => (
                <tr key={t.id}>
                  <td>{t.sort_order}</td>
                  <td>
                    <div className={styles.avatar} style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                      {t.avatar_initial}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td>{t.role}</td>
                  <td>
                    <div style={{ color: 'var(--gold)', display: 'flex', gap: '2px' }}>
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <i key={i} class="bx bxs-star" style={{ fontSize: '0.8rem' }}></i>
                      ))}
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.content}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleOpenEdit(t)} className={`${styles.btnRow} ${styles.edit}`}>
                        <i className="bx bx-edit-alt"></i>
                      </button>
                      <button onClick={() => handleDelete(t.id)} className={`${styles.btnRow} ${styles.delete}`}>
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
              <h3>{editingId ? 'Edit Testimoni' : 'Tambah Testimoni'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.btnCloseModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Nama Lengkap Wali Murid</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Ibu Maharani"
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Hubungan / Peran</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="Contoh: Wali Murid Kelas 1"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Inisial Avatar (Opsional)</label>
                    <input
                      type="text"
                      value={avatarInitial}
                      onChange={(e) => setAvatarInitial(e.target.value)}
                      placeholder="M"
                      maxLength="1"
                    />
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Bintang Rating (1-5)</label>
                    <select value={rating} onChange={(e) => setRating(e.target.value)}>
                      <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
                      <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
                      <option value="3">⭐⭐⭐ (3 Bintang)</option>
                      <option value="2">⭐⭐ (2 Bintang)</option>
                      <option value="1">⭐ (1 Bintang)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Urutan Urutan Tampilan</label>
                    <input
                      type="number"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Isi Ulasan / Testimoni</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis ulasan/komentar positif wali murid..."
                    required
                  />
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
