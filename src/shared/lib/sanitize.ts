import DOMPurify from 'dompurify';

export type SanitizeConfig = 'richText' | 'email' | 'notes' | 'legal';

const RICH_TEXT_TAGS = [
  'p', 'strong', 'em', 'b', 'i', 'u', 'ul', 'ol', 'li', 'br', 'a', 'span', 'div',
];
const RICH_TEXT_ATTR = ['href', 'target'];

const LEGAL_TAGS = ['p', 'strong', 'em', 'ul', 'ol', 'li', 'br'];

function stripDangerousHref(node: Element) {
  if (node.tagName === 'A' && node.hasAttribute('href')) {
    const href = node.getAttribute('href') || '';
    const lower = href.toLowerCase().trim();
    if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
      node.removeAttribute('href');
    }
  }
}

export function sanitizeHtml(html: string, config: SanitizeConfig): string {
  if (typeof html !== 'string') return '';

  switch (config) {
    case 'richText':
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: RICH_TEXT_TAGS,
        ALLOWED_ATTR: RICH_TEXT_ATTR,
      });
    case 'email':
    case 'notes': {
      const sanitized = DOMPurify.sanitize(html, {
        ALLOWED_TAGS: RICH_TEXT_TAGS,
        ALLOWED_ATTR: RICH_TEXT_ATTR,
        ADD_ATTR: ['target'],
      });
      const fragment = document.createElement('div');
      fragment.innerHTML = sanitized;
      fragment.querySelectorAll('a').forEach(stripDangerousHref);
      return fragment.innerHTML;
    }
    case 'legal':
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: LEGAL_TAGS,
        ALLOWED_ATTR: [],
      });
    default:
      return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
  }
}
