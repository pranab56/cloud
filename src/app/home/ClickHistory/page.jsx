<<<<<<< HEAD
"use client";
import { useState, useEffect } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdDelete, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import useSWR from 'swr';
import Loader from "@/components/Loader";
import { isLoggedIn } from "@/app/utils/auth";
import { useRouter } from "next/navigation";

const ActiveLinksTable = () => {
  const router = useRouter()
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/"); 
    }
  }, []);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",  // Default column to sort by
    direction: "ascending",
  });
  const itemsPerPage = 10;
  const loginUser = localStorage.getItem('login_user')

  const [ClickHistory,setClickHistory] = useState([])

  // Fetch Data from API
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR("/api/get-visit-counts", fetcher, {
    refreshInterval: 50,
  });
  useEffect(()=>{
    const filter = data?.filter(value=>value?.email === loginUser)
    setClickHistory(filter)
  },[data])

  if (isLoading) return <Loader />;
  if (error) return <p>Error loading data: {error.message}</p>;

  // Sorting logic based on selected column and direction
  const sortedData = ClickHistory
    ? [...ClickHistory].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "time") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      })
    : [];

  const reversedData = [...sortedData].reverse();
  const totalPages = Math.ceil(reversedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedData.slice(startIndex, startIndex + itemsPerPage);
=======
'use client';
import { useState } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdDelete, MdArrowDownward, MdArrowUpward } from "react-icons/md";

const ActiveLinksTable = () => {
  const [links] = useState([
    { id: 1, siteName: "Mega Bad Comments", link: "https://example.com", time: "1 day ago" },
    { id: 2, siteName: "Mega Bad Comments", link: "https://example.com", time: "2 days ago" },
    { id: 3, siteName: "Mega Bad Comments", link: "https://example.com", time: "3 days ago" },
    { id: 4, siteName: "Mega Bad Comments", link: "https://example.com", time: "4 days ago" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const itemsPerPage = 5;

  // Calculate Pagination
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = links.slice(startIndex, startIndex + itemsPerPage);
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

<<<<<<< HEAD
    const sortedLinks = [...reversedData].sort((a, b) => {
=======
    const sortedLinks = [...links].sort((a, b) => {
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    // Update the links to the sorted order
<<<<<<< HEAD
    reversedData.splice(0, reversedData.length, ...sortedLinks);
  };

 
 
=======
    links.splice(0, links.length, ...sortedLinks); // mutate the state to trigger a re-render
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    });
  };
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376

  return (
    <div className="p-4">
      {/* Table */}
<<<<<<< HEAD
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        
          <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("id")}>
                  <span className="flex items-center justify-between">
                    ID
                    <span className="flex justify-center w-5">
                      {sortConfig.key === "id" && (
                        sortConfig.direction === "ascending" ? (
                          <MdArrowUpward size={20} />
                        ) : (
                          <MdArrowDownward size={20} />
                        )
                      )}
                    </span>
                  </span>
                </th>
                <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("siteName")}>
                  <span className="flex items-center justify-between">
                    Active Domain
                    <span className="flex justify-center w-5">
                      {sortConfig.key === "siteName" && (
                        sortConfig.direction === "ascending" ? (
                          <MdArrowUpward size={20} />
                        ) : (
                          <MdArrowDownward size={20} />
                        )
                      )}
                    </span>
                  </span>
                </th>
                <th className="px-4 py-2 text-center border border-gray-300">Mobile</th>
                <th className="px-4 py-2 text-center border border-gray-300">Desktop</th>
                <th className="px-4 py-2 text-center border border-gray-300">Tablet</th>
              </tr>
            </thead>
            <tbody>
  {ClickHistory && ClickHistory.length === 0 ? (
    <tr>
      <td colSpan="5" className="px-4 py-2 font-normal text-center text-gray-800 text-md">
        No Data Available
      </td>
    </tr>
  ) : (
    currentItems?.map((link, index) => (
      <tr key={index} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
        <td className="px-4 py-2 border border-gray-300">{startIndex + index + 1}</td>
        <td className="px-4 py-2 border border-gray-300">{link?.domain?.split("?")[0]}</td>
        <td className="px-4 py-2 text-center border border-gray-300">{link.deviceCounts?.mobile || 0}</td>
        <td className="px-4 py-2 text-center border border-gray-300">{link.deviceCounts?.desktop || 0}</td>
        <td className="px-4 py-2 text-center border border-gray-300">{link.deviceCounts?.tablet || 0}</td>
      </tr>
    ))
  )}
</tbody>
          </table>
        
      </div>

      {/* Pagination */}
      {ClickHistory && ClickHistory.length === 0 ? (
          <p className="text-xl font-semibold text-center text-gray-500 "></p>
        ) :  <div className="flex items-center gap-4 mt-4">
=======
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Today Click</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort('id')}>
               
               <span className="flex items-center justify-between">
               ID
               {sortConfig.key === 'id' && (sortConfig.direction === 'ascending' ? <MdArrowUpward size={20} /> : <MdArrowDownward size={20} />)}
               </span>
              </th>
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort('siteName')}>
                
                <span className="flex items-center justify-between">
                Active Domain
                {sortConfig.key === 'siteName' && (sortConfig.direction === 'ascending' ? <MdArrowUpward size={20} /> : <MdArrowDownward size={20} />)}
                </span>
                
              </th>
              
              <th className="px-4 py-2 text-center border border-gray-300">
                Mobile
              </th>
              <td className="px-4 py-2 font-bold text-center border border-gray-300">
                  Desktop
                </td>
              <th className="px-4 py-2 text-center border border-gray-300">
                Teblet
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((link, index) => (
              <tr
                key={link.id}
                className={`${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-200 transition-colors`}
              >
                <td className="px-4 py-2 border border-gray-300">{link.id}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <a href={link.link} className="text-blue-500 underline">
                    {link.link}
                  </a>
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  0
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  0
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  0
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-4">
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${
            currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === 1}
        >
          <MdKeyboardArrowLeft />
        </button>

<<<<<<< HEAD
        <div className="flex gap-2">
=======
        <div className="flex space-x-2">
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`${
<<<<<<< HEAD
                currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              } px-4 py-1 rounded`}
=======
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } px-3 py-1 rounded`}
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
            >
              {index + 1}
            </button>
          ))}
        </div>
<<<<<<< HEAD

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${
            currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
=======
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${
            currentPage === totalPages
              ? "cursor-not-allowed bg-gray-200"
              : "bg-blue-500 hover:bg-blue-600"
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === totalPages}
        >
          <MdKeyboardArrowRight />
        </button>
<<<<<<< HEAD
      </div>}

      
      

=======
      </div>
>>>>>>> 697fd6d2c2994a37ee3f1d5a2782723dd91b4376
    </div>
  );
};

export default ActiveLinksTable;
