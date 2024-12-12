"use client";

import withAuth from "@/app/utils/auth";
import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";

// Fetcher function to handle API calls
const fetcher = (url) => fetch(url).then((res) => res.json());

const AdminDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "role", "delete", or "edit"
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [updatedUserData, setUpdatedUserData] = useState({ id: "", name: "", email: "", password: "" });
  const { data: users, error, isLoading } = useSWR("/api/auth/signup", fetcher, { refreshInterval: 50 });

  const [prevUsers, setPrevUsers] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    if (users && prevUsers.length && users.length > prevUsers.length) {
      const audio = new Audio("/sounds/notification.mp3"); // Add your sound file to the public folder
      audio.play();
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
    setPrevUsers(users || []);
  }, [users]);

  const togglePasswordVisibility = () => {
    setPasswordVisible((prev) => !prev);
  };

  const reversedUsers = users ? [...users] : [];
  const totalPages = reversedUsers.length ? Math.ceil(reversedUsers.length / itemsPerPage) : 0;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages); // Adjust current page to the last page if out of bounds
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUpdatedUserData({ name: "", email: "", password: "" });
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    openModal("role");
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    openModal("delete");
  };

  const confirmRoleChange = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch("/api/auth/updateRole", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email, role: selectedUser.role }),
      });
      if (response.ok) {
        console.log("Role updated successfully");
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      closeModal();
    }
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      const response = await fetch("/api/auth/delete_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: selectedUser.email }),
      });
      if (response.ok) {
        console.log("User deleted successfully");
      } else {
        const errorData = await response.json();
        console.error("Error:", errorData.message);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    } finally {
      closeModal();
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setUpdatedUserData({
      id: user._id,
      name: user.name,
      email: user.email,
      password: user.password, // It's important to never store plain passwords in a real app
    });
    openModal("edit");
  };

  const updateUserDetails = async () => {
    if (!updatedUserData.name || !updatedUserData.email || !updatedUserData.password) {
      alert("All fields are required!");
      return;
    }

    try {
      const response = await fetch("/api/auth/editUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUserData),
      });

      const data = await response.json();
      if (response.ok) {
        closeModal(); // Close the modal after successful update
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating user details:", error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-normal">Users</h1>
      {showPopup && (
        <div className="fixed p-4 text-white bg-blue-500 rounded-lg shadow-lg top-4 right-4">
          New user!
        </div>
      )}
      <table className="w-full border border-collapse border-gray-300 table-auto">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border border-gray-300 text-start">SL</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Name</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Email</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Password</th>
            <th className="px-4 py-2 border border-gray-300 text-start">Role</th>
            <th className="px-4 py-2 border border-gray-300">Edit</th>
            <th className="px-4 py-2 border border-gray-300">Delete</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan="7" className="px-4 py-2 border border-gray-300">
                <div className="space-y-4 animate-pulse">
                  <div className="w-1/2 h-4 bg-gray-300 rounded"></div>
                  <div className="w-1/4 h-4 bg-gray-300 rounded"></div>
                  <div className="w-1/3 h-4 bg-gray-300 rounded"></div>
                </div>
              </td>
            </tr>
          ) : (
            currentItems.map((user, index) => (
              <tr key={user._id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
                <td className="px-4 py-2 border border-gray-300">{startIndex + index + 1}</td>
                <td className="px-4 py-2 border border-gray-300">{user.name}</td>
                <td className="px-4 py-2 border border-gray-300">{user.email}</td>
                <td className="px-4 py-2 border border-gray-300">{user.password}</td>
                <td className="px-4 py-2 border border-gray-300">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange({ ...user, role: e.target.value })}
                    className="px-2 py-1 border rounded"
                  >
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                  </select>
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <FaEdit size={18} />
                  </button>
                </td>
                <td className="px-4 py-2 text-center border border-gray-300">
                  {user.role === "user" && (
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <MdDelete size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {currentItems.length > 0 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`${currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-2 rounded`}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft />
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} px-4 py-1 rounded`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-2 rounded`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight />
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-lg w-96">
            {modalType === "role" && (
              <p className="mb-4">
                Are you sure you want to change the role of <strong>{selectedUser?.email}</strong> to <strong>{selectedUser?.role}</strong>?
              </p>
            )}
            {modalType === "delete" && (
              <p className="mb-4">
                Are you sure you want to delete <strong>{selectedUser?.email}</strong>?
              </p>
            )}
            {modalType === "edit" && (
              <>
                <div className="mb-4">
                  <label className="block text-sm">Name</label>
                  <input
                    type="text"
                    value={updatedUserData.name}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, name: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Email</label>
                  <input
                    type="email"
                    value={updatedUserData.email}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, email: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm">Password</label>
                  <div className="relative">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      value={updatedUserData.password}
                      onChange={(e) => setUpdatedUserData({ ...updatedUserData, password: e.target.value })}
                      className="w-full px-2 py-1 border rounded"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute text-gray-600 transform -translate-y-1/2 right-3 top-1/2"
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={modalType === "role" ? confirmRoleChange : modalType === "delete" ? confirmDelete : updateUserDetails}
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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

export default withAuth(AdminDashboard);
