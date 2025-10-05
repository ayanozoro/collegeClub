"use client";
import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";
import EventCard from "../components/EventCard";
import NavbarComponent from "../components/navbar";
import Footer from "../components/Footer";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    college: "",
    type: "",
    sort: "recent",
  });
  const router = useRouter();

  const fetchEvents = async (filterParams = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filterParams);
      const response = await fetch(`/api/events?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(filters);
  }, []);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchEvents(newFilters);
  };

  const handleClick = (event) => {
    router.push(`/events/${event._id}`);
  };

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gradient-to-r from-purple-100 via-pink-100 to-yellow-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-purple-900 mb-10 text-center drop-shadow-lg">
            Explore Exciting Events
          </h1>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">Category</label>
                <select
                  value={filters.category || filters.type}
                  onChange={(e) => handleFilterChange("type", e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Categories</option>
                  <option value="tech">Tech</option>
                  <option value="cultural">Cultural</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">College</label>
                <input 
                  type="text"
                  value={filters.college}
                  onChange={(e) => handleFilterChange("college", e.target.value)}
                  placeholder="Enter college name"
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-semibold text-gray-700">Sort By</label>
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="recent">Recent</option>
                  <option value="old">Old</option>
                </select>
              </div>
              <button
                className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition"
                onClick={() => fetchEvents(filters)}
              >
                Search
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-purple-700 text-lg font-semibold">Loading events...</div>
          ) : error ? (
            <div className="text-center text-red-600 text-lg font-semibold">Error: {error}</div>
          ) : events.length === 0 ? (
            <p className="text-center text-purple-700 text-lg font-semibold">No events found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                  onClick={() => handleClick(event)}
                >
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
