import { useState } from 'react';
import Button from '../common/Button';
import { ModalFooter } from '../common/Modal';

interface CourseFormData {
  name: string;
  colorTheme: string;
  description: string;
  instructor: string;
  schedule: string;
  location: string;
}

interface CourseFormProps {
  initialData?: CourseFormData;
  onSubmit: (data: CourseFormData) => void;
  onCancel: () => void;
}

const CourseForm = ({
  initialData = {
    name: '',
    colorTheme: 'blue',
    description: '',
    instructor: '',
    schedule: '',
    location: '',
  },
  onSubmit,
  onCancel,
}: CourseFormProps) => {
  const [formData, setFormData] = useState<CourseFormData>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormData, string>>>({});

  // Available color themes from the tailwind.config.js
  const colorThemes = [
    { name: 'Red', value: 'red' },
    { name: 'Orange', value: 'orange' },
    { name: 'Amber', value: 'amber' },
    { name: 'Yellow', value: 'yellow' },
    { name: 'Lime', value: 'lime' },
    { name: 'Green', value: 'green' },
    { name: 'Emerald', value: 'emerald' },
    { name: 'Teal', value: 'teal' },
    { name: 'Cyan', value: 'cyan' },
    { name: 'Sky', value: 'sky' },
    { name: 'Blue', value: 'blue' },
    { name: 'Indigo', value: 'indigo' },
    { name: 'Violet', value: 'violet' },
    { name: 'Purple', value: 'purple' },
    { name: 'Fuchsia', value: 'fuchsia' },
    { name: 'Pink', value: 'pink' },
    { name: 'Rose', value: 'rose' },
  ];

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is updated
    if (errors[name as keyof CourseFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<Record<keyof CourseFormData, string>> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required';
    }
    
    if (!formData.colorTheme) {
      newErrors.colorTheme = 'Please select a color theme';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit form data
    onSubmit(formData);
  };

  // Get color theme classes for preview
  const getThemeClasses = (colorName: string) => {
    // Get appropriate background and text color
    const bgClass = `bg-course-${colorName}`;
    const textClass = ['yellow', 'lime', 'amber'].includes(colorName) ? 'text-gray-900' : 'text-white';
    return `${bgClass} ${textClass}`;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Course Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Course Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
              errors.name ? 'border-red-500 dark:border-red-500' : ''
            }`}
            placeholder="Introduction to Computer Science"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
          )}
        </div>
        
        {/* Color Theme */}
        <div>
          <label htmlFor="colorTheme" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Color Theme *
          </label>
          <div className="mt-1 flex flex-wrap gap-2">
            {colorThemes.map(theme => (
              <button
                key={theme.value}
                type="button"
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  formData.colorTheme === theme.value
                    ? 'ring-2 ring-offset-2 ring-primary-500 dark:ring-primary-400'
                    : ''} bg-course-${theme.value} ${['yellow', 'lime', 'amber'].includes(theme.value) ? 'text-gray-900' : 'text-white'}`}
                onClick={() => {
                  setFormData(prev => ({ ...prev, colorTheme: theme.value }));
                  if (errors.colorTheme) {
                    setErrors(prev => ({ ...prev, colorTheme: undefined }));
                  }
                }}
                title={theme.name}
              >
                {formData.colorTheme === theme.value && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          {errors.colorTheme && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.colorTheme}</p>
          )}
          
          {/* Color Theme Preview */}
          <div className="mt-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme Preview</h4>
            
            <div className="flex items-center">
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl font-bold ${getThemeClasses(formData.colorTheme)} shadow-sm mr-3`}
              >
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
              </div>
              
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {formData.name || "Course Name"}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Color: {colorThemes.find(t => t.value === formData.colorTheme)?.name || 'Blue'}
                </div>
              </div>
            </div>
            
            <div className="mt-2 flex space-x-2">
              <div className={`px-3 py-1 rounded-md text-sm font-medium ${getThemeClasses(formData.colorTheme)}`}>
                Primary Button
              </div>
              <div className={`px-3 py-1 rounded-md text-sm font-medium border border-course-${formData.colorTheme} text-course-${formData.colorTheme} bg-white dark:bg-gray-800`}>
                Secondary Button
              </div>
            </div>
          </div>
        </div>
        
        {/* Instructor */}
        <div>
          <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Instructor
          </label>
          <input
            type="text"
            id="instructor"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Professor Smith"
          />
        </div>
        
        {/* Schedule */}
        <div>
          <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Schedule
          </label>
          <input
            type="text"
            id="schedule"
            name="schedule"
            value={formData.schedule}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Mon/Wed/Fri 10:00 AM - 11:30 AM"
          />
        </div>
        
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Building 3, Room 101"
          />
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Course description, objectives, or other notes..."
          />
        </div>
      </div>
      
      <ModalFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          Save Course
        </Button>
      </ModalFooter>
    </form>
  );
};

export default CourseForm;