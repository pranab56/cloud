'use client';
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, []);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "admin",
    password:""
  });
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(formData)

    try {
      const response = await fetch("/api/auth/admin_add_user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add the link");
      }

      const data = await response.json();
      toast.success(data.message || "Create user successfully!");
      setFormData({
        name: "",
        email: "",
        role: "admin",
        password:""
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-4">
      <h3 className="text-2xl font-normal text-gray-800">Add User</h3>
      <form
        className="grid w-full grid-cols-1 gap-4 px-4 py-6 mx-auto mt-5 bg-white rounded shadow-lg sm:grid-cols-2"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter UserName"
            required
          />
        </div>

        <div>
          <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900">
            Link
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter Email"
            required
          />
        </div>

        <div>
          <label htmlFor="siteReview" className="block mb-2 text-sm font-medium text-gray-900">
            User Role
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="admin">admin</option>
            <option value="user">user</option>
          </select>
        </div>

        <div>
          <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900">
            Link
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter Password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="text-white w-[150px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-2 py-2.5 text-center"
        >
          {loading ? "Creating user..." : "Create user"}
        </button>
      </form>
    </section>
  );
};

export default Page;
