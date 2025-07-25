import { FastMCP } from "fastmcp";
import { YoutubeService } from "./services/youtube-service.js";

/**
 * Register all resources with the MCP server
 * @param server The FastMCP server instance
 */
export function registerResources(server: FastMCP) {
  // server.addResourceTemplate({
  //   uriTemplate: "youtube:transcript:{videoId}",
  //   name: "YouTube Transcript",
  //   mimeType: "text/plain",
  //   arguments: [
  //     {
  //       name: "videoId",
  //       description: "The unique identifier for the YouTube video from which to retrieve the transcript.",
  //       required: true,
  //     },
  //   ],
  //   async load({ videoId }) {
  //     try {
  //       const transcript = await YoutubeService.getTranscript(`https://www.youtube.com/watch?v=${videoId}`);
  //       return {
  //         text: transcript.map(chunk => chunk.text).join(" ")
  //       };
  //     } catch (error) {
  //       console.error(`Failed to load YouTube transcript for videoId ${videoId}:`, error);
  //       throw new Error(`Could not retrieve transcript for videoId ${videoId}`);
  //     }
  //   }
  // });
} 