export const searchPapers = async (query: string) => {
    try {
      const response = await fetch(`/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to search papers');
      }
      return await response.json();
    } catch (error) {
      console.error('Error searching papers:', error);
      throw error;
    }
  };
  
  export const fetchPaperContent = async (paperId: string) => {
    try {
      const response = await fetch(`/paper/${paperId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch paper content');
      }
      // Parse the HTML response to extract paper data
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract paper data from the HTML
      // This is simplified - you'll need to adapt this based on your actual HTML structure
      const paperData = {
        id: paperId,
        title: doc.querySelector('.paper-title')?.textContent || 'Unknown Title',
        authors: Array.from(doc.querySelectorAll('.paper-author')).map(el => el.textContent || ''),
        content: doc.querySelector('.paper-content')?.textContent || 'No content available',
        url: doc.querySelector('.paper-url')?.getAttribute('href') || '',
        published: doc.querySelector('.paper-date')?.textContent || 'Unknown Date',
        error: false
      };
      
      return paperData;
    } catch (error) {
      console.error('Error fetching paper content:', error);
      throw error;
    }
  };