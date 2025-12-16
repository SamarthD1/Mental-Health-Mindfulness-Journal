import { ExternalLink, LogOut, Phone } from 'lucide-react'
import './Pages.css'
import './Crisis.css'

const resources = [
    {
        name: 'Tele MANAS (Govt of India)',
        number: '14416',
        altNumber: '1800-891-4416',
        description: '24/7 free tele-mental health counseling.',
        website: 'https://telemanas.mohfw.gov.in/',
    },
    {
        name: 'Vandrevala Foundation',
        number: '1860-266-2345',
        altNumber: '1800-233-3330',
        description: 'Free confidential counseling and support.',
        website: 'https://www.vandrevalafoundation.com/',
    },
    {
        name: 'AASRA',
        number: '+91 98204 66726',
        description: '24/7 helpline for those in emotional distress.',
        website: 'http://www.aasra.info/',
    },
    {
        name: 'iCall',
        number: '+91 91529 87821',
        description: 'Psychosocial helpline by TISS.',
        website: 'https://icallhelpline.org/',
    },
    {
        name: 'Emergency Services',
        number: '112',
        description: 'National Emergency Number for Police, Fire, and Ambulance.',
        website: null,
    },
]

const CrisisSupport = () => {
    const handleQuickExit = () => {
        // Redirect to a safe website and replace history to prevent back button
        window.location.replace('https://www.google.com/search?q=weather')
    }

    return (
        <section className="page">
            <div className="card crisis-card">
                <div className="crisis-header">
                    <div>
                        <h1 className="crisis-title">Crisis Support</h1>
                        <p className="muted">
                            If you are feeling overwhelmed or hopeless, please know that you are not alone.
                            Help is available.
                        </p>
                    </div>
                    <button
                        className="quick-exit-button"
                        onClick={handleQuickExit}
                        title="Quickly leave this page"
                    >
                        <LogOut size={20} />
                        Quick Exit
                    </button>
                </div>

                <div className="resource-list">
                    {resources.map((resource) => (
                        <div key={resource.name} className="resource-item">
                            <div className="resource-content">
                                <h3 className="resource-name">{resource.name}</h3>
                                <p className="muted">{resource.description}</p>
                            </div>
                            <div className="resource-actions">
                                <a href={`tel:${resource.number}`} className="btn-action btn-phone">
                                    <Phone size={16} />
                                    <span>{resource.number}</span>
                                </a>
                                {resource.altNumber && (
                                    <a href={`tel:${resource.altNumber}`} className="btn-action btn-phone">
                                        <Phone size={16} />
                                        <span>{resource.altNumber}</span>
                                    </a>
                                )}
                                {resource.website && (
                                    <a
                                        href={resource.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-action btn-website"
                                    >
                                        <ExternalLink size={16} />
                                        <span>Visit Website</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}


export default CrisisSupport
