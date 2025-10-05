"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Heart,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  Award,
} from "lucide-react";

export default function Hero() {
  const [expanded, setExpanded] = useState(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const toggleExpanded = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  const benefits = [
    {
      icon: Users,
      title: "Networking Opportunities",
      description:
        "Connect with like-minded peers and professionals to build lasting relationships.",
      expandedText:
        "Meet industry experts, alumni, and peers through our tech, cultural, and innovation events. Expand your reach early in your career.",
    },
    {
      icon: BookOpen,
      title: "Skill Development",
      description:
        "Participate in workshops and events to enhance your skills and knowledge.",
      expandedText:
        "From technical hackathons to leadership sessions, develop real-world abilities that go beyond the classroom.",
    },
    {
      icon: Heart,
      title: "Fun & Engagement",
      description:
        "Enjoy a vibrant campus life with exciting events and activities.",
      expandedText:
        "Immerse yourself in fests, competitions, and community events that make college life unforgettable.",
    },
  ];

  const testimonials = [
    {
      name: "Rahul",
      role: "Computer Science Student",
      quote:
        "Joining the Tech Club completely transformed my college experience. I learned so much and made lifelong friends!",
      image:
        "https://static.vecteezy.com/system/resources/thumbnails/047/198/660/small_2x/young-indian-student-photo.jpg",
    },
    {
      name: "Aman Gupta",
      role: "Business Major",
      quote:
        "The Entrepreneurship Club gave me the skills and network I needed to start my own business while still in school.",
      image:
        "https://tse2.mm.bing.net/th/id/OIP.SmyAjYcSmRdjxE35EmypfwHaE8?pid=ImgDet&w=184&h=122",
    },
    {
      name: "Sneha",
      role: "Art Student",
      quote:
        "Being part of the Arts Society opened so many doors for me. I got to exhibit my work and connect with amazing artists.",
      image:
        "https://img.freepik.com/premium-photo/south-indian-college-girl-student-white-top-is-standing-campus-holding-sheets-papers_905085-5.jpg",
    },
  ];

  const upcomingEvents = [
    {
      title: "Tech Workshop: AI Fundamentals",
      date: "Oct 15, 2026",
      time: "2:00 PM",
      location: "Room 101",
    },
    {
      title: "Career Fair 2026",
      date: "Jan 20, 2026",
      time: "10:00 AM",
      location: "Main Auditorium",
    },
    {
      title: "Cultural Festival",
      date: "Nov 25, 2026",
      time: "6:00 PM",
      location: "Campus Grounds",
    },
  ];

  const featuredClub = {
    name: "Innovation Hub",
    description:
      "The premier club for tech enthusiasts and innovators. We build projects, host hackathons, and connect students with cutting-edge technology.",
    members: 150,
    rating: 4.9,
    image: "/placeholder-club.jpg",
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 py-20 px-6 md:px-12 lg:px-24 overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col max-w-xl"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold text-indigo-700 leading-tight drop-shadow-lg">
              Discover Your Passion.
            </h1>
            <p className="mt-6 text-lg text-gray-700 font-medium leading-relaxed">
              Explore college clubs and events that inspire creativity, build
              skills, and shape your future.
            </p>
            <a
              href="/clubs"
              className="mt-8 px-8 py-4 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 hover:scale-105 transition-all w-fit"
            >
              Explore Clubs
            </a>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <img
              src="/img2.jpg"
              alt="Students"
              className="rounded-3xl shadow-2xl w-[500px] h-[500px] object-cover border-8 border-white"
            />
            <div className="absolute -bottom-8 -left-8 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg text-lg font-semibold">
              100+ Active Clubs 🎯
            </div>
          </motion.div>
        </div>
      </div>

      {/* Benefits Section */}
      <motion.div
        className="bg-white py-20"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-indigo-700 mb-4">
            Why Join College Clubs?
          </h2>
          <p className="text-lg text-gray-600 mb-12">
            Enhance your learning, leadership, and social experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="bg-gradient-to-br from-indigo-50 to-white border border-gray-100 p-8 rounded-2xl shadow-md hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="bg-indigo-100 p-4 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-indigo-800">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.description}</p>
                    {expanded === index && (
                      <p className="mt-3 text-gray-500 text-sm animate-fade-in">
                        {benefit.expandedText}
                      </p>
                    )}
                    <button className="mt-4 text-indigo-600 font-semibold flex items-center gap-1" suppressHydrationWarning={true}>
                      {expanded === index ? "Show Less" : "Learn More"}
                      {expanded === index ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Testimonials */}
      <motion.div
        className="bg-gradient-to-r from-indigo-600 to-purple-600 py-16 text-white"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold mb-8">What Students Say</h2>
          <div className="bg-white text-gray-800 rounded-2xl p-8 shadow-lg mx-4">
            <img
              src={testimonials[currentTestimonial].image}
              alt={testimonials[currentTestimonial].name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
            <blockquote className="text-lg italic text-gray-700">
              “{testimonials[currentTestimonial].quote}”
            </blockquote>
            <p className="mt-4 font-bold text-indigo-600">
              {testimonials[currentTestimonial].name}
            </p>
            <p className="text-sm text-gray-500">
              {testimonials[currentTestimonial].role}
            </p>
          </div>

          {/* Dots */}
          <div className="flex justify-center mt-6 gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentTestimonial
                    ? "bg-white scale-125"
                    : "bg-indigo-300 hover:bg-white/70"
                }`}
                suppressHydrationWarning={true}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}
