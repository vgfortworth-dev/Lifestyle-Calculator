type InfoButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

export function InfoButton({ label, onClick, className = '' }: InfoButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onKeyDown={(event) => event.stopPropagation()}
      className={`absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-sm font-black text-[#3372B2] transition-all hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-200 ${className}`}
      aria-label={label}
    >
      i
    </button>
  );
}
