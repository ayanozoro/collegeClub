"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import NavbarComponent from "../components/navbar";
// const { club } = await fetch("/api/clubs").then(res => res.json());
// import Club from "@/model/Club"

export default function Create() {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [mode, setMode] = useState('event'); // 'club' or 'event'
  
  const [formData, setFormData] = useState({
    // Shared: Organizer (prefill if user data available)
    organizer: {
      fullName: "",
      email: "",
      phone: "",
    },
    // Club fields (new/extended)
    club: {
      name: "",
      description: "",
      category: "",
      type: "",
      college: "",
      fee: "",
    },
    venue: "", // Shared optional
    instagram: "",
    linkedin: "",
    clubImage: null,
    // Event fields (from previous plan)
    title: "",
    description: "",
    category: "",
    type: "",
    startDate: "",
    endDate: "",
    eventMode: "online",
    certificatePdf: null,
    certificateImage: null,
    posterImage: null,
    clubId: "", // For club events
  });
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }
    if (mode === 'event' || mode === 'club') {
      fetch("/api/user/clubs")
        .then((res) => res.json())
        .then((data) => setClubs(Array.isArray(data) ? data : []))
        .catch((err) => setError("Failed to load clubs"));
    }
    // Prefill organizer from user
    if (user) {
      setFormData(prev => ({
        ...prev,
        organizer: {
          ...prev.organizer,
          fullName: user.fullName || prev.organizer.fullName,
          email: user.emailAddresses?.[0]?.emailAddress || prev.organizer.email,
        }
      }));
    }
  }, [isSignedIn, router, user, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('organizer.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        organizer: { ...prev.organizer, [field]: value }
      }));
    } else if (name.startsWith('club.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        club: { ...prev.club, [field]: value }
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e, field) => {
    setFormData({ ...formData, [field]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === 'club') {
        // Create club
        const data = new FormData();
        // Organizer
        data.append('fullName', formData.organizer.fullName);
        data.append('email', formData.organizer.email);
        data.append('phone', formData.organizer.phone);
        // Club details
        data.append('name', formData.club.name);
        data.append('description', formData.club.description);
        data.append('category', formData.club.category);
        data.append('type', formData.club.type);
        data.append('college', formData.club.college);
        data.append('fee', formData.club.fee);
        // Shared
        data.append('venue', formData.venue);
        data.append('instagram', formData.instagram);
        data.append('linkedin', formData.linkedin);
        if (formData.clubImage) {
          data.append('clubImage', formData.clubImage);
        }

        const res = await fetch("/api/clubs", {
          method: "POST",
          body: data,
          credentials: 'include',
        });
        if (res.ok) {
          router.push("/clubs");
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to create club");
        }
      } else {
        // Create event
        const data = new FormData();
        // Organizer
        data.append('fullName', formData.organizer.fullName);
        data.append('email', formData.organizer.email);
        data.append('phone', formData.organizer.phone);
        // Event details
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('category', formData.category);
        data.append('type', formData.type);
        data.append('startDate', formData.startDate);
        data.append('endDate', formData.endDate);
        data.append('mode', formData.eventMode);
        data.append('venue', formData.venue);
        data.append('instagram', formData.instagram);
        data.append('linkedin', formData.linkedin);
        data.append('clubId', formData.clubId);
        if (formData.posterImage) {
          data.append('image', formData.posterImage);
        }
        if (formData.certificatePdf) {
          data.append('certificatePdf', formData.certificatePdf);
        }
        if (formData.certificateImage) {
          data.append('certificateImage', formData.certificateImage);
        }

        const res = await fetch("/api/events", {
          method: "POST",
          body: data,
          credentials: 'include',
        });
        if (res.ok) {
          router.push("/events");
        } else {
          const errData = await res.json();
          setError(errData.error || "Failed to create event");
        }
      }
    } catch (err) {
      setError("Network error");
    }
    setLoading(false);
  };

  if (!isSignedIn) return <div>Loading...</div>;

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-purple-900 mb-8">
            Create {mode === 'club' ? 'Club' : 'Event'}
          </h1>
          <div className="flex justify-center space-x-4 mb-6">
            <label className="flex items-center">
              <input
                type="radio"
                value="club"
                checked={mode === 'club'}
                onChange={() => setMode('club')}
                className="mr-1"
              />
              Create Club
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="event"
                checked={mode === 'event'}
                onChange={() => setMode('event')}
                className="mr-1"
              />
              Create Event
            </label>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit} encType="multipart/form-data">
            {/* Shared Organizer Section */}
            <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-purple-900 mb-4">Organizer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-purple-700 mb-1">Full Name</label>
                  <input
                    id="fullName"
                    name="organizer.fullName"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full Name"
                    value={formData.organizer.fullName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-purple-700 mb-1">Email</label>
                  <input
                    id="email"
                    name="organizer.email"
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Email"
                    value={formData.organizer.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-purple-700 mb-1">Phone</label>
                  <input
                    id="phone"
                    name="organizer.phone"
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Phone"
                    value={formData.organizer.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </fieldset>

            {mode === 'club' ? (
              <>
                {/* Club Details Section */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Club Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="clubName" className="block text-sm font-medium text-purple-700 mb-1">Name</label>
                      <input
                        id="clubName"
                        name="club.name"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Club Name"
                        value={formData.club.name}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="clubDescription" className="block text-sm font-medium text-purple-700 mb-1">Description</label>
                      <textarea
                        id="clubDescription"
                        name="club.description"
                        rows="3"
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Club Description"
                        value={formData.club.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="clubCategory" className="block text-sm font-medium text-purple-700 mb-1">Category</label>
                        <select
                          id="clubCategory"
                          name="club.category"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.club.category}
                          onChange={handleChange}
                        >
                          <option value="">Select Category</option>
                          <option value="tech">Tech</option>
                          <option value="cultural">Cultural</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="clubType" className="block text-sm font-medium text-purple-700 mb-1">Type</label>
                        <select
                          id="clubType"
                          name="club.type"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.club.type}
                          onChange={handleChange}
                        >
                          <option value="">Select Type</option>
                          <option value="academic">Academic</option>
                          <option value="recreational">Recreational</option>
                          <option value="professional">Professional</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="college" className="block text-sm font-medium text-purple-700 mb-1">College</label>
                        <input
                          id="college"
                          name="club.college"
                          type="text"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="College"
                          value={formData.club.college}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="fee" className="block text-sm font-medium text-purple-700 mb-1">Fee</label>
                        <input
                          id="fee"
                          name="club.fee"
                          type="number"
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Fee (optional)"
                          value={formData.club.fee}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                {/* Location Section for Club */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Location Information</h3>
                  <div>
                    <label htmlFor="clubVenue" className="block text-sm font-medium text-purple-700 mb-1">Venue (optional)</label>
                    <input
                      id="clubVenue"
                      name="venue"
                      type="text"
                      className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Club Venue / Address"
                      value={formData.venue}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>

                {/* Social Media Section for Club */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="clubInstagram" className="block text-sm font-medium text-purple-700 mb-1">Instagram</label>
                      <input
                        id="clubInstagram"
                        name="instagram"
                        type="url"
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Instagram URL"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="clubLinkedin" className="block text-sm font-medium text-purple-700 mb-1">LinkedIn</label>
                      <input
                        id="clubLinkedin"
                        name="linkedin"
                        type="url"
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="LinkedIn URL"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Club Image */}
                <div className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <label htmlFor="clubImage" className="block text-sm font-medium text-purple-700 mb-1">Club Logo Image (optional)</label>
                  <input
                    id="clubImage"
                    name="clubImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'clubImage')}
                    className="w-full text-sm text-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </>
            ) : (
              // Event form
              <>

                {/* Event Details Section */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Event Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-purple-700 mb-1">Title</label>
                      <input
                        id="title"
                        name="title"
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Event Title"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-purple-700 mb-1">Description</label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        required
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Event Description"
                        value={formData.description}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-purple-700 mb-1">Category</label>
                        <select
                          id="category"
                          name="category"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.category}
                          onChange={handleChange}
                        >
                          <option value="">Select Category</option>
                          <option value="workshop">Workshop</option>
                          <option value="seminar">Seminar</option>
                          <option value="conference">Conference</option>
                          <option value="compitition">compitition</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-purple-700 mb-1">Type</label>
                        <select
                          id="type"
                          name="type"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.type}
                          onChange={handleChange}
                        >
                          <option value="">Select Type</option>
                          <option value="tech">Tech</option>
                          <option value="cultural">Cultural</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-purple-700 mb-1">Start Date</label>
                        <input
                          id="startDate"
                          name="startDate"
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.startDate}
                          onChange={handleChange}
                        />
                      </div>
                      <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-purple-700 mb-1">End Date</label>
                        <input
                          id="endDate"
                          name="endDate"
                          type="date"
                          required
                          className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          value={formData.endDate}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventMode"
                          value="online"
                          checked={formData.eventMode === "online"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Online
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="eventMode"
                          value="offline"
                          checked={formData.eventMode === "offline"}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        Offline
                      </label>
                    </div>
                  </div>
                </fieldset>

                {/* Location Section for Event */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Location Information</h3>
                  <div>
                    <label htmlFor="venue" className="block text-sm font-medium text-purple-700 mb-1">Venue</label>
                    <input
                      id="venue"
                      name="venue"
                      type="text"
                      className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Venue / Google Maps Link"
                      value={formData.venue}
                      onChange={handleChange}
                    />
                  </div>
                </fieldset>

                {/* Social Media Section for Event */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Social Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="instagram" className="block text-sm font-medium text-purple-700 mb-1">Instagram</label>
                      <input
                        id="instagram"
                        name="instagram"
                        type="url"
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Instagram URL"
                        value={formData.instagram}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="linkedin" className="block text-sm font-medium text-purple-700 mb-1">LinkedIn</label>
                      <input
                        id="linkedin"
                        name="linkedin"
                        type="url"
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="LinkedIn URL"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Poster Image */}
                <div className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <label htmlFor="posterImage" className="block text-sm font-medium text-purple-700 mb-1">Event Poster Image (optional)</label>
                  <input
                    id="posterImage"
                    name="posterImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'posterImage')}
                    className="w-full text-sm text-purple-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>

                {/* Club Select for events */}
                <fieldset className="border border-purple-200 bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Club Selection</h3>
                  <div>
                    <label htmlFor="clubId" className="block text-sm font-medium text-purple-700 mb-1">Select Club</label>
                    <select
                      id="clubId"
                      name="clubId"
                      required
                      className="w-full px-3 py-2 border border-purple-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={formData.clubId}
                      onChange={handleChange}
                    >
                      <option value="">Select Club</option>
                      {clubs.map((club) => (
                        <option key={club._id} value={club._id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>
              </>
            )}

            {error && <div className="text-red-500 text-sm p-4 bg-red-50 rounded-md">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
              >
                {loading ? "Creating..." : `Create ${mode === 'club' ? 'Club' : 'Event'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
