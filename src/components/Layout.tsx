
import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import useNotificationRegistration from '@/hooks/useNotificationRegistration';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useNotificationRegistration();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
