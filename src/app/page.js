import { supabase } from '@/lib/supabase';
import ClientEffects from '@/components/public/ClientEffects';

// Fallback data in case database is empty or connection fails
const FALLBACK_HERO = {
  title: "Mendidik Generasi Qur'ani Berakhlak Mulia",
  highlight_text: "Qur'ani",
  description: "Sekolah Dasar Berbasis Agama di Desa Gambiranom, Kismantoro, Wonogiri. Menyelenggarakan pendidikan berlandaskan nilai-nilai Qur'an, mendampingi dan merangsang anak dalam pembelajaran baik di sekolah maupun di luar sekolah.",
  image_url: "/img/hero.jpg",
  hero_image_main: "/img/classroom.jpg",
  hero_image_float1: "/img/tahfidz.jpg",
  hero_image_float2: "/img/drumband.jpg",
  stat_value: 155,
  stat_label: "Siswa",
  stat_sub_text: "Tahun Ajaran Aktif"
};

const FALLBACK_PROGRAMS = [
  { title: 'Full Day School', description: 'Setelah proses belajar mengajar, siswa diberi materi ekstra kurikuler yang dapat mereka pilih sendiri.', image_url: '/img/fullday.jpg', icon: 'bxs-book-reader', icon_color: 'green' },
  { title: 'Tahfidz Juz 30', description: 'Dari kelas 1, siswa diajarkan menghafal Al-Qur\'an. Diharapkan menghafal minimal Juz 30 saat lulus.', image_url: '/img/tahfidz.jpg', icon: 'bxs-book-open', icon_color: 'blue' },
  { title: 'Drumband', description: 'Membuat anak memiliki keberanian tampil di depan dan dilatih untuk mandiri serta konsentrasi.', image_url: '/img/drumband.jpg', icon: 'bxs-music', icon_color: 'amber' },
  { title: 'Pramuka', description: 'Melatih ketangkasan, ketelitian serta kemandirian. Bekal siswa di kemudian hari.', image_url: '/img/pramuka.jpg', icon: 'bxs-tree', icon_color: 'rose' }
];

const FALLBACK_PRESTASI = {
  title: 'Edukasi Virus Covid-19',
  content: 'Siswa-siswi MI Muhammadiyah Gambiranom aktif berpartisipasi dalam program edukasi kesehatan dan pencegahan virus Covid-19 di lingkungan sekolah dan masyarakat sekitar.',
  image_url: '/img/prestasi.jpg'
};

const FALLBACK_TESTIMONI = [
  { name: 'Maharani', role: 'Wali Murid', content: 'Tidak salah saya menyekolahkan anak saya ke MI Gambiranom. Selain materi umum, materi agama juga diajarkan dengan baik. Budi pekertinya juga diajarkan dengan baik.', avatar_initial: 'M' },
  { name: 'Nadia Rahma', role: 'Wali Murid', content: 'Awalnya saya agak pesimis bahwa madrasah ini berbeda dengan sekolah lainnya. Ternyata ekspektasi saya meleset jauh. Madrasah ini dapat membuktikan kehebatannya.', avatar_initial: 'N' },
  { name: 'Raychel', role: 'Wali Murid', content: 'Madrasah dulu dipandang sebelah mata. Kini madrasah sudah semakin di depan dan lebih baik. Saya tidak menyesal menyekolahkan anak saya di madrasah ini.', avatar_initial: 'R' }
];

const FALLBACK_DATA = [
  { label: 'Guru', value: 12, sub_text: '3 guru S2 dan 9 guru S1', icon: 'bxs-user-detail', icon_class: 'di-1' },
  { label: 'Siswa', value: 155, sub_text: 'Terdiri dari 7 rombel', icon: 'bxs-group', icon_class: 'di-2' },
  { label: 'Ruang Kelas', value: 7, sub_text: 'Sesuai Standar Nasional', icon: 'bxs-building-house', icon_class: 'di-3' }
];

