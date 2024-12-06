'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { isLoggedIn } from "@/app/utils/auth";

const Page = () => {
  
  
  const [loginUser,setLoginUser] = useState(null)
  const [formData, setFormData] = useState({
    link: "",
    siteLink: "https://cloud-sub-pranab56s-projects.vercel.app/",
    siteReview: "Mega Review",
    email:loginUser
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem('login_user');
      setLoginUser(user);
    }
  }, []);


  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [loginUser]);
  
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

    try {
      const response = await fetch("/api/addLink", {
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
      toast.success(data.message || "Link added successfully!");
      setFormData({
        link: "",
        siteLink: "https://cloud-sub-pranab56s-projects.vercel.app/",
        siteReview: "Mega Review",
      });
    } catch (error) {
      toast.error(error.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="p-4">
      <h3 className="text-2xl font-normal text-gray-800">Add New Link</h3>
      <form
        className="flex flex-col w-full gap-4 px-4 py-6 mx-auto mt-5 bg-white rounded shadow-lg"
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="link" className="block mb-2 text-sm font-medium text-gray-900">
            Link
          </label>
          <input
            type="text"
            id="link"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Enter your link"
            required
          />
        </div>

        <div>
          <label htmlFor="siteLink" className="block mb-2 text-sm font-medium text-gray-900">
            Site Link
          </label>
          <select
            id="siteLink"
            name="siteLink"
            value={formData.siteLink}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="https://cloud-sub-pranab56s-projects.vercel.app/">https://cloud-sub-pranab56s-projects.vercel.app/</option>
          </select>
        </div>

        <div>
          <label htmlFor="siteReview" className="block mb-2 text-sm font-medium text-gray-900">
            Site Review
          </label>
          <select
            id="siteReview"
            name="siteReview"
            value={formData.siteReview}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          >
            <option value="Mega Review">Mega Review</option>
            <option value="Mega Bad Comments">Mega Bad Comments</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="text-white w-[150px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-2 py-2.5 text-center"
        >
          {loading ? "Generating..." : "Generate Link"}
        </button>
      </form>
    </section>
  );
};

export default Page;
