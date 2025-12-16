import { useToast } from '../context/ToastContext.jsx'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import './Components.css'
import { useEffect } from 'react'

const Toast = ({ id, message, type, title }) => {
    const { removeToast } = useToast()

    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(id)
        }, 4000)
        return () => clearTimeout(timer)
    }, [id, removeToast])

    const icons = {
        success: <CheckCircle2 size={20} color="var(--primary-600)" />,
        error: <AlertCircle size={20} color="#ef4444" />,
        info: <Info size={20} color="var(--secondary-600)" />,
    }

    return (
        <div className={`toast ${type}`}>
            <div className="toast-icon">{icons[type]}</div>
            <div className="toast-content">
                {title && <div className="toast-title">{title}</div>}
                <div className="toast-message">{message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(id)}>
                <X size={16} />
            </button>
        </div>
    )
}

export const ToastContainer = () => {
    const { toasts } = useToast()

    if (toasts.length === 0) return null

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast key={toast.id} {...toast} />
            ))}
        </div>
    )
}
