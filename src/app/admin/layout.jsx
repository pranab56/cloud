'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from "next/link";
import { MdDashboard ,MdLogout } from "react-icons/md";
import { FaList, FaHistory, FaUnlink } from "react-icons/fa";
import { RiMenuUnfold3Line } from "react-icons/ri";
import Image from 'next/image';
import useSWR from 'swr';

export default function Sidebar({ children }) {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;
  const [loginUser,setLoginUser] = useState(null);
  const [userName ,setUserName ] = useState(null)

  const [isCollapsed, setIsCollapsed] = useState(false); 
  const [sidebarWidth, setSidebarWidth] = useState(256); 
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newWidth = Math.max(200, Math.min(e.clientX, 400));
      setSidebarWidth(newWidth);
    }
  };


  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem('login_user');
      setLoginUser(user);
    }
  }, []);


  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [loginUser]);

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data:name, isLoading:loadingName } = useSWR("/api/auth/signup", fetcher, {
    refreshInterval: 50,
  });
  
  useEffect(()=>{
    const findName = name?.find(value => value.email === loginUser);
        setUserName(findName)
  },[name])



  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
  
      if (response.ok) {
        localStorage.removeItem('login_user')
        router.push('/');
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };


  return (
    <div onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} className="flex">
      <aside
        style={{
          width: isCollapsed ? '0' : `${sidebarWidth}px`, // Set width to 0 when collapsed
          opacity: isCollapsed ? '0' : '1', // Make sidebar invisible when collapsed
        }}
        className={`h-screen bg-slate-900 dark:bg-gray-800 relative transition-all duration-300 ease-in-out overflow-hidden`} // Hidden when collapsed
        aria-label="Sidebar"
      >
        <div className="h-full px-3 py-5 overflow-y-auto">
          <ul className="flex flex-col gap-1 font-normal">
            <li className='border-b'>
            <span className='flex justify-center'>
            <Image src={'/images/light_prev_ui.png'} height={10} width={100} alt='cloud logo'/>
            </span>
            </li> 
            <li>
              <h3 className={`py-5 pl-2 text-xl text-white border-b text-start ${isCollapsed ? 'hidden' : ''}`}>
              {"Admin"}
              </h3>
            </li>
            <li className='mt-3'>
              <Link href="/admin">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-xl">
                    <MdDashboard />
                  </span>
                  <span className={`font-medium ms-3 ${isCollapsed ? 'hidden' : ''}`}>Dashboard</span>
                </h3>
              </Link>
            </li>
            <li className='mt-3'>
              <Link href="/admin/users">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin/users") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-xl">
                    <MdDashboard />
                  </span>
                  <span className={`font-medium ms-3 ${isCollapsed ? 'hidden' : ''}`}>All Users</span>
                </h3>
              </Link>
            </li>
            <li className="flex flex-col gap-1">
              <Link href="/admin/add_user">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin/add_user") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaList /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Add User</span>
                </h3>
              </Link>
              <Link href="/admin/website_list">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin/website_list") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaHistory /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Website List</span>
                </h3>
              </Link>
              <Link href="/admin/informations_list">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/admin/informations_list") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaUnlink /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Information List</span>
                </h3>
              </Link>
              <Link onClick={handleLogout} href="">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/home/logout") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-xl"><MdLogout /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Log Out</span>
                </h3>
              </Link>

            </li>
          </ul>
        </div>
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 right-0 w-2 h-full bg-gray-700 cursor-col-resize hover:bg-gray-500"
        />
      </aside>

      <div className="flex-1 bg-[#f4f6f9] h-screen">
        <div className='flex items-center gap-3 p-4 bg-white shadow-lg'>
          <span
            onClick={toggleSidebar}
            className='text-2xl cursor-pointer'
          >
            <RiMenuUnfold3Line />
          </span>
          {pathname.slice(6) === "" ? "Admn Dashboard" : pathname.slice(7)}
        </div>
        {children}
      </div>
    </div>
  );
}
