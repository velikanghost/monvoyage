interface ModalProps {
  visible: boolean
  title: string
  text: string
  onClose: () => void
}

export function Modal({ visible, title, text, onClose }: ModalProps) {
  if (!visible) return null

  return (
    <div className="modal show">
      <button className="closeModal" onClick={onClose}>
        ×
      </button>
      <h2 className="modalTitle">{title}</h2>
      <p className="modalText">{text}</p>
    </div>
  )
}
