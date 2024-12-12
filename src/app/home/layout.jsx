'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MdDashboard, MdLogout } from 'react-icons/md';
import { FaList, FaHistory, FaUnlink } from 'react-icons/fa';
import { RiMenuUnfold3Line } from 'react-icons/ri';
import Image from 'next/image';
import useSWR from 'swr';
import debounce from 'lodash.debounce';  // Import lodash debounce for performance optimization

const Sidebar = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  // State management
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256);
  const [isDragging, setIsDragging] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [userName, setUserName] = useState(null);

  // Check active route
  const isActive = (route) => pathname === route;

  // Fetch user data
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: nameData, isLoading: loadingName } = useSWR("/api/auth/signup", fetcher, {
    refreshInterval: 30000,  // Increase interval for better performance
  });

  // Set user data when fetched
  useEffect(() => {
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("login_user") : null;
    if (storedUser !== loginUser) {
      setLoginUser(storedUser);
    }
  }, []);

  useEffect(() => {
    if (nameData && loginUser) {
      const user = nameData.find((user) => user.email === loginUser);
      setUserName(user);
    }
  }, [nameData, loginUser]);

  // Sidebar resizing logic (debounced for performance)
  const handleMouseMove = debounce((e) => {
    if (isDragging) {
      const newWidth = Math.max(200, Math.min(e.clientX, 400));
      setSidebarWidth(newWidth);
    }
  }, 100);  // Debounced function to optimize performance

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Logout logic with error handling
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        localStorage.removeItem('login_user');
        router.push('/');
      } else {
        console.error('Failed to log out');
        alert('Logout failed. Please try again!');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('An error occurred. Please try again!');
    }
  };

  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="flex">
      {/* Sidebar */}
      <aside
        aria-label="Sidebar"
        aria-expanded={!isCollapsed}
        style={{
          width: isCollapsed ? '0' : `${sidebarWidth}px`,
          opacity: isCollapsed ? '0' : '1',
        }}
        className="relative h-screen overflow-hidden transition-all duration-300 ease-in-out bg-slate-900 dark:bg-gray-800"
      >
        <div className="h-full px-3 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1 font-normal">
            <li className="border-b">
              <div className="flex justify-center">
                <Image src="/images/light_prev_ui.png" height={10} width={100} alt="Cloud logo" />
              </div>
            </li>
            <li>
              <h3 className={`py-5 pl-2 text-xl text-white border-b ${isCollapsed ? 'hidden' : ''}`}>
                {userName?.name || 'Guest'}
              </h3>
            </li>
            <li className="mt-3">
              <Link href="/home" passHref>
                <div
                  className={`flex items-center p-2 cursor-pointer rounded-lg ${isActive("/home") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-colors dark:hover:bg-gray-700`}
                >
                  <MdDashboard className="text-xl" />
                  <span className={`font-medium ms-3 ${isCollapsed ? 'hidden' : ''}`}>Dashboard</span>
                </div>
              </Link>
            </li>
            <li className="flex flex-col gap-1">
              <Link href="/home/websiteList" passHref>
                <div
                  className={`flex items-center p-2 cursor-pointer rounded-lg ${isActive("/home/websiteList") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700`}
                >
                  <FaList className="text-lg" />
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Website List</span>
                </div>
              </Link>

              <Link href="/home/ClickHistory" passHref>
                <div
                  className={`flex items-center p-2 cursor-pointer rounded-lg ${isActive("/home/ClickHistory") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700`}
                >
                  <FaHistory className="text-lg" />
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Click History</span>
                </div>
              </Link>

              <Link href="/home/CreateLink" passHref>
                <div
                  className={`flex items-center p-2 cursor-pointer rounded-lg ${isActive("/home/CreateLink") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700`}
                >
                  <FaUnlink className="text-lg" />
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Create Link</span>
                </div>
              </Link>

              <div
                onClick={handleLogout}
                className={`flex items-center p-2 cursor-pointer rounded-lg ${isActive("/home/logout") ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700`}
              >
                <MdLogout className="text-xl" />
                <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Log Out</span>
              </div>
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
      <div className="flex-1 bg-[#f4f6f9] h-screen w-9/12">
        <div className="flex items-center gap-3 p-4 bg-white shadow-lg">
          <span onClick={toggleSidebar} className="text-2xl cursor-pointer">
            <RiMenuUnfold3Line />
          </span>
          <span>{pathname.slice(6) === "" ? "Home" : pathname.slice(6)}</span>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
