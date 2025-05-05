import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ScraperResult } from '../typing';
import './index.css';

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<ScraperResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }
        const data = await response.json();
        setArticles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className="article-list">
      <h1>文章列表</h1>
      {articles.map((article) => (
        <div key={article.id} className="article-card">
          <h2>{article.title}</h2>
          {article.date && <p className="date">发布日期: {article.date}</p>}
          {article.summary && <p className="summary">{article.summary}</p>}
          <a href={article.link} target="_blank" rel="noopener noreferrer" className="read-more">
            阅读更多
          </a>
        </div>
      ))}
    </div>
  );
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ArticleList />
  </React.StrictMode>
);

