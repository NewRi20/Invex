import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--primary-bg)]">

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-10 px-5">

        <div className="w-full max-w-[500px] p-10 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] bg-[var(--peach-bg)]">
          <h2 className="mb-2 text-center text-[28px] font-bold text-[var(--primary-bg)]">Sign Up</h2>
          <p className="mb-8 text-center text-sm text-[var(--primary-bg)]">Please enter your information to create an account</p>

          <form>
            <div className="mb-4 grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
              <input
                type="date"
                placeholder="Birthday"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
            </div>

            <div className="mb-6 grid grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Password"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
            </div>

            <div className=''>
              <input
                type="text"
                placeholder="Home Address"
                className="w-full rounded-lg border-none bg-[var(--card-bg)] px-3 py-2.5 text-[var(--primary-bg)] outline-none placeholder-[var(--primary-bg)]/50"
              />
            </div>              

            <button 
              type="submit"
              className="mt-6 mb-2.5 w-full rounded-xl border-none bg-[var(--primary-bg)] p-2.5 text-base font-bold text-[var(--card-bg)] outline-none cursor-pointer hover:opacity-90 transition-opacity"
            >
              Sign Up
            </button>

            <div className="text-center">
              <span className="text-sm text-[var(--primary-bg)]">
                Already have an account?{" "}
              </span>
              <Link 
                to="/login"
                className="text-[15px] font-semibold text-[var(--primary-bg)] no-underline hover:underline"
              >
                Log In
              </Link>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
};

export default SignUp;
