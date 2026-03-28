import { FunBerryLogo } from "./components/FunBerryLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-50 via-white to-purple-50/40">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <FunBerryLogo size="xl" />
        </div>
        <h1 className="font-display text-3xl font-bold text-sky-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          Oops! This page doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="kid-glass-btn kid-glass-sky inline-block rounded-kid px-6 py-3"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
