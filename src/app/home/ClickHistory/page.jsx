"use client";
import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import withAuth from "@/app/utils/auth";
import Loader from "@/components/Loader";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

const ActiveLinksTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending",
  });

  const itemsPerPage = 10;
  const loginUser = useMemo(() => (typeof window !== "undefined" ? localStorage.getItem("login_user") : null), []);

  const { data, error, isLoading } = useSWR("/api/get-visit-counts", fetcher, {
    refreshInterval: 5000, // Polling every 5 seconds
  });

  const ClickHistory = data?.filter((item) => item.email === loginUser) || [];

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  // Memoize sorted data for performance optimization
  const sortedData = useMemo(() => {
    if (!ClickHistory) return [];

    return [...ClickHistory].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (sortConfig.key === "time") {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === "ascending" ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return aValue - bValue;
    });
  }, [ClickHistory, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4" aria-live="polite">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h3 className="pb-10 text-2xl font-normal text-gray-800">Error fetching data</h3>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <caption className="sr-only">List of active links and device counts</caption>
          <thead>
            <tr className="text-left bg-gray-100">
              {["ID", "Active Domain", "Mobile", "Desktop", "Tablet"].map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-4 py-2 border border-gray-300 cursor-pointer"
                  onClick={() => handleSort(header.toLowerCase().replace(" ", ""))}
                  aria-sort={sortConfig.key === header.toLowerCase().replace(" ", "") ? sortConfig.direction : "none"}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ClickHistory.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-2 text-center">No Data Available</td>
              </tr>
            ) : (
              currentItems.reverse().map((link, index) => (
                <tr
                  key={index}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-300 focus:bg-gray-300`}
                  tabIndex={0}
                >
                  <td className="px-4 py-2 border border-gray-300">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    {`https://escortdabylon-post-comment.escortbabylonn.net/${link?.domainName.slice(0, -2)}`}
                  </td>
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
      {ClickHistory.length > 0 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
            className={`${
              currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-3 py-2 rounded`}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft />
          </button>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                } px-4 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
                aria-label={`Page ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
            className={`${
              currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
            } text-white px-3 py-2 rounded`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default withAuth(ActiveLinksTable);
