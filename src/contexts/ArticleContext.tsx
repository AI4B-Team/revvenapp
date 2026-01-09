import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface Article {
  id: number;
  title: string;
  description: string;
  wordCount: number;
  status: 'draft' | 'published' | 'generating';
  createdAt: string;
  updatedAt: string;
  articleType: string;
  tags: string[];
  progress: number;
  content?: string;
  coverImage?: string;
  tone?: string;
  style?: string;
}

interface ArticleContextType {
  articles: Article[];
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>;
  updateArticle: (id: number, updates: Partial<Article>) => void;
  addArticle: (article: Article) => void;
  deleteArticle: (id: number) => void;
  getArticle: (id: number) => Article | undefined;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

const INITIAL_ARTICLES: Article[] = [
  { 
    id: 1, 
    title: 'The Ultimate Guide to AI Marketing', 
    description: 'A comprehensive guide to leveraging AI in your marketing strategy', 
    wordCount: 4500, 
    status: 'published', 
    createdAt: '2025-12-15', 
    updatedAt: '2025-12-17', 
    articleType: 'Ultimate Guide',
    tags: ['Marketing', 'AI', 'Business'], 
    progress: 100,
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=300&fit=crop'
  },
  { 
    id: 2, 
    title: 'Top 10 Social Media Strategies for 2025', 
    description: 'Discover the most effective social media tactics for growing your brand', 
    wordCount: 2800, 
    status: 'draft', 
    createdAt: '2025-12-10', 
    updatedAt: '2025-12-18', 
    articleType: 'Listicle',
    tags: ['Social Media', 'Marketing'], 
    progress: 75,
    coverImage: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=300&fit=crop'
  },
  { 
    id: 3, 
    title: 'How We Increased Conversions by 300%', 
    description: 'A detailed case study on our conversion optimization journey', 
    wordCount: 3200, 
    status: 'generating', 
    createdAt: '2025-12-18', 
    updatedAt: '2025-12-19', 
    articleType: 'Case Study',
    tags: ['Case Study', 'Conversions'], 
    progress: 45,
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=300&fit=crop'
  },
  { 
    id: 4, 
    title: 'The Future of Content Creation', 
    description: 'Exploring how AI is reshaping content creation for businesses', 
    wordCount: 1800, 
    status: 'draft', 
    createdAt: '2025-12-05', 
    updatedAt: '2025-12-16', 
    articleType: 'Thought Leadership',
    tags: ['AI', 'Content', 'Future'], 
    progress: 60,
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=300&fit=crop'
  },
  { 
    id: 5, 
    title: 'SEO Best Practices for 2025', 
    description: 'Everything you need to know about optimizing your content for search engines', 
    wordCount: 5200, 
    status: 'published', 
    createdAt: '2025-11-20', 
    updatedAt: '2025-12-01', 
    articleType: 'Blog Post',
    tags: ['SEO', 'Marketing'], 
    progress: 100,
    coverImage: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=300&fit=crop'
  }
];

export const ArticleProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);

  const updateArticle = useCallback((id: number, updates: Partial<Article>) => {
    setArticles(prev => prev.map(article => 
      article.id === id ? { ...article, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : article
    ));
  }, []);

  const addArticle = useCallback((article: Article) => {
    setArticles(prev => [article, ...prev]);
  }, []);

  const deleteArticle = useCallback((id: number) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  }, []);

  const getArticle = useCallback((id: number) => {
    return articles.find(article => article.id === id);
  }, [articles]);

  return (
    <ArticleContext.Provider value={{ articles, setArticles, updateArticle, addArticle, deleteArticle, getArticle }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = () => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};
