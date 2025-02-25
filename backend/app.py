import logging.config
from flask import Flask, jsonify, request, render_template
from arxiv_helper import search_papers, extract_paper_content
from langchain_helper import analyze_paper
import os
import logging

logging.basicConfig(level=logging.DEBUG)
app=Flask(__name__) 
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "ai_research_assistant_key")
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search')
def search():
    query = request.args.get('query')
    if not query:
        return jsonify({"papers":[]})
    try:
        papers = search_papers(query)
        return jsonify({"papers":papers})
    except Exception as e:
        logging.error(f"Error in search: {str(e)}")
        return jsonify({"error":str(e)})

@app.route('/paper/<paper_id>')
def paper(paper_id):
    try:
        paper = extract_paper_content(paper_id)
        if paper is None:
            return render_template('index.html', error='Failed to fetch paper')
        return render_template('paper.html', paper=paper)
    except Exception as e:
        logging.error(f"Paper fetch error: {str(e)}")
        return render_template('index.html', error='Failed to fetch paper')

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        paper_content = data.get('content')
        question = data.get('question')
        paper_id = data.get('paper_id')

        if not all([paper_content, question]):
            return jsonify({'error': 'Missing required fields'}), 400

        result = analyze_paper(paper_content, question, paper_id)
        if 'error' in result:
            return jsonify(result), 500
        return jsonify(result)
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        return jsonify({'error': 'Failed to analyze paper'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)


