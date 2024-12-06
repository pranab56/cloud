"use client";
import Loader from '@/components/Loader';
import React, { useEffect, useState } from 'react';
import { FaRegArrowAltCircleRight } from 'react-icons/fa';
import useSWR from 'swr';

const page = () => {
    const fetcher = (url) => fetch(url).then((res) => res.json());
    const { data:users, isLoading:usersLoading } = useSWR("/api/auth/signup", fetcher, {refreshInterval: 1000});
    const { data:information, isLoading:informationLoading } = useSWR("/api/information_list", fetcher, {refreshInterval: 1000});
    const Website = 3
    const counts = [users?.length, Website, information?.length];
    const titles = ["Users", "Website", "Informations"];

    if (usersLoading || informationLoading) {
        return <Loader />; // Show loader while fetching or deleting
      }
    return (
        <section className="flex p-[20px] items-center justify-between gap-5">
        {titles.map((title, index) => (
          <div className="w-full" key={index}>
            <div
              className={`flex justify-between rounded-md ${
                index === 0
                  ? "bg-cyan-600"
                  : index === 1
                  ? "bg-[#28a745]"
                  : index === 2
                  ? "bg-[#ffc107]"
                  : "bg-[#dc3545]"
              }`}
            >
              <div className="flex flex-col w-full gap-1">
                {/* Replace 0 with actual counts */}
                <h1 className="px-4 pt-5 text-3xl font-bold text-white">{counts[index]}</h1>
                <p className="px-4 pb-6 text-white">{title}</p>
                <button
                  className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md ${
                    index === 0
                      ? "hover:bg-cyan-800 bg-cyan-700"
                      : index === 1
                      ? "hover:bg-[#196e2d] bg-[#1a7d31]"
                      : index === 2
                      ? "hover:bg-[#d1a72b] bg-yellow-400"
                      : "hover:bg-[#962934] bg-[#c92535]"
                  }`}
                >
                  More Info
                  <FaRegArrowAltCircleRight />
                </button>
              </div>
            </div>
          </div>
        ))}
      </section>
    );
};

export default page;