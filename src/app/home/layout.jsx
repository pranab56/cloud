'use client';
import debounce from 'lodash.debounce';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FaHistory, FaList, FaUnlink } from 'react-icons/fa';
import { MdDashboard, MdLogout } from 'react-icons/md';
import { RiMenuUnfold3Line } from 'react-icons/ri';
import useSWR from 'swr';

const Sidebar = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // State management
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [userName, setUserName] = useState(null);

  // Check active route
  const isActive = useCallback((route) => pathname === route, [pathname]);

  // Enhanced fetcher with error handling
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

  const { data: nameData, isLoading: loadingName, error } = useSWR(
    isMounted ? "/api/auth/signup" : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: process.env.NODE_ENV === 'development', // Only revalidate on focus in dev
    }
  );

  // Set user data when mounted and fetched
  useEffect(() => {
    setIsMounted(true);
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("login_user") : null;
    setLoginUser(storedUser);
  }, []);

  useEffect(() => {
    if (nameData && loginUser) {
      const user = nameData.find((user) => user.email === loginUser);
      setUserName(user);
    }
  }, [nameData, loginUser]);

  // Sidebar resizing logic with cleanup
  const handleMouseMove = useCallback(debounce((e) => {
    if (isDragging) {
      const newWidth = Math.max(200, Math.min(e.clientX, 400));
      setSidebarWidth(newWidth);
    }
  }, 100), [isDragging]);

  const handleMouseDown = useCallback(() => setIsDragging(true), []);
  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Add/remove event listeners for resizing
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Toggle sidebar collapse
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Logout logic with enhanced error handling
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        localStorage.removeItem('login_user');
        router.push('/');
        router.refresh(); // Ensure proper state update in production
      } else {
        const errorData = await response.json();
        console.error('Failed to log out:', errorData.message);
        alert(errorData.message || 'Logout failed. Please try again!');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred. Please try again!');
    }
  };

  // Don't render until mounted (client-side)
  if (!isMounted) {
    return <div className="flex">Loading...</div>;
  }

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        aria-expanded={!isCollapsed}
        style={{
          width: isCollapsed ? '0' : `${sidebarWidth}px`,
          minWidth: isCollapsed ? '0' : '200px',
          opacity: isCollapsed ? '0' : '1',
        }}
        className="relative h-screen overflow-hidden transition-all duration-300 ease-in-out bg-slate-900 dark:bg-gray-800"
      >
        <div className="h-full px-3 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1 font-normal">
            <li className="border-b">
              <div className="flex justify-center">
                <Image
                  src="/images/light_prev_ui.png"
                  height={10}
                  width={100}
                  alt="Cloud logo"
                  priority
                />
              </div>
            </li>
            <li>
              <h3 className={`py-5 pl-2 text-xl text-white border-b ${isCollapsed ? 'hidden' : ''}`}>
                {userName?.name || 'Guest'}
              </h3>
            </li>

            {/* Navigation Links */}
            <NavLink
              href="/home"
              icon={<MdDashboard className="text-xl" />}
              label="Dashboard"
              isActive={isActive("/home")}
              isCollapsed={isCollapsed}
            />

            <NavLink
              href="/home/websiteList"
              icon={<FaList className="text-lg" />}
              label="Website List"
              isActive={isActive("/home/websiteList")}
              isCollapsed={isCollapsed}
            />

            <NavLink
              href="/home/ClickHistory"
              icon={<FaHistory className="text-lg" />}
              label="Click History"
              isActive={isActive("/home/ClickHistory")}
              isCollapsed={isCollapsed}
            />

            <NavLink
              href="/home/CreateLink"
              icon={<FaUnlink className="text-lg" />}
              label="Create Link"
              isActive={isActive("/home/CreateLink")}
              isCollapsed={isCollapsed}
            />

            <li>
              <button
                onClick={handleLogout}
                className={`w-full flex items-center p-2 rounded-lg text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <MdLogout className="text-xl" />
                {!isCollapsed && <span className="ms-3">Log Out</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Resizing handle */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-2 h-full bg-gray-700 cursor-col-resize hover:bg-gray-500"
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 bg-[#f4f6f9] h-screen overflow-auto">
        <div className="flex items-center gap-3 p-4 bg-white shadow-lg sticky top-0 z-10">
          <button
            onClick={toggleSidebar}
            className="text-2xl cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <RiMenuUnfold3Line />
          </button>
          <span className="capitalize">
            {pathname?.split('/').pop() || 'Home'}
          </span>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// Extracted NavLink component for better reusability and performance
const NavLink = ({ href, icon, label, isActive, isCollapsed }) => (
  <li>
    <Link href={href} passHref legacyBehavior>
      <a
        className={`flex items-center p-2 rounded-lg ${isActive ? "bg-green-500 text-white" : "text-white"} hover:text-black hover:bg-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
      >
        {icon}
        {!isCollapsed && <span className="ms-3">{label}</span>}
      </a>
    </Link>
  </li>
);

export default Sidebar;