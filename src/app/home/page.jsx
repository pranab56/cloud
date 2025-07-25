'use client';

export const dynamic = "force-dynamic";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { MdContentCopy, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";
import withAuth from "../utils/auth";



// Enhanced fetcher with timeout and caching headers
const fetcher = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50); // 5s timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store', // Bypass cache
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const error = new Error('An error occurred while fetching the data.');
      error.info = await res.json();
      error.status = res.status;
      throw error;
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

const ActiveLinksTable = () => {
  const router = useRouter();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);

  // Get user from localStorage immediately on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInUser = localStorage.getItem("login_user");
      setUser(loggedInUser);
    }
  }, []);

  // SWR configuration with aggressive revalidation
  const swrConfig = {
    refreshInterval: 50, // Refresh every 3 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryInterval: 50,
    errorRetryCount: 3
  };

  // SWR data fetching with error handling
  const { data: loginData, isLoading: isLoginDataLoading, error: loginError } = useSWR(
    user ? "/api/mega_login" : null,
    fetcher,
    swrConfig
  );

  const { data: signupData, isLoading: isSignupDataLoading, error: signupError } = useSWR(
    user ? "/api/auth/signup" : null,
    fetcher,
    swrConfig
  );

  const { data: countsData, isLoading: isCountsDataLoading, error: countsError } = useSWR(
    user ? "/api/get-visit-counts" : null,
    fetcher,
    swrConfig
  );

  const loading = isLoginDataLoading || isSignupDataLoading || isCountsDataLoading;

  // Memoized data processing
  const userDetails = useMemo(() => {
    if (!loginData?.data || !user) return [];
    return loginData.data.filter((value) => value?.logEmail === user) || [];
  }, [loginData, user]);

  const reversedUserDetails = useMemo(() => [...userDetails].reverse(), [userDetails]);

  const userName = useMemo(() => {
    if (!signupData || !user) return null;
    return signupData.find((value) => value.email === user) || null;
  }, [signupData, user]);

  const deviceCounts = useMemo(() => {
    if (!countsData || !user) return { mobile: 0, desktop: 0, tablet: 0, total: 0 };

    return countsData
      .filter((value) => value.email === user)
      .reduce(
        (acc, item) => {
          acc.mobile += item.deviceCounts?.mobile || 0;
          acc.desktop += item.deviceCounts?.desktop || 0;
          acc.tablet += item.deviceCounts?.tablet || 0;
          acc.total += (item.deviceCounts?.mobile || 0) +
            (item.deviceCounts?.desktop || 0) +
            (item.deviceCounts?.tablet || 0);
          return acc;
        },
        { mobile: 0, desktop: 0, tablet: 0, total: 0 }
      );
  }, [countsData, user]);

  // Pagination logic
  const totalPages = Math.ceil(reversedUserDetails.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedUserDetails.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [totalPages]
  );

  const copyToClipboard = useCallback((value) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value).then(() => {
        toast.success(`Copied: ${value}`);
      }).catch((err) => {
        toast.error('Failed to copy to clipboard');
        console.error('Clipboard error:', err);
      });
    } else {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = value;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success(`Copied: ${value}`);
      } catch (err) {
        toast.error('Failed to copy to clipboard');
        console.error('Clipboard fallback error:', err);
      }
      document.body.removeChild(textArea);
    }
  }, []);

  // Error handling
  useEffect(() => {
    if (loginError) {
      console.error('Login data error:', loginError);
      toast.error('Failed to load login data');
    }
    if (signupError) {
      console.error('Signup data error:', signupError);
      toast.error('Failed to load user data');
    }
    if (countsError) {
      console.error('Counts data error:', countsError);
      toast.error('Failed to load device counts');
    }
  }, [loginError, signupError, countsError]);

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>

      {/* Device Counts Section */}
      <section className="grid items-center justify-between grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array(4).fill(0).map((_, index) => (
            <DeviceCountCard key={`loading-${index}`} loading={true} />
          ))
          : [
            { title: "Mobile Click", count: deviceCounts.mobile },
            { title: "Desktop Click", count: deviceCounts.desktop },
            { title: "Total Click", count: deviceCounts.total },
            { title: "Total Account", count: reversedUserDetails.length }
          ].map((item, index) => (
            <DeviceCountCard
              key={`count-${index}`}
              title={item.title}
              count={item.count}
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
          startIndex={startIndex}
        />
      </div>

      {/* Pagination */}
      {!loading && currentItems.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

// Helper Components (remain the same as in your original code)
const DeviceCountCard = ({ loading, title, count, color, hover }) => (
  <div className="w-full">
    <div className={`flex justify-between rounded-md ${loading ? 'bg-gray-200 animate-pulse h-40' : color}`}>
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
            <button
              className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md ${hover}`}
              aria-label={`View more ${title} information`}
            >
              More Info <FaRegArrowAltCircleRight />
            </button>
          </>
        )}
      </div>
    </div>
  </div>
);

const Table = ({ loading, currentItems, userName, copyToClipboard, startIndex }) => (
  <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
    <thead>
      <tr className="text-left bg-gray-100">
        {["ID", "Site Name", "Name", "Email", "Password", "OTP", "UserAgent", "Landing URL", "Time", "Copy"].map((title) => (
          <th key={title} className="px-4 py-2 border border-gray-300">
            {title}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="10" className="px-4 py-2 text-center text-gray-500 border border-gray-300">
            Loading data...
          </td>
        </tr>
      ) : currentItems.length === 0 ? (
        <tr>
          <td colSpan="10" className="px-4 py-2 text-center text-gray-500 border border-gray-300">
            No data available
          </td>
        </tr>
      ) : (
        currentItems.map((link, index) => (
          <TableRow
            key={link._id || index}
            link={link}
            index={startIndex + index + 1}
            userName={userName}
            copyToClipboard={copyToClipboard}
          />
        ))
      )}
    </tbody>
  </table>
);

const TableRow = ({ link, index, userName, copyToClipboard }) => (
  <tr className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-200`}>
    <td className="px-4 py-2 border border-gray-300">{index}</td>
    <td className="px-4 py-2 border border-gray-300">Mega</td>
    <td className="px-4 py-2 border border-gray-300">{userName?.name || 'N/A'}</td>
    <td className="px-4 py-2 border border-gray-300">{link?.email || 'N/A'}</td>
    <td className="px-4 py-2 border border-gray-300">{link?.password || 'N/A'}</td>
    <td className={`px-4 py-2 border border-gray-300 ${link?.otp ? "text-green-500 font-medium" : "text-red-500"}`}>
      {link?.otp || "N/A"}
    </td>
    <td className="px-4 py-2 border border-gray-300 truncate max-w-xs">
      {link?.userAgent || 'N/A'}
    </td>
    <td className="px-4 py-2 border border-gray-300 truncate max-w-xs">
      {link?.url?.split("?")[0] || 'N/A'}
    </td>
    <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
      {link?.createdAt ? formatDistanceToNow(new Date(link.createdAt), { addSuffix: true }) : "N/A"}
    </td>
    <td className="px-4 py-2 text-center border border-gray-300">
      <button
        onClick={() => copyToClipboard(`${link?.email || ''} ${link?.password || ''}`.trim())}
        className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
        aria-label="Copy credentials"
      >
        <MdContentCopy size={18} />
      </button>
    </td>
  </tr>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-start gap-4 mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`flex items-center justify-center p-2 rounded ${currentPage === 1
        ? "cursor-not-allowed bg-gray-200 text-gray-500"
        : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <MdKeyboardArrowLeft size={20} />
    </button>
    <span className="text-gray-700">
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`flex items-center justify-center p-2 rounded ${currentPage === totalPages
        ? "cursor-not-allowed bg-gray-200 text-gray-500"
        : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      <MdKeyboardArrowRight size={20} />
    </button>
  </div>
);

// Helper functions
const getColorByIndex = (index) => {
  const colors = ["bg-cyan-600", "bg-[#28a745]", "bg-[#ffc107]", "bg-[#dc3545]"];
  return colors[index % colors.length];
};

const getButtonClass = (index) => {
  const buttonClasses = [
    "hover:bg-cyan-800 bg-cyan-700",
    "hover:bg-[#196e2d] bg-[#1a7d31]",
    "hover:bg-[#d1a72b] bg-[#ffc107]",
    "hover:bg-[#962934] bg-[#dc3545]",
  ];
  return buttonClasses[index % buttonClasses.length];
};

export default withAuth(ActiveLinksTable);