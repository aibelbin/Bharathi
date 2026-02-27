import React from 'react';
import Image from 'next/image';

const HeroSection = () => {
  return (
    <section className="relative flex flex-col pt-28 md:pt-40 h-screen overflow-visible bg-[#F8F9FB]">
      <div className="top-0 left-0 z-10 absolute bg-linear-to-b from-white to-transparent w-full h-28 pointer-events-none" />

      <div className="flex flex-1 justify-center items-center mx-auto pb-[12vh] w-[85%] md:w-9/12 max-w-360 overflow-visible">
        <div className="relative flex flex-col items-center">
          <div className="absolute top-[-80%] md:top-[-165%] left-1/2 -translate-x-1/2 w-[160%] md:w-[220%] max-w-none pointer-events-none z-0">
            <img 
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b135cba7-8861-4fea-9416-b3f6f6822032-sarvam-ai/assets/svgs/hero-gradient-2.svg" 
              alt="" 
              className="w-full h-auto scale-x-[2.0] scale-y-[1.7]"
            />
          </div>

          <div className="z-10 relative flex flex-col items-center gap-5 md:gap-10">
            <div className="flex justify-center items-center">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/b135cba7-8861-4fea-9416-b3f6f6822032-sarvam-ai/assets/svgs/motif-3.svg" 
                alt="" 
                role="presentation" 
                className="w-auto h-10 object-cover opacity-90"
              />
            </div>

            <div className="relative bg-zinc-500/50 shadow-[0px_0px_60px_0px_rgba(85,106,220,0.12)] backdrop-blur-lg px-5 py-2.5 border border-[#556ADC]/20 rounded-full overflow-hidden">
              <span className="absolute inset-0 bg-linear-to-r from-transparent via-zinc-900/60 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite_1.5s] pointer-events-none"></span>
              <p className="relative font-sans font-semibold text-[#556ADC] text-sm text-center leading-normal tracking-wide">
                Autonomous Voice Agents for&nbsp;India
              </p>
            </div>

            <div className="flex flex-col items-center gap-2.5 md:gap-3">
              <h1 className="max-w-4xl  font-extrabold text-[48px] text-[#131313] md:text-[72px] text-center leading-[1.05] tracking-tight">
                Bharathi Ai
              </h1>
              <p className="max-w-200 font-sans text-[#666666] md:text-[22px] text-lg text-center leading-[1.6]">
              Autonomous Voice agent that helps local and multinational businesses in India to automate their customer support, sales, and other operations with ease and efficiency.
              </p>
            </div>
            <div className="mt-2">
              <a 
                href="/dashboard" 
                aria-label="Sign in to experience Bharathi"
                className="group relative inline-flex items-center justify-center cursor-pointer font-display font-medium transition-all duration-500 overflow-hidden rounded-full active:scale-95 touch-manipulation px-6 py-3.5 text-lg bg-[#131313] text-white shadow-[inset_0_0_12px_rgba(255,255,255,1),0px_0px_2px_0_rgba(0,0,0,0.1)]"
              >
                <span className="absolute inset-0 opacity-0 transition-opacity duration-700 bg-[linear-gradient(90deg,#131313_0%,#0A2156_33%,#BED2FF_66%,#FF8717_100%)] group-hover:opacity-100 group-active:opacity-100 rounded-full shadow-[inset_0px_0px_12px_2px_rgba(255,255,255,0.5)]"></span>
                <span className="z-10 relative flex items-center gap-2 transition-all duration-500">
                  Experience Bharathi
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 pb-8 md:pb-14 w-full shrink-0">
        <p className="font-sans font-semibold text-[#999999] text-[10px] md:text-xs uppercase tracking-[3px]">
          India develops with Bharathi
        </p>
      </div>

    </section>
  );
};

export default HeroSection;