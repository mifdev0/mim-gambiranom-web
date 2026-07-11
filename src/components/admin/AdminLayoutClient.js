'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import styles from './adminLayout.module.css';

export default function AdminLayoutClient({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();

  // If loading or login page, just return children
  if (status === 'loading' || pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Sidebar links config
  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: 'bx-grid-alt' },
    { href: '/admin/hero', label: 'Edit Hero', icon: 'bx-image' },
    { href: '/admin/program', label: 'Program Unggulan', icon: 'bx-book-reader' },
    { href: '/admin/prestasi', label: 'Prestasi Siswa', icon: 'bx-trophy' },
    { href: '/admin/guru', label: 'Profil Guru', icon: 'bx-id-card' },
    { href: '/admin/data', label: 'Data Madrasah', icon: 'bx-bar-chart-alt-2' },
    { href: '/admin/testimoni', label: 'Testimoni', icon: 'bx-comment-detail' },
    { href: '/admin/pengaturan', label: 'Pengaturan', icon: 'bx-cog' },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/admin/login' });
  };

  const getPageTitle = () => {
    const active = navLinks.find(link => link.href === pathname);
    return active ? active.label : 'Admin Portal';
  };

  return (
    <div className={styles.adminLayout}>
      {/* SIDEBAR */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <img src="/logo-mim-gambiranom.png" alt="Logo MIM Gambiranom" className={styles.sidebarLogoImg} />
          <div>
            <h3>MIM Gambiranom</h3>
            <p>Admin Portal</p>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <ul>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`bx ${link.icon}`}></i>
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUser}>
            <div className={styles.avatar}>A</div>
            <div>
              <h4>Administrator</h4>
              <p>Online</p>
            </div>
          </div>
          <button className={styles.btnLogout} onClick={handleLogout}>
            <i className="bx bx-log-out"></i>
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* MAIN CONTENT WRAPPER */}
      <div className={styles.mainWrapper}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.btnMenuToggle} onClick={() => setSidebarOpen(true)}>
              <i className="bx bx-menu"></i>
            </button>
            <h2 className={styles.headerTitle}>{getPageTitle()}</h2>
          </div>

          <div className={styles.headerRight}>
            <Link href="/" target="_blank" className={styles.btnViewSite}>
              <i className="bx bx-show"></i>
              <span>Lihat Website</span>
            </Link>
            <div className={styles.headerDivider}></div>
            <span className={styles.sessionUser}>Halo, Admin</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
