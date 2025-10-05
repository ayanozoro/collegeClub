"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Calendar, Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import Navbar from "../components/navbar";
import Footer from "../components/Footer";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("clubs");
  const [expandedClub, setExpandedClub] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createType, setCreateType] = useState("club");
  const [search, setSearch] = useState("");
  const [data, setData] = useState({ clubs: [], events: [] });
  const [loading, setLoading] = useState(true);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    fullName: "",
    email: "",
    phone: "",
    category: "",
    type: "",
    college: "",
    fee: "",
    venue: "",
    instagram: "",
    linkedin: ""
  });

  const handleCreateSubmit = async () => {
    try {
      const endpoint = createType === "club" ? "/api/clubs" : "/api/events";
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(createForm).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh data
        const [clubsRes, eventsRes] = await Promise.all([
          fetch("/api/user/clubs", { credentials: 'include' }),
          fetch("/api/user/events", { credentials: 'include' })
        ]);

        const clubsData = clubsRes.ok ? await clubsRes.json() : [];
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const clubs = Array.isArray(clubsData) ? clubsData : [];
        const events = Array.isArray(eventsData) ? eventsData : [];

        setData({ clubs, events });
        setShowCreateModal(false);
        setCreateForm({
          name: "",
          description: "",
          fullName: "",
          email: "",
          phone: "",
          category: "",
          type: "",
          college: "",
          fee: "",
          venue: "",
          instagram: "",
          linkedin: ""
        });
      } else {
        console.error("Failed to create", createType);
      }
    } catch (error) {
      console.error("Error creating", createType, error);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!confirm("Are you sure you want to delete this club? This will also delete all associated events.")) return;
    try {
      const response = await fetch(`/api/clubs/${clubId}`, { method: 'DELETE', credentials: 'include' });

      if (response.ok) {
        // Refresh data
        const [clubsRes, eventsRes] = await Promise.all([
          fetch("/api/user/clubs", { credentials: 'include' }),
          fetch("/api/user/events", { credentials: 'include' })
        ]);

        const clubsData = clubsRes.ok ? await clubsRes.json() : [];
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const clubs = Array.isArray(clubsData) ? clubsData : [];
        const events = Array.isArray(eventsData) ? eventsData : [];

        setData({ clubs, events });
      } else {
        alert("Failed to delete club");
      }
    } catch (error) {
      alert("Error deleting club");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events/${eventId}`, { method: 'DELETE', credentials: 'include' });

      if (response.ok) {
        // Refresh data
        const [clubsRes, eventsRes] = await Promise.all([
          fetch("/api/user/clubs", { credentials: 'include' }),
          fetch("/api/user/events", { credentials: 'include' })
        ]);

        const clubsData = clubsRes.ok ? await clubsRes.json() : [];
        const eventsData = eventsRes.ok ? await eventsRes.json() : [];
        const clubs = Array.isArray(clubsData) ? clubsData : [];
        const events = Array.isArray(eventsData) ? eventsData : [];

        setData({ clubs, events });
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      alert("Error deleting event");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsRes, eventsRes] = await Promise.all([
          fetch("/api/user/clubs", { credentials: 'include' }),
          fetch("/api/user/events", { credentials: 'include' })
        ]);

        const clubs = clubsRes.ok ? await clubsRes.json() : [];
        const events = eventsRes.ok ? await eventsRes.json() : [];

        setData({ clubs, events });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setData({ clubs: [], events: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default data structure
  const safeData = data;

  // Filtered clubs & events
  const filteredClubs = safeData.clubs.filter(club =>
    club.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredEvents = safeData.events.filter(event =>
    event.title.toLowerCase().includes(search.toLowerCase())
  );

  // Show only clubs where user is admin (already filtered in API)
  // Show only events where user is attendee (already filtered in API)

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-8 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <h1 className="text-4xl font-bold text-purple-700 mb-6">Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <Users className="mx-auto h-12 w-12 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">{safeData.clubs.length}</h3>
            <p className="text-gray-600">My Clubs</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <Calendar className="mx-auto h-12 w-12 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">{safeData.events.length}</h3>
            <p className="text-gray-600">My Events</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6 text-center"
          >
            <Users className="mx-auto h-12 w-12 text-purple-600 mb-2" />
            <h3 className="text-2xl font-bold text-gray-800">
              {safeData.clubs.reduce((total, club) => total + club.members.length, 0)}
            </h3>
            <p className="text-gray-600">Total Members</p>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          {[
            { key: "clubs", label: "My Clubs", count: safeData.clubs.length },
            { key: "events", label: "My Events", count: safeData.events.length },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === tab.key
                  ? "bg-purple-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              suppressHydrationWarning
            >
              {tab.label}
              <span className="ml-2 bg-white text-purple-600 px-2 py-0.5 rounded-full text-xs">
                {tab.count}
              </span>
              {activeTab === tab.key && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-purple-400 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Clubs Section */}
        {activeTab === "clubs" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredClubs.length === 0 ? (
              <p className="text-gray-500">No clubs found.</p>
            ) : (
              filteredClubs.map((club) => (
                <div
                  key={club._id}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold mb-2">{club.name}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">
                    {club.description}
                  </p>

                  {/* Toggle Members */}
                  <button
                    onClick={() =>
                      setExpandedClub(expandedClub === club._id ? null : club._id)
                    }
                    className="flex items-center text-purple-600 font-semibold text-sm hover:text-purple-800 mr-4"
                    suppressHydrationWarning
                  >
                    {expandedClub === club._id ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Hide Members
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        View Members
                      </>
                    )}
                  </button>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 mt-2">
                    <button className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600" suppressHydrationWarning>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClub(club._id)}
                      className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                      suppressHydrationWarning
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </div>

                  {expandedClub === club._id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-3"
                    >
                      {club.members.length === 0 ? (
                        <p className="text-sm text-gray-500">No members yet.</p>
                      ) : (
                        <ul className="text-sm text-gray-700 space-y-1">
                          {club.members.map((member, index) => (
                            <li
                              key={member._id || member.id || index}
                              className="flex justify-between border-b pb-1"
                            >
                              <span>{member.name}</span>
                              <span className="text-gray-500">{member.email}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </motion.div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Events Section */}
        {activeTab === "events" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEvents.length === 0 ? (
              <p className="text-gray-500">No events found.</p>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border border-gray-300"
                >
                  <div className="md:w-1/3 relative h-40 md:h-auto">
                    <img
                      src={event.image || '/default-event.jpg'}
                      alt={event.title || "Event Image"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                      <p className="text-sm text-gray-500 mb-2">
                        Club: {event.club.name}
                      </p>

                      {/* Toggle Attendees */}
                      <button
                        onClick={() =>
                          setExpandedEvent(expandedEvent === event._id ? null : event._id)
                        }
                        className="flex items-center text-purple-600 font-semibold text-sm hover:text-purple-800 mr-4"
                        suppressHydrationWarning
                      >
                        {expandedEvent === event._id ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Hide Attendees
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            View Attendees
                          </>
                        )}
                      </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4">
                      <button className="flex items-center px-3 py-1 bg-green-500 text-white rounded-md text-sm hover:bg-green-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Mark Active
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className="flex items-center px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>

                    {expandedEvent === event._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-3"
                      >
                        {event.attendees && event.attendees.length === 0 ? (
                          <p className="text-sm text-gray-500">No attendees yet.</p>
                        ) : (
                          <ul className="text-sm text-gray-700 space-y-1">
                            {event.attendees && event.attendees.map((attendee, index) => (
                              <li
                                key={attendee._id || attendee.id || index}
                                className="flex justify-between border-b pb-1"
                              >
                                <span>{attendee.name}</span>
                                <span className="text-gray-500">{attendee.email}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        </div>
      </div>
      <Footer />
    </>
  );
}
