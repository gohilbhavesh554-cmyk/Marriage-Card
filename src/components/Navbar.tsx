import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const location = useLocation();

  // The Interactive Wedding Card Web-App has its own sticky header matching the reference screenshots
  if (
    location.pathname === '/' ||
    location.pathname.startsWith('/i/') ||
    location.pathname.startsWith('/editor/')
  ) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F0]/95 backdrop-blur-sm border-b border-[#E8E0D5]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-6 px-6 py-3.5">
        <Link
          to="/"
          className="font-display text-xl font-bold tracking-tight text-[#16325B]"
        >
          ← Back to Wedding Card
        </Link>
        <div className="flex items-center gap-5 text-xs uppercase tracking-widest text-[#5E584F]">
          <Link to="/templates" className="hover:text-[#16325B]">
            5 Templates
          </Link>
          <Link to="/dashboard" className="hover:text-[#16325B]">
            Guest RSVPs
          </Link>
        </div>
      </div>
    </header>
  );
};
