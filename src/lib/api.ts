import { Channel, Stream, Category, ChannelWithStream } from "@/types/channel";

const CHANNELS_API = "https://iptv-org.github.io/api/channels.json";
const STREAMS_API = "https://iptv-org.github.io/api/streams.json";
const CATEGORIES_API = "https://iptv-org.github.io/api/categories.json";

export async function fetchIndianChannels(): Promise<Channel[]> {
  const response = await fetch(CHANNELS_API);
  const channels: Channel[] = await response.json();
  return channels.filter((channel) => channel.country === "IN" && !channel.closed && !channel.is_nsfw);
}

export async function fetchStreams(): Promise<Stream[]> {
  const response = await fetch(STREAMS_API);
  return response.json();
}

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(CATEGORIES_API);
  return response.json();
}

export async function fetchChannelsWithStreams(): Promise<ChannelWithStream[]> {
  const [channels, streams] = await Promise.all([
    fetchIndianChannels(),
    fetchStreams(),
  ]);

  const streamsByChannel = new Map<string, Stream[]>();
  for (const s of streams) {
    if (!s.channel) continue;
    const list = streamsByChannel.get(s.channel) ?? [];
    list.push(s);
    streamsByChannel.set(s.channel, list);
  }

  const scoreStream = (s: Stream) => {
    // Prefer HTTPS (works on Vercel HTTPS)
    const httpsScore = s.url.startsWith("https://") ? 100 : 0;
    // Prefer HLS playlists
    const hlsScore = s.url.toLowerCase().includes(".m3u8") ? 50 : 0;
    // Penalize streams that require referrer/user-agent headers (often fail in browsers)
    const headerPenalty = s.referrer || s.user_agent ? -40 : 0;
    return httpsScore + hlsScore + headerPenalty;
  };

  return channels
    .map((channel) => {
      const channelStreams = streamsByChannel.get(channel.id) ?? [];
      const best = channelStreams
        .slice()
        .sort((a, b) => scoreStream(b) - scoreStream(a))[0];

      return {
        ...channel,
        stream: best,
      };
    })
    .filter((channel) => Boolean(channel.stream));
}

export function getChannelsByCategory(
  channels: ChannelWithStream[],
  category: string
): ChannelWithStream[] {
  if (category === "all") return channels;
  return channels.filter((channel) => channel.categories.includes(category));
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
