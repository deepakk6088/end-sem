export default function Toast({ toast, onClose }) {
  if (!toast) return null

  return (
    <div className={`toast-banner ${toast.type || 'info'}`} role="status">
      <p>{toast.message}</p>
      <button className="toast-close" onClick={onClose} type="button">
        ×
      </button>
    </div>
  )
}
