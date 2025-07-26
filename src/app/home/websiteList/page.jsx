"use client";

export const dynamic = "force-dynamic";
import withAuth from "@/app/utils/auth";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { MdContentCopy, MdDelete, MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import useSWR from "swr";

const TableRow = ({ link, index, currentPage, copyToClipboard, setLinkToDelete, setIsDeleteModalOpen }) => (
  <tr className={`${index % 2 === 0 ? "bg-gray-100" : "bg-white"} hover:bg-gray-200 transition-colors`}>
    <td className="px-4 py-2 border border-gray-300">{(currentPage - 1) * 10 + index + 1}</td>
    <td className="px-4 py-2 border border-gray-300 w-full">{link.siteReview}</td>
    <td className="px-4 py-2 border border-gray-300 w-full">
      <div className="flex items-center">
        <input
          type="text"
          value={`${link.siteLink}${link.link}`}
          className="w-7/12 p-1 mr-2 border border-black rounded"
          readOnly
          aria-label="Link to site"
        />
        {/* <a
          href={`${link.siteLink}${link.link}`}
          className="text-blue-500 underline"
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${link.siteReview}`}
        >
          Open
        </a> */}
      </div>
    </td>
    <td className="px-4 py-2 text-center border border-gray-300">
      <button
        onClick={() => copyToClipboard(`${link.siteLink}${link.link}`)}
        className="p-2 text-white bg-green-500 rounded hover:bg-green-600"
        aria-label="Copy link to clipboard"
      >
        <MdContentCopy size={18} />
      </button>
    </td>
    <td className="px-4 py-2 border border-gray-300">
      {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
    </td>
    <td className="px-4 py-2 text-center border border-gray-300">
      <button
        onClick={() => { setLinkToDelete(link._id); setIsDeleteModalOpen(true); }}
        className="p-2 text-white bg-red-500 rounded hover:bg-red-600"
        aria-label="Delete link"
      >
        <MdDelete size={18} />
      </button>
    </td>
  </tr>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center gap-4 mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      className={`${currentPage === 1 ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-2 rounded`}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <MdKeyboardArrowLeft />
    </button>

    <div className="flex gap-2">
      {Array.from({ length: totalPages }, (_, index) => (
        <button
          key={index}
          onClick={() => onPageChange(index + 1)}
          className={`${currentPage === index + 1 ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"} px-4 py-1 rounded`}
          aria-label={`Go to page ${index + 1}`}
        >
          {index + 1}
        </button>
      ))}
    </div>

    <button
      onClick={() => onPageChange(currentPage + 1)}
      className={`${currentPage === totalPages ? "cursor-not-allowed bg-gray-200" : "bg-blue-500 hover:bg-blue-600"} text-white px-3 py-2 rounded`}
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      <MdKeyboardArrowRight />
    </button>
  </div>
);

const DeleteModal = ({ isOpen, onClose, onConfirm }) => (
  isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <h3 className="mb-4 text-lg font-bold">Are you sure you want to delete this link?</h3>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 text-black bg-gray-300 rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-white bg-red-500 rounded">Confirm</button>
        </div>
      </div>
    </div>
  )
);

const ActiveLinksTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "id", direction: "ascending" });
  const [loginUser, setLoginUser] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const itemsPerPage = 10;

  const fetcher = (url) => fetch(url).then((res) => res.json());
  const { data, error, isLoading, mutate } = useSWR("/api/addLink", fetcher, { refreshInterval: 1000 });

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem("login_user");
      if (storedUser) setLoginUser(storedUser);
    }
  }, []);

  const filteredWebsiteList = useMemo(() => {
    if (!data || !loginUser) return [];
    return data.filter((link) => link.email === loginUser) || [];
  }, [data, loginUser]);

  const sortedData = useMemo(() => {
    if (!filteredWebsiteList.length) return [];
    return [...filteredWebsiteList].sort((a, b) => sortData(a, b, sortConfig));
  }, [filteredWebsiteList, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // Fixed: Properly reverse the data and handle pagination
  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Create a proper reversed copy without mutating the original array
    const reversedData = sortedData.slice().reverse();

    return reversedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (key) => {
    const direction = sortConfig.direction === "ascending" ? "descending" : "ascending";
    setSortConfig({ key, direction });
  };

  const copyToClipboard = (text) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => toast.error("Failed to copy link"));
    } else {
      toast.error("Clipboard access not available");
    }
  };

  const deleteLink = async () => {
    try {
      const response = await fetch("/api/addLink", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: linkToDelete }),
      });

      if (!response.ok) throw new Error("Failed to delete the link");

      toast.success("Link deleted successfully!");
      setIsDeleteModalOpen(false);
      setLinkToDelete(null);

      // Trigger a refetch of the data
      mutate();
    } catch (err) {
      toast.error("Error deleting link");
      console.error("Delete error:", err);
    }
  };

  return (
    <div className="p-4">
      <h3 className="pb-10 text-2xl font-normal text-gray-800">Active Links</h3>
      <div className="overflow-x-auto rounded shadow-lg">
        <table className="min-w-full border border-collapse border-gray-300 rounded-lg">
          <thead>
            <tr className="text-left bg-gray-100">
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("id")}>ID</th>
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("siteName")}>Site Name</th>
              <th className="px-4 py-2 border border-gray-300">Link</th>
              <th className="px-4 py-2 text-center border border-gray-300">Copy</th>
              <th className="px-4 py-2 border border-gray-300 cursor-pointer" onClick={() => handleSort("time")}>Time</th>
              <th className="px-4 py-2 text-center border border-gray-300">Delete</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" className="px-4 py-2 text-center text-gray-500">Loading...</td></tr>
            ) : filteredWebsiteList.length ? (
              currentItems.map((link, index) => (
                <TableRow
                  key={link._id}
                  link={link}
                  index={index}
                  currentPage={currentPage}
                  copyToClipboard={copyToClipboard}
                  setLinkToDelete={setLinkToDelete}
                  setIsDeleteModalOpen={setIsDeleteModalOpen}
                />
              ))
            ) : (
              <tr><td colSpan="6" className="px-4 py-2 text-center text-gray-500">No Data Available</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredWebsiteList.length > 0 && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setLinkToDelete(null);
        }}
        onConfirm={deleteLink}
      />
    </div>
  );
};

const sortData = (a, b, { key, direction }) => {
  if (!a || !b) return 0;

  if (key === "time") {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return direction === "ascending" ? dateA - dateB : dateB - dateA;
  }

  const valueA = a[key] || "";
  const valueB = b[key] || "";

  return direction === "ascending"
    ? valueA.toString().localeCompare(valueB.toString())
    : valueB.toString().localeCompare(valueA.toString());
};

export default withAuth(ActiveLinksTable);