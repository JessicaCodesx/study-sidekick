import React, { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageContainer wraps page content with consistent padding and max-width
 * Use this component to wrap all page content for proper layout
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`p-6 w-full h-full max-w-full ${className}`}>
      <div className="max-w-6xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;