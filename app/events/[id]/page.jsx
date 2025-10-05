"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import NavbarComponent from "../../components/navbar";
import { useUser } from "@clerk/nextjs";

export default function EventDetailPage() {
  const { id } = useParams(); // gets the event id from URL
  const { user, isSignedIn } = useUser();

  // Core state
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");
  const [expandedTimelineStep, setExpandedTimelineStep] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  // ---- Countdown hook (internal) ----
  // returns { label, totalSeconds }
  function useCountdown(targetIso) {
    const [label, setLabel] = useState("calculating...");
    const [totalSeconds, setTotalSeconds] = useState(null);

    useEffect(() => {
      if (!targetIso) {
        setLabel("No deadline set");
        setTotalSeconds(null);
        return;
      }
      const target = Date.parse(targetIso);
      if (Number.isNaN(target)) {
        setLabel("Invalid date");
        setTotalSeconds(null);
        return;
      }

      const tick = () => {
        const now = Date.now();
        const diff = Math.max(0, target - now);
        const secs = Math.floor(diff / 1000);
        setTotalSeconds(secs);

        if (secs <= 0) {
          setLabel("Registration closed");
          return;
        }

        const days = Math.floor(secs / (24 * 3600));
        const hours = Math.floor((secs % (24 * 3600)) / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const seconds = secs % 60;

        // format: "2d 05:09:08"
        const formatted = `${days}d ${String(hours).padStart(2, "0")}:${String(
          minutes
        ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        setLabel(formatted);
      };

      // run immediately then every second
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, [targetIso]);

    return { label, totalSeconds };
  }
  // ---- end countdown hook ----

  // Fetch event and determine registration status
  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event");
        }
        const data = await response.json();
        setEvent(data);

        // Check if user is registered
        if (isSignedIn && data.attendees) {
          // attendees might be array of objects with clerkId or _id depending on your backend
          const registered = data.attendees.some((att) => {
            // try multiple common fields
            return att._id === user?.id || att.clerkId === user?.id || att.id === user?.id;
          });
          setIsRegistered(registered);
        } else {
          setIsRegistered(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isSignedIn, user?.id]);

  // determine the ISO to use for countdown (memoized)
  const deadlineIso = useMemo(() => {
    if (!event) return null;
    // prefer explicit registration close if provided, otherwise endDate, else event.date
    return event.registrationClose || event.endDate || event.date || null;
  }, [event]);

  const { label: countdownLabel, totalSeconds: countdownSeconds } = useCountdown(deadlineIso);

  // computed boolean: registration closed if countdownSeconds === 0 or negative
  const registrationClosed = countdownSeconds !== null && countdownSeconds <= 0;

  // Image modal helpers
  const openImageModal = (imageSrc) => {
    setSelectedImage(imageSrc);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage("");
  };

  const toggleTimelineStep = (step) => {
    setExpandedTimelineStep(expandedTimelineStep === step ? null : step);
  };

  const handleRegister = async () => {
    if (!isSignedIn) {
      alert("Please sign in to register for the event.");
      return;
    }
    if (registrationClosed) {
      alert("Registration is closed.");
      return;
    }
    if (isRegistered) {
      alert("You are already registered.");
      return;
    }

    setRegisterLoading(true);
    try {
      const response = await fetch("/api/join-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, eventId: id }),
      });
      const data = await response.json();
      if (!response.ok) {
        alert(data.error || data.message || "Registration failed");
      } else {
        alert(data.message || "Registered successfully");
        setIsRegistered(true);
        // optimistic update: append attendee if attendees exists
        setEvent((prev) => {
          if (!prev) return prev;
          const newAtt = { _id: user.id, name: user.fullName || user.username || "You" };
          const attendees = prev.attendees ? [...prev.attendees, newAtt] : [newAtt];
          return { ...prev, attendees };
        });
      }
    } catch (err) {
      alert("Error registering for event.");
    } finally {
      setRegisterLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="flex justify-center items-center min-h-screen">Loading event...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarComponent />
        <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <NavbarComponent />
        <div className="flex justify-center items-center min-h-screen">Event not found</div>
      </>
    );
  }

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gray-50">
        {/* Event Poster Image Section - Separate from Info */}
        <section className="flex justify-center items-center py-10 bg-gray-50">
          <div className="max-w-6xl w-full flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden">
            {/* Left: Event Image */}
            <div className="w-full md:w-2/3 flex items-center justify-center bg-black p-4">
              {event.image ? (
                <img src={event.image} alt={event.title} className="max-h-56 w-auto object-contain rounded-md" />
              ) : (
                <div className="flex items-center justify-center w-full h-56 text-white text-2xl bg-gradient-to-r from-purple-700 to-indigo-600 rounded-md">
                  No Image Available
                </div>
              )}
            </div>

            {/* Right: Event Details */}
            <div className="w-full md:w-1/3 p-6 flex flex-col justify-between border-l">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{event.title}</h1>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="block text-gray-500 font-semibold">EVENT DATE</span>
                    <p className="text-gray-800">
                      {event.date ? new Date(event.date).toLocaleDateString() : "TBD"} –{" "}
                      {event.endDate ? new Date(event.endDate).toLocaleDateString() : "TBD"}
                    </p>
                  </div>

                  <div>
                    <span className="block text-gray-500 font-semibold">HAPPENING</span>
                    <p className="text-gray-800">{event.mode || "Offline"}</p>
                  </div>

                  <div>
                    <span className="block text-gray-500 font-semibold">REGISTER BY</span>
                    <p className="text-gray-800">{deadlineIso ? new Date(deadlineIso).toLocaleString() : "TBD"}</p>
                  </div>
                </div>
              </div>

              {/* Countdown + Button */}
              <div className="mt-6 space-y-3">
                <div className="bg-purple-100 text-purple-800 text-center py-2 rounded-md font-semibold" aria-live="polite">
                  APPLICATIONS CLOSE IN
                  <br />
                  <span className="text-lg block mt-1">{countdownLabel}</span>
                </div>

                <button
                  onClick={handleRegister}
                  disabled={isRegistered || registerLoading || registrationClosed || !isSignedIn}
                  className={`w-full py-2 rounded-md font-semibold text-white transition-all duration-300 ${
                    isRegistered
                      ? "bg-green-600 cursor-not-allowed"
                      : registerLoading
                      ? "bg-gray-600 cursor-not-allowed"
                      : registrationClosed
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {isRegistered ? "Registered" : registerLoading ? "Registering..." : registrationClosed ? "Registration Closed" : "Register Now"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Event Details - Left Column */}
            <div className="flex-1 lg:w-2/3 space-y-8">
              {/* Description Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Description</h2>
                <p className="text-gray-700 leading-relaxed">{event.description}</p>
              </section>

              {/* Highlights Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Highlights</h2>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">•</span>
                    Engaging workshops and sessions
                  </li>
                  <li className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">•</span>
                    Networking opportunities with industry experts
                  </li>
                  <li className="flex items-center hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">
                    <span className="bg-purple-100 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center mr-3">•</span>
                    Certificates and prizes for participants
                  </li>
                </ul>
              </section>

              {/* Rules Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Rules</h2>
                <ol className="space-y-2 text-gray-700">
                  <li className="hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">Participants must register before the deadline.</li>
                  <li className="hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">Teams of up to 4 members are allowed.</li>
                  <li className="hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">All submissions must be original work.</li>
                  <li className="hover:bg-gray-50 p-2 rounded transition-colors cursor-pointer">Follow the event guidelines strictly.</li>
                </ol>
              </section>

              {/* Prizes Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Prizes</h2>
                <ul className="space-y-4">
                  <li className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-lg">1st Place</span>
                    <span className="font-bold text-purple-900 text-xl">$1000 + Certificate</span>
                  </li>
                  <li className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-lg">2nd Place</span>
                    <span className="font-bold text-purple-900 text-xl">$500 + Certificate</span>
                  </li>
                  <li className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-lg">3rd Place</span>
                    <span className="font-bold text-purple-900 text-xl">$250 + Certificate</span>
                  </li>
                </ul>
              </section>

              {/* Timeline Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Timeline</h2>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleTimelineStep(1)}>
                    <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">1</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Registration Opens</h3>
                      <p>{event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</p>
                      {expandedTimelineStep === 1 && <p className="text-sm text-gray-600 mt-1">Start your registration process here.</p>}
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleTimelineStep(2)}>
                    <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">2</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Event Date</h3>
                      <p>{event.date ? new Date(event.date).toLocaleDateString() : "TBD"}</p>
                      {expandedTimelineStep === 2 && <p className="text-sm text-gray-600 mt-1">Main event activities take place.</p>}
                    </div>
                  </div>

                  {event.endDate && (
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleTimelineStep(3)}>
                      <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">3</div>
                      <div className="flex-1">
                        <h3 className="font-semibold">Event Ends</h3>
                        <p>{new Date(event.endDate).toLocaleDateString()}</p>
                        {expandedTimelineStep === 3 && <p className="text-sm text-gray-600 mt-1">Closing ceremonies and wrap-up.</p>}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => toggleTimelineStep(4)}>
                    <div className="bg-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4">4</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Results Announced</h3>
                      <p>TBD</p>
                      {expandedTimelineStep === 4 && <p className="text-sm text-gray-600 mt-1">Winners and certificates distributed.</p>}
                    </div>
                  </div>
                </div>
              </section>

              {/* Registration Section */}
              <section className="bg-white rounded-lg shadow-md p-8 text-center hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Registration</h2>
                <p className="text-gray-700 mb-6">Join us and be part of this exciting event!</p>
                <button
                  onClick={handleRegister}
                  disabled={isRegistered || registerLoading || registrationClosed || !isSignedIn}
                  className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                    isRegistered
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : registerLoading
                      ? "bg-gray-600 text-white cursor-not-allowed"
                      : registrationClosed
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-purple-600 text-white hover:bg-purple-700 hover:scale-105 animate-pulse"
                  }`}
                >
                  {isRegistered ? "Registered" : registerLoading ? "Registering..." : registrationClosed ? "Registration Closed" : "Register Now"}
                </button>
              </section>

              {/* Contact Section */}
              <section className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-all duration-300">
                <h2 className="text-3xl font-bold text-purple-900 mb-6">Contact</h2>
                <div className="flex flex-wrap gap-4">
                  {event.instagram && <a href={event.instagram} className="text-purple-600 hover:text-purple-800 transition-colors">📸 Instagram</a>}
                  {event.linkedin && <a href={event.linkedin} className="text-purple-600 hover:text-purple-800 transition-colors">💼 LinkedIn</a>}
                  <p className="text-gray-700">Email: event@organizer.com</p>
                </div>
              </section>
            </div>

            {/* Club Sidebar - Right Column */}
            <div className="lg:w-1/3 space-y-8">
              {event.club ? (
                <section className="bg-white rounded-lg shadow-md p-6 h-fit sticky top-8 hover:shadow-lg transition-all duration-300">
                  <h2 className="text-2xl font-bold text-purple-900 mb-4">Partner Club</h2>
                  {event.club.image && (
                    <img
                      src={event.club.image}
                      alt={event.club.name}
                      className="w-full h-64 object-contain rounded mb-4 cursor-pointer hover:scale-105 transition-transform duration-300"
                      onClick={() => openImageModal(event.club.image)}
                    />
                  )}
                  <h3 className="text-xl font-semibold mb-2">{event.club.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{event.club.description}</p>

                  <div className="mb-4 space-y-2">
                    {event.club.instagram && <a href={event.club.instagram} className="block text-purple-600 hover:text-purple-800 text-sm transition-colors">📸 Instagram</a>}
                    {event.club.linkedin && <a href={event.club.linkedin} className="block text-purple-600 hover:text-purple-800 text-sm transition-colors">💼 LinkedIn</a>}
                  </div>

                  <a href={`/clubs/${event.club._id}`} className="w-full block bg-purple-600 text-white py-3 px-4 rounded-full text-center font-semibold hover:bg-purple-700 transition-all duration-300 text-sm">
                    View Club
                  </a>
                </section>
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-600">No club associated with this event.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Image Modal */}
        {showImageModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={closeImageModal}>
            <div className="relative max-w-4xl max-h-full p-4">
              <img src={selectedImage} alt="Enlarged" className="max-w-full max-h-full object-contain rounded" />
              <button onClick={closeImageModal} className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors">×</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
