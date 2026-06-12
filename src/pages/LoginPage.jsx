import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { BookOpen, Chrome, Github } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_API_URL;

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, updateUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/';

  // Listen for OAuth message from popup window
  useEffect(() => {
    const handleOAuthMessage = (event) => {
      // IMPORTANT: In production, change this to your Render URL
      // For now, accept messages from localhost:8080 (backend) and your Vercel frontend
      const allowedOrigins = [
        'http://localhost:8080',
        'https://your-backend.onrender.com' // Change to your actual Render URL
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.log('Ignored message from origin:', event.origin);
        return;
      }
      
      const data = event.data;
      if (data.type === 'oauth-success') {
        console.log('OAuth success message received:', data);
        
        // Store token and user data
        localStorage.setItem('token', data.token);
        const userData = {
          id: data.userId,
          name: data.name,
          email: data.email,
          role: data.role
        };
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update auth context
        if (updateUser) {
          updateUser(userData);
        }
        
        toast.success(`Welcome ${data.name || 'User'}!`);
        navigate(from, { replace: true });
      }
    };
    
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [navigate, from, updateUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(email, password);
      
      if (result && result.success) {
        toast.success('Login successful!');
        navigate(from, { replace: true });
      } else {
        const errorMsg = result?.error || 'Invalid email or password';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    if (!API_BASE_URL) {
      console.error('VITE_API_URL is not configured');
      toast.error('Login service not configured');
      return;
    }
    
    // Store current location to return after OAuth
    localStorage.setItem('oauthReturnPath', from);
    
    // Calculate popup position
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    
    // Open popup
    const popup = window.open(
      `${API_BASE_URL}/oauth2/authorization/${provider}`,
      'oauth-popup',
      `width=${width},height=${height},left=${left},top=${top}`
    );
    
    if (!popup) {
      toast.error('Popup was blocked. Please allow popups for this site.');
    }
  };

  const loadDemoUser = () => {
    setEmail('user@test.com');
    setPassword('123456');
  };

  const loadAdminUser = () => {
    setEmail('admin@bookreview.com');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Helmet>
        <title>Login - Library</title>
      </Helmet>
      
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-4">
            <BookOpen className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-bold font-serif">Welcome back</h1>
          <p className="text-muted-foreground mt-2 text-center">Log in to your account to review books and connect.</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@example.com" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>
            <Input 
              id="password" 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-background text-foreground"
            />
          </div>

          <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>
        </form>

        {/* Demo buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <Button type="button" variant="secondary" size="sm" onClick={loadDemoUser}>
            Demo User
          </Button>
          <Button type="button" variant="secondary" size="sm" onClick={loadAdminUser}>
            Admin Demo
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full h-11 gap-2"
            onClick={() => handleOAuthLogin('google')}
          >
            <Chrome className="h-5 w-5" />
            Sign in with Google
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full h-11 gap-2"
            onClick={() => handleOAuthLogin('github')}
          >
            <Github className="h-5 w-5" />
            Sign in with GitHub
          </Button>
        </div>

        <div className="mt-8 text-center text-sm">
          <p className="text-muted-foreground mb-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
