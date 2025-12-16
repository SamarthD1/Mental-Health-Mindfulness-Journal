import './Components.css'

export const SkeletonText = ({ width = '100%', lines = 1 }) => {
    return (
        <div style={{ width }}>
            {Array.from({ length: lines }).map((_, i) => (
                <div key={i} className="skeleton skeleton-text" />
            ))}
        </div>
    )
}

export const SkeletonTitle = ({ width = '60%' }) => {
    return <div className="skeleton skeleton-title" style={{ width }} />
}

export const SkeletonCard = () => {
    return <div className="skeleton skeleton-card" />
}
