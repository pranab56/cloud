'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const Page = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role:'user',
    rePassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (formData.password !== formData.rePassword) {
      setError('Passwords do not match!');
      return;
    }
  
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role:formData.role
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
      }
  
      setSuccess(data.message);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setError(error.message || 'Something went wrong!');
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
          Sign Up to start your session
        </h3>

        {error && <p className="mb-3 text-center text-red-500">{error}</p>}
        {success && <p className="mb-3 text-center text-green-500">{success}</p>}

        <div className="mb-5">
          <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900">
            Your Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="John Doe"
            required
          />
        </div>
        <div className="mb-5">
          <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900">
            Your Email
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
          <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">
            Your Password
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
        <div className="mb-5">
          <label htmlFor="rePassword" className="block mb-2 text-sm font-medium text-gray-900">
            Re-Enter Password
          </label>
          <input
            type="password"
            id="rePassword"
            value={formData.rePassword}
            onChange={handleChange}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="**********"
            required
          />
        </div>
        <button
          type="submit"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Sign Up
        </button>

        <h3 className="pt-3 text-center text-gray-900">
          Already have an account?{' '}
          <span
            onClick={() => router.push('/')}
            className="font-bold text-blue-500 underline cursor-pointer"
          >
            Sign In
          </span>
        </h3>
      </form>
    </div>
  );
};

export default Page;
