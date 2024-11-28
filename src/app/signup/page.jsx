'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Page = () => {
  const router = useRouter();
  return (
    <div className="bg-[#e9ecef] h-screen flex items-center justify-center">
  <form className="flex flex-col w-3/12 p-5 bg-white">
  <h3 className='text-3xl font-normal text-center text-gray-500 '>Cloud</h3>
  <h3 className='py-4 text-sm font-normal text-center text-gray-500'>Sign Up to start your session</h3>

  <div className="mb-5">
      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
      <input type="text" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="jhon due" required />
    </div>
    <div className="mb-5">
      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
      <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" required />
    </div>
    <div className="mb-5">
      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
      <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="**********" required />
    </div>
    <div className="mb-5">
      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Re_Password</label>
      <input type="password" id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="**********" required />
    </div>
    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign Up</button>

    <h3 className="pt-3 text-center text-gray-900">Already an account? <span onClick={()=>router.push('/')} className="font-bold text-blue-500 underline cursor-pointer">Sign In</span></h3>
  </form>
</div>

  );
};

export default Page;
