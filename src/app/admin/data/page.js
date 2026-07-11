'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../adminPage.module.css';

export default function AdminDataPage() {
  const [dataItems, setDataItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState(0);
  const [subText, setSubText] = useState('');
  const [icon, setIcon] = useState('bxs-group');
  const [iconClass, setIconClass] = useState('di-1');
  const [sortOrder, setSortOrder] = useState(1);

  useEffect(() => {
    fetchDataItems();
  }, []);

  async function fetchDataItems() {
    try {
      const { data, error } = await supabase
        .from('data_madrasah')
        .select('*')
        .order('sort_order', { ascending: true });
      if (data) setDataItems(data);
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
    setLabel('');
    setValue(0);
    setSubText('');
    setIcon('bxs-group');
    setIconClass('di-1');
    setSortOrder(dataItems.length + 1);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setLabel(item.label);
    setValue(item.value);
    setSubText(item.sub_text);
    setIcon(item.icon);
    setIconClass(item.icon_class);
    setSortOrder(item.sort_order);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      label,
      value: parseInt(value),
      sub_text: subText,
      icon,
      icon_class: iconClass,
      sort_order: parseInt(sortOrder)
    };

    try {
      if (editingId) {
        const { error } = await supabase.from('data_madrasah').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Data statistik berhasil diupdate!', 'success');
      } else {
        const { error } = await supabase.from('data_madrasah').insert([payload]);
        if (error) throw error;
        showToast('Data statistik berhasil ditambahkan!', 'success');
      }
      setModalOpen(false);
      fetchDataItems();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data statistik ini?')) return;
    try {
      const { error } = await supabase.from('data_madrasah').delete().eq('id', id);
      if (error) throw error;
      showToast('Data statistik berhasil dihapus.', 'success');
      fetchDataItems();
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
        <h3>Data Statistik Madrasah</h3>
        <button onClick={handleOpenAdd} className={`${styles.btnAction} ${styles.primary}`}>
          <i className="bx bx-plus"></i> Tambah Data
        </button>
      </div>

      {loading ? (
        <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat data...</p></div>
      ) : dataItems.length === 0 ? (
        <div className={styles.emptyState}><i className="bx bx-info-circle"></i><p>Belum ada data statistik.</p></div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.adminTable}>
            <thead>
              <tr>
                <th>Urutan</th>
                <th>Icon</th>
                <th>Label / Kategori</th>
                <th>Nilai Jumlah</th>
                <th>Sub-Teks Penjelasan</th>
                <th style={{ width: '100px' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {dataItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.sort_order}</td>
                  <td>
                    <span className={`${styles.badge} ${styles.blue}`}>
                      <i className={`bx ${item.icon}`} style={{ marginRight: '6px' }}></i>
                      {item.icon}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.label}</td>
                  <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{item.value}</td>
                  <td>{item.sub_text}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button onClick={() => handleOpenEdit(item)} className={`${styles.btnRow} ${styles.edit}`}>
                        <i className="bx bx-edit-alt"></i>
                      </button>
                      <button onClick={() => handleDelete(item.id)} className={`${styles.btnRow} ${styles.delete}`}>
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
              <h3>{editingId ? 'Edit Data Statistik' : 'Tambah Data Statistik'}</h3>
              <button onClick={() => setModalOpen(false)} className={styles.btnCloseModal}>
                <i className="bx bx-x"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>Label Statistik</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Contoh: Siswa / Guru / Ruang Kelas"
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Nilai Jumlah (Angka)</label>
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      min="0"
                      required
                    />
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
                </div>

                <div className={styles.formGroup}>
                  <label>Sub-Teks Keterangan</label>
                  <input
                    type="text"
                    value={subText}
                    onChange={(e) => setSubText(e.target.value)}
                    placeholder="Contoh: Terdiri dari 7 rombel"
                    required
                  />
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Icon Boxicons</label>
                    <select value={icon} onChange={(e) => setIcon(e.target.value)}>
                      <option value="bxs-group">Grup / Murid (bxs-group)</option>
                      <option value="bxs-user-detail">User Detail / Guru (bxs-user-detail)</option>
                      <option value="bxs-building-house">Gedung / Kelas (bxs-building-house)</option>
                      <option value="bxs-briefcase">Karier / Staf (bxs-briefcase)</option>
                      <option value="bxs-certification">Sertifikat (bxs-certification)</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Skema Warna Icon</label>
                    <select value={iconClass} onChange={(e) => setIconClass(e.target.value)}>
                      <option value="di-1">Hijau Emerald (di-1)</option>
                      <option value="di-2">Gold Emas (di-2)</option>
                      <option value="di-3">Sky Blue (di-3)</option>
                    </select>
                  </div>
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
