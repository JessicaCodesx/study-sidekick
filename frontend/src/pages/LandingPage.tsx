import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  {
    title: "Course Management",
    description: "Keep all your courses organized in one place with customizable color themes.",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  {
    title: "Notes & Flashcards",
    description: "Create comprehensive notes and study with flashcards - all linked to your course structure.",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: "Task Management",
    description: "Never miss a deadline with integrated calendars and task tracking for assignments and exams.",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    title: "Academic Records",
    description: "Track your academic performance with comprehensive grade management and GPA visualization.",
    icon: () => (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <svg 
                  className="h-8 w-8 text-amber-500" 
                  fill="currentColor" 
                  viewBox="0 0 24 24">
                  <path d="M12 14l9-5-9-5-9 5 9 5z"/>
                  <path d="M12 14l6.16-3.422a12 12 0 01.665 1.526A11.953 11.953 0 0120 20.485V22h2v-1.515a14.058 14.058 0 00-1.175-5.585c-.15-.376-.319-.737-.499-1.084L24 11.537v6.914L12 23l-12-4.545V10.454l5.318 2.954a10.807 10.807 0 00-.399 1.08A11.963 11.963 0 004 20.486V22h2v-1.515a9.99 9.99 0 011.175-4.695c.142-.374.301-.734.473-1.083L12 16l3.714-2.063a10.881 10.881 0 00-.466-1.083A10.032 10.032 0 0014.054 11H12v-.5a.5.5 0 00-1 0V11h-2.053c.16.658.246 1.34.246 2.043 0 .742-.097 1.46-.276 2.142L5.175 12.63A9.968 9.968 0 016.794 8.87C8.02 6.534 9.91 5 12 5c2.09 0 3.98 1.534 5.206 3.87A9.998 9.998 0 0118.746 11h2.238a12.056 12.056 0 00-1.486-3.380C17.855 4.842 15.086 3 12 3 8.914 3 6.145 4.842 4.502 7.62A12.072 12.072 0 003 11.482v2.035z"/>
                </svg>
                <span className="ml-2 text-xl font-bold">StudySidekick</span>
              </div>
            </div>
            <div className="flex items-center">
  <Link to="/signin" className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400">
    Sign In
  </Link>
  <Link to="/signup" className="ml-4 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md shadow-sm">
    Sign Up
  </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <motion.div 
                className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block">All your studying.</span>
                  <span className="block text-amber-600">All in one place.</span>
                </h1>
                <p className="mt-6 text-base text-gray-600 dark:text-gray-300 sm:text-lg md:text-xl">
                  StudySidekick is your all-in-one study assistant for managing courses, notes, flashcards, tasks, and grades - beautifully organized and completely offline.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                    <Link
  to="/signup"
  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 md:py-4 md:text-lg md:px-10"
>
  Get Started
</Link>
                    </div>
                  </div>
                </div>
              </motion.div>
              <motion.div 
                className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full rounded-lg overflow-hidden">
                    <img
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg"
                      src="/api/placeholder/800/500"
                      alt="StudySidekick dashboard preview"
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Features designed for students
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-600 dark:text-gray-300 mx-auto">
              Everything you need to succeed in your studies, thoughtfully organized in one application.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  className="pt-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <div className="flow-root bg-gray-50 dark:bg-gray-900 rounded-lg px-6 pb-8 h-full">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center p-3 bg-amber-500 rounded-md shadow-lg">
                          {feature.icon()}
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg font-medium text-gray-900 dark:text-white tracking-tight">{feature.title}</h3>
                      <p className="mt-5 text-base text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="py-16 bg-gray-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                Why StudySidekick?
              </h2>
              <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
                Designed with privacy and reliability in mind. All your data stays on your device.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Works completely offline - no internet required",
                  "Your data never leaves your device - total privacy",
                  "No accounts or logins needed - just download and start",
                  "Customizable interface with light and dark modes",
                  "Optimized for desktop with keyboard shortcuts"
                ].map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                  >
                    <svg className="flex-shrink-0 h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="ml-3 text-base text-gray-600 dark:text-gray-300">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:relative">
              <motion.div 
                className="aspect-w-5 aspect-h-3 rounded-lg shadow-lg overflow-hidden"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <img
                  src="/api/placeholder/800/600"
                  alt="StudySidekick features showcase"
                  className="object-cover object-center"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-amber-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to get started?</span>
            <span className="block text-amber-100">Download now or sign up for free.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
            <Link
  to="/signup"
  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-amber-600 bg-white hover:bg-amber-50"
>
  Sign up
</Link>

            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6">
            {["GitHub", "Twitter", "Discord", "Contact"].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">{item}</span>
                <span className="text-sm">{item}</span>
              </a>
            ))}
          </div>
          <p className="mt-8 text-center text-base text-gray-500">
            &copy; {new Date().getFullYear()} StudySidekick. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;