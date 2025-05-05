import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ScraperResult } from '../typing';
import './index.css';

const ApiHost = '//localhost:9080';

const ArticleList: React.FC = () => {
  const [articles, setArticles] = useState<ScraperResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch(`${ApiHost}/coinbase/listResults`);
        if (!response.ok) {
          throw new Error('获取文章列表失败');
        }
        const data = await response.json();
        setArticles(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return <div className="loading">加载中</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className="container">
      <h1 className="page-title">文章列表</h1>
      <div className="article-list">
        {articles.map((article, index) => (
          <div key={article.id} className="article-item">
            <div className="article-number">{index + 1}</div>
            <div className="article-content">
              <h2 className="article-title">{article.title}</h2>
              <div className="article-meta">
                {article.author && (
                  <span className="article-author">{article.author}</span>
                )}
                {article.date && (
                  <span className="article-date">{article.date}</span>
                )}
              </div>
              {article.summary && (
                <p className="article-summary">{article.summary}</p>
              )}
            </div>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="article-link"
            >
              查看详情
            </a>
          </div>
        ))}
      </div>
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

