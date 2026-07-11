'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import styles from './adminPage.module.css';

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    guru: 0,
    siswa: 0,
    prestasi: 0,
    programs: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: countGuru },
          { data: dataSiswa },
          { count: countPrestasi },
          { count: countPrograms }
        ] = await Promise.all([
          supabase.from('guru').select('*', { count: 'exact', head: true }),
          supabase.from('data_madrasah').select('value').eq('label', 'Siswa').single(),
          supabase.from('prestasi').select('*', { count: 'exact', head: true }),
          supabase.from('programs').select('*', { count: 'exact', head: true })
        ]);

        setStats({
          guru: countGuru || 0,
          siswa: dataSiswa?.value || 0,
          prestasi: countPrestasi || 0,
          programs: countPrograms || 0,
        });
      } catch (err) {
        console.error('Error fetching admin dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className={styles.emptyState}><i className="bx bx-loader-alt bx-spin"></i><p>Memuat statistik...</p></div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h3>Dashboard Ringkasan</h3>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.green}`}>
            <i className="bx bxs-id-card"></i>
          </div>
          <div className={styles.statsInfo}>
            <h4>Total Guru</h4>
            <p>{stats.guru}</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.blue}`}>
            <i className="bx bxs-group"></i>
          </div>
          <div className={styles.statsInfo}>
            <h4>Siswa Aktif</h4>
            <p>{stats.siswa}</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.amber}`}>
            <i className="bx bxs-trophy"></i>
          </div>
          <div className={styles.statsInfo}>
            <h4>Prestasi</h4>
            <p>{stats.prestasi}</p>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={`${styles.statsIcon} ${styles.rose}`}>
            <i className="bx bxs-book-reader"></i>
          </div>
          <div className={styles.statsInfo}>
            <h4>Program Unggulan</h4>
            <p>{stats.programs}</p>
          </div>
        </div>
      </div>

      <div className={styles.pageHeader} style={{ marginTop: '40px' }}>
        <h3>Akses Cepat Pengaturan Konten</h3>
      </div>
      <div className={styles.cardGrid}>
        <Link href="/admin/hero" className={styles.statsCard} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
          <div className={`${styles.statsIcon} ${styles.green}`}><i className="bx bx-image"></i></div>
          <div className={styles.statsInfo}>
            <strong>Edit Hero Section</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 'normal', marginTop: '4px' }}>Edit judul, teks, dan foto hero</p>
          </div>
        </Link>

        <Link href="/admin/program" className={styles.statsCard} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
          <div className={`${styles.statsIcon} ${styles.blue}`}><i className="bx bx-book-reader"></i></div>
          <div className={styles.statsInfo}>
            <strong>Program Unggulan</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 'normal', marginTop: '4px' }}>Tambah / edit kegiatan unggulan</p>
          </div>
        </Link>

        <Link href="/admin/guru" className={styles.statsCard} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
          <div className={`${styles.statsIcon} ${styles.amber}`}><i className="bx bx-id-card"></i></div>
          <div className={styles.statsInfo}>
            <strong>Profil Guru</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 'normal', marginTop: '4px' }}>Update staf pengajar & kepala sekolah</p>
          </div>
        </Link>

        <Link href="/admin/pengaturan" className={styles.statsCard} style={{ cursor: 'pointer', transition: 'all 0.3s' }}>
          <div className={`${styles.statsIcon} ${styles.rose}`}><i className="bx bx-cog"></i></div>
          <div className={styles.statsInfo}>
            <strong>Pengaturan Umum</strong>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontFamily: 'inherit', fontWeight: 'normal', marginTop: '4px' }}>Alamat, No HP, Jam kerja sekolah</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
