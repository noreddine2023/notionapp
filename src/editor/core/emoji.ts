import { Extension, textInputRule } from '@tiptap/core';

/**
 * Common emoji shortcuts
 */
const emojiShortcuts: Record<string, string> = {
  ':)': '😊',
  ':-)': '😊',
  ':(': '😔',
  ':-(': '😔',
  ':D': '😄',
  ':-D': '😄',
  ';)': '😉',
  ';-)': '😉',
  ':P': '😛',
  ':-P': '😛',
  ':p': '😛',
  ':-p': '😛',
  '<3': '❤️',
  ':heart:': '❤️',
  ':+1:': '👍',
  ':-1:': '👎',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎',
  ':fire:': '🔥',
  ':star:': '⭐',
  ':check:': '✅',
  ':x:': '❌',
  ':rocket:': '🚀',
  ':sparkles:': '✨',
  ':tada:': '🎉',
  ':thinking:': '🤔',
  ':wave:': '👋',
  ':eyes:': '👀',
  ':warning:': '⚠️',
  ':bulb:': '💡',
  ':coffee:': '☕',
  ':100:': '💯',
};

/**
 * Emoji extension that converts text shortcuts to emojis
 */
export const EmojiExtension = Extension.create({
  name: 'emoji',

  addInputRules() {
    const rules = [];

    // Create input rules for each emoji shortcut
    for (const [shortcut, emoji] of Object.entries(emojiShortcuts)) {
      // Escape special regex characters in the shortcut
      const escapedShortcut = shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      rules.push(
        textInputRule({
          find: new RegExp(`(?:^|\\s)(${escapedShortcut})$`),
          replace: (match) => {
            // Replace the shortcut with emoji, preserving leading space if present
            const hasLeadingSpace = match.startsWith(' ');
            return (hasLeadingSpace ? ' ' : '') + emoji;
          },
        })
      );
    }

    return rules;
  },

  addCommands() {
    return {
      insertEmoji:
        (emoji: string) =>
        ({ commands }) => {
          return commands.insertContent(emoji);
        },
    };
  },
});

/**
 * Get all available emoji shortcuts
 */
export function getEmojiShortcuts(): Record<string, string> {
  return { ...emojiShortcuts };
}

/**
 * Search emojis by shortcut
 */
export function searchEmojis(query: string): Array<{ shortcut: string; emoji: string }> {
  const lowerQuery = query.toLowerCase();
  
  return Object.entries(emojiShortcuts)
    .filter(([shortcut]) => shortcut.toLowerCase().includes(lowerQuery))
    .map(([shortcut, emoji]) => ({ shortcut, emoji }));
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    emoji: {
      insertEmoji: (emoji: string) => ReturnType;
    };
  }
}
