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
  const [isMobile, setIsMobile] = useState(false);
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

  // Sidebar resizing logic with cleanup (only for desktop)
  const handleMouseMove = useCallback(debounce((e) => {
    if (isDragging && !isMobile) {
      const newWidth = Math.max(200, Math.min(e.clientX, 400));
      setSidebarWidth(newWidth);
    }
  }, 100), [isDragging, isMobile]);

  const handleMouseDown = useCallback(() => {
    if (!isMobile) {
      setIsDragging(true);
    }
  }, [isMobile]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Add/remove event listeners for resizing
  useEffect(() => {
    if (isDragging && !isMobile) {
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
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile]);

  // Toggle sidebar collapse
  const toggleSidebar = useCallback(() => {
    setIsCollapsed((prev) => !prev);
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
        const sidebar = document.getElementById('sidebar');
        const toggleButton = document.getElementById('sidebar-toggle');

        if (sidebar && !sidebar.contains(event.target) &&
          toggleButton && !toggleButton.contains(event.target)) {
          setIsCollapsed(true);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isCollapsed]);

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

  const sidebarStyles = isMobile ? {
    width: isCollapsed ? '0' : '280px',
    transform: isCollapsed ? 'translateX(-100%)' : 'translateX(0)',
  } : {
    width: isCollapsed ? '0' : `${sidebarWidth}px`,
    minWidth: isCollapsed ? '0' : '200px',
    opacity: isCollapsed ? '0' : '1',
  };

  return (
    <div className="flex relative">
      {/* Mobile Overlay */}
      {isMobile && !isCollapsed && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
      )}

      {/* Sidebar */}
      <aside
        id="sidebar"
        aria-label="Sidebar"
        aria-expanded={!isCollapsed}
        style={sidebarStyles}
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          h-screen overflow-hidden transition-all duration-300 ease-in-out 
          bg-slate-900 dark:bg-gray-800
          ${isMobile ? 'z-50 left-0 top-0' : ''}
        `}
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
              onClick={handleNavLinkClick}
            />

            <NavLink
              href="/home/websiteList"
              icon={<FaList className="text-lg" />}
              label="Website List"
              isActive={isActive("/home/websiteList")}
              isCollapsed={isCollapsed}
              onClick={handleNavLinkClick}
            />

            <NavLink
              href="/home/ClickHistory"
              icon={<FaHistory className="text-lg" />}
              label="Click History"
              isActive={isActive("/home/ClickHistory")}
              isCollapsed={isCollapsed}
              onClick={handleNavLinkClick}
            />

            <NavLink
              href="/home/CreateLink"
              icon={<FaUnlink className="text-lg" />}
              label="Create Link"
              isActive={isActive("/home/CreateLink")}
              isCollapsed={isCollapsed}
              onClick={handleNavLinkClick}
            />

            <li>
              <button
                onClick={() => {
                  handleLogout();
                  handleNavLinkClick();
                }}
                className={`w-full flex items-center p-2 rounded-lg text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
              >
                <MdLogout className="text-xl" />
                {!isCollapsed && <span className="ms-3">Log Out</span>}
              </button>
            </li>
          </ul>
        </div>

        {/* Resizing handle (only show on desktop) */}
        {!isMobile && (
          <div
            onMouseDown={handleMouseDown}
            className="absolute top-0 right-0 w-2 h-full bg-gray-700 cursor-col-resize hover:bg-gray-500"
          />
        )}
      </aside>

      {/* Main content */}
      <div className="flex-1 bg-[#f4f6f9] h-screen overflow-auto">
        <div className="flex items-center gap-3 p-4 bg-white shadow-lg sticky top-0 z-10">
          <button
            id="sidebar-toggle"
            onClick={toggleSidebar}
            className="text-2xl cursor-pointer hover:bg-gray-100 p-1 rounded"
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

// Enhanced NavLink component with mobile support
const NavLink = ({ href, icon, label, isActive, isCollapsed, onClick }) => (
  <li>
    <Link href={href} passHref legacyBehavior>
      <a
        onClick={onClick}
        className={`flex items-center p-2 rounded-lg ${isActive ? "bg-green-500 text-white" : "text-white"} hover:text-black hover:bg-white dark:hover:bg-gray-700 ${isCollapsed ? 'justify-center' : ''}`}
      >
        {icon}
        {!isCollapsed && <span className="ms-3">{label}</span>}
      </a>
    </Link>
  </li>
);

export default Sidebar;