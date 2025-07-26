'use client';
import Image from 'next/image';
import Link from "next/link";
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaHistory, FaList, FaUnlink } from "react-icons/fa";
import { MdDashboard, MdLogout } from "react-icons/md";
import { RiMenuUnfold3Line } from "react-icons/ri";
import useSWR from 'swr';

const SidebarLink = ({ href, icon: Icon, label, isActive, onClick, isMobile }) => (
  <Link
    href={href}
    prefetch={process.env.NODE_ENV === 'production'} // Only prefetch in production
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
    aria-current={isActive ? "page" : undefined}
    className={`flex items-center p-2 rounded-lg ${isActive ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
  >
    <span className="text-xl"><Icon /></span>
    <span className="font-medium ms-3">{label}</span>
  </Link>
);

const Sidebar = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const fetcher = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
    return res.json();
  };

  const { data: name, isLoading, error } = useSWR(
    isClient ? "/api/auth/signup" : null,
    fetcher,
    {
      refreshInterval: 1000,
      revalidateOnFocus: false // Reduce unnecessary requests in production
    }
  );

  // Check if screen is mobile and set initial sidebar state
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true); // Close sidebar on mobile by default
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('login_user');
      setLoginUser(user);
    }
  }, []);

  useEffect(() => {
    if (name && loginUser) {
      const foundUser = name.find((value) => value.email === loginUser);
      setUserName(foundUser);
    }
  }, [name, loginUser]);

  const toggleSidebar = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  // Close sidebar when clicking on nav links (mobile only)
  const handleNavLinkClick = useCallback(() => {
    if (isMobile) {
      setIsCollapsed(true);
    }
  }, [isMobile]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && !isCollapsed) {
        const sidebar = document.getElementById('admin-sidebar');
        const toggleButton = document.getElementById('admin-sidebar-toggle');

        if (sidebar && !sidebar.contains(event.target) &&
          toggleButton && !toggleButton.contains(event.target)) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isCollapsed]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('login_user');
        }
        router.push('/');
        router.refresh(); // Ensure page refresh in production
      } else {
        console.error('Failed to log out:', await response.text());
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }

    // Close sidebar after logout on mobile
    if (isMobile) {
      setIsCollapsed(true);
    }
  };

  const isActive = useMemo(() => (route) => pathname === route, [pathname]);

  if (!isClient) {
    return null; // Or return a loading skeleton
  }

  const sidebarStyles = isMobile ? {
    width: isCollapsed ? '0' : '280px',
    transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
  } : {
    width: isCollapsed ? '0' : '256px',
    opacity: isCollapsed ? '0' : '1',
  };

  return (
    <div className="flex relative">
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      <aside
        id="admin-sidebar"
        role="navigation"
        style={sidebarStyles}
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          h-screen bg-slate-900 dark:bg-gray-800 transition-all duration-300 ease-in-out overflow-hidden
          ${isMobile ? 'z-50 left-0 top-0' : ''}
        `}
        aria-label="Admin Sidebar"
        aria-expanded={!isCollapsed}
      >
        <div className="h-full px-3 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1 font-normal">
            <li className='border-b'>
              <span className='flex justify-center'>
                <Image
                  src={'/images/light_prev_ui.png'}
                  height={10}
                  width={100}
                  alt='cloud logo'
                  priority // Important for production images
                />
              </span>
            </li>
            <li>
              <h3 className={`py-5 pl-2 text-xl text-white border-b text-start ${isCollapsed ? 'hidden' : ''}`}>
                Admin
              </h3>
            </li>

            {/* Navigation Links with mobile auto-close */}
            <li>
              <Link
                href="/admin"
                prefetch={process.env.NODE_ENV === 'production'}
                onClick={handleNavLinkClick}
                aria-current={isActive("/admin") ? "page" : undefined}
                className={`flex items-center p-2 rounded-lg ${isActive("/admin") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
              >
                <span className="text-xl"><MdDashboard /></span>
                <span className="font-medium ms-3">Dashboard</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/users"
                prefetch={process.env.NODE_ENV === 'production'}
                onClick={handleNavLinkClick}
                aria-current={isActive("/admin/users") ? "page" : undefined}
                className={`flex items-center p-2 rounded-lg ${isActive("/admin/users") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
              >
                <span className="text-xl"><MdDashboard /></span>
                <span className="font-medium ms-3">All Users</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/add_user"
                prefetch={process.env.NODE_ENV === 'production'}
                onClick={handleNavLinkClick}
                aria-current={isActive("/admin/add_user") ? "page" : undefined}
                className={`flex items-center p-2 rounded-lg ${isActive("/admin/add_user") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
              >
                <span className="text-xl"><FaList /></span>
                <span className="font-medium ms-3">Add User</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/website_list"
                prefetch={process.env.NODE_ENV === 'production'}
                onClick={handleNavLinkClick}
                aria-current={isActive("/admin/website_list") ? "page" : undefined}
                className={`flex items-center p-2 rounded-lg ${isActive("/admin/website_list") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
              >
                <span className="text-xl"><FaHistory /></span>
                <span className="font-medium ms-3">Website List</span>
              </Link>
            </li>

            <li>
              <Link
                href="/admin/informations_list"
                prefetch={process.env.NODE_ENV === 'production'}
                onClick={handleNavLinkClick}
                aria-current={isActive("/admin/informations_list") ? "page" : undefined}
                className={`flex items-center p-2 rounded-lg ${isActive("/admin/informations_list") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}
              >
                <span className="text-xl"><FaUnlink /></span>
                <span className="font-medium ms-3">Information List</span>
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center p-2 rounded-lg text-white dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group"
              >
                <span className="text-xl"><MdLogout /></span>
                <span className="font-medium ms-3">Log Out</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Resizing handle (only show on desktop) */}
        {!isMobile && (
          <div className="absolute top-0 right-0 w-2 h-full bg-gray-700 cursor-col-resize hover:bg-gray-500" />
        )}
      </aside>

      <div className="flex-1 bg-[#f4f6f9] h-screen overflow-auto">
        <div className='flex items-center gap-3 p-4 bg-white shadow-lg sticky top-0 z-10'>
          <button
            id="admin-sidebar-toggle"
            onClick={toggleSidebar}
            className='text-2xl cursor-pointer hover:bg-gray-100 p-1 rounded'
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <RiMenuUnfold3Line />
          </button>
          <span className="capitalize">
            {pathname?.slice(6) === "" ? "Admin Dashboard" : pathname?.slice(7)}
          </span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;