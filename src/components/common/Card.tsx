import { ReactNode } from 'react';
import classNames from 'classnames';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'hover' | 'interactive';
  border?: boolean;
}

const Card = ({
  children,
  className,
  onClick,
  padding = 'md',
  variant = 'default',
  border = true,
}: CardProps) => {
  const baseClasses = 'bg-white dark:bg-gray-800 rounded shadow';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };
  
  const variantClasses = {
    default: '',
    hover: 'transition-shadow hover:shadow-card-hover',
    interactive: 'transition-shadow hover:shadow-card-hover cursor-pointer',
  };
  
  const borderClass = border ? 'border border-gray-100 dark:border-gray-700' : '';
  
  const cardClasses = classNames(
    baseClasses,
    paddingClasses[padding],
    variantClasses[variant],
    borderClass,
    className
  );
  
  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

export default Card;

export const CardHeader = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={classNames('mb-4 pb-2 border-b border-gray-100 dark:border-gray-700', className)}>
      {children}
    </div>
  );
};

export const CardTitle = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={classNames('text-lg font-medium text-gray-900 dark:text-white', className)}>
      {children}
    </h3>
  );
};

export const CardDescription = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <p className={classNames('mt-1 text-sm text-gray-500 dark:text-gray-400', className)}>
      {children}
    </p>
  );
};

export const CardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return <div className={className}>{children}</div>;
};

export const CardFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={classNames(
        'mt-4 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-2',
        className
      )}
    >
      {children}
    </div>
  );
};