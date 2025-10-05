import Image from 'next/image';
import { Users, Calendar, DollarSign } from 'lucide-react';

export default function ClubCard({ club, onClick }) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-blue-200 hover:scale-105 group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
          {club.image ? (
            <Image
              src={club.image}
              alt={club.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-blue-400">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold text-blue-800 mb-2 transition-colors duration-300 group-hover:text-blue-900">{club.name}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{club.description || 'No description available.'}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 text-blue-500" />
            <span><strong>Members:</strong> {club.members?.length || 0}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            <span><strong>Events:</strong> {club.events?.length || 0}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <span><strong>Fee:</strong> ₹{club.fee || 0}</span>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105" onMouseEnter={cursor => cursor.target.style.cursor = 'pointer'}>
          View Details
        </button>
      </div>
    </div>
  );
}
