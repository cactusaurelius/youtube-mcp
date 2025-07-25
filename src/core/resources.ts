import { FastMCP } from "fastmcp";
import { YoutubeService, SearchSortBy } from "./services/youtube-service.js";

/**
 * Register all resources with the MCP server
 * @param server The FastMCP server instance
 */
export function registerResources(server: FastMCP) {
  server.addResourceTemplate({
    uriTemplate: "youtube:transcript:{videoId}",
    name: "getTranscript",
    description: "YouTube video transcript with optional formatting for summaries. When creating summaries, consider using this format (but user instructions override): **Key Points with Timestamps:** Use [MM:SS] or [HH:MM:SS] inline references. **Structure:** Break into logical sections. **Context:** Include video title and channel. Example: 'The speaker explains TypeScript generics [05:30] and shows practical examples [08:15].' This formatting is optional - follow any specific user instructions instead.",
    mimeType: "text/plain",
    arguments: [
      {
        name: "videoId",
        description: "The unique identifier for the YouTube video from which to retrieve the transcript.",
        required: true,
      },
    ],
    async load({ videoId }) {
      try {
        const transcript = await YoutubeService.getTranscript(`https://www.youtube.com/watch?v=${videoId}`);

        // Format transcript with timestamps for easy reference
        const formattedTranscript = transcript.map(chunk => {
          const startSeconds = Math.floor(chunk.start_ms / 1000);
          const minutes = Math.floor(startSeconds / 60);
          const seconds = startSeconds % 60;
          const timestamp = `[${minutes}:${seconds.toString().padStart(2, '0')}]`;
          return `${timestamp} ${chunk.text}`;
        }).join('\n');

        return {
          text: `YouTube Video Transcript\n========================\nVideo URL: https://www.youtube.com/watch?v=${videoId}\n\n${formattedTranscript}`
        };
      } catch (error) {
        return {
          text: `Error retrieving transcript: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    },
  });

  server.addResourceTemplate({
    uriTemplate: "youtube:search:videos:{query}:{sortBy?}",
    name: "searchVideos",
    description: "Search YouTube for videos with optional sorting. Default sort is by rating.",
    mimeType: "application/json",
    arguments: [
      {
        name: "query",
        description: "The search query to find YouTube videos.",
        required: true,
      },
      {
        name: "sortBy",
        description: "Sort order: relevance, date, rating (default), viewCount, title",
        required: false,
      },
    ],
    async load({ query, sortBy }) {
      try {
        const validSortBy = ['relevance', 'date', 'rating', 'viewCount', 'title'].includes(sortBy || '')
          ? (sortBy as SearchSortBy)
          : 'rating';

        const videos = await YoutubeService.searchVideos(query, validSortBy);
        return {
          text: JSON.stringify(videos, null, 2)
        };
      } catch (error) {
        return {
          text: JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }, null, 2)
        };
      }
    },
  });

  server.addResourceTemplate({
    uriTemplate: "youtube:search:channels:{query}",
    name: "searchChannels",
    mimeType: "application/json",
    arguments: [
      {
        name: "query",
        description: "The search query to find YouTube channels.",
        required: true,
      },
      {
        name: "sortBy",
        description: "Sort order for search results: relevance, date, rating (default), viewCount, title, or videoCount.",
        required: false,
      },
    ],
    async load({ query, sortBy }) {
      try {
        const validSortBy = ['relevance', 'date', 'rating', 'viewCount', 'title', 'videoCount'].includes(sortBy as string)
          ? (sortBy as SearchSortBy)
          : 'rating';
        const channels = await YoutubeService.searchChannels(query as string, validSortBy);
        return {
          text: JSON.stringify(channels, null, 2),
        };
      } catch (error) {
        return {
          text: `Error searching for channels: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });

  server.addResourceTemplate({
    uriTemplate: "youtube:channel:{channelId}:videos",
    name: "getChannelVideos",
    mimeType: "application/json",
    arguments: [
      {
        name: "channelId",
        description: "The YouTube channel ID from which to retrieve videos.",
        required: true,
      },
      {
        name: "maxResults",
        description: "Maximum number of videos to retrieve (default: 50, max: 200).",
        required: false,
      },
    ],
    async load({ channelId, maxResults }) {
      try {
        const limit = maxResults ? Math.min(Number(maxResults), 200) : 50;
        const videos = await YoutubeService.getChannelVideos(channelId as string, limit);
        return {
          text: JSON.stringify(videos, null, 2),
        };
      } catch (error) {
        return {
          text: `Error fetching channel videos: ${error instanceof Error ? error.message : 'Unknown error'}`,
        };
      }
    },
  });
}