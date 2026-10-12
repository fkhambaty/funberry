import { FunBerryLogo } from "./components/FunBerryLogo";

export default function NotFound() {
  return (
    <div className="fb-empty">
      <div className="fb-empty-card glass-card">
        <div className="mb-4 flex justify-center">
          <FunBerryLogo size="xl" />
        </div>
        <p className="fb-kicker">Lost a berry</p>
        <h1 className="font-display mb-2 text-3xl font-bold text-sky-900">
          Page not found
        </h1>
        <p className="mb-6 font-semibold text-ink-500">
          This path is not part of FunBerry. Head back to the village.
        </p>
        <a href="/" className="fb-cta fb-cta-sky px-6">
          Go home
        </a>
      </div>
    </div>
  );
}
