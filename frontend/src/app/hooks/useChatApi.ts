import { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

export const useChatApi = () => {
  const { addMessage, currentPaper, setLoading } = useChatContext();
  const [error, setError] = useState<string | null>(null);

  const analyzeWithAI = async (question: string) => {
    if (!currentPaper) {
      setError('Please select a paper first');
      return;
    }

    setLoading(true);
    addMessage(question, 'human');

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: currentPaper.content,
          question,
          paper_id: currentPaper.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze paper');
      }

      const data = await response.json();
      addMessage(data.response, 'ai');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      addMessage('Sorry, I encountered an error analyzing this paper.', 'ai');
    } finally {
      setLoading(false);
    }
  };

  return {
    analyzeWithAI,
    error,
    setError,
  };
};