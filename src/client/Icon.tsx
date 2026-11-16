/** Original line icon; host owns sidebar row geometry, color and selection. */
export function SkillIcon({ size = 24 }: { size?: number; active?: boolean }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5.5C9 3.8 5.5 3.7 3 4.5v14c3-.8 6.5-.5 9 1 2.5-1.5 6-1.8 9-1v-14c-2.5-.8-6-.7-9 1Z" />
      <path d="M12 5.5v14M6 8h3M6 11h3M15 8h3M15 11h3" />
    </svg>
  )
}
