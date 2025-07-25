"use client";
import withAuth from "@/app/utils/auth";
import Loader from "@/components/Loader";
import { useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";

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

const ActiveLinksTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending",
  });
  const [isMounted, setIsMounted] = useState(false);

  const itemsPerPage = 10;
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    const user = typeof window !== "undefined" ? localStorage.getItem("login_user") : null;
    setLoginUser(user);
  }, []);

  const { data, error, isLoading } = useSWR(
    isMounted ? "/api/get-visit-counts" : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: process.env.NODE_ENV === 'development',
      shouldRetryOnError: false
    }
  );

  // Memoized filtered data
  const ClickHistory = useMemo(() => {
    if (!data || !loginUser) return [];
    return data.filter((item) => item.email === loginUser);
  }, [data, loginUser]);

  const handleSort = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "ascending"
        ? "descending"
        : "ascending";
    setSortConfig({ key, direction });
  };

  // Memoize sorted data for performance optimization
  const sortedData = useMemo(() => {
    if (!ClickHistory) return [];

    return [...ClickHistory].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === "time") {
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        return sortConfig.direction === "ascending" ? aDate - bDate : bDate - aDate;
      }

      // Handle string sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "ascending"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number sorting
      return sortConfig.direction === "ascending"
        ? (aValue || 0) - (bValue || 0)
        : (bValue || 0) - (aValue || 0);
    });
  }, [ClickHistory, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const currentItems = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate pagination buttons with smart truncation
  const paginationButtons = useMemo(() => {
    const buttons = [];
    const maxVisibleButtons = 5;

    if (totalPages <= maxVisibleButtons) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(i);
      }
    } else {
      // Always show first page
      buttons.push(1);

      // Show current page and neighbors
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) buttons.push('...');

      for (let i = start; i <= end; i++) {
        buttons.push(i);
      }

      if (end < totalPages - 1) buttons.push('...');

      // Always show last page
      buttons.push(totalPages);
    }

    return buttons;
  }, [totalPages, currentPage]);

  if (!isMounted) {
    return (
      <div className="p-4" aria-live="polite">
        <Loader />
      </div>
    );
  }

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
        <p className="text-red-500">{error.message}</p>
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
              {["ID", "Active Domain", "Mobile", "Desktop", "Tablet"].map((header) => {
                const key = header.toLowerCase().replace(" ", "");
                return (
                  <th
                    key={key}
                    scope="col"
                    className="px-4 py-2 border border-gray-300 cursor-pointer hover:bg-gray-200"
                    onClick={() => handleSort(key)}
                    aria-sort={
                      sortConfig.key === key ? sortConfig.direction : "none"
                    }
                  >
                    <div className="flex items-center">
                      {header}
                      {sortConfig.key === key && (
                        <span className="ml-1">
                          {sortConfig.direction === "ascending" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {ClickHistory.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="py-4 text-center text-gray-500 border border-gray-300"
                >
                  No data available
                </td>
              </tr>
            ) : (
              currentItems.map((link, index) => (
                <tr
                  key={`${link._id || link.domainName || index}`}
                  className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"
                    } hover:bg-gray-300`}
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 truncate max-w-xs">
                    {link?.domainName
                      ? `https://escortdabylon-post-comment.escortbabylonn.net/${link.domainName.slice(0, -2)}`
                      : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    {link.deviceCounts?.mobile || 0}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    {link.deviceCounts?.desktop || 0}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    {link.deviceCounts?.tablet || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {ClickHistory.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            aria-label="Previous page"
            className={`flex items-center justify-center p-2 rounded ${currentPage === 1
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={20} />
          </button>

          <div className="flex gap-1">
            {paginationButtons.map((button, index) =>
              button === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={button}
                  onClick={() => handlePageChange(button)}
                  className={`px-3 py-1 rounded ${currentPage === button
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  aria-label={`Page ${button}`}
                  aria-current={currentPage === button ? "page" : undefined}
                >
                  {button}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            aria-label="Next page"
            className={`flex items-center justify-center p-2 rounded ${currentPage === totalPages
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default withAuth(ActiveLinksTable);