const FALLBACK_GURU = [
  { name: 'Siti Ngaisah, M.Pd.I', position: 'Kepala Madrasah', initial: 'SN', gradient_class: 'gc-kepala', is_kepala: true, bio: 'Memimpin MI Muhammadiyah Gambiranom dengan visi menjadikan madrasah yang unggul dalam pendidikan umum dan agama, mencetak generasi Qur\'ani yang berakhlak mulia.' },
  { name: 'Larso, M.Pd', position: 'Guru Kelas 6', initial: 'L', gradient_class: 'gc1' },
  { name: 'Muqorobin, S.Pd.I', position: 'Guru Kelas 5', initial: 'M', gradient_class: 'gc2' },
  { name: 'Sukidi, M.Pd', position: 'Guru Kelas 4', initial: 'S', gradient_class: 'gc3' },
  { name: 'Isnaeni, S.Pd.I', position: 'Guru Kelas 3', initial: 'I', gradient_class: 'gc4' },
  { name: 'M Rudi, S.Pd.I', position: 'Guru Kelas 2A', initial: 'MR', gradient_class: 'gc5' },
  { name: 'Siti Juariyah, S.Pd.I', position: 'Guru Kelas 2B', initial: 'SJ', gradient_class: 'gc6' },
  { name: 'Watik, S.Pd.I', position: 'Guru Kelas 1', initial: 'W', gradient_class: 'gc7' },
  { name: 'Zuriono Eko A, S.Pd', position: 'Guru PENJAS', initial: 'ZE', gradient_class: 'gc8' },
  { name: 'Khamdani AM', position: 'Guru PAI', initial: 'K', gradient_class: 'gc9' },
  { name: 'Cahyaning R', position: 'Guru Mulok', initial: 'CR', gradient_class: 'gc10' },
  { name: 'Lailina RC', position: 'Guru PAI', initial: 'LR', gradient_class: 'gc11' }
];

const FALLBACK_SETTINGS = {
  address: 'Dusun Gambiran, RT 02 RW 01, Desa Gambiranom, Kismantoro, Wonogiri',
  work_hours: 'Senin - Sabtu, 07.00 - 14.00 WIB',
  phone: '081335138666',
  school_name: 'MIM Gambiranom'
};

export const revalidate = 0; // Disable server cache for dynamic real-time dashboard updates

