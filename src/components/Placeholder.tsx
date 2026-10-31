type PlaceholderProps = {
  kind: "person" | "image" | "craft"
  label: string
}

export function Placeholder({ kind, label }: PlaceholderProps) {
  return (
    <div className={`placeholder ${kind}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" width="36" height="36" role="img">
        <title>{label}</title>
        {kind === "person" ? (
          <>
            <circle cx="32" cy="22" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M14 54c2-12 10-16 18-16s16 4 18 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </>
        ) : (
          <>
            <rect x="8" y="12" width="48" height="36" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M8 40l14-12 10 8 8-6 16 14" fill="none" stroke="currentColor" strokeWidth="2" />
          </>
        )}
      </svg>
    </div>
  )
}
