import './globals.css';

export const metadata = {
  title: 'MIM Gambiranom — MI Muhammadiyah Gambiranom',
  description: 'Sekolah Dasar Berbasis Agama di Kismantoro, Wonogiri, Jawa Tengah. Mendidik generasi Qur\'ani yang berakhlak mulia.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Lora:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
