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
  const baseClasses = 'glass dark:glass-dark rounded-2xl card-glow';
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6',
  };
  
  const variantClasses = {
    default: '',
    hover: 'card-glow-hover cursor-pointer',
    interactive: 'card-glow-hover cursor-pointer',
  };
  
  const borderClass = border ? 'border border-white/20 dark:border-gray-700/50' : '';
  
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
    <h3 className={classNames('text-xl font-bold text-gray-900 dark:text-white gradient-text', className)}>
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