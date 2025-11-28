/**
 * Citation Generation Service
 * Generates citations in various formats
 */

import type { Paper, CitationFormat } from '../types/paper';

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
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const initials = parts.map(n => n[0] + '.').join(' ');
        return `${lastName}, ${initials}`.trim();
      }
      if (authors.length === 2) {
        return authors.map(a => {
          const parts = a.name.split(' ');
          const lastName = parts.pop() || '';
          const initials = parts.map(n => n[0] + '.').join(' ');
          return `${lastName}, ${initials}`.trim();
        }).join(' & ');
      }
      if (authors.length > 2) {
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const initials = parts.map(n => n[0] + '.').join(' ');
        return `${lastName}, ${initials} et al.`.trim();
      }
      return authors[0].name;

    case 'mla':
      if (authors.length === 1) {
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const firstName = parts.join(' ');
        return `${lastName}, ${firstName}`;
      }
      if (authors.length === 2) {
        const first = authors[0].name.split(' ');
        const lastName1 = first.pop() || '';
        const firstName1 = first.join(' ');
        return `${lastName1}, ${firstName1}, and ${authors[1].name}`;
      }
      if (authors.length > 2) {
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const firstName = parts.join(' ');
        return `${lastName}, ${firstName}, et al.`;
      }
      return authors[0].name;

    case 'harvard':
      if (authors.length === 1) {
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const initials = parts.map(n => n[0] + '.').join('');
        return `${lastName}, ${initials}`;
      }
      if (authors.length === 2) {
        return authors.map(a => {
          const parts = a.name.split(' ');
          const lastName = parts.pop() || '';
          const initials = parts.map(n => n[0] + '.').join('');
          return `${lastName}, ${initials}`;
        }).join(' and ');
      }
      if (authors.length > 2) {
        const parts = authors[0].name.split(' ');
        const lastName = parts.pop() || '';
        const initials = parts.map(n => n[0] + '.').join('');
        return `${lastName}, ${initials} et al.`;
      }
      return authors[0].name;

    case 'ieee':
      return authors.map(a => {
        const parts = a.name.split(' ');
        const lastName = parts.pop() || '';
        const initials = parts.map(n => n[0] + '.').join(' ');
        return `${initials} ${lastName}`.trim();
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
  const firstAuthor = paper.authors[0]?.name.split(' ').pop()?.toLowerCase() || 'unknown';
  const year = paper.year || 'n.d.';
  const titleWord = paper.title.split(' ')[0]?.toLowerCase().replace(/[^a-z]/g, '') || 'paper';
  return `${firstAuthor}${year}${titleWord}`;
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
