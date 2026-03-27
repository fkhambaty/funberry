import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mb-4"><Image src="/logo.png" alt="FunBerry Kids" width={120} height={72} className="mx-auto" /></div>
        <h1 className="font-display text-3xl font-bold text-sky-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-500 mb-6">
          Oops! This page doesn&apos;t exist.
        </p>
        <a
          href="/"
          className="rounded-kid bg-sky-500 px-6 py-3 text-white font-bold hover:bg-sky-600 transition inline-block"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
