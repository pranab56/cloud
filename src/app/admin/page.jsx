"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import useSWR from "swr";
import withAuth from "../utils/auth";

// Fetcher function for SWR
const fetcher = (url) => fetch(url).then((res) => res.json());

// Notification sound
const playNotification = () => {
  const audio = new Audio("/sounds/notification.mp3");
  audio.play();
};

const Page = () => {
  // SWR data fetching
  const { data: users, isLoading: usersLoading, error: usersError } = useSWR("/api/auth/signup", fetcher, { refreshInterval: 1000 });
  const { data: information, isLoading: informationLoading, error: informationError } = useSWR("/api/information_list", fetcher, { refreshInterval: 1000 });

  const Website = 1;
  const counts = useMemo(() => [users?.length || 0, Website, information?.length || 0], [users, information]);
  const titles = ["Users", "Website", "Informations"];

  const prevUsersRef = useRef([]);
  const prevInforRef = useRef([]);
  const [showPopup, setShowPopup] = useState(false);
  const [showInPopup, setShowInPopup] = useState(false);

  // Handle new users notification
  useEffect(() => {
    if (users && prevUsersRef.current.length && users.length > prevUsersRef.current.length) {
      playNotification();
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
    prevUsersRef.current = users || [];
  }, [users]);

  // Handle new information notification
  useEffect(() => {
    if (information && prevInforRef.current.length && information.length > prevInforRef.current.length) {
      playNotification();
      setShowInPopup(true);
      setTimeout(() => setShowInPopup(false), 1000);
    }
    prevInforRef.current = information || [];
  }, [information]);

  if (usersLoading || informationLoading) {
    return (
      <section className="flex items-center justify-between gap-5 p-5">
        {titles.map((title, index) => (
          <div className="w-full" key={index}>
            <div className="flex justify-between bg-gray-300 rounded-md animate-pulse">
              <div className="flex flex-col w-full gap-1">
                <div className="w-3/4 h-8 bg-gray-400 rounded-md"></div>
                <div className="w-1/2 h-4 mt-2 bg-gray-400 rounded-md"></div>
                <div className="w-full h-10 mt-2 bg-gray-400 rounded-md"></div>
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (usersError || informationError) {
    return <p>Error loading data. Please try again later.</p>;
  }

  return (
    <section className="grid items-center justify-between grid-cols-1 gap-5 p-5 lg:grid-cols-3 sm:grid-cols-2">
      {showPopup && (
        <div className="fixed p-4 text-white bg-blue-500 rounded-lg shadow-lg top-4 right-4" role="alert" aria-live="assertive">
          New user added!
        </div>
      )}
      {showInPopup && (
        <div className="fixed p-4 text-white bg-blue-500 rounded-lg shadow-lg top-4 right-4" role="alert" aria-live="assertive">
          New information added!
        </div>
      )}

      {titles.map((title, index) => (
        <div className="w-full" key={index}>
          <div className={`flex justify-between rounded-md ${getBackgroundClass(index)}`}>
            <div className="flex flex-col w-full gap-1">
              <h1 className="px-4 pt-5 text-3xl font-bold text-white">{counts[index]}</h1>
              <p className="px-4 pb-6 text-white">{title}</p>
              <button
                className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md ${getButtonClass(index)}`}
                aria-label={`More information about ${title}`}
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

// Utility function for button background classes
const getButtonClass = (index) => {
  const buttonClasses = [
    "hover:bg-cyan-800 bg-cyan-700",
    "hover:bg-[#196e2d] bg-[#1a7d31]",
    "hover:bg-[#d1a72b] bg-yellow-400",
    "hover:bg-[#962934] bg-[#c92535]",
  ];
  return buttonClasses[index] || "";
};

// Utility function for background colors
const getBackgroundClass = (index) => {
  const backgroundClasses = [
    "bg-cyan-600",
    "bg-[#28a745]",
    "bg-[#ffc107]",
    "bg-[#dc3545]",
  ];
  return backgroundClasses[index] || "";
};

export default withAuth(Page);
