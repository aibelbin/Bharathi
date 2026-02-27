import React from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronDown, MoveRight, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-10000 w-full">
     

      <div className="p-0">
        <div className="rounded-b-xl overflow-hidden">
          <nav className="hidden lg:flex justify-between items-center py-3 pr-4 pl-6 w-full bg-white/10 backdrop-blur-md">
            <div className="flex flex-1 justify-between items-center mx-auto max-w-360">
             
              <a href="/" className="flex flex-1 items-center gap-2 transition-opacity hover:opacity-80">
                <h3 className='font-bold text-2xl text-black'>Bharathi Ai</h3>
              </a>

              

              <div className="hidden md:flex flex-1 justify-end items-center gap-3">
                <button className="group relative inline-flex items-center justify-center cursor-pointer font-display font-medium overflow-hidden rounded-full py-3 px-5 text-base bg-[#131313] text-white transition-all duration-500 active:scale-95 shadow-[inset_0_0_12px_rgba(255,255,255,1),0px_0px_2px_0_rgba(0,0,0,0.1)]">
                  <span className="absolute inset-0 opacity-0 transition-opacity duration-700 bg-[linear-gradient(90deg,#131313_0%,#0A2156_33%,#BED2FF_66%,#FF8717_100%)] group-hover:opacity-100 rounded-full shadow-[inset_0px_0px_12px_2px_rgba(255,255,255,0.5)]"></span>
                  <span className="z-10 relative flex items-center gap-2 transition-all duration-500">
                    <a href="/dashboard" className="inherit">Experience Bharathi</a>
                  </span>
                </button>

              </div>
            </div>
          </nav>

          <div className="lg:hidden flex flex-col p-0.5 max-h-[calc(100vh-2rem)] overflow-hidden bg-white/80 backdrop-blur-md">
            <div className="flex justify-between items-center px-4.5 py-2.5">
              
              <button className="flex flex-col justify-center items-center space-y-1 w-8 h-8" aria-label="Toggle menu">
                <span className="w-6 h-0.5 bg-black"></span>
                <span className="w-6 h-0.5 bg-black"></span>
                <span className="w-6 h-0.5 bg-black"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};



export default Header;