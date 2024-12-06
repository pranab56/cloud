"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Added loading state
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); 

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Invalid email or password");
      } else {
        // Login successful, redirect to the home page
        const data = await response.json();
        console.log(data)
        // router.push("/home");
        localStorage.setItem("login_user", formData?.email);

        if (data?.user?.role === "admin") {
          router.push("/admin");
        } else if (data?.user?.role === "user") {
          router.push("/home");
        } else {
          setError("Invalid role assigned");
        }
      }      
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="bg-[#e9ecef] h-screen flex items-center justify-center">
        
      <form
        className="flex flex-col w-3/12 p-5 bg-white"
        onSubmit={handleSubmit}
      >
        <h3 className="text-3xl font-normal text-center text-gray-500">Cloud</h3>
        <h3 className="py-4 text-sm font-normal text-center text-gray-500">
          Sign in to start your session
        </h3>

        {error && <p className="mb-3 text-center text-red-500">{error}</p>}

        <div className="mb-5">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Your email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@example.com"
            required
          />
        </div>
        <div className="mb-5">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Your password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="**********"
            required
          />
        </div>
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center h-5">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300"
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium text-gray-900 ms-2"
            >
              Remember me
            </label>
          </div>
          <span>
            <label
              onClick={() => router.push("/forgot")}
              className="text-sm font-medium text-gray-900 cursor-pointer select-none ms-2 hover:text-blue-500"
            >
              Forgot password
            </label>
          </span>
        </div>
        <button
          type="submit"
          className={`text-white font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center ${
            loading ? "bg-gray-500 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800"
          }`}
          disabled={loading} // Disable button during loading
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <h3 className="pt-3 text-center text-gray-900">
          Don’t have an account?{" "}
          <span
            onClick={() => router.push("/signup")}
            className="font-bold text-blue-500 underline cursor-pointer"
          >
            Sign Up
          </span>
        </h3>
      </form>
    </div>
  );
};

export default Page;
