/**
 * Resilient M3U parser for IPTV-Org playlists
 * Safely ignores unknown tags and malformed entries
 */

export interface M3UChannel {
  id: string;
  name: string;
  logo: string | null;
  group: string | null;
  country: string | null;
  language: string | null;
  url: string;
  tvgId: string | null;
}

interface ParsedExtInf {
  name: string;
  logo: string | null;
  group: string | null;
  tvgId: string | null;
  tvgCountry: string | null;
  tvgLanguage: string | null;
}

const EXTINF_REGEX = /^#EXTINF:\s*-?\d+\s*,?\s*(.*)$/i;
const ATTR_REGEX = /([a-z-]+)="([^"]*)"/gi;

function parseExtInfLine(line: string): ParsedExtInf | null {
  const match = line.match(EXTINF_REGEX);
  if (!match) return null;

  const remainder = match[1] || "";
  
  // Extract attributes
  const attrs: Record<string, string> = {};
  let attrMatch;
  while ((attrMatch = ATTR_REGEX.exec(line)) !== null) {
    const key = attrMatch[1].toLowerCase().replace(/-/g, "");
    attrs[key] = attrMatch[2];
  }
  
  // The name is what's left after the last comma (after attributes)
  const commaIdx = remainder.lastIndexOf(",");
  const name = commaIdx >= 0 ? remainder.slice(commaIdx + 1).trim() : remainder.trim();

  return {
    name: name || attrs["tvgname"] || "Unknown Channel",
    logo: attrs["tvglogo"] || null,
    group: attrs["grouptitle"] || null,
    tvgId: attrs["tvgid"] || null,
    tvgCountry: attrs["tvgcountry"] || null,
    tvgLanguage: attrs["tvglanguage"] || null,
  };
}

export function parseM3U(content: string): M3UChannel[] {
  const channels: M3UChannel[] = [];
  const lines = content.split(/\r?\n/);
  
  let currentExtInf: ParsedExtInf | null = null;
  let channelIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Skip header
    if (line.startsWith("#EXTM3U")) continue;
    
    // Parse EXTINF
    if (line.startsWith("#EXTINF:")) {
      try {
        currentExtInf = parseExtInfLine(line);
      } catch {
        // Silently skip malformed EXTINF
        currentExtInf = null;
      }
      continue;
    }
    
    // Skip other tags safely
    if (line.startsWith("#")) continue;
    
    // This should be a URL
    if (currentExtInf && (line.startsWith("http://") || line.startsWith("https://"))) {
      channels.push({
        id: currentExtInf.tvgId || `channel-${channelIndex}`,
        name: currentExtInf.name,
        logo: currentExtInf.logo,
        group: currentExtInf.group,
        country: currentExtInf.tvgCountry,
        language: currentExtInf.tvgLanguage,
        url: line,
        tvgId: currentExtInf.tvgId,
      });
      channelIndex++;
      currentExtInf = null;
    }
  }

  return channels;
}

// Filter by country code (e.g., "IN" for India)
export function filterByCountry(channels: M3UChannel[], countryCode: string): M3UChannel[] {
  const code = countryCode.toUpperCase();
  return channels.filter((ch) => {
    if (!ch.country) return false;
    // Country can be comma-separated list
    const countries = ch.country.split(/[,;]/).map((c) => c.trim().toUpperCase());
    return countries.includes(code);
  });
}

// Group channels by category/group
export function groupByCategory(channels: M3UChannel[]): Map<string, M3UChannel[]> {
  const groups = new Map<string, M3UChannel[]>();
  
  for (const ch of channels) {
    const group = ch.group || "Uncategorized";
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(ch);
  }
  
  return groups;
}
