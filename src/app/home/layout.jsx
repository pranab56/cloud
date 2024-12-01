'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import { MdDashboard } from "react-icons/md";
import { FaList, FaHistory, FaUnlink } from "react-icons/fa";
import { RiMenuUnfold3Line } from "react-icons/ri";
import Image from 'next/image';

export default function Sidebar({ children }) {
  const pathname = usePathname();
  const isActive = (route) => pathname === route;

  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapsed state
  const [sidebarWidth, setSidebarWidth] = useState(256); // Initial width of sidebar
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newWidth = Math.max(200, Math.min(e.clientX, 400)); // Restrict width between 200px and 400px
      setSidebarWidth(newWidth);
    }
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
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
              {`Pronab`}
              </h3>
            </li>
            <li className='mt-3'>
              <Link href="/home">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/home") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-xl">
                    <MdDashboard />
                  </span>
                  <span className={`font-medium ms-3 ${isCollapsed ? 'hidden' : ''}`}>Dashboard</span>
                </h3>
              </Link>
            </li>
            <li className="flex flex-col gap-1">
              <Link href="/home/websiteList">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/home/websiteList") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaList /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Website List</span>
                </h3>
              </Link>
              <Link href="/home/ClickHistory">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/home/ClickHistory") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaHistory /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Click History</span>
                </h3>
              </Link>
              <Link href="/home/CreateLink">
                <h3
                  className={`flex items-center p-2 rounded-lg ${
                    isActive("/home/CreateLink") ? "bg-green-500 text-white" : "text-white"
                  } dark:text-white hover:text-black hover:bg-white dark:hover:bg-gray-700 group`}
                >
                  <span className="text-lg"><FaUnlink /></span>
                  <span className={`ms-3 ${isCollapsed ? 'hidden' : ''}`}>Create Link</span>
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
          {pathname.slice(6) === "" ? "Home" : pathname.slice(6)}
        </div>
        {children}
      </div>
    </div>
  );
}
