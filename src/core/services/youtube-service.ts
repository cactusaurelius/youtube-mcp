import { Innertube } from "youtubei.js";

type TranscriptSegment = {
  text: string ;
  start_ms: number;
  end_ms: number;
};

type TranscriptChunk = {
  text: string;
  start_ms: number;
  end_ms: number;
};

type GetTranscriptOptions = {
  chunkSize?: number;
  chunkBySilence?: boolean;
  silenceThreshold?: number;
};

export type VideoSearchResult = {
  title: string;
  videoId: string;
  channelName: string;
};

export type ChannelSearchResult = {
  channelName: string;
  channelId: string;
};

export type SearchSortBy = 'relevance' | 'date' | 'rating' | 'viewCount' | 'title' | 'videoCount';

export type ChannelVideoResult = {
  title: string;
  videoId: string;
  publishedAt: string;
  description: string;
  thumbnailUrl: string;
};

/**
 * A service for fetching YouTube video transcripts
 */
export class YoutubeService {
  private static getVideoId(url: string): string | null {
    // Look for youtube.com/watch?v=VIDEO_ID
    let match = url.match(/[?&]v=([^&]+)/);
    if (match) {
      return match[1];
    }
    // Look for youtu.be/VIDEO_ID
    match = url.match(/youtu.be\/([^?]+)/);
    if (match) {
      return match[1];
    }
    return null;
  }

  /**
   * Get the transcript of a YouTube video
   * @param videoUrl The URL of the YouTube video
   * @param options Options for chunking the transcript
   * @returns The transcript of the video
   */
  public static async getTranscript(
    videoUrl: string,
    options: GetTranscriptOptions = {}
  ): Promise<TranscriptChunk[]> {
    try {
      const videoId = this.getVideoId(videoUrl);
      if (!videoId) {
        throw new Error("Invalid YouTube URL");
      }

      const youtube = await Innertube.create();
      const info = await youtube.getInfo(videoId);

      if (!info.captions || info.captions.caption_tracks?.length === 0) {
        throw new Error("No caption tracks found for this video.");
      }

      const _transcript = await info.getTranscript();
      const segments: TranscriptSegment[] =
        _transcript.transcript.content?.body?.initial_segments?.map(
          ({ snippet, start_ms, end_ms }) => ({
            text: snippet?.text || "",
            start_ms: Number(start_ms),
            end_ms: Number(end_ms),
          })
        ) || [];

      if (options.chunkBySilence) {
        return this.chunkSegmentsBySilence(segments, options.silenceThreshold);
      }

      if (options.chunkSize) {
        return this.chunkSegments(segments, options.chunkSize);
      }

      return segments.map(({ text, start_ms, end_ms }) => ({
        text,
        start_ms,
        end_ms,
      }));
    } catch (error) {

      console.log("🚀ԅ(≖⌣≖ԅ) ~ YoutubeService ~ error => ", error)

      

      console.error("Failed to fetch transcript:", error);
      throw new Error("Failed to fetch transcript");
    }
  }

  private static chunkSegments(
    segments: TranscriptSegment[],
    chunkSize: number
  ): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunk: TranscriptChunk = {
      text: "",
      start_ms: 0,
      end_ms: 0,
    };

    for (const segment of segments) {
      if (currentChunk.text.length + segment.text.length > chunkSize) {
        chunks.push(currentChunk);
        currentChunk = {
          text: "",
          start_ms: segment.start_ms,
          end_ms: 0,
        };
      }

      if (currentChunk.text.length === 0) {
        currentChunk.start_ms = segment.start_ms;
      }

      currentChunk.text += segment.text + " ";
      currentChunk.end_ms = segment.end_ms;
    }

