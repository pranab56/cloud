// utils/auth.js
export const isLoggedIn = () => {
    return typeof window !== "undefined" && localStorage.getItem("login_user") !== null;
  };
  