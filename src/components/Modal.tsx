interface ModalProps {
  visible: boolean
  title: string
  text: string
  logo?: string
  banner?: string
  siteLink?: string | null
  socialLinks?: string[]
  onClose: () => void
}

export function Modal({
  visible,
  title,
  text,
  logo,
  banner,
  siteLink,
  socialLinks = [],
  onClose,
}: ModalProps) {
  if (!visible) return null

  return (
    <div className="modal show">
      <button className="closeModal" onClick={onClose}>
        ×
      </button>
      {banner && (
        <img
          src={banner}
          alt={`${title} banner`}
          className="modalBanner"
          style={{
            width: '100%',
            height: '120px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '16px',
          }}
        />
      )}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        {logo && (
          <img
            src={logo}
            alt={`${title} logo`}
            className="modalLogo"
            style={{ width: '48px', height: '48px', borderRadius: '8px' }}
          />
        )}
        <h2 className="modalTitle" style={{ margin: 0 }}>
          {title}
        </h2>
      </div>
      <p className="modalText">{text}</p>
      {(siteLink || socialLinks.length > 0) && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {siteLink && (
            <a
              href={siteLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 16px',
                background: '#836EF9',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Visit Site
            </a>
          )}
          {socialLinks.map((link, idx) => (
            <a
              key={idx}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '8px 12px',
                background: '#f0f0f0',
                color: '#333',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '14px',
              }}
            >
              Social
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
