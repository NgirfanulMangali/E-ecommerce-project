function Newsletter() {
  return (
    <div className="rounded-[20px] bg-black p-6 sm:p-8">
      <h2 className="max-w-[280px] text-[28px] font-bold uppercase leading-[1.15] tracking-tight text-white sm:text-[32px]">
        Stay upto date about our latest offers
      </h2>
      <div className="mt-6 flex flex-col gap-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            type="email"
            placeholder="Enter your email address"
            className="h-12 w-full rounded-full bg-white pl-12 pr-5 text-sm text-black outline-none placeholder:text-black/40"
          />
        </div>
        <button
          type="button"
          className="h-12 w-full rounded-full bg-white text-sm font-medium text-black"
        >
          Subscribe to Newsletter
        </button>
      </div>
    </div>
  );
}

export default Newsletter;
