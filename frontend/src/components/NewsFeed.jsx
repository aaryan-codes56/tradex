import { useState, useEffect } from 'react';
import axios from 'axios';
import './NewsFeed.css';

const NewsFeed = () => {
    const [news, setNews] = useState([]);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const { data } = await axios.get('http://localhost:5001/api/market/news');
                setNews(data);
            } catch (error) {
                console.error('Error fetching news', error);
            }
        };

        fetchNews();
    }, []);

    return (
        <div className="news-feed-card">
            <div className="news-header">
                <h3>📰 Market News</h3>
            </div>
            <div className="news-list">
                {news.map((item) => (
                    <a key={item.id} href={item.url} className="news-item" onClick={(e) => e.preventDefault()}>
                        <div className="news-content">
                            <h4>{item.title}</h4>
                            <div className="news-meta">
                                <span className="news-source">{item.source}</span>
                                <span className="news-dot">•</span>
                                <span className="news-time">{item.time}</span>
                            </div>
                        </div>
                        <div className={`news-sentiment sentiment-${item.sentiment.toLowerCase()}`}>
                            {item.sentiment}
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default NewsFeed;
