import SessionWrapper from '@/components/admin/SessionWrapper';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
  title: 'MIM Gambiranom — Portal Admin',
  description: 'Sistem manajemen konten website MI Muhammadiyah Gambiranom.',
};

export default function AdminLayout({ children }) {
  return (
    <SessionWrapper>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </SessionWrapper>
  );
}
