"use client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { MdKeyboardArrowRight, MdKeyboardArrowLeft, MdContentCopy, MdDelete, MdArrowDownward, MdArrowUpward } from "react-icons/md";
import useSWR from 'swr';
import { Toaster, toast } from 'react-hot-toast';
import Loader from "@/components/Loader";
import { isLoggedIn } from "@/app/utils/auth";
import { useRouter } from "next/navigation";

const ActiveLinksTable = () => {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "ascending",
  });
  const [loginUser,setLoginUser] = useState(null);
  const [websiteList,setWebsiteList] = useState([])
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  
  const itemsPerPage = 10;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem('login_user');
      if (user) {
        setLoginUser(user); // Parse stored user JSON
      }
    }
  }, []);
  


  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/");
    }
  }, [loginUser]);

  // Fetch Data from API
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading } = useSWR("/api/addLink", fetcher, {
    refreshInterval: 50,
  });

  useEffect(() => {
    if (!loginUser || !data) return;
  
    const filter = data.filter(value => value.email === loginUser); // Access email property
    setWebsiteList(filter);
  }, [data, loginUser]);
  





  if (isLoading) return <Loader />;
  if (error) return <p>Error loading data: {error.message}</p>;

  // Sorting logic based on selected column and direction
  const sortedData = websiteList
    ? [...websiteList].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.key === "time") {
          const aDate = new Date(aValue);
          const bDate = new Date(bValue);
          return sortConfig.direction === "ascending"
            ? aDate - bDate
            : bDate - aDate;
        }

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortConfig.direction === "ascending"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "ascending" ? aValue - bValue : bValue - aValue;
        }

        return 0;
      })
    : [];

  const reversedData = [...sortedData].reverse();
  const totalPages = Math.ceil(reversedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = reversedData.slice(startIndex, startIndex + itemsPerPage);

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

    const sortedLinks = [...reversedData].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'ascending' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'ascending' ? 1 : -1;
      return 0;
    });

    reversedData.splice(0, reversedData.length, ...sortedLinks);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success("Link copied to clipboard!");
    });
  };



 

  const deleteLink = async () => {
    try {
      const response = await fetch("/api/addLink", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: linkToDelete }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete the link");
      }

      toast.success("Link deleted successfully!");
      setIsDeleteModalOpen(false); // Close the modal after deletion
    } catch (error) {
      toast.error("Error deleting link");
    }
  };

  return (
    <div className="p-4">
      {/* Table */}
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        
          
          <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
            <thead>
              <tr className="text-left bg-gray-100">
                <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("id")}>
                  <span className="flex items-center justify-between">
                    ID
                    <span className="flex justify-center w-5">
                      {sortConfig.key === "id" && (
                        sortConfig.direction === "ascending" ? (
                          <MdArrowUpward size={20} />
                        ) : (
                          <MdArrowDownward size={20} />
                        )
                      )}
                    </span>
                  </span>
                </th>
                <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("siteName")}>
                  <span className="flex items-center justify-between">
                    Site Name
                    <span className="flex justify-center w-5">
                      {sortConfig.key === "siteName" && (
                        sortConfig.direction === "ascending" ? (
                          <MdArrowUpward size={20} />
                        ) : (
                          <MdArrowDownward size={20} />
                        )
                      )}
                    </span>
                  </span>
                </th>
                <th className="px-4 py-2 border border-gray-300">Link</th>
                <th className="px-4 py-2 text-center border border-gray-300">Copy</th>
                <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("time")}>
                  <span className="flex items-center justify-between">
                    Time
                    <span className="flex justify-center w-5">
                      {sortConfig.key === "time" && (
                        sortConfig.direction === "ascending" ? (
                          <MdArrowUpward size={20} />
                        ) : (
                          <MdArrowDownward size={20} />
                        )
                      )}
                    </span>
                  </span>
                </th>
                <th className="px-4 py-2 text-center border border-gray-300">Delete</th>
              </tr>
            </thead>
            <tbody>
            {websiteList && websiteList.length === 0 ? (
    <tr>
      <td colSpan="5" className="px-4 py-2 font-normal text-center text-gray-800 text-md">
        No Data Available
      </td>
    </tr>
  ) :
              (currentItems?.map((link, index) => (
                <tr key={index} className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
                  <td className="px-4 py-2 border border-gray-300">{startIndex + index + 1}</td>
                  <td className="px-4 py-2 border border-gray-300">{link.siteReview}</td>
                  <td className="px-4 py-2 border border-gray-300">
                                  <a
                  href={`${link.siteLink}${link.link}?email=${loginUser || ""}`.split("@gmail.com")[0]}
                  className="text-blue-500 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.siteLink + link.link}
                </a>
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                  <button
                    onClick={() => {
                      const email = loginUser ? loginUser.split("@gmail.com")[0] : "";
                      const url = `${link.siteLink}${link.link}?email=${email}`;
                      copyToClipboard(url);
                    }}
                    className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
                  >
                    <MdContentCopy size={18} />
                  </button>

                  </td>
                  <td className="px-4 py-2 border border-gray-300">
                    {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-2 text-center border border-gray-300">
                    <button
                      onClick={() => {
                        setLinkToDelete(link._id);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        
      </div>

      {/* Pagination */}
      {websiteList && websiteList.length === 0 ? (
          <p className="text-xl font-semibold text-center text-gray-500 "></p>
        ) :  <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          className={`${
            currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"
          } text-white px-3 py-2 rounded`}
          disabled={currentPage === 1}
        >
          <MdKeyboardArrowLeft />
        </button>

        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`${
                currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
              } px-4 py-1 rounded`}
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
      </div>}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`bg-white p-6 rounded-lg shadow-lg transform transition-all duration-300 ${
              isDeleteModalOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
          >
            <h3 className="mb-4 text-lg font-bold">Are you sure you want to delete this link?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-black bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={deleteLink}
                className="px-4 py-2 text-white bg-red-500 rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ActiveLinksTable;
