# import logging.config
# from flask import Flask, jsonify, request, render_template
# from arxiv_helper import search_papers, extract_paper_content
# from langchain_helper import analyze_paper
# import os
# import logging

# logging.basicConfig(level=logging.DEBUG)
# app=Flask(__name__) 
# app.secret_key = os.environ.get("FLASK_SECRET_KEY", "ai_research_assistant_key")
# @app.route('/')
# def index():
#     return render_template('index.html')

# @app.route('/search')
# def search():
#     query = request.args.get('query')
#     if not query:
#         return jsonify({"papers":[]})
#     try:
#         papers = search_papers(query)
#         return jsonify({"papers":papers})
#     except Exception as e:
#         logging.error(f"Error in search: {str(e)}")
#         return jsonify({"error":str(e)})

# @app.route('/paper/<paper_id>')
# def paper(paper_id):
#     try:
#         paper = extract_paper_content(paper_id)
#         if paper is None:
#             return render_template('index.html', error='Failed to fetch paper')
#         return render_template('paper.html', paper=paper)
#     except Exception as e:
#         logging.error(f"Paper fetch error: {str(e)}")
#         return render_template('index.html', error='Failed to fetch paper')

# @app.route('/analyze', methods=['POST'])
# def analyze():
#     try:
#         data = request.json
#         if not data:
#             return jsonify({'error': 'No data provided'}), 400

#         paper_content = data.get('content')
#         question = data.get('question')
#         paper_id = data.get('paper_id')

#         if not all([paper_content, question]):
#             return jsonify({'error': 'Missing required fields'}), 400

#         result = analyze_paper(paper_content, question, paper_id)
#         if 'error' in result:
#             return jsonify(result), 500
#         return jsonify(result)
#     except Exception as e:
#         logging.error(f"Analysis error: {str(e)}")
#         return jsonify({'error': 'Failed to analyze paper'}), 500

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)


import streamlit as st
import logging
import os
from dotenv import load_dotenv

# Import existing functions from modules
from arxiv_helper import search_papers, extract_paper_content
from langchain_helper import analyze_paper, generate_code_example

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()

# Set page config
st.set_page_config(
    page_title="AI Research Assistant",
    page_icon="📚",
    layout="wide"
)

# Initialize session state variables
if 'paper_content' not in st.session_state:
    st.session_state.paper_content = None
if 'current_paper_id' not in st.session_state:
    st.session_state.current_paper_id = None
if 'conversation' not in st.session_state:
    st.session_state.conversation = []
if 'papers' not in st.session_state:
    st.session_state.papers = []

# Modified analyze function to only return clean Q&A
def analyze_paper_for_streamlit(content, question, paper_id=None):
    """Wrapper around analyze_paper that only returns clean Q&A"""
    result = analyze_paper(content, question, paper_id)
    
    if 'error' in result:
        return {'error': result['error']}
    
    # Extract just the response without the paper context
    return {'response': result['response']}

# Sidebar for search
with st.sidebar:
    st.title("AI Research Assistant")
    st.write("Search for AI research papers on arXiv")
    
    search_query = st.text_input("Search Query", placeholder="e.g., transformers, reinforcement learning")
    
    if st.button("Search"):
        with st.spinner("Searching arXiv..."):
            try:
                st.session_state.papers = search_papers(search_query)
                if not st.session_state.papers:
                    st.error("No papers found. Try a different search term.")
            except Exception as e:
                st.error(f"Error searching papers: {str(e)}")
    
    # Display search results
    if st.session_state.papers:
        st.subheader("Search Results")
        for i, paper in enumerate(st.session_state.papers):
            if st.button(f"{paper['title'][:50]}...", key=f"paper_{i}"):
                with st.spinner("Loading paper..."):
                    try:
                        paper_data = extract_paper_content(paper['id'])
                        if paper_data:
                            st.session_state.paper_content = paper_data
                            st.session_state.current_paper_id = paper['id']
                            st.session_state.conversation = []  # Reset conversation for new paper
                    except Exception as e:
                        st.error(f"Error loading paper: {str(e)}")

# Main content area
if st.session_state.paper_content:
    paper = st.session_state.paper_content
    
    # Paper details
    st.title(paper['title'])
    st.write(f"**Authors:** {', '.join(paper['authors'])}")
    st.write(f"**Published:** {paper['published']}")
    st.write(f"**PDF:** [View Original]({paper['url']})")
    
    # Tabs for different views
    tab1, tab2 = st.tabs(["Summary", "AI Assistant"])
    
    with tab1:
        st.subheader("Abstract")
        if 'paper_summary' in paper:
            st.write(paper['paper_summary'])
        else:
            abstract = paper.get('content', 'No summary available')
            if len(abstract) > 1000:
                abstract = abstract[:1000] + "..."
            st.write(abstract)
    
    with tab2:
        st.subheader("Ask Questions About This Paper")
        user_question = st.text_input("Your question", placeholder="e.g., What is the main contribution of this paper?")
        
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Ask"):
                if user_question:
                    with st.spinner("Analyzing paper..."):
                        try:
                            result = analyze_paper_for_streamlit(paper['content'], user_question, paper['id'])
                            if 'error' in result:
                                st.error(result['error'])
                            else:
                                # Add to conversation history
                                st.session_state.conversation.append({
                                    "type": "question",
                                    "content": user_question
                                })
                                st.session_state.conversation.append({
                                    "type": "answer",
                                    "content": result['response']
                                })
                        except Exception as e:
                            st.error(f"Error analyzing paper: {str(e)}")
        
        with col2:
            if st.button("Generate Code Example"):
                with st.spinner("Generating code example..."):
                    try:
                        code = generate_code_example(paper['content'])
                        st.session_state.code_example = code
                    except Exception as e:
                        st.error(f"Error generating code: {str(e)}")
        
        # Display clean conversation history (just Q&A without paper context)
        st.subheader("Conversation")
        for msg in st.session_state.conversation:
            if msg['type'] == 'question':
                st.markdown(f"**You:** {msg['content']}")
            else:
                st.markdown(f"**AI:** {msg['content']}")
        
        # Display code example if generated
        if 'code_example' in st.session_state:
            st.subheader("Code Example")
            st.code(st.session_state.code_example, language="python")
else:
    # Landing page
    st.title("AI Research Assistant")
    st.markdown("""
    ## Welcome to the AI Research Assistant
    
    This application helps you find, read, and understand AI research papers from arXiv.
    
    ### Features:
    - Search for papers in AI, Machine Learning, and related fields
    - Read paper summaries
    - Ask questions about papers and get AI-powered explanations
    - Generate code examples based on paper concepts
    
    ### Get Started:
    1. Enter a search term in the sidebar
    2. Click on a paper to view it
    3. Use the AI Assistant tab to ask questions
    """)

if __name__ == "__main__":
    # This part won't be executed when running with streamlit run command
    pass