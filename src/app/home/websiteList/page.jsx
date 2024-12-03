"use client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdDelete, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import useSWR from 'swr';

const ActiveLinksTable = () => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const itemsPerPage = 5;

  // Fetch Data from API
  const links = useState([
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

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR('/api/addLink', fetcher,{ refreshInterval: 50 });




  // Calculate Pagination
  const totalPages = Math.ceil(links.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = links.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedLinks = [...links].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setLinks(sortedLinks);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const deleteLink = async (id) => {
    try {
      const response = await fetch("/api/addLink", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the link");
      }
  
      const data = await response.json();
      alert(data.message);
  
    } catch (error) {
      console.error("Error deleting link:", error);
    }
   
  };

  

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="p-4">
      {/* Table */}
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("id")}>
                <span className="flex items-center justify-between">
                  ID
                  {sortConfig.key === "id" && (sortConfig.direction === "ascending" ? <MdArrowUpward size={20} /> : <MdArrowDownward size={20} />)}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("siteName")}>
                <span className="flex items-center justify-between">
                  Site Name
                  {sortConfig.key === "siteName" && (sortConfig.direction === "ascending" ? <MdArrowUpward size={20} /> : <MdArrowDownward size={20} />)}
                </span>
              </th>
              <th className="px-4 py-2 border border-gray-300">Link</th>
              <th className="px-4 py-2 text-center border border-gray-300">Copy</th>
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("time")}>
                <span className="flex items-center justify-between">
                  Time
                  {sortConfig.key === "time" && (sortConfig.direction === "ascending" ? <MdArrowUpward size={20} /> : <MdArrowDownward size={20} />)}
                </span>
              </th>
              <th className="px-4 py-2 text-center border border-gray-300">Delete</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((link, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}
              >
                <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
                <td className="px-4 py-2 border border-gray-300">{link.siteReview}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <a href={link.siteLink+link.link} className="text-blue-500 underline" target="_blank" rel="noopener noreferrer">
                    {link.siteLink+link.link}
                  </a>
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    onClick={() => copyToClipboard(link.siteLink)}
                    className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <MdContentCopy size={18} />
                  </button>
                </td>
                <td className="px-4 py-2 border border-gray-300">
                  {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                  
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    onClick={() => deleteLink(link._id)}
                    className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    <MdDelete size={18} />
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
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              } px-3 py-1 rounded`}
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
