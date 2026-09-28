'use client';

// Path: @yotpo/components/review-form.tsx
//
// "Write A Review" trigger + modal. Uses the native <dialog> element (focus trap, Esc to close,
// backdrop, inert page behind it) so it needs no extra UI dependency.
// Posts to /api/yotpo/reviews, which validates and forwards to Yotpo.

import { useRef, useState } from 'react';

import { Star } from './star';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const inputClass =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-black placeholder:text-neutral-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black';

export function WriteReviewButton({
  handle,
  productTitle
}: {
  handle: string;
  productTitle: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);

  function open() {
    setStatus('idle');
    setError(null);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === 'submitting') return;

    if (score < 1) {
      setError('Choose a star rating.');
      return;
    }

    const form = new FormData(e.currentTarget);
    setStatus('submitting');
    setError(null);

    try {
      const res = await fetch('/api/yotpo/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          score,
          name: form.get('name'),
          email: form.get('email'),
          title: form.get('title'),
          content: form.get('content'),
          website: form.get('website') // honeypot, real users leave it empty
        })
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('error');
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setStatus('success');
      setScore(0);
      e.currentTarget.reset();
    } catch {
      setStatus('error');
      setError('Network error. Check your connection and try again.');
    }
  }

  const shown = hoverScore || score;

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="whitespace-nowrap rounded-full bg-black px-6 py-3 text-xs font-bold text-white hover:opacity-85"
      >
        Write A Review
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => {
          // Clicking the backdrop (the dialog element itself) closes it.
          if (e.target === dialogRef.current) close();
        }}
        aria-labelledby="yotpo-review-title"
        className="m-auto w-[min(92vw,32rem)] rounded-xl bg-white p-0 text-black shadow-xl backdrop:bg-black/50"
      >
        <div className="p-6 font-sans">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 id="yotpo-review-title" className="text-lg font-bold">
                Write a review
              </h2>
              <p className="mt-0.5 text-sm text-neutral-500">{productTitle}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mr-2 -mt-1 rounded-md p-2 text-neutral-500 hover:text-black"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                <path
                  d="M4 4l12 12M16 4L4 16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </button>
          </div>

          {status === 'success' ? (
            <div className="py-6 text-center">
              <p className="text-base font-bold">Thanks for your review.</p>
              <p className="mt-1 text-sm text-neutral-500">
                It will appear on this page once it has been approved.
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-5 rounded-full bg-black px-6 py-3 text-xs font-bold text-white hover:opacity-85"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4" noValidate>
              <fieldset>
                <legend className="mb-1.5 text-sm font-bold">Your rating</legend>
                <div className="flex gap-1" onMouseLeave={() => setHoverScore(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <label
                      key={n}
                      className="cursor-pointer rounded p-0.5 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-black"
                      onMouseEnter={() => setHoverScore(n)}
                    >
                      <input
                        type="radio"
                        name="score"
                        value={n}
                        checked={score === n}
                        onChange={() => setScore(n)}
                        className="sr-only"
                        aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                      />
                      <Star filled={n <= shown} className="h-7 w-7" />
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="grid gap-1.5">
                <label htmlFor="yotpo-title" className="text-sm font-bold">
                  Review title
                </label>
                <input
                  id="yotpo-title"
                  name="title"
                  type="text"
                  maxLength={100}
                  required
                  placeholder="Sum it up in a few words"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-1.5">
                <label htmlFor="yotpo-content" className="text-sm font-bold">
                  Your review
                </label>
                <textarea
                  id="yotpo-content"
                  name="content"
                  rows={5}
                  minLength={10}
                  maxLength={2000}
                  required
                  placeholder="What did you like or dislike? How did you use it?"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <label htmlFor="yotpo-name" className="text-sm font-bold">
                    Name
                  </label>
                  <input
                    id="yotpo-name"
                    name="name"
                    type="text"
                    maxLength={60}
                    autoComplete="name"
                    required
                    className={inputClass}
                  />
                </div>
                <div className="grid gap-1.5">
                  <label htmlFor="yotpo-email" className="text-sm font-bold">
                    Email
                  </label>
                  <input
                    id="yotpo-email"
                    name="email"
                    type="email"
                    maxLength={254}
                    autoComplete="email"
                    required
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Honeypot: hidden from people, tempting to bots. */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="yotpo-website">Website</label>
                <input id="yotpo-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              <p className="text-xs text-neutral-500">
                Your email is used only to verify your review and is never shown.
              </p>

              {error ? (
                <p role="alert" className="text-sm font-bold text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  className="rounded-full px-5 py-3 text-xs font-bold text-neutral-600 hover:text-black"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="rounded-full bg-black px-6 py-3 text-xs font-bold text-white hover:opacity-85 disabled:opacity-50"
                >
                  {status === 'submitting' ? 'Submitting…' : 'Submit review'}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
