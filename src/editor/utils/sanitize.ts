/**
 * HTML sanitization utility to prevent XSS attacks
 */

// Allowed HTML tags for rich text formatting
const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span', 'font',
  'br', 'p', 'div', 'sub', 'sup', 'mark'
]);

// Allowed attributes for styling
const ALLOWED_ATTRS = new Set([
  'style', 'color', 'face', 'size', 'class'
]);

// Allowed CSS properties
const ALLOWED_STYLES = new Set([
  'color', 'background-color', 'background', 'font-size', 'font-family',
  'font-weight', 'font-style', 'text-decoration', 'text-decoration-color',
  'text-decoration-style', 'text-align'
]);

/**
 * Sanitize HTML content to prevent XSS attacks
 * Only allows safe formatting tags and attributes
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  // Create a temporary DOM element to parse the HTML
  const template = document.createElement('template');
  template.innerHTML = html;

  const sanitize = (node: Node): void => {
    const children = Array.from(node.childNodes);

    for (const child of children) {
      if (child.nodeType === Node.TEXT_NODE) {
        // Text nodes are safe
        continue;
      }

      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as Element;
        const tagName = element.tagName.toLowerCase();

        // Check if tag is allowed
        if (!ALLOWED_TAGS.has(tagName)) {
          // Replace disallowed tag with its text content
          const textNode = document.createTextNode(element.textContent || '');
          node.replaceChild(textNode, child);
          continue;
        }

        // Remove disallowed attributes
        const attrs = Array.from(element.attributes);
        for (const attr of attrs) {
          if (!ALLOWED_ATTRS.has(attr.name.toLowerCase())) {
            element.removeAttribute(attr.name);
          } else if (attr.name.toLowerCase() === 'style') {
            // Sanitize style attribute
            element.setAttribute('style', sanitizeStyle(attr.value));
          }
        }

        // Recursively sanitize children
        sanitize(element);
      } else {
        // Remove other node types (comments, etc.)
        node.removeChild(child);
      }
    }
  };

  sanitize(template.content);
  return template.innerHTML;
}

/**
 * Sanitize CSS style string
 */
function sanitizeStyle(style: string): string {
  if (!style) return '';

  const sanitizedParts: string[] = [];
  const parts = style.split(';');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const property = trimmed.slice(0, colonIndex).trim().toLowerCase();
    const value = trimmed.slice(colonIndex + 1).trim();

    // Only allow safe CSS properties
    if (ALLOWED_STYLES.has(property)) {
      // Prevent javascript: URLs in values
      if (!value.toLowerCase().includes('javascript:') && 
          !value.toLowerCase().includes('expression(')) {
        sanitizedParts.push(`${property}: ${value}`);
      }
    }
  }

  return sanitizedParts.join('; ');
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  
  // Check for dangerous protocols
  const lowerUrl = trimmed.toLowerCase();
  if (lowerUrl.startsWith('javascript:') || 
      lowerUrl.startsWith('data:') ||
      lowerUrl.startsWith('vbscript:')) {
    return null;
  }

  // Allow http, https, mailto, tel, and relative URLs
  if (lowerUrl.startsWith('http://') || 
      lowerUrl.startsWith('https://') ||
      lowerUrl.startsWith('mailto:') ||
      lowerUrl.startsWith('tel:') ||
      lowerUrl.startsWith('/') ||
      lowerUrl.startsWith('#') ||
      !lowerUrl.includes(':')) {
    return trimmed;
  }

  return null;
}
