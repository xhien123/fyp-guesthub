import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

type InquiryStatus = "New" | "Viewed" | "Resolved";

interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  status: InquiryStatus;
}

const AdminInquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setError(null);
      setLoading(true);
      const res = await fetch(`${API_URL}/api/admin/inquiries`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch inquiries");
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch (e: any) {
      setError(e.message || "Failed to load inquiries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();

    const socket = io(SOCKET_URL, { transports: ["websocket"], withCredentials: true });
    
    socket.on("inquiry:new", (newInquiry: Inquiry) => {
        setInquiries(prev => [newInquiry, ...prev]);
    });

    socket.on("inquiry:updated", (updated: Inquiry) => {
        setInquiries(prev => prev.map(i => i._id === updated._id ? updated : i));
    });

    return () => {
        socket.disconnect();
    };
  }, []);

  const updateStatus = async (id: string, status: InquiryStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to update status");
      // Socket will handle UI update
    } catch (e: any) {
      setError(e.message || "Failed to update status");
    }
  };

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const Badge = ({ status }: { status: InquiryStatus }) => {
    if (status === "New") return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">New</span>;
    if (status === "Viewed") return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">Viewed</span>;
    return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">Resolved</span>;
  };

  if (loading && inquiries.length === 0) return <div className="p-6 text-center text-stone-500">Loading Inquiries...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-3xl font-serif font-semibold text-stone-900 mb-6">Contact Inquiries</h1>
      {inquiries.length === 0 ? (
        <p className="text-stone-500">No new inquiries found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject / Promotion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inquiries.map((inquiry) => {
                const isExpanded = expandedId === inquiry._id;
                
                return (
                  <React.Fragment key={inquiry._id}>
                    <tr className={`transition-colors duration-200 ${isExpanded ? 'bg-stone-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 align-top">
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                        {inquiry.name} <br /> <span className="text-xs text-gray-500">{inquiry.email}</span>
                      </td>
                      <td className="px-6 py-4 max-w-sm overflow-hidden text-sm text-gray-900 align-top">
                        <p className="font-semibold mb-1">{inquiry.subject}</p>
                        <p className="text-xs text-gray-600 truncate">{inquiry.message}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap align-top">
                        <Badge status={inquiry.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium align-top">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateStatus(inquiry._id, "Viewed")}
                            className="text-yellow-700 hover:text-yellow-900 text-xs disabled:opacity-50"
                            disabled={inquiry.status !== "New"}
                          >
                            Mark Viewed
                          </button>
                          <button
                            onClick={() => updateStatus(inquiry._id, "Resolved")}
                            className="text-green-600 hover:text-green-900 text-xs disabled:opacity-50"
                            disabled={inquiry.status === "Resolved"}
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => toggleRow(inquiry._id)}
                            className={`text-xs px-3 py-1 border rounded transition-colors ${isExpanded ? 'bg-stone-800 text-white border-stone-800' : 'text-indigo-600 border-indigo-200 hover:border-indigo-600'}`}
                          >
                            {isExpanded ? 'Close' : 'Details'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-stone-50 border-b border-gray-200 shadow-inner">
                        <td colSpan={5} className="p-6">
                          <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-6 grid md:grid-cols-3 gap-6">
                            
                            <div className="md:col-span-1 space-y-4 border-r border-stone-100 pr-4">
                              <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Guest Details</label>
                                <div className="mt-1 text-sm font-medium text-stone-900">{inquiry.name}</div>
                                <div className="text-sm text-stone-600">{inquiry.email}</div>
                                {inquiry.phone && <div className="text-sm text-stone-600 mt-1">{inquiry.phone}</div>}
                              </div>
                              <div className="pt-4 border-t border-stone-100">
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest">Inquiry ID</label>
                                <div className="mt-1 text-xs font-mono text-stone-500">{inquiry._id}</div>
                              </div>
                            </div>

                            <div className="md:col-span-2 flex flex-col">
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Full Message</label>
                              <div className="bg-[#fffdf5] border border-stone-200 p-4 rounded text-sm text-stone-800 font-serif leading-relaxed whitespace-pre-wrap flex-grow">
                                {inquiry.message}
                              </div>
                              <div className="mt-4 text-right">
                                <a 
                                  href={`mailto:${inquiry.email}?subject=Re: ${inquiry.subject}`}
                                  className="inline-flex items-center px-4 py-2 bg-stone-800 text-white text-xs font-bold uppercase tracking-widest rounded hover:bg-stone-700 transition"
                                >
                                  Reply via Email
                                </a>
                              </div>
                            </div>

                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;