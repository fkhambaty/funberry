export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-4">🍓</p>
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
