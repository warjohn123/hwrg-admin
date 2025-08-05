'use client';

import { supabase } from '@/lib/supabaseClient';
import { X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login'; // full reload
  };

  const linkClasses = (href: string) =>
    `hover:text-yellow-400 ${
      pathname === href ? 'text-yellow-400 font-semibold' : 'text-white'
    }`;

  return (
    <aside
      className={`
        fixed top-0 left-0 min-h-screen bg-gray-800 text-white p-5 z-50 transition-transform duration-300
        w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:flex md:flex-col
      `}
    >
      {/* Close button for mobile */}
      <div className="md:hidden flex justify-end mb-4">
        <button onClick={() => setIsOpen(false)}>
          <X size={24} />
        </button>
      </div>

      <h1 className="text-xl font-bold mb-6 hidden md:block">HWRG</h1>
      <nav className="flex flex-col space-y-4">
        <Link
          href="/admin/chicky-dashboard"
          className={linkClasses('/admin/chicky-dashboard')}
        >
          Chicky Oink Dashboard
        </Link>
        <Link
          href="/admin/imagawayaki-dashboard"
          className={linkClasses('/admin/imagawayaki-dashboard')}
        >
          Imagawayaki Dashboard
        </Link>
        <Link
          href="/admin/employees"
          className={linkClasses('/admin/employees')}
        >
          Employees
        </Link>
        <Link href="/admin/branches" className={linkClasses('/admin/branches')}>
          Branches
        </Link>
        <Link
          href="/admin/chicky-oink-sales"
          className={linkClasses('/admin/chicky-oink-sales')}
        >
          Chicky Oink Sales
        </Link>
        <Link
          href="/admin/chicky-oink-expenses"
          className={linkClasses('/admin/chicky-oink-expenses')}
        >
          Chicky Oink Expenses
        </Link>
        <Link
          href="/admin/imagawayaki-sales"
          className={linkClasses('/admin/imagawayaki-sales')}
        >
          Imagawayaki Sales
        </Link>
        <Link
          href="/admin/imagawayaki-expenses"
          className={linkClasses('/admin/imagawayaki-expenses')}
        >
          Imagawayaki Expenses
        </Link>
        {/* <Link
          href="/admin/collection-reports"
          className={linkClasses('/admin/collection-reports')}
        >
          Collection Reports
        </Link> */}
        <Link href="/admin/timelogs" className={linkClasses('/admin/timelogs')}>
          Time Logs
        </Link>
        <div onClick={logout} className="hover:text-yellow-400 cursor-pointer">
          Logout
        </div>
      </nav>
    </aside>
  );
}
