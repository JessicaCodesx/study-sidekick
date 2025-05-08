import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFoundPage = () => {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Page Not Found</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button variant="primary">
          Go Back to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;