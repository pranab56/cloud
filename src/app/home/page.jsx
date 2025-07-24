'use client';

import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { MdContentCopy, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";
import withAuth from "../utils/auth";

const fetcher = (url) => fetch(url).then((res) => res.json());

const ActiveLinksTable = () => {
  const router = useRouter();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);

  const [user, setUser] = useState(() => typeof window !== "undefined" ? localStorage.getItem("login_user") : null);

  useEffect(() => {
    if (!user) {
      const loggedInUser = localStorage.getItem("login_user");
      if (loggedInUser) {
        setUser(loggedInUser);
      }
    }
  }, [user]);

  // SWR data fetching
  const { data: loginData, isLoading: isLoginDataLoading } = useSWR("/api/mega_login", fetcher);
  // console.log(loginData?.data)

  const { data: signupData, isLoading: isSignupDataLoading } = useSWR("/api/auth/signup", fetcher);
  const { data: countsData, isLoading: isCountsDataLoading } = useSWR("/api/get-visit-counts", fetcher);

  const loading = isLoginDataLoading || isSignupDataLoading || isCountsDataLoading;

  const userDetails = loginData?.data?.filter((value) => value?.logEmail === user) || [];

  console.log(userDetails)
  const userName = signupData?.find((value) => value.email === user) || null;

  // Aggregate device counts
  const deviceCounts = countsData?.filter((value) => value.email === user)?.reduce(
    (acc, item) => {
      acc.mobile += item.deviceCounts?.mobile || 0;
      acc.desktop += item.deviceCounts?.desktop || 0;
      acc.tablet += item.deviceCounts?.tablet || 0;
      acc.total += (item.deviceCounts?.mobile || 0) + (item.deviceCounts?.desktop || 0) + (item.deviceCounts?.tablet || 0);
      return acc;
    },
    { mobile: 0, desktop: 0, tablet: 0, total: 0 }
  ) || { mobile: 0, desktop: 0, tablet: 0, total: 0 };

  // Pagination logic
  const totalPages = Math.ceil(userDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = userDetails.slice(startIndex, startIndex + itemsPerPage);



  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const copyToClipboard = useCallback((value) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`Copied: ${value}`);
    });
  }, []);

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>

      {/* Device Counts Section */}
      <section className="grid items-center justify-between grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? ["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((_, index) => (
            <DeviceCountCard key={index} loading={true} />
          ))
          : ["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"].map((title, index) => (
            <DeviceCountCard
              key={index}
              title={title}
              count={Object.values(deviceCounts)[index]}
              color={getColorByIndex(index)}
              hover={getButtonClass(index)}
            />
          ))}
      </section>

      {/* Data Table */}
      <div className="pt-10 overflow-x-auto rounded shadow-lg">
        <Table
          loading={loading}
          currentItems={currentItems}
          userName={userName}
          copyToClipboard={copyToClipboard}
        />
      </div>

      {/* Pagination */}
      {currentItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// Helper Components
const DeviceCountCard = ({ loading, title, count, color, hover }) => (
  <div className="w-full">
    <div className={`flex justify-between rounded-md ${loading ? 'bg-gray-200 animate-pulse' : color}`}>
      <div className="flex flex-col w-full gap-1">
        {loading ? (
          <>
            <div className="h-12 px-4 pt-5 bg-gray-300 rounded-md"></div>
            <div className="h-6 px-4 pb-6 mt-2 bg-gray-300 rounded-md"></div>
            <div className="w-full h-10 p-2 mt-2 bg-gray-300 rounded-md"></div>
          </>
        ) : (
          <>
            <h1 className="px-4 pt-5 text-3xl font-bold text-white">{count}</h1>
            <p className="px-4 pb-6 text-white">{title}</p>
            <button className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md ${hover}`}>
              More Info <FaRegArrowAltCircleRight />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

const getColorByIndex = (index) => {
  const colors = ["bg-cyan-600", "bg-[#28a745]", "bg-[#ffc107]", "bg-[#dc3545]"];
  return colors[index] || "bg-gray-600";
};

const getButtonClass = (index) => {
  const buttonClasses = [
    "hover:bg-cyan-800 bg-cyan-700",
    "hover:bg-[#196e2d] bg-[#1a7d31]",
    "hover:bg-[#d1a72b] bg-yellow-400",
    "hover:bg-[#962934] bg-[#c92535]",
  ];
  return buttonClasses[index] || "";
};

const Table = ({ loading, currentItems, userName, copyToClipboard }) => (
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
      ) : currentItems.length === 0 ? (
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
                onClick={() => copyToClipboard(`${link?.email} ${link?.password}`)}
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
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center gap-4 mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`${currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} p-2 text-white rounded`}
      disabled={currentPage === 1}
    >
      <MdKeyboardArrowLeft size={20} />
    </button>
    <span>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`${currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} p-2 text-white rounded`}
      disabled={currentPage === totalPages}
    >
      <MdKeyboardArrowRight size={20} />
    </button>
  </div>
);

export default withAuth(ActiveLinksTable);
