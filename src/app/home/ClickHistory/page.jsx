"use client";
import { useState, useEffect } from "react";
import useSWR from "swr"; // Import useSWR
import {
  MdKeyboardArrowRight,
  MdKeyboardArrowLeft,
  MdArrowDownward,
  MdArrowUpward,
} from "react-icons/md";
import Loader from "@/components/Loader"; // Assuming you have a loader component
import { isLoggedIn } from "@/app/utils/auth";
import { useRouter } from "next/navigation";

// Create a fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

const ActiveLinksTable = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id", // Default column to sort by
    direction: "ascending",
  });
  const itemsPerPage = 10;
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/"); // Redirect if not logged in
    } else {
      const user = localStorage.getItem("login_user");
      if (user) {
        setLoginUser(user);
      }
    }
  }, []);

  // Use SWR to fetch data
  const { data, error, isLoading } = useSWR("/api/get-visit-counts", fetcher, {
    refreshInterval: 50, // Polling interval (5 seconds)
  });

  const ClickHistory = data?.filter((item) => item.email === loginUser) || [];

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

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

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) {
    return <Loader />; // Show a loader while data is being fetched
  }

  if (error) {
    return <div>Error fetching data</div>; // Handle error
  }

  return (
    <div className="p-4">
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              <th
                className="px-4 py-2 border border-gray-300"
                onClick={() => handleSort("id")}
              >
                <span className="flex items-center justify-between">
                  ID
                  
                </span>
              </th>
              <th
                className="px-4 py-2 border border-gray-300"
                onClick={() => handleSort("siteName")}
              >
                <span className="flex items-center justify-between">
                  Active Domain
                 
                </span>
              </th>
              <th className="px-4 py-2 text-center border border-gray-300">
                Mobile
              </th>
              <th className="px-4 py-2 text-center border border-gray-300">
                Desktop
              </th>
              <th className="px-4 py-2 text-center border border-gray-300">
                Tablet
              </th>
            </tr>
          </thead>
          <tbody>
            {ClickHistory.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-2 font-normal text-center text-gray-800 text-md"
                >
                  No Data Available
                </td>
              </tr>
            ) : (
              currentItems.map((link, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-200 transition-colors`}
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {link?.domain?.split("?")[0]}
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
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-200"
                : "bg-blue-500 hover:bg-blue-600"
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
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700"
                } px-4 py-1 rounded`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${
              currentPage === totalPages
                ? "cursor-not-allowed bg-gray-200"
                : "bg-blue-500 hover:bg-blue-600"
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

export default ActiveLinksTable;
