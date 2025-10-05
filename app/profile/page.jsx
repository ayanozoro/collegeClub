"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import NavbarComponent from "../components/navbar";
import ClubCard from "../components/ClubCard";
import EventCard from "../components/EventCard";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const [profile, setProfile] = useState(null);
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchProfile = async () => {
      try {
        const [profileRes, clubsRes, eventsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/clubs"),
          fetch("/api/user/events"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
          setName(profileData.name || "");
        }

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setJoinedClubs(clubsData);
        }

        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setJoinedEvents(eventsData);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoaded, user]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        setProfile(updatedProfile);
        setEditing(false);
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  if (loading) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl">Loading profile...</div>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <NavbarComponent />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">Please sign in to view your profile.</div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h1 className="text-3xl font-bold text-purple-900 mb-6">My Profile</h1>
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.firstName?.charAt(0) || "?"}
                </span>
              </div>
              <div className="flex-1">
                {editing ? (
                  <div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder="Enter your name"
                    />
                    <button
                      onClick={handleSave}
                      className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-800">
                      {profile?.name || "No name set"}
                    </h2>
                    <p className="text-gray-600">{user.primaryEmailAddress?.emailAddress}</p>
                    <button
                      onClick={() => setEditing(true)}
                      className="mt-2 bg-purple-600 text-white px-4 py-2 rounded"
                    >
                      Edit Name
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Joined Clubs */}
          <section className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Joined Clubs ({joinedClubs.length})
            </h2>
            {joinedClubs.length === 0 ? (
              <p className="text-gray-600">You haven't joined any clubs yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedClubs.map((club) => (
                  <ClubCard key={club._id} club={club} />
                ))}
              </div>
            )}
          </section>

          {/* Joined Events */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-purple-900 mb-4">
              Registered Events ({joinedEvents.length})
            </h2>
            {joinedEvents.length === 0 ? (
              <p className="text-gray-600">You haven't registered for any events yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
