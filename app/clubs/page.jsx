"use client";
import { useEffect, useState } from 'react';
import ClubCard from '../components/ClubCard';
import NavbarComponent from '../components/navbar';
import Footer from '../components/Footer';
import { useRouter } from "next/navigation";

export default function ClubsPage() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Filters
  const [searchName, setSearchName] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState(""); // feeLowHigh | feeHighLow

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch('/api/clubs');
        if (!response.ok) {
          throw new Error('Failed to fetch clubs');
        }
        const data = await response.json();
        setClubs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const handelClick = (club) => {
    router.push(`/clubs/${club._id}`);
  };

  // Apply filters
  let filteredClubs = clubs.filter((club) => {
    return (
      club.name.toLowerCase().includes(searchName.toLowerCase()) &&
      (collegeFilter === "" || club.college === collegeFilter) &&
      (typeFilter === "" || (club.type || "General") === typeFilter)
    );
  });

  // Apply sorting
  if (sortBy === "feeLowHigh") {
    filteredClubs = filteredClubs.sort((a, b) => (a.fee || 0) - (b.fee || 0));
  } else if (sortBy === "feeHighLow") {
    filteredClubs = filteredClubs.sort((a, b) => (b.fee || 0) - (a.fee || 0));
  }

  return (
    <>
      <NavbarComponent />
      <div className="min-h-screen bg-gradient-to-r from-blue-100 via-green-100 to-yellow-100 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-10 text-center drop-shadow-lg">
            Discover Amazing Clubs
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="bg-white rounded-xl shadow-md p-6 space-y-6 md:col-span-1">
              <h2 className="text-xl font-bold text-purple-800 mb-4">Filters</h2>

              {/* Search by Club Name */}
              <div>
                <label className="block text-sm font-semibold mb-2">Club Name</label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              {/* Filter by College */}
              <div>
                <label className="block text-sm font-semibold mb-2">College</label>
                <select
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  <option value="">All Colleges</option>
                  {[...new Set(clubs.map((club) => club.college))].map((college) => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Club Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">Club Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                >
                  <option value="">All Types</option>
                  {[...new Set(clubs.map((club) => club.type || "General"))].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Sort by Fee */}
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                >
                  <option value="">Default</option>
                  <option value="feeLowHigh">Fee: Low → High</option>
                  <option value="feeHighLow">Fee: High → Low</option>
                </select>
              </div>
            </aside>

            {/* Clubs Grid */}
            <main className="md:col-span-3">
              {loading ? (
                <div className="text-center text-blue-700 text-lg font-semibold">Loading clubs...</div>
              ) : error ? (
                <div className="text-center text-red-600 text-lg font-semibold">Error: {error}</div>
              ) : filteredClubs.length === 0 ? (
                <p className="text-center text-blue-700 text-lg font-semibold">No clubs match your filters.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredClubs.map((club) => (
                    <div
                      key={club._id}
                      className="bg-white rounded-xl shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                      onClick={() => handelClick(club)}
                    >
                      <ClubCard club={club} />
                    </div>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
