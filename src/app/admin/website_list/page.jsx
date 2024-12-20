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
  const itemsPerPage = 10;

  // Fetch Data from API
  

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem('login_user');
      setLoginUser(user);
    }
  }, []);

  



  const reversedData = [];
  const totalPages = Math.ceil(reversedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const deleteLink = async () => {
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
      setIsDeleteModalOpen(false); // Close the modal after deletion
    } catch (error) {
      toast.error("Error deleting link");
    }
  };

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
           
                <tr className={` "bg-gray-100" hover:bg-gray-200 transition-colors`}>
                  <td className="px-4 py-2 border border-gray-300">1</td>
                  <td className="px-4 py-2 border border-gray-300">Mega Review</td>
                  <td className="px-4 py-2 border border-gray-300">	https://escortdabylon-post-comment.escortbabylonn.net/</td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    <button
                      onClick={() => {
                        alert("Do not Delete Mega Review Url")
                        // setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
             
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {currentItems && currentItems.length === 0 ? (
        <p className="text-xl font-semibold text-center text-gray-500 "></p>
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

      {/* Delete Confirmation Modal */}
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
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-black bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink}
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

export default withAuth(ActiveLinksTable);
