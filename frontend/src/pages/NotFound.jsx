import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="font-display text-6xl font-bold text-brand-500">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <p className="mt-2 text-sm text-ink/50">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