export default async function Home() {
  // Fetch everything in parallel
  let hero = FALLBACK_HERO;
  let programs = FALLBACK_PROGRAMS;
  let featuredPrestasi = FALLBACK_PRESTASI;
  let testimoni = FALLBACK_TESTIMONI;
  let dataMadrasah = FALLBACK_DATA;
  let guruList = FALLBACK_GURU;
  let settings = FALLBACK_SETTINGS;

  try {
    const [
      { data: dbHero },
      { data: dbPrograms },
      { data: dbPrestasi },
      { data: dbTestimoni },
      { data: dbData },
      { data: dbGuru },
      { data: dbSettings }
    ] = await Promise.all([
      supabase.from('hero_settings').select('*').single(),
      supabase.from('programs').select('*').order('sort_order', { ascending: true }),
      supabase.from('prestasi').select('*').eq('is_featured', true).single(),
      supabase.from('testimoni').select('*').order('sort_order', { ascending: true }),
      supabase.from('data_madrasah').select('*').order('sort_order', { ascending: true }),
      supabase.from('guru').select('*').order('sort_order', { ascending: true }),
      supabase.from('site_settings').select('*')
    ]);

    if (dbHero) hero = dbHero;
    if (dbPrograms && dbPrograms.length > 0) programs = dbPrograms;
    if (dbPrestasi) featuredPrestasi = dbPrestasi;
    if (dbTestimoni && dbTestimoni.length > 0) testimoni = dbTestimoni;
    if (dbData && dbData.length > 0) dataMadrasah = dbData;
    if (dbGuru && dbGuru.length > 0) guruList = dbGuru;

    if (dbSettings && dbSettings.length > 0) {
      const settingsMap = {};
      dbSettings.forEach(s => {
        settingsMap[s.key] = s.value;
      });
      settings = { ...FALLBACK_SETTINGS, ...settingsMap };
    }
  } catch (error) {
    console.error('Error fetching data from Supabase, using fallback data:', error);
  }

  const kepalaMadrasah = guruList.find(g => g.is_kepala);
  const regularGuru = guruList.filter(g => !g.is_kepala);

  // Helper to replace title with highlight em
  const renderTitle = (title, highlight) => {
    if (!highlight) return title;
    const parts = title.split(highlight);
    return (
      <>
        {parts[0]}
        <em>{highlight}</em>
        {parts[1]}
      </>
    );
  };

  return (
    <>
      <ClientEffects />

      {/* NAVBAR */}
      <nav class="nav" id="navbar">
        <div class="container">
          <a href="#" class="nav-brand">
            <img src="/logo-mim-gambiranom.png" alt="Logo MIM Gambiranom" className="nav-logo-img" />
            <span>{settings.school_name}</span>
          </a>
          <ul class="nav-menu" id="navMenu">
            <li><a href="#home">Home</a></li>
            <li><a href="#program">Program</a></li>
            <li><a href="#prestasi">Prestasi</a></li>
            <li><a href="#data">Data</a></li>
            <li><a href="#guru">Guru</a></li>
            <li><a href="#kontak" class="cta-link">Hubungi Kami</a></li>
          </ul>
          <button class="burger" id="burger" aria-label="Menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>
      <div class="nav-overlay" id="navOverlay"></div>

      {/* HERO */}
      <section class="hero" id="home">
        <div class="hero-bg">
          <img src={hero.image_url || '/img/hero.jpg'} alt={settings.school_name} />
        </div>
        <div class="hero-ornament"></div>

        <div class="container">
          <div class="hero-inner">
            <div class="hero-content">
              <div className="hero-tag">
                <i className="bx bxs-graduation" style={{ color: 'var(--gold-light)', fontSize: '1.1rem' }}></i>
                <span>{settings.school_name}</span>
              </div>
              <h1>{renderTitle(hero.title, hero.highlight_text)}</h1>
              <p class="hero-desc">{hero.description}</p>
              <div class="hero-actions">
                <a href="#program" class="btn btn-gold">
                  Cari Tahu Lebih Dalam <i class="bx bx-right-arrow-alt"></i>
                </a>
                <a href="#kontak" class="btn btn-ghost">
                  <i class="bx bx-envelope"></i> Hubungi Kami
                </a>
              </div>
            </div>

            <div class="hero-visual">
              <div class="hero-img-main">
                <img src={hero.hero_image_main || '/img/classroom.jpg'} alt="Suasana Kelas" />
              </div>
              <div class="hero-img-float hero-img-float-1">
                <img src={hero.hero_image_float1 || '/img/tahfidz.jpg'} alt="Foto Kegiatan 1" />
              </div>
              <div class="hero-img-float hero-img-float-2">
                <img src={hero.hero_image_float2 || '/img/drumband.jpg'} alt="Foto Kegiatan 2" />
              </div>
              <div class="hero-stat-card">
                <div class="hero-stat-icon"><i class="bx bxs-group"></i></div>
                <div>
                  <strong>{hero.stat_value || 155} {hero.stat_label || 'Siswa'}</strong>
                  <small>{hero.stat_sub_text || 'Tahun Ajaran Aktif'}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAM UNGGULAN */}
      <section class="section programs" id="program">
        <div class="container">
          <div class="sec-head anim fade-up">
            <div class="sec-label"><i class="bx bxs-star-half"></i> Keunggulan Kami</div>
            <h2>Program Unggulan</h2>
            <p>Program terbaik untuk membentuk karakter dan kecerdasan siswa secara menyeluruh.</p>
          </div>

          <div class="prog-grid">
            {programs.map((prog, idx) => (
              <div key={idx} class="prog-card anim fade-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                <div class="prog-img">
                  <img src={prog.image_url} alt={prog.title} />
                  <div class="prog-img-overlay"></div>
                </div>
                <div class="prog-body">
                  <div class={`prog-icon ic-${prog.icon_color || 'green'}`}><i class={`bx ${prog.icon}`}></i></div>
                  <h3>{prog.title}</h3>
                  <p>{prog.description}</p>
                  <a href="#" class="prog-link">Selengkapnya <i class="bx bx-right-arrow-alt"></i></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRESTASI & TESTIMONI */}
      <section class="section prestasi" id="prestasi">
        <div class="container">
          <div class="sec-head anim fade-up">
            <div class="sec-label"><i class="bx bxs-trophy"></i> Pencapaian</div>
            <h2>Prestasi Siswa</h2>
            <p>Kebanggaan kami atas pencapaian siswa-siswi dalam berbagai bidang.</p>
          </div>

          {featuredPrestasi && (
            <div class="prestasi-top">
              <div class="prestasi-img-wrap anim fade-left">
                <img src={featuredPrestasi.image_url} alt={featuredPrestasi.title} />
                <div class="prestasi-img-badge">
                  <i class="bx bxs-trophy"></i>
                  <span>{featuredPrestasi.title}</span>
                </div>
              </div>
              <div class="prestasi-text anim fade-right">
                <h3>Terus Berprestasi &amp; Menginspirasi</h3>
                <p>{featuredPrestasi.content}</p>
                <a href="#" class="btn btn-green">
                  <i class="bx bx-trophy"></i> Lihat Semua Prestasi
                </a>
              </div>
            </div>
          )}

          {/* Testimoni */}
          <div class="testi-grid">
            {testimoni.map((testi, idx) => (
              <div key={idx} class="testi-card anim fade-up" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                <div class="testi-stars">
                  {[...Array(testi.rating || 5)].map((_, i) => (
                    <i key={i} class="bx bxs-star"></i>
                  ))}
                </div>
                <blockquote>"{testi.content}"</blockquote>
                <div class="testi-author">
                  <div class="testi-avatar">{testi.avatar_initial}</div>
                  <div>
                    <div class="testi-name">{testi.name}</div>
                    <div class="testi-role">{testi.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY STRIP */}
      <div class="gallery-strip">
        <div class="gallery-row" id="galleryRow">
          <img src="/img/hero.jpg" alt="Sekolah" />
          <img src="/img/fullday.jpg" alt="Full Day" />
          <img src="/img/tahfidz.jpg" alt="Tahfidz" />
          <img src="/img/drumband.jpg" alt="Drumband" />
          <img src="/img/pramuka.jpg" alt="Pramuka" />
          <img src="/img/prestasi.jpg" alt="Prestasi" />
          <img src="/img/classroom.jpg" alt="Kelas" />
          <img src="/img/aerial.jpg" alt="Aerial" />
          {/* Duplicated for infinite scroll */}
          <img src="/img/hero.jpg" alt="Sekolah" />
          <img src="/img/fullday.jpg" alt="Full Day" />
          <img src="/img/tahfidz.jpg" alt="Tahfidz" />
          <img src="/img/drumband.jpg" alt="Drumband" />
          <img src="/img/pramuka.jpg" alt="Pramuka" />
          <img src="/img/prestasi.jpg" alt="Prestasi" />
          <img src="/img/classroom.jpg" alt="Kelas" />
          <img src="/img/aerial.jpg" alt="Aerial" />
        </div>
      </div>

      {/* DATA MADRASAH */}
      <section class="section data-sec" id="data">
        <div class="data-bg">
          <img src="/img/aerial.jpg" alt="Aerial View" />
        </div>
        <div class="container">
          <div class="sec-head anim fade-up">
            <div class="sec-label"><i class="bx bxs-bar-chart-alt-2"></i> Statistik</div>
            <h2>Data Madrasah</h2>
            <p>Sumber daya dan fasilitas yang mendukung kegiatan belajar mengajar.</p>
          </div>
          <div class="data-row">
            {dataMadrasah.map((d, idx) => (
              <div key={idx} class="data-item anim scale-in" style={{ animationDelay: `${(idx + 1) * 0.1}s` }}>
                <div class={`data-item-icon ${d.icon_class}`}><i class={`bx ${d.icon}`}></i></div>
                <div class="num" data-count={d.value}>0</div>
                <div class="label">{d.label}</div>
                <div class="sub">{d.sub_text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFIL GURU */}
      <section class="section guru-sec" id="guru">
        <div class="container">
          <div class="sec-head anim fade-up">
            <div class="sec-label"><i class="bx bxs-graduation"></i> Tim Pengajar</div>
            <h2>Profil Guru</h2>
            <p>Tenaga pengajar profesional dan berdedikasi tinggi.</p>
          </div>

          {kepalaMadrasah && (
            <div class="guru-kepala anim fade-up">
              <div class="guru-kepala-photo">
                {kepalaMadrasah.photo_url ? (
                  <img src={kepalaMadrasah.photo_url} alt={kepalaMadrasah.name} />
                ) : (
                  <div class="guru-kepala-initial">{kepalaMadrasah.initial}</div>
                )}
              </div>
              <div class="guru-kepala-info">
                <div class="badge"><i class="bx bxs-crown"></i> Kepala Madrasah</div>
                <h3>{kepalaMadrasah.name}</h3>
                <p>{kepalaMadrasah.bio}</p>
              </div>
            </div>
          )}

          <div class="guru-grid">
            {regularGuru.map((guru, idx) => (
              <div key={idx} class="guru-card anim fade-up" style={{ animationDelay: `${(idx + 1) * 0.05}s` }}>
                <div class={`guru-card-photo ${guru.gradient_class}`}>
                  {guru.photo_url ? (
                    <img src={guru.photo_url} alt={guru.name} />
                  ) : (
                    <div class="guru-init">{guru.initial}</div>
                  )}
                </div>
                <div class="guru-card-info">
                  <h3>{guru.name}</h3>
                  <p>{guru.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section class="section contact-sec" id="kontak">
        <div class="container">
          <div class="sec-head anim fade-up">
            <div class="sec-label"><i class="bx bxs-chat"></i> Kontak</div>
            <h2>Hubungi Kami</h2>
            <p>Ada pertanyaan? Silakan hubungi kami atau isi formulir pesan.</p>
          </div>
          <div class="contact-grid">
            <div class="contact-left anim fade-left">
              <h3>Mari Terhubung</h3>
              <p>Kami senang mendengar dari Anda. Hubungi kami kapan saja untuk informasi pendaftaran dan program madrasah.</p>

              <div class="c-item">
                <div class="c-item-icon"><i class="bx bxs-map"></i></div>
                <div class="c-item-text">
                  <h4>Alamat</h4>
                  <p>{settings.address}</p>
                </div>
              </div>
              <div class="c-item">
                <div class="c-item-icon"><i class="bx bxs-time"></i></div>
                <div class="c-item-text">
                  <h4>Jam Kerja</h4>
                  <p>{settings.work_hours}</p>
                </div>
              </div>
              <div class="c-item">
                <div class="c-item-icon"><i class="bx bxs-phone"></i></div>
                <div class="c-item-text">
                  <h4>No HP</h4>
                  <p>{settings.phone}</p>
                </div>
              </div>

              <div class="contact-map">
                <img src="/img/aerial.jpg" alt="Lokasi MIM Gambiranom" />
                <div class="contact-map-overlay">
                  <span><i class="bx bxs-map-pin"></i> Gambiranom, Kismantoro, Wonogiri</span>
                </div>
              </div>
            </div>

            <div class="contact-form anim fade-right">
              <h3>Kirim Pesan</h3>
              <form id="contactForm">
                <div class="field">
                  <label for="fName">Nama</label>
                  <input type="text" id="fName" placeholder="Masukkan nama Anda" required />
                </div>
                <div class="field">
                  <label for="fEmail">E-mail</label>
                  <input type="email" id="fEmail" placeholder="Masukkan email Anda" required />
                </div>
                <div class="field">
                  <label for="fMsg">Pesan</label>
                  <textarea id="fMsg" placeholder="Tulis pesan Anda..." required></textarea>
                </div>
                <button type="submit" class="btn-send">
                  Kirim Pesan <i class="bx bx-send"></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand">
              <h3>{settings.school_name}</h3>
              <p>Mendidik generasi Qur'ani yang berakhlak mulia, cerdas, dan mandiri. Mendampingi anak dalam pembelajaran baik di sekolah maupun di luar sekolah.</p>
            </div>
            <div class="footer-col">
              <h4>Navigasi</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#program">Program Unggulan</a></li>
                <li><a href="#prestasi">Prestasi Siswa</a></li>
                <li><a href="#data">Data Madrasah</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Lainnya</h4>
              <ul>
                <li><a href="#guru">Profil Guru</a></li>
                <li><a href="#kontak">Hubungi Kami</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Kontak</h4>
              <ul>
                <li><a href={`tel:${settings.phone}`}>{settings.phone}</a></li>
                <li><a href="#">Kismantoro, Wonogiri</a></li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>Copyright 2025 MIM Gambiranom. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
