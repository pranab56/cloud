"use client";

import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(""); // "role", "delete", or "edit"
  const [selectedUser, setSelectedUser] = useState(null);
  const [updatedUserData, setUpdatedUserData] = useState({
    id:"",
    name: "",
    email: "",
    password: "",
  });

  const [passwordVisible, setPasswordVisible] = useState(false);

const togglePasswordVisibility = () => {
  setPasswordVisible((prev) => !prev);
};


const [currentPage, setCurrentPage] = useState(1); 
const itemsPerPage = 10;

const reversedData = [...users].reverse();
const totalPages = Math.ceil(reversedData.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const currentItems = reversedData.slice(startIndex, startIndex + itemsPerPage);

const handlePageChange = (page) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page);
  }
};

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/auth/signup");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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
        const data = await response.json();
        console.log(data.message);

        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.email === selectedUser.email
              ? { ...user, role: selectedUser.role }
              : user
          )
        );
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
        const data = await response.json();
        console.log(data.message);

        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.email !== selectedUser.email)
        );
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
      id:user._id,
      name: user.name,
      email: user.email,
      password: user.password, // This assumes you're storing raw passwords, which isn't secure.
    });
    openModal("edit");
  };
  

  const updateUserDetails = async () => {
    if ( !updatedUserData.name || !updatedUserData.email || !updatedUserData.password) {
        alert("All fields are required!");
        return;
    }

    console.log("Updated User Data:", updatedUserData);

    try {
        const response = await fetch("/api/auth/editUser", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedUserData),
        });

        const data = await response.json();
        console.log("Response Data:", data);

        if (response.ok) {
            fetchUsers(); // Re-fetch the list of users after updating
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
      <h1 className="mb-4 text-xl font-bold">Admin Dashboard</h1>
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
          {currentItems.map((user, index) => (
            <tr key={user._id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
              <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
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
                    <button
                      onClick={() => handleDelete(user)} 
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
          <p className="text-xl font-semibold text-center text-gray-500 "></p>
        ) :  <div className="flex items-center gap-4 mt-4">
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
      </div>}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-lg w-96">
            {modalType === "role" && (
              <p className="mb-4">
                Are you sure you want to change the role of{" "}
                <strong>{selectedUser?.email}</strong> to{" "}
                <strong>{selectedUser?.role}</strong>?
              </p>
            )}
            {modalType === "delete" && (
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <strong>{selectedUser?.email}</strong>?
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
                    type={passwordVisible ? "text" : "password"} // Toggle between text and password types
                    value={updatedUserData.password}
                    onChange={(e) => setUpdatedUserData({ ...updatedUserData, password: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                    />
                    <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute text-gray-600 transform -translate-y-1/2 right-2 top-1/2"
                    >
                    {passwordVisible ? "Hide" : "Show"} {/* Button text */}
                </button>
            </div>
            </div>
              </>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              {modalType === "role" && (
                <button
                  onClick={confirmRoleChange}
                  className="px-4 py-2 text-white bg-blue-600 rounded"
                >
                  Confirm
                </button>
              )}
              {modalType === "delete" && (
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-white bg-red-600 rounded"
                >
                  Confirm
                </button>
              )}
              {modalType === "edit" && (
                <button
                  onClick={updateUserDetails}
                  className="px-4 py-2 text-white bg-green-600 rounded"
                >
                  Update
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
