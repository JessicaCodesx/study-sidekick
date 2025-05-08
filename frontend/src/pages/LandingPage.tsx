import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Card, { CardTitle, CardContent } from '../components/common/Card';
import { ClipboardList, Calendar, BookOpen, ArrowUpRight } from 'lucide-react';
import React from 'react';

const features = [
  {
    icon: ClipboardList,
    title: 'Task Management',
    description: 'Organize your study tasks and track progress effortlessly.',
  },
  {
    icon: Calendar,
    title: 'Schedule & Calendar',
    description: 'Plan your week with our integrated calendar view.',
  },
  {
    icon: BookOpen,
    title: 'Notes & Flashcards',
    description: 'Create and review notes and flashcards in one place.',
  },
  {
    icon: ArrowUpRight,
    title: 'Performance Insights',
    description: 'Monitor your study streak and course progress.',
  },
];

export default function LandingPage() {
  return (
    <PageContainer className="space-y-24 py-16">
      {/* Hero Section */}
      <section className="flex flex-col-reverse lg:flex-row items-center gap-12 md:gap-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            All Your Study Tools in One Place
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            StudySidekick simplifies your workflow with tasks, notes, flashcards, and analytics—all in a clean, intuitive interface.
          </p>
          <Link to="/signup">
            <Button className="px-8 py-3">Get Started Free</Button>
          </Link>
        </motion.div>
        <motion.img
          src="/images/dashboard-preview.png"
          alt="App preview"
          className="w-full max-w-lg rounded-xl shadow-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        />
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Key Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon: Icon, title, description }, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 * idx, duration: 0.4 }}
            >
              <Card className="h-full p-6 text-center">
                <Icon className="w-10 h-10 mx-auto mb-4 text-amber-500" />
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
                <CardContent className="mt-2 text-gray-600 dark:text-gray-300">
                  {description}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 px-8 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-gray-800 dark:to-gray-700 rounded-xl text-center">
        <h3 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-900 dark:text-white">
          Ready to Boost Your Productivity?
        </h3>
        <Link to="/signup">
          <Button className="px-10 py-3">Start Your Free Trial</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 dark:text-gray-400 pt-12 border-t border-gray-200 dark:border-gray-700">
        &copy; {new Date().getFullYear()} StudySidekick. All rights reserved.
      </footer>
    </PageContainer>
  );
}
