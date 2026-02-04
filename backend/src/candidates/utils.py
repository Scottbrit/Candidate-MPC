from pypdf import PdfReader
import re
import io
import random
import string

def read_pdf_file(pdf_bytes: bytes, clean_text: bool = True) -> str:
    """
    Extract text content from a PDF file.
    
    Args:
        pdf_bytes: PDF file content as bytes
        clean_text: Whether to clean the extracted text (remove extra whitespace)
    
    Returns:
        Extracted text content as string
        
    Raises:
        ValueError: If PDF bytes are invalid or empty
        Exception: If PDF processing fails
    """

    if not pdf_bytes:
        raise ValueError("PDF bytes cannot be empty")
    
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PdfReader(pdf_file)
        
        if not pdf_reader.pages:
            return ""
        
        # Extract text from all pages
        content_parts = []
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                content_parts.append(page_text)
        
        content = "\n".join(content_parts)

        if clean_text:
            content = _clean_text(content)

        return content
    
    except Exception as e:
        raise Exception(f"Failed to process PDF: {str(e)}")

def read_fathom_pdf_file(pdf_bytes: bytes) -> str:
    """
    Extract text content from a Fathom PDF file.
    
    This is a specialized function for Fathom PDFs that maintains
    the original text formatting without cleaning.
    
    Args:
        pdf_bytes: PDF file content as bytes
    
    Returns:
        Extracted text content as string
        
    Raises:
        ValueError: If PDF bytes are invalid or empty
        Exception: If PDF processing fails
    """
    return read_pdf_file(pdf_bytes, clean_text=False)

def read_ashby_pdf_file(pdf_bytes: bytes) -> str:
    return read_pdf_file(pdf_bytes, clean_text=True)

def _clean_text(text: str) -> str:
    """
    Clean extracted text by normalizing whitespace.
    
    Args:
        text: Raw text to clean
    
    Returns:
        Cleaned text with normalized whitespace
    """
    if not text:
        return ""
    
    # Replace newlines with spaces and normalize multiple spaces
    cleaned = re.sub(r'\s+', ' ', text)
    return cleaned.strip()

def generate_random_chars(length: int):
    return ''.join(random.choices(string.ascii_letters + string.digits, k=length)).upper()