'use client';

import { useEffect, useState } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { FaRegArrowAltCircleRight } from "react-icons/fa";


const ActiveLinksTable = () => {

  

  const [links] = useState([
    { id: 1, siteName: "Mega Bad Comments", link: "https://example.com", time: "1 day ago" },
    { id: 2, siteName: "Mega Bad Comments", link: "https://example.com", time: "2 days ago" },
    { id: 3, siteName: "Mega Bad Comments", link: "https://example.com", time: "3 days ago" },
    { id: 4, siteName: "Mega Bad Comments", link: "https://example.com", time: "4 days ago" },
    { id: 5, siteName: "Mega Bad Comments", link: "https://example.com", time: "5 days ago" },
    { id: 6, siteName: "Mega Bad Comments", link: "https://example.com", time: "6 days ago" },
    { id: 7, siteName: "Mega Bad Comments", link: "https://example.com", time: "7 days ago" },
    { id: 8, siteName: "Mega Bad Comments", link: "https://example.com", time: "8 days ago" },
    { id: 9, siteName: "Mega Bad Comments", link: "https://example.com", time: "9 days ago" },
    { id: 10, siteName: "Mega Bad Comments", link: "https://example.com", time: "10 days ago" },
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 5;

  // Simulate loading completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Optional delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  // Pagination
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = links.slice(startIndex, startIndex + itemsPerPage);

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

    const sortedLinks = [...links].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    links.splice(0, links.length, ...sortedLinks);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Copied: ${text}`);
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>
      <section className="flex items-center justify-between gap-5">
        {["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((title, index) => (
          <div className="w-full" key={index}>
            <div
              className={`flex justify-between rounded-md ${
                index === 0 ? "bg-cyan-600" : index === 1 ? "bg-[#28a745]" : index === 2 ? "bg-[#ffc107]" : "bg-[#dc3545]"
              }`}
            >
              <div className="flex flex-col w-full gap-1">
                <h1 className="px-4 pt-5 text-3xl font-bold text-white">0</h1>
                <p className="px-4 pb-6 text-white">{title}</p>
                <button
                  className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md ${
                    index === 0
                      ? "hover:bg-cyan-800 bg-cyan-700"
                      : index === 1
                      ? "hover:bg-[#196e2d] bg-[#1a7d31]"
                      : index === 2
                      ? "hover:bg-[#d1a72b] bg-yellow-400"
                      : "hover:bg-[#962934] bg-[#c92535]"
                  }`}
                >
                  More Info
                  <FaRegArrowAltCircleRight />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="pt-10 overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              {["ID", "Sitename", "Time", "Link", "Copy"].map((title, index) => (
                <th
                  key={index}
                  className="px-4 py-2 border border-gray-300 cursor-pointer"
                  onClick={() => title !== "Copy" && handleSort(title.toLowerCase())}
                >
                  <span className="flex items-center justify-between">
                    {title}
                    {sortConfig.key === title.toLowerCase() &&
                      (sortConfig.direction === "ascending" ? (
                        <MdArrowUpward size={20} />
                      ) : (
                        <MdArrowDownward size={20} />
                      ))}
                  </span>
                </th>
              ))}
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
                <td className="px-4 py-2 border border-gray-300">{link.siteName}</td>
                <td className="px-4 py-2 border border-gray-300">{link.time}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <a href={link.link} className="text-blue-500 underline">
                    {link.link}
                  </a>
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    onClick={() => copyToClipboard(link.link)}
                    className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <MdContentCopy size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${
            currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === 1}
        >
          <MdKeyboardArrowLeft />
        </button>

        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`${
                currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700"
              } px-3 py-2 rounded hover:bg-blue-500 hover:text-white`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${
            currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === totalPages}
        >
          <MdKeyboardArrowRight />
        </button>
      </div>
    </div>
  );
};

export default ActiveLinksTable;
