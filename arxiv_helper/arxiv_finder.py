import arxiv
import logging
import requests
from io import BytesIO
import PyPDF2

def search_papers(query, max_results=5):
    try:
        search=arxiv.Search(
            query=f"{query} AND (cat:cs.AI OR cat:cs.LG OR cat:stat.ML)",
            max_results=max_results,
            sort_by=arxiv.SortCriterion.Relevance,
            sort_order=arxiv.SortOrder.Descending)
        papers=[]
        for result in search.results():
            papers.append({
                "id":result.entry_id.split("/")[-1],
                "title":result.title,
                "authors":[author.name for author in result.authors],
                "published":result.published.strftime("%Y-%m-%d"),
                "abstract":result.summary,
                "url":result.pdf_url
            })
        return papers
    except Exception as e:
        logging.error(f"Arxiv search error :{str(e)}")
        raise


def extract_paper_content(paper_id):
    try:
        search=arxiv.Search( 
            id_list=[paper_id]
        )
        response=None
        paper=next(search.results())

        pdf_url=paper.pdf_url
        if pdf_url is not None:
            response = requests.get(pdf_url)
        if response is None or response.status_code!=200:
            return{
                'id':paper_id,
                'title':paper.title,
                'authors':[author.name for author in paper.authors],
                'content':f"<h3>Paper Summary</h3><p>{paper.summary}</p> <div class='alert alert-danger' role='alert'><strong>Failed to download the full paper content.You can still read the summary or access the pdf directly</strong></div>",
                'url':pdf_url,
                'published':paper.published.strftime("%Y-%m-%d"),
                'error':False
            }
        try:
            pdf_file = BytesIO(response.content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            content = ""
            for page in pdf_reader.pages:
                content += page.extract_text()+ "\n"
            if not content.strip():
                return {
                    'id':paper_id,
                    'title':paper.title,
                    'authors':[author.name for author in paper.authors],
                    'content':(f"<h3>Paper Summary</h3><p>{paper.summary}</p><div class='alert alert-warning' role='alert'><strong>Failed to extract text content from PDF.You can still read the summary or access the pdf directly</strong></div>"),
                    'url':pdf_url,
                    'published':paper.published.strftime("%Y-%m-%d"),
                    'error':False
                }
            return {
                'id':paper_id,
                'title':paper.title,
                'authors':[author.name for author in paper.authors],
                'content':content,
                'paper_summary':paper.summary,
                'url':pdf_url,
                'published':paper.published.strftime("%Y-%m-%d"),
                'error':False
            }
        except Exception as e:
            logging.error(f"Error extracting content from PDF: {str(e)}")
            return None
    except Exception as e:
        logging.error(f"Error extracting paper content: {str(e)}")
        return None
                