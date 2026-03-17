import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthProvider';
import './Login.css';

const Login = () => {
  const { user, loading, signInWithGoogle, signInWithEmail } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard'); 
    }
  }, [user, loading, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) throw error;
      // Navigation will happen via useEffect when user state updates
    } catch (error) {
      console.error("Login failed:", error.message);
      setLoginError(error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Failed to sign in with Google", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-xl font-semibold text-slate-700 dark:text-slate-300">Loading...</div>
      </div>
    ); 
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-x-hidden">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side: Branding & Imagery */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between p-12 overflow-hidden bg-primary">
          <div 
            className="absolute inset-0 opacity-40 bg-cover bg-center" 
            data-alt="High-quality modern professional warehouse distribution center" 
            style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB_1Bdd0udvZw9c7MDESki66zZaPAnoLaMJ9_4Af4CVM2I1ljqbUYbvtPv3BRUAfGfZwnvncaaLOdj4PZOXlROz3vki_1HdGhqwxWOO6FTBwQ829DN1ezS1VKowCT7KXVa0BtPJzFFYsH10yXdRUGsI97_3YFwgPEbPGnZAEbNTnZczi9eD1YhzCb9pZKCqnzSMai2vjaxz76d290UkwQjc3fm4SCgNRcT0YmMuoYheyLDknQoNVr9tCDePvREiSZAcF5Tt0koWcPE')"}}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-white text-primary">
              <span className="material-symbols-outlined text-3xl font-bold">inventory_2</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Invex</h1>
          </div>
          <div className="relative z-10 max-w-lg">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">The Operating System for Modern Logistics</h2>
            <p className="text-slate-200 text-lg">Streamlining warehouse operations, inventory management, and supply chain visibility for global enterprises.</p>
          </div>
          <div className="relative z-10 flex gap-4 text-slate-300 text-sm">
            <span>© 2024 Invex Logistics Inc.</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-white dark:bg-background-dark">
          <div className="w-full max-w-md space-y-8">
            {/* Mobile Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-12">
              <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
                <span className="material-symbols-outlined text-3xl font-bold">inventory_2</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-primary uppercase">Invex</h1>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
              <p className="text-slate-500 dark:text-slate-400">Please enter your credentials to access your dashboard.</p>
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {loginError}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleEmailLogin}>
              <div className="space-y-4">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Email Address</span>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                    <input 
                      className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-4 h-12 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400" 
                      placeholder="name@company.com" 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </label>
                <label className="block">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</span>
                    <a className="text-xs font-semibold text-primary dark:text-primary hover:underline" href="#">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                    <input 
                      className="w-full rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 pl-10 pr-12 h-12 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 dark:text-white placeholder:text-slate-400" 
                      placeholder="••••••••" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" type="button">
                      <span className="material-symbols-outlined text-xl">visibility</span>
                    </button>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4" type="checkbox"/>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Remember me for 30 days</span>
                </label>
              </div>

              <button 
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoggingIn}
              >
                <span>{isLoggingIn ? 'Signing In...' : 'Sign In'}</span>
                <span className="material-symbols-outlined">login</span>
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-background-dark px-2 text-slate-500">Or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" 
                  type="button"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                  </svg>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 h-11 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" type="button">
                  <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">fingerprint</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">SSO</span>
                </button>
              </div>
            </form>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account yet? {' '}
              <a className="font-bold text-primary dark:text-primary hover:underline" href="#">Request Access</a>
            </p>

            <div className="pt-8 flex items-center justify-center gap-6">
              <div className="flex items-center gap-1.5 grayscale opacity-50">
                <span className="material-symbols-outlined text-xl">verified_user</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-1.5 grayscale opacity-50">
                <span className="material-symbols-outlined text-xl">shield_locked</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">256-bit AES</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;