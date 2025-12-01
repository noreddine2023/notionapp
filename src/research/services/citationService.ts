/**
 * Citation Generation Service
 * Generates citations in various formats
 */

import type { Paper, CitationFormat } from '../types/paper';

/**
 * Parse author name into last name and other parts
 * Handles various name formats including single names, hyphenated names
 */
function parseAuthorName(fullName: string): { lastName: string; otherNames: string[] } {
  const trimmedName = fullName.trim();
  
  // Handle single name
  if (!trimmedName.includes(' ')) {
    return { lastName: trimmedName, otherNames: [] };
  }
  
  const parts = trimmedName.split(' ').filter(p => p.length > 0);
  const lastName = parts.pop() || trimmedName;
  
  return { lastName, otherNames: parts };
}

/**
 * Format author names for citations
 */
function formatAuthors(paper: Paper, format: CitationFormat): string {
  const authors = paper.authors;
  
  if (authors.length === 0) {
    return 'Unknown Author';
  }

  switch (format) {
    case 'apa':
    case 'chicago':
      if (authors.length === 1) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join(' ');
        return initials ? `${lastName}, ${initials}` : lastName;
      }
      if (authors.length === 2) {
        return authors.map(a => {
          const { lastName, otherNames } = parseAuthorName(a.name);
          const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join(' ');
          return initials ? `${lastName}, ${initials}` : lastName;
        }).join(' & ');
      }
      if (authors.length > 2) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join(' ');
        const formatted = initials ? `${lastName}, ${initials}` : lastName;
        return `${formatted} et al.`;
      }
      return authors[0].name;

    case 'mla':
      if (authors.length === 1) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const firstName = otherNames.join(' ');
        return firstName ? `${lastName}, ${firstName}` : lastName;
      }
      if (authors.length === 2) {
        const { lastName: lastName1, otherNames: otherNames1 } = parseAuthorName(authors[0].name);
        const firstName1 = otherNames1.join(' ');
        const firstAuthor = firstName1 ? `${lastName1}, ${firstName1}` : lastName1;
        return `${firstAuthor}, and ${authors[1].name}`;
      }
      if (authors.length > 2) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const firstName = otherNames.join(' ');
        const formatted = firstName ? `${lastName}, ${firstName}` : lastName;
        return `${formatted}, et al.`;
      }
      return authors[0].name;

    case 'harvard':
      if (authors.length === 1) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join('');
        return initials ? `${lastName}, ${initials}` : lastName;
      }
      if (authors.length === 2) {
        return authors.map(a => {
          const { lastName, otherNames } = parseAuthorName(a.name);
          const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join('');
          return initials ? `${lastName}, ${initials}` : lastName;
        }).join(' and ');
      }
      if (authors.length > 2) {
        const { lastName, otherNames } = parseAuthorName(authors[0].name);
        const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join('');
        const formatted = initials ? `${lastName}, ${initials}` : lastName;
        return `${formatted} et al.`;
      }
      return authors[0].name;

    case 'ieee':
      return authors.map(a => {
        const { lastName, otherNames } = parseAuthorName(a.name);
        const initials = otherNames.map(n => n[0] ? n[0] + '.' : '').join(' ');
        return initials ? `${initials} ${lastName}` : lastName;
      }).join(', ');

    case 'bibtex':
      return authors.map(a => a.name).join(' and ');

    default:
      return authors.map(a => a.name).join(', ');
  }
}

/**
 * Generate BibTeX key from paper
 */
function generateBibtexKey(paper: Paper): string {
  const { lastName } = parseAuthorName(paper.authors[0]?.name || 'unknown');
  const year = paper.year || 'n.d.';
  const titleWord = paper.title.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'paper';
  return `${lastName.toLowerCase()}${year}${titleWord}`;
}

/**
 * Generate citation in specified format
 */
export function generateCitation(paper: Paper, format: CitationFormat): string {
  const authors = formatAuthors(paper, format);
  const year = paper.year || 'n.d.';
  const title = paper.title;
  const venue = paper.venue || '';
  const doi = paper.doi;

  switch (format) {
    case 'apa':
      let apaCitation = `${authors} (${year}). ${title}.`;
      if (venue) apaCitation += ` ${venue}.`;
      if (doi) apaCitation += ` https://doi.org/${doi}`;
      return apaCitation;

    case 'mla':
      let mlaCitation = `${authors}. "${title}."`;
      if (venue) mlaCitation += ` ${venue},`;
      mlaCitation += ` ${year}.`;
      if (doi) mlaCitation += ` DOI: ${doi}.`;
      return mlaCitation;

    case 'chicago':
      let chicagoCitation = `${authors}. "${title}."`;
      if (venue) chicagoCitation += ` ${venue}`;
      chicagoCitation += ` (${year}).`;
      if (doi) chicagoCitation += ` https://doi.org/${doi}.`;
      return chicagoCitation;

    case 'harvard':
      let harvardCitation = `${authors} (${year}) '${title}',`;
      if (venue) harvardCitation += ` ${venue}.`;
      if (doi) harvardCitation += ` Available at: https://doi.org/${doi}.`;
      return harvardCitation;

    case 'ieee':
      let ieeeCitation = `${authors}, "${title},"`;
      if (venue) ieeeCitation += ` ${venue},`;
      ieeeCitation += ` ${year}.`;
      if (doi) ieeeCitation += ` doi: ${doi}.`;
      return ieeeCitation;

    case 'bibtex':
      const key = generateBibtexKey(paper);
      let bibtex = `@article{${key},\n`;
      bibtex += `  author = {${authors}},\n`;
      bibtex += `  title = {${title}},\n`;
      bibtex += `  year = {${year}},\n`;
      if (venue) bibtex += `  journal = {${venue}},\n`;
      if (doi) bibtex += `  doi = {${doi}},\n`;
      bibtex += `}`;
      return bibtex;

    default:
      return `${authors} (${year}). ${title}.`;
  }
}

/**
 * Export multiple papers as BibTeX file content
 */
export function exportBibtex(papers: Paper[]): string {
  return papers.map(paper => generateCitation(paper, 'bibtex')).join('\n\n');
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

export const citationService = {
  generateCitation,
  exportBibtex,
  copyToClipboard,
};
