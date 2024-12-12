'use client';
import { useEffect, useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaList, FaHistory, FaUnlink } from "react-icons/fa";
import { RiMenuUnfold3Line } from "react-icons/ri";
import Image from 'next/image';
import useSWR from 'swr';

const SidebarLink = ({ href, icon: Icon, label, isActive, onClick }) => (
  <Link href={href} prefetch={true} onClick={onClick} aria-current={isActive ? "page" : undefined}>
    <h3 className={`flex items-center p-2 rounded-lg ${isActive ? "bg-green-500 text-white" : "text-white"} dark:text-white hover:text-black hover:bg-white transition-all duration-500 hover:scale-100 dark:hover:bg-gray-700 group`}>
      <span className="text-xl"><Icon /></span>
      <span className="font-medium ms-3">{label}</span>
    </h3>
  </Link>
);

const Sidebar = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loginUser, setLoginUser] = useState(null);
  const [userName, setUserName] = useState(null);

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: name, isLoading } = useSWR("/api/auth/signup", fetcher, { refreshInterval: 1000 });

  useEffect(() => {
    if (typeof window !== "undefined") {
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

  const toggleSidebar = () => setIsCollapsed(prev => !prev);
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        localStorage.removeItem('login_user');
        router.push('/');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const isActive = useMemo(() => (route) => pathname === route, [pathname]);

  return (
    <div className="flex">
      <aside
        role="navigation"
        style={{
          width: isCollapsed ? '0' : '256px',
          opacity: isCollapsed ? '0' : '1',
        }}
        className={`h-screen sm:w-3/12 w-6/12 bg-slate-900 dark:bg-gray-800 relative transition-all duration-300 ease-in-out overflow-hidden`}
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1 font-normal">
            <li className='border-b'>
              <span className='flex justify-center'>
                <Image src={'/images/light_prev_ui.png'} height={10} width={100} alt='cloud logo' />
              </span>
            </li>
            <li>
              <h3 className={`py-5 pl-2 text-xl text-white border-b text-start ${isCollapsed ? 'hidden' : ''}`}>
                Admin
              </h3>
            </li>
            <SidebarLink href="/admin" icon={MdDashboard} label="Dashboard" isActive={isActive("/admin")} />
            <SidebarLink href="/admin/users" icon={MdDashboard} label="All Users" isActive={isActive("/admin/users")} />
            <SidebarLink href="/admin/add_user" icon={FaList} label="Add User" isActive={isActive("/admin/add_user")} />
            <SidebarLink href="/admin/website_list" icon={FaHistory} label="Website List" isActive={isActive("/admin/website_list")} />
            <SidebarLink href="/admin/informations_list" icon={FaUnlink} label="Information List" isActive={isActive("/admin/informations_list")} />
            <SidebarLink href="" icon={MdLogout} label="Log Out" onClick={handleLogout} isActive={isActive("/home/logout")} />
          </ul>
        </div>
        <div className="absolute top-0 right-0 w-2 h-full bg-gray-700 cursor-col-resize hover:bg-gray-500" />
      </aside>

      <div className="flex-1 sm:w-9/12 w-6/12 bg-[#f4f6f9] h-screen">
        <div className='flex items-center gap-3 p-4 bg-white shadow-lg'>
          <span onClick={toggleSidebar} className='text-2xl cursor-pointer'>
            <RiMenuUnfold3Line />
          </span>
          {pathname.slice(6) === "" ? "Admin Dashboard" : pathname.slice(7)}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Sidebar;
