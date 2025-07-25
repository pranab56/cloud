"use client";
import { useState, useEffect } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdDelete } from "react-icons/md";
import useSWR from 'swr';
import { toast } from 'react-hot-toast';
import Loader from "@/components/Loader";
import withAuth from "@/app/utils/auth";

const ActiveLinksTable = () => {
  const [currentPage, setCurrentPage] = useState(1);  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const itemsPerPage = 10;

  // Fetcher function with error handling
  const fetcher = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return response.json();
  };

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    const user = localStorage.getItem('login_user');
    setLoginUser(user);
  }, []);

  // Fetch data from API only when client is ready and user is logged in
  const { data: linksData, error, isLoading, mutate } = useSWR(
    isClient && loginUser ? "/api/addLink" : null,
    fetcher,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: false,
      onError: (error) => {
        console.error('Error fetching links:', error);
        toast.error('Failed to load links');
      }
    }
  );

  // Process data safely
  const reversedData = Array.isArray(linksData) ? [...linksData].reverse() : [];
  const totalPages = Math.ceil(reversedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openDeleteModal = (linkId) => {
    setLinkToDelete(linkId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setLinkToDelete(null);
  };

  const deleteLink = async () => {
    if (!linkToDelete) return;

    try {
      const response = await fetch("/api/addLink", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: linkToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the link");
      }

      toast.success("Link deleted successfully!");
      closeDeleteModal();
      
      // Revalidate the data to update the table
      mutate();
      
      // Reset to page 1 if current page becomes empty
      const newDataLength = reversedData.length - 1;
      const newTotalPages = Math.ceil(newDataLength / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error(error.message || "Error deleting link");
    }
  };

  // Show loading state during hydration
  if (!isClient) {
    return (
      <div className="p-4">
        <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show loading state when fetching data
  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
        <Loader />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4">
        <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
        <div className="text-center text-red-500">
          <p>Error loading links: {error.message}</p>
          <button 
            onClick={() => mutate()} 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Table */}
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="w-full border border-collapse border-gray-300 table-auto">
          <thead>
            <tr className="bg-gray-200">
              <th className="px-4 py-2 border border-gray-300 text-start">SL</th>
              <th className="px-4 py-2 border border-gray-300 text-start">Website Name</th>
              <th className="px-4 py-2 border border-gray-300 text-start">Website Url</th>
              <th className="px-4 py-2 border border-gray-300">Delete</th>
            </tr>
          </thead>
          <tbody>
            {/* Static Mega Review Row */}
            <tr className="bg-gray-100 hover:bg-gray-200 transition-colors">
              <td className="px-4 py-2 border border-gray-300">1</td>
              <td className="px-4 py-2 border border-gray-300">Mega Review</td>
              <td className="px-4 py-2 border border-gray-300">
                https://escortdabylon-post-comment.escortbabylonn.net/
              </td>
              <td className="px-4 py-2 text-center border border-gray-300">
                <button
                  onClick={() => {
                    toast.error("Cannot delete Mega Review URL");
                  }}
                  className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                  title="Cannot delete this link"
                >
                  <MdDelete size={18} />
                </button>
              </td>
            </tr>

            {/* Dynamic Links */}
            {currentItems.length > 0 ? (
              currentItems.map((link, index) => (
                <tr 
                  key={link.id || index} 
                  className="bg-white hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 border border-gray-300">
                    {startIndex + index + 2} {/* +2 because Mega Review is #1 */}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {link.websiteName || 'N/A'}
                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    <a 
                      href={link.websiteUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline break-all"
                    >
                      {link.websiteUrl || 'N/A'}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    <button
                      onClick={() => openDeleteModal(link.id)}
                      className="p-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
                      title="Delete this link"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-4 py-8 text-center text-gray-500 border border-gray-300">
                  No additional links found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - Only show if there are multiple pages */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`${
              currentPage === 1 
                ? "cursor-not-allowed bg-gray-200 text-gray-400" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } px-3 py-2 rounded transition-colors`}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, index) => {
              const pageNumber = index + 1;
              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  className={`${
                    currentPage === pageNumber 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  } px-3 py-1 rounded transition-colors min-w-[2rem]`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${
              currentPage === totalPages 
                ? "cursor-not-allowed bg-gray-200 text-gray-400" 
                : "bg-blue-500 hover:bg-blue-600 text-white"
            } px-3 py-2 rounded transition-colors`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight />
          </button>
        </div>
      )}

      {/* Show total count */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {currentItems.length} of {reversedData.length + 1} links
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 max-w-md w-full mx-4 ${
              isDeleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <h3 className="mb-4 text-lg font-bold text-gray-800">
              Confirm Deletion
            </h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink}
                className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withAuth(ActiveLinksTable);