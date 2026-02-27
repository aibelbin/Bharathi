import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-white/80 p-8 shadow-lg backdrop-blur dark:bg-white/10">
        <Image
          src="/logo.png"
          alt="Bharathi AI Logo"
          width={120}
          height={120}
          className="animate-pulse rounded-full"
        />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
          Welcome to Bharathi AI
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your intelligent assistant for all your needs.
        </p>
      </div>
    </div>
  );
}
