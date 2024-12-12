'use client';

import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import withAuth, { useAuthRedirect } from "@/app/utils/auth";

// Loader Component
const Loader = () => (
  <div className="flex items-center justify-center">
    <div className="inline-block w-8 h-8 border-4 border-blue-600 border-solid rounded-full spinner-border animate-spin" role="status" aria-live="assertive">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

// Form Field Components
const FormField = ({ label, id, value, onChange, type = 'text', options = [] }) => {
  return (
    <div>
      <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-900">
        {label}
      </label>
      {options.length > 0 ? (
        <select
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          placeholder={`Enter your ${label.toLowerCase()}`}
          required
        />
      )}
    </div>
  );
};

const Page = () => {
  const [loginUser, setLoginUser] = useState(null);
  const randomTwoDigitNumber = Math.floor(Math.random() * 90) + 10;
  const [formData, setFormData] = useState({
    link: ``,
    siteLink: "https://escortdabylon-post-comment.escortbabylonn.net/",
    siteReview: "Mega Review",
    email: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch the logged-in user and set form data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("login_user");
      if (user) {
        setLoginUser(user);
        setFormData((prevData) => ({
          ...prevData,
          email: user,
        }));
      }
    }
  }, []); // Empty dependency array to run only once

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Append the random two-digit number to the link
      const updatedFormData = {
        ...formData,
        link: `${formData.link}${randomTwoDigitNumber}`,
      };

      const { data, status } = await axios.post("/api/addLink", updatedFormData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true, // Send cookies with the request
      });

      if (status === 200) {
        toast.success(data.message || "Link added successfully!");
        setFormData({
          link: "",
          siteLink: "https://escortdabylon-post-comment.escortbabylonn.net/",
          siteReview: "Mega Review",
          email: loginUser, // Reset email to current loginUser
        });
      } else {
        toast.error("Failed to add the link");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong!");
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
        {/* Link Input */}
        <FormField
          label="Link"
          id="link"
          value={formData.link}
          onChange={handleChange}
        />

        {/* Site Link Input */}
        <FormField
          label="Site Link"
          id="siteLink"
          value={formData.siteLink}
          onChange={handleChange}
          options={["https://escortdabylon-post-comment.escortbabylonn.net/"]}
        />

        {/* Site Review Input */}
        <FormField
          label="Site Review"
          id="siteReview"
          value={formData.siteReview}
          onChange={handleChange}
          options={["Mega Review", "Mega Bad Comments"]}
        />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          aria-label="Submit the form to generate a link"
          className="text-white w-[150px] bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded text-sm px-2 py-2.5 text-center"
        >
          {loading ? <Loader /> : "Generate Link"}
        </button>
      </form>
    </section>
  );
};

export default withAuth(Page);
