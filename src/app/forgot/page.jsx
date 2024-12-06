'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  return (
    <div className="bg-[#e9ecef] min-h-screen flex items-center justify-center py-4">
    <form className="flex flex-col w-full p-5 bg-white sm:w-4/12 md:w-3/12">
      <h3 className="text-3xl font-normal text-center text-gray-500">Cloud</h3>
      <h3 className="py-4 text-sm font-normal text-center text-gray-500">
        Sign in to start your session
      </h3>
  
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 16"
          >
            <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
            <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
          </svg>
        </div>
        <input
          type="text"
          id="input-group-1"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Email"
        />
      </div>
  
      <button
        type="submit"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        Request new password
      </button>
  
      <h3 className="pt-3 text-center text-gray-900">
        <span
          onClick={() => router.push("/")}
          className="font-bold text-blue-500 underline cursor-pointer"
        >
          Sign in
        </span>{" "}
        ||{" "}
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
