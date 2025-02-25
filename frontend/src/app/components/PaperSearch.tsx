import React, { useState } from 'react';
import { searchPapers } from '../utils/api';
import { Paper } from '../types';

interface PaperSearchProps {
  onSelectPaper: (paper: Paper) => void;
}

const PaperSearch: React.FC<PaperSearchProps> = ({ onSelectPaper }) => {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await searchPapers(query);
      setPapers(result.papers || []);
    } catch (err) {
      setError('Failed to search papers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 rounded-lg mb-4">
      <h2 className="text-xl font-bold mb-4 text-neon-green">Search Papers</h2>
      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Search for AI research papers..."
          className="flex-1 p-2 bg-black border border-gray-700 rounded-md text-white focus:border-neon-green focus:outline-none"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-neon-green text-black font-medium rounded-md hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {error && (
        <div className="p-3 mb-4 bg-red-900 text-white rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {papers.map((paper) => (
          <div 
            key={paper.id}
            onClick={() => onSelectPaper(paper)}
            className="p-3 bg-black border border-gray-800 rounded-md hover:border-neon-green cursor-pointer"
          >
            <h3 className="font-medium text-white">{paper.title}</h3>
            <p className="text-gray-400 text-sm">
              {paper.authors.join(', ')} • {paper.published}
            </p>
          </div>
        ))}
        
        {papers.length === 0 && !loading && (
          <div className="text-center text-gray-500 py-4">
            No papers found. Try a different search.
          </div>
        )}
      </div>
    </div>
  );
};

export default PaperSearch;