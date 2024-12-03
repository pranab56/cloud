"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [formData, setFormData] = useState({
    link: "",
    siteLink: "https://escortbabylion.com/",
    siteReview: "Mega Review",
  });
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

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
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch("/api/addLink", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include", // Send cookies (authentication token) with the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add the link");
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setFormData({
        link: "",
        siteLink: "https://escortbabylion.com/",
        siteReview: "Mega Review",
      });
    } catch (error) {
      setErrorMessage(error.message);
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
        {successMessage && <p className="text-center text-green-600">{successMessage}</p>}
        {errorMessage && <p className="text-center text-red-600">{errorMessage}</p>}

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
            <option value="https://escortbabylion.com/">https://escortbabylion.com/</option>
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
