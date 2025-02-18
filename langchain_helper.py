
import os
import logging
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_huggingface import HuggingFaceEndpoint
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Load environment variables
load_dotenv()


def initialize_llm():
    """Initialize the Llama 2 model with error handling"""
    try:
        # Get Hugging Face API token from environment variables
        huggingface_token = os.environ.get("HUGGINGFACE_API_TOKEN")
        if not huggingface_token:
            logging.error(
                "HUGGINGFACEHUB_API_TOKEN not found in environment variables")
            return None

        # Initialize HuggingFace Endpoint with Llama 2
        llm = HuggingFaceEndpoint(repo_id="meta-llama/Llama-2-70b-chat-hf",
                                  huggingfacehub_api_token=huggingface_token,
                                  task="text-generation",
                                  temperature=0.7,
                                  max_new_tokens=2048,
                                  top_p=0.9)
        logging.info("Successfully initialized Llama 2 model")
        return llm
    except Exception as e:
        logging.error(f"Failed to initialize Llama 2 model: {str(e)}")
        return None


# Initialize the LLM
llm = initialize_llm()
memory = ConversationBufferMemory()
current_paper_id = None


def analyze_paper(content: str, question: str, paper_id: str = None) -> dict:
    """Analyze paper content based on user question"""
    try:
        global current_paper_id, memory, llm

        # If LLM is not initialized, try initializing it again
        if llm is None:
            llm = initialize_llm()
            if llm is None:
                return {
                    "error":
                    "Unable to initialize the language model. Please try again later.",
                    "chat_history": []
                }

        # Reset memory if paper_id changes
        if paper_id != current_paper_id:
            memory = ConversationBufferMemory()
            current_paper_id = paper_id

        # Create conversation chain
        chain = ConversationChain(llm=llm, memory=memory, verbose=True)

        # Generate response
        response = chain.predict(
            input=f"Paper Content: {content}\nQuestion: {question}")

        # Get chat history
        chat_history = []
        for message in memory.chat_memory.messages:
            chat_history.append({
                "type":
                "human" if isinstance(message, HumanMessage) else "ai",
                "content":
                message.content
            })

        return {"response": response, "chat_history": chat_history}
    except Exception as e:
        logging.error(f"Error analyzing paper: {str(e)}")
        return {"error": f"Analysis failed: {str(e)}", "chat_history": []}


def generate_code_example(content: str) -> str:
    """Generate code example based on paper concepts"""
    try:
        if llm is None:
            return "Error: Language model is not initialized. Please try again later."

        prompt = """Based on the paper's content, generate a Python code example that implements 
        or demonstrates the main concept or algorithm described. Focus on clarity and include comments.
        Paper content: {content}"""

        response = llm(prompt.format(content=content))
        return response
    except Exception as e:
        logging.error(f"Error generating code example: {str(e)}")
        return f"Error generating code example: {str(e)}"
