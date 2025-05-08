// src/components/auth/SignIn.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Card, { CardTitle, CardContent, CardFooter } from '../common/Card';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signInWithGoogle, currentUser } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setIsLoading(true);
      await signIn(email, password);
      // Redirection handled by the useEffect above
    } catch (err: any) {
      setError('Failed to sign in: ' + (err.message || 'Unknown error'));
      setIsLoading(false);
    }
  };
  
  const handleGoogleSignIn = async () => {
    setError('');
    
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // Redirection handled by the useEffect above
    } catch (err: any) {
      setError('Failed to sign in with Google: ' + (err.message || 'Unknown error'));
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-10">
      <Card>
        <CardTitle>Sign In to StudySidekick</CardTitle>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 theme-pink:bg-pink-100 theme-pink:text-red-700 rounded">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 theme-pink:text-pink-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-800 theme-pink:border-pink-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 theme-pink:focus:border-pink-500 theme-pink:focus:ring-pink-500 sm:text-sm"
              />
            </div>
            
            <div>
              <Button variant="primary" type="submit" isFullWidth isLoading={isLoading}>
                Sign In
              </Button>
            </div>
          </form>
          
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700 theme-pink:border-pink-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 theme-pink:bg-white text-gray-500 dark:text-gray-400 theme-pink:text-pink-500">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                variant="outline"
                type="button"
                isFullWidth
                onClick={handleGoogleSignIn}
                isLoading={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
                Sign in with Google
              </Button>
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 theme-pink:text-pink-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-primary-600 dark:text-primary-400 theme-pink:text-pink-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignIn;