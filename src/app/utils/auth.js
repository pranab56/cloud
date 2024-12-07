import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useSWR from "swr";

// utils/auth.js
export const isLoggedIn = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("login_user");
    return user; // Return the user data as an object
  }
  return null;
};

export const useAuthRedirect = () => {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data: users, error } = useSWR("/api/auth/signup", fetcher);
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch users:", error); // Log error if fetch fails
      return;
    }

    if (!users) return; // Wait for users to be fetched

    const loggedInUser = isLoggedIn();
    console.log(loggedInUser); // Get the logged-in user data from localStorage
    if (!loggedInUser) {
      router.push("/"); // Redirect to login if not logged in
      return;
    }

    const matchedUser = users.find((user) => user?.email === loggedInUser); // Match user by email

    if (!matchedUser) {
      router.push("/"); // Redirect to login if no matching user is found
      return;
    }

    const { role } = matchedUser;
    if (role === "admin") {
      router.push("/admin"); // Redirect to admin dashboard
    } else if (role === "user") {
      router.push("/home"); // Redirect to user dashboard
    } else {
      router.push("/"); // Redirect to login for invalid role
    }
  }, [users, error, router]);
};
