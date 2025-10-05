import React from 'react';
import { MapPin, CalendarDays, Users, Tag } from 'lucide-react';

const EventCard = ({ event, onClick }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 cursor-pointer border border-purple-200 hover:scale-105 group relative overflow-hidden"
      onClick={onClick}
    >
      <div className="relative">
        <div className="relative h-48 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg overflow-hidden">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-purple-400">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="mt-4">
        <h2 className="text-xl font-bold text-purple-800 mb-2 transition-colors duration-300 group-hover:text-purple-900">{event.title}</h2>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description || 'No description available.'}</p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarDays className="w-4 h-4 mr-2 text-purple-500" />
            <span><strong>Date:</strong> {formatDate(event.date)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-2 text-purple-500" />
            <span><strong>Attendees:</strong> {event.attendees?.length || 0}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Tag className="w-4 h-4 mr-2 text-purple-500" />
            <span><strong>Type:</strong> {event.type}</span>
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105" onMouseEnter={cursor => cursor.target.style.cursor = 'pointer'}>
          View Details
        </button>
      </div>
    </div>
  );
};

export default EventCard;
