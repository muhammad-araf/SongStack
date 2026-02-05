/**
 * Intelligent Song Parser
 * Extracts clean song names from OCR text by filtering out YouTube metadata
 */

export interface ParsedSong {
  original: string;
  cleaned: string;
  confidence: number;
}

/**
 * Patterns to identify and remove from song names
 */
const NOISE_PATTERNS = [
  /\(\d+\)/g, // Remove (607) or any number in parentheses
  /- YouTube$/gi, // Remove "- YouTube" suffix
  /youtube\.com/gi, // Remove youtube.com
  /\d+\s*(views?|subscribers?)/gi, // Remove view counts
  /\d+:\d+/g, // Remove timestamps like 3:45
  /\d+[KMB]\s*views?/gi, // Remove formatted views like "1.2M views"
  /\d+\s*hours?\s*ago/gi, // Remove "2 hours ago"
  /\d+\s*days?\s*ago/gi, // Remove "3 days ago"
  /\d+\s*weeks?\s*ago/gi, // Remove "1 week ago"
  /\d+\s*months?\s*ago/gi, // Remove "2 months ago"
  /\d+\s*years?\s*ago/gi, // Remove "1 year ago"
  /verified/gi, // Remove "Verified"
  /official\s*(music\s*)?video/gi, // Remove "Official Music Video"
  /lyric(s)?\s*video/gi, // Remove "Lyric Video"
  /audio\s*only/gi, // Remove "Audio Only"
  /HD|4K|1080p|720p/gi, // Remove video quality indicators
  /©|®|™/g, // Remove copyright symbols
];

/**
 * Keywords that indicate this is likely a song title line
 */
const SONG_INDICATORS = [
  'lyrics?',
  'song',
  'audio',
  'music',
  'official',
  'feat\\.?',
  'ft\\.?',
  '\\|',
  '-',
];

/**
 * Clean a single line of text to extract song name
 */
export function cleanSongName(text: string): string {
  let cleaned = text.trim();

  // Remove all noise patterns
  NOISE_PATTERNS.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Remove leading/trailing special characters
  cleaned = cleaned.replace(/^[^\w\d]+|[^\w\d]+$/g, '');

  return cleaned;
}

/**
 * Calculate confidence score for a potential song name
 */
function calculateConfidence(original: string, cleaned: string): number {
  let score = 50; // Base score

  // Increase confidence if contains song indicators
  const lowerOriginal = original.toLowerCase();
  SONG_INDICATORS.forEach(indicator => {
    if (new RegExp(indicator, 'i').test(lowerOriginal)) {
      score += 10;
    }
  });

  // Decrease confidence if too short
  if (cleaned.length < 5) {
    score -= 30;
  }

  // Decrease confidence if only numbers or special chars
  if (!/[a-zA-Z]/.test(cleaned)) {
    score -= 50;
  }

  // Increase confidence if has artist separator (|, -, feat, ft)
  if (/(\||feat\.?|ft\.?|-)/i.test(cleaned)) {
    score += 15;
  }

  // Decrease if still contains URLs or emails
  if (/(http|www\.|@|\.com|\.net)/i.test(cleaned)) {
    score -= 40;
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Extract song names from OCR text
 * @param ocrText - Raw text from OCR
 * @returns Array of parsed songs with confidence scores
 */
export function extractSongNames(ocrText: string): ParsedSong[] {
  // Split text into lines
  const lines = ocrText.split('\n');

  const songs: ParsedSong[] = [];
  const seenSongs = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines or very short lines
    if (trimmed.length < 5) continue;

    // Skip lines that are pure URLs
    if (trimmed.startsWith('http') || trimmed.includes('youtube.com')) continue;

    // Clean the line
    const cleaned = cleanSongName(trimmed);

    // Skip if cleaning removed everything
    if (cleaned.length < 5) continue;

    // Calculate confidence
    const confidence = calculateConfidence(trimmed, cleaned);

    // Only keep if confidence is reasonable and not duplicate
    if (confidence >= 40 && !seenSongs.has(cleaned.toLowerCase())) {
      songs.push({
        original: trimmed,
        cleaned,
        confidence,
      });
      seenSongs.add(cleaned.toLowerCase());
    }
  }

  // Sort by confidence (highest first)
  return songs.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Advanced parser specifically for YouTube playlist screenshots
 * Uses pattern matching to identify title sections
 */
export function parseYouTubePlaylist(ocrText: string): ParsedSong[] {
  const songs: ParsedSong[] = [];
  const seenSongs = new Set<string>();

  // Split into lines
  const lines = ocrText.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty or very short lines
    if (line.length < 10) continue;

    // Check if this line looks like a video title
    // YouTube titles often have: (number) Title - Artist | Something - YouTube
    const titleMatch = line.match(/^(?:\(\d+\))?\s*(.+?)\s*(?:-\s*YouTube)?$/i);

    if (titleMatch) {
      const potentialTitle = titleMatch[1];
      const cleaned = cleanSongName(potentialTitle);

      if (cleaned.length >= 5 && !seenSongs.has(cleaned.toLowerCase())) {
        const confidence = calculateConfidence(line, cleaned);

        if (confidence >= 30) {
          songs.push({
            original: line,
            cleaned,
            confidence,
          });
          seenSongs.add(cleaned.toLowerCase());
        }
      }
    }
  }

  return songs.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Post-process extracted songs to improve quality
 */
export function refineSongList(songs: ParsedSong[], minConfidence = 40): ParsedSong[] {
  return songs
    .filter(song => song.confidence >= minConfidence)
    .filter(song => {
      // Additional quality checks
      const hasLetters = /[a-zA-Z]/.test(song.cleaned);
      const notTooShort = song.cleaned.length >= 5;
      const notJustNumbers = !/^\d+$/.test(song.cleaned);

      return hasLetters && notTooShort && notJustNumbers;
    });
}
