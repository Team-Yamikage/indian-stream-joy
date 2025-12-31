import { ChannelWithStream, Category } from "@/types/channel";
import { parseM3U, M3UChannel } from "./m3u-parser";

const INDIA_M3U_URL = "https://iptv-org.github.io/iptv/countries/in.m3u";
const CATEGORIES_API = "https://iptv-org.github.io/api/categories.json";

// Convert M3UChannel to ChannelWithStream format
function m3uToChannelWithStream(m3u: M3UChannel): ChannelWithStream {
  // Extract category from group
  const categories: string[] = [];
  if (m3u.group) {
    // Group might be like "News" or "Entertainment;Movies"
    const groups = m3u.group.split(/[;,]/).map((g) => g.trim().toLowerCase());
    categories.push(...groups);
  }

  return {
    id: m3u.id,
    name: m3u.name,
    alt_names: [],
    network: m3u.group || null,
    owners: [],
    country: m3u.country || "IN",
    categories,
    is_nsfw: false,
    launched: null,
    closed: null,
    replaced_by: null,
    website: null,
    logoUrl: m3u.logo || undefined,
    stream: {
      channel: m3u.id,
      feed: null,
      title: m3u.name,
      url: m3u.url,
      referrer: null,
      user_agent: null,
      quality: null,
    },
  };
}

export async function fetchChannelsWithStreams(): Promise<ChannelWithStream[]> {
  const response = await fetch(INDIA_M3U_URL);
  const content = await response.text();
  
  const m3uChannels = parseM3U(content);
  
  // Convert to ChannelWithStream format
  return m3uChannels.map(m3uToChannelWithStream);
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(CATEGORIES_API);
  return response.json();
}

export function getChannelsByCategory(
  channels: ChannelWithStream[],
  category: string
): ChannelWithStream[] {
  if (category === "all") return channels;
  const lowerCategory = category.toLowerCase();
  return channels.filter((channel) => 
    channel.categories.some((cat) => cat.toLowerCase() === lowerCategory)
  );
}

export function searchChannels(
  channels: ChannelWithStream[],
  query: string
): ChannelWithStream[] {
  const lowerQuery = query.toLowerCase();
  return channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(lowerQuery) ||
      channel.alt_names.some((name) => name.toLowerCase().includes(lowerQuery)) ||
      (channel.network && channel.network.toLowerCase().includes(lowerQuery))
  );
}
