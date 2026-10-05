"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <div className="wrap empty-state"><h1 className="page-title">We couldn’t load this page.</h1><p className="body-copy">Please try again in a moment.</p><button type="button" className="button" onClick={reset}>Try Again</button></div>;
}
