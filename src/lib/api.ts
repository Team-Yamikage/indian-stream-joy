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

  const streamMap = new Map<string, Stream>();
  streams.forEach((stream) => {
    if (stream.channel && !streamMap.has(stream.channel)) {
      streamMap.set(stream.channel, stream);
    }
  });

  return channels
    .map((channel) => ({
      ...channel,
      stream: streamMap.get(channel.id),
    }))
    .filter((channel) => channel.stream);
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
