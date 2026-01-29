import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedResume {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pages?: number;
  };
}

/**
 * Extract text from PDF file
 */
export async function extractTextFromPDF(file: File): Promise<ParsedResume> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    const metadata = await pdf.getMetadata();

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    const info = (metadata?.info || {}) as any;
    return {
      text: fullText.trim(),
      metadata: {
        title: info.Title,
        author: info.Author,
        pages: pdf.numPages,
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from resume URL (fetches and parses)
 */
export async function extractTextFromResumeUrl(url: string): Promise<ParsedResume> {
  // Handle mock URLs gracefully - these are placeholders and can't be fetched
  if (url.startsWith('mock://') || url.startsWith('mock:')) {
    console.warn(`Skipping mock URL: ${url}. Resume text extraction not available for mock URLs.`);
    return {
      text: '',
      metadata: {
        title: 'Mock Resume URL',
      },
    };
  }

  // Check if URL is a valid HTTP/HTTPS URL
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
    console.warn(`Invalid or unsupported URL scheme: ${url}`);
    return {
      text: '',
      metadata: {
        title: 'Invalid URL',
      },
    };
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`);
    }

    const blob = await response.blob();
    const file = new File([blob], 'resume.pdf', { type: blob.type });

    if (blob.type === 'application/pdf' || url.toLowerCase().endsWith('.pdf')) {
      return extractTextFromPDF(file);
    } else if (blob.type === 'text/plain' || url.toLowerCase().endsWith('.txt')) {
      const text = await blob.text();
      return { text };
    } else {
      // For other formats, try to extract as text
      const text = await blob.text();
      return { text: text.substring(0, 10000) }; // Limit to avoid issues
    }
  } catch (error) {
    // Don't throw error, just return empty text so scoring can continue without resume
    console.warn(`Failed to extract text from resume URL: ${url}`, error);
    return {
      text: '',
      metadata: {
        title: 'Failed to extract',
      },
    };
  }
}

/**
 * Extract text from file (supports PDF, TXT)
 */
export async function extractTextFromFile(file: File): Promise<ParsedResume> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractTextFromPDF(file);
  } else if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt')) {
    const text = await file.text();
    return { text };
  } else {
    throw new Error(`Unsupported file type: ${file.type}. Supported types: PDF, TXT`);
  }
}

