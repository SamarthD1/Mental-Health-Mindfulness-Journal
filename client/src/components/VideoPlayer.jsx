export const VideoPlayer = ({ url }) => {
    const getEmbedUrl = (url) => {
        try {
            const videoId = url.split('v=')[1]?.split('&')[0]
            if (!videoId) return url
            return `https://www.youtube.com/embed/${videoId}`
        } catch {
            return url
        }
    }

    return (
        <div className="video-player-container">
            <iframe
                width="100%"
                height="100%"
                src={getEmbedUrl(url)}
                title="Mindfulness Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    )
}