    if (currentChunk.text.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  private static chunkSegmentsBySilence(
    segments: TranscriptSegment[],
    silenceThreshold: number = 200
  ): TranscriptChunk[] {
    const chunks: TranscriptChunk[] = [];
    let currentChunk: TranscriptChunk = {
      text: "",
      start_ms: 0,
      end_ms: 0,
    };

    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      if (currentChunk.text.length === 0) {
        currentChunk.start_ms = segment.start_ms;
      }

      currentChunk.text += segment.text + " ";
      currentChunk.end_ms = segment.end_ms;

      const nextSegment = segments[i + 1];
      if (nextSegment) {
        const silenceDuration = nextSegment.start_ms - segment.end_ms;
        if (silenceDuration > silenceThreshold) {
          chunks.push(currentChunk);
          currentChunk = {
            text: "",
            start_ms: 0,
            end_ms: 0,
          };
        }
      }
    }

    if (currentChunk.text.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  public static async searchVideos(query: string, sortBy: SearchSortBy = 'rating'): Promise<VideoSearchResult[]> {
    const youtube = await Innertube.create();

    // Create search options with sorting
    const searchOptions: any = { type: 'video' };

    // Map our sort options to youtubei.js sort options
    switch (sortBy) {
      case 'date':
        searchOptions.sort_by = 'upload_date';
        break;
      case 'viewCount':
        searchOptions.sort_by = 'view_count';
        break;
      case 'rating':
        searchOptions.sort_by = 'rating';
        break;
      case 'relevance':
        searchOptions.sort_by = 'relevance';
        break;
      default:
        searchOptions.sort_by = 'rating'; // Default to rating
    }

    const search = await youtube.search(query, searchOptions);
    return search.videos.map(video => {
      // Safely extract title
      const title = ('title' in video && video.title) ? video.title.toString() : 'No title';

      // Safely extract video ID
      const videoId = ('id' in video && video.id) ? video.id : 'No ID';

      // Safely extract channel name from author
      let channelName = 'No channel name';
      if ('author' in video && video.author) {
        if (typeof video.author === 'object' && 'name' in video.author) {
          channelName = video.author.name;
        } else if (typeof video.author === 'string') {
          channelName = video.author;
        }
      }

      return { title, videoId, channelName };
    });
  }

  public static async searchChannels(query: string, sortBy: SearchSortBy = 'rating'): Promise<ChannelSearchResult[]> {
    const youtube = await Innertube.create();

    // Create search options with sorting
    const searchOptions: any = { type: 'channel' };

    // Map our sort options to youtubei.js sort options  
    // Note: For channels, videoCount and relevance are most relevant
    switch (sortBy) {
      case 'date':
        searchOptions.sort_by = 'upload_date';
        break;
      case 'videoCount':
        searchOptions.sort_by = 'video_count';
        break;
      case 'viewCount':
        searchOptions.sort_by = 'view_count';
        break;
      case 'rating':
        searchOptions.sort_by = 'rating';
        break;
      case 'relevance':
        searchOptions.sort_by = 'relevance';
        break;
      default:
        searchOptions.sort_by = 'rating'; // Default to rating
    }

    const search = await youtube.search(query, searchOptions);
    return search.channels.map(channel => {
      // Safely extract channel name and ID from author
      let channelName = 'No channel name';
      let channelId = 'No channel ID';

      if ('author' in channel && channel.author) {
        if (typeof channel.author === 'object') {
          if ('name' in channel.author) {
            channelName = channel.author.name;
          }
          if ('id' in channel.author) {
            channelId = channel.author.id;
          }
        } else if (typeof channel.author === 'string') {
          channelName = channel.author;
        }
      }

      return { channelName, channelId };
    });
  }

  public static async getChannelVideos(channelId: string, maxResults: number = 50): Promise<ChannelVideoResult[]> {
    const youtube = await Innertube.create();

    // Get the channel to access its uploads playlist
    const channel = await youtube.getChannel(channelId);

    if (!channel || !channel.header) {
      throw new Error(`Channel not found: ${channelId}`);
    }

    // Get the uploads playlist from the channel
    const videos = await channel.getVideos();

    return videos.videos.slice(0, maxResults).map(video => {
      // Safely extract video properties
      const title = ('title' in video && video.title) ? video.title.toString() : 'No title';
      const videoId = ('id' in video && video.id) ? video.id : 'No ID';

      // Extract publish date
      let publishedAt = 'Unknown date';
      if ('published' in video && video.published) {
        publishedAt = video.published.toString();
      }

      // Extract description 
      let description = 'No description';
      if ('description' in video && video.description) {
        description = video.description.toString();
      }

      // Extract thumbnail URL
      let thumbnailUrl = '';
      if ('thumbnails' in video && video.thumbnails && Array.isArray(video.thumbnails) && video.thumbnails.length > 0) {
        thumbnailUrl = video.thumbnails[0].url || '';
      }

      return {
        title,
        videoId,
        publishedAt,
        description,
        thumbnailUrl
      };
    });
  }
}