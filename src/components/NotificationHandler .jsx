"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

// Function to play the notification sound
const playNotificationSound = () => {
  const audio = new Audio("/sounds/notification.mp3"); // Path to your sound file
  audio.play();
};

// Function to show the toast notification
const showLoginToast = (userName) => {
  toast.success(`Welcome, ${userName}!`, {
    duration: 3000,
    position: "top-right",
  });
};

const NotificationHandler = () => {
  useEffect(() => {
    const handleNewUserLogin = (userName) => {
      playNotificationSound(); // Play notification sound
      showLoginToast(userName); // Show toast notification
    };

    // Simulate a new user login (could be replaced with actual login logic)
    const simulateLogin = () => {
      setTimeout(() => {
        handleNewUserLogin("John Doe"); // Replace with actual user name
      }, 1000);
    };

    simulateLogin(); // Trigger simulated login event

  }, []); // Empty dependency array to run only once when component mounts

  return null; // No UI rendering required
};

export default NotificationHandler;
