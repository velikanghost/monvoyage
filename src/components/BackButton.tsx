interface BackButtonProps {
  onClick: () => void
}

export function BackButton({ onClick }: BackButtonProps) {
  return (
    <button className="backBtn" onClick={onClick}>
      ← Back to Categories
    </button>
  )
}
