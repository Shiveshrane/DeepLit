export interface Paper {
    id: string;
    title: string;
    authors: string[];
    published: string;
    abstract: string;
    url: string;
  }
  
  export interface PaperContent {
    id: string;
    title: string;
    authors: string[];
    content: string;
    paper_summary?: string;
    url: string;
    published: string;
    error: boolean;
  }
  
  export interface ChatMessage {
    id: string;
    type: 'human' | 'ai';
    content: string;
    timestamp: string;
  }
  
  export interface Conversation {
    id: string;
    title: string;
    paperId?: string;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
  }