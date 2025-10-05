"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import NavbarComponent from "../../components/navbar";
import EventCard from "../../components/EventCard";

export default function ClubDetailPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const { user, isSignedIn } = useUser();

  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchClub = async () => {
      try {
        const response = await fetch(`/api/clubs/${id}`);
        if (!response.ok) throw new Error("Failed to fetch club details");
        const data = await response.json();
        setClub(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id]);

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading club details...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">Error: {error}</div>
        </div>
      </>
    );
  }

  if (!club) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Club not found.</div>
        </div>
      </>
    );
  }

  const handleJoinClub = async () => {
    if (!isSignedIn) {
      alert("Please sign in to join the club.");
      return;
    }
    setJoinLoading(true);
    try {
      const response = await fetch("/api/join-club", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user.id, clubId: id }),
      });
      const data = await response.json();
      alert(data.message);
      if (response.ok) {
        setIsJoined(true);
        // Optionally refetch club to update members count
        setClub(prev => ({ ...prev, members: [...prev.members, { _id: "temp", name: user.fullName || user.username }] }));
      }
    } catch (error) {
      alert("Error joining club.");
    } finally {
      setJoinLoading(false);
    }
  };

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Main Club Header Layout (Image + Info side by side) */}
          <section className="flex flex-col md:flex-row bg-white rounded-lg shadow-md overflow-hidden">
            {/* Left: Club Image */}
            <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-100 p-6">
              {club.image ? (
                <img
                  src={club.image}
                  alt={club.name}
                  className="max-h-640 w-full object-contain rounded-md"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-gradient-to-r from-purple-800 to-purple-600 rounded-md">
                  <span className="text-2xl text-white">No Image Available</span>
                </div>
              )}
            </div>

            {/* Right: Club Info */}
            <div className="w-full md:w-1/3 p-8 flex flex-col justify-between">
              <div>
                <h1 className="text-3xl font-bold text-purple-900 mb-4">
                  {club.name}
                </h1>

                <div className="space-y-3 text-sm">
                  <p>
                    <strong>🏫 College:</strong> {club.college}
                  </p>
                  <p>
                    <strong>💰 Fee:</strong> ₹{club.fee || "Free"}
                  </p>
                  <p>
                    <strong>👥 Members:</strong> {club.members.length}
                  </p>
                  <p>
                    <strong>📧 Organizer Email:</strong> {club.organizer.email}
                  </p>
                  <p>
                    <strong>📞 Organizer Phone:</strong> {club.organizer.phone}
                  </p>
                  <p>
                    <strong>👤 Organizer Full Name:</strong> {club.organizer.fullName}
                  </p>
                  <p>
                    <strong>🏷️ Category:</strong> {club.category}
                  </p>
                  <p>
                    <strong>🏷️ Type:</strong> {club.type}
                  </p>
                  <p>
                    <strong>📍 Venue:</strong> {club.venue || "Not specified"}
                  </p>
                  <p>
                    <strong>📱 Instagram:</strong> {club.instagram ? <a href={club.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{club.instagram}</a> : "Not provided"}
                  </p>
                  <p>
                    <strong>💼 LinkedIn:</strong> {club.linkedin ? <a href={club.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{club.linkedin}</a> : "Not provided"}
                  </p>
                  
                </div>
              </div>

              <button
                onClick={handleJoinClub}
                disabled={isJoined || joinLoading || !isSignedIn}
                className={`mt-6 px-6 py-2 rounded-full font-semibold transition ${
                  isJoined
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : joinLoading
                    ? "bg-gray-600 text-white cursor-not-allowed"
                    : "bg-purple-600 text-white hover:bg-purple-700"
                }`}
              >
                {isJoined ? "Joined" : joinLoading ? "Joining..." : "Join Club"}
              </button>
            </div>
          </section>

          {/* About Section */}
          <section className="mt-10 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              About the Club
            </h2>
            <p className="text-gray-700 leading-relaxed">{club.description}</p>
          </section>

          {/* Members Section */}

          {/* Events Section */}
          <section className="mt-10 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Upcoming Events
            </h2>
            {club.events && club.events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">No upcoming events.</p>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition">
                  Create Event
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {club.events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onClick={() => router.push(`/events/${event._id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
