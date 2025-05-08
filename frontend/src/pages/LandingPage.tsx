// src/pages/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-400 text-white p-8">
      <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
        Study Sidekick
      </h1>
      <p className="text-xl md:text-2xl mb-8 max-w-xl">
        Your all-in-one offline-friendly productivity app for mastering school life —
        with notes, flashcards, a calendar, and more.
      </p>
      <div className="flex gap-4">
        <Link to="/signup" className="bg-white text-purple-700 px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:bg-purple-100 transition">
          Get Started
        </Link>
        <Link to="/signin" className="border border-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-white hover:text-purple-700 transition">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
