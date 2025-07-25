import { FastMCP } from "fastmcp";
import { z } from "zod";
import * as services from "./services/index.js";

/**
 * Register all tools with the MCP server
 * 
 * @param server The FastMCP server instance
 */
export function registerTools(server: FastMCP) {
  server.addTool({
    name: "get_transcript",
    description: "Retrieves the full transcript of a specified YouTube video. This tool is useful for understanding video content without watching it, or for extracting textual information from videos.",
    parameters: z.object({
      videoUrl: z.string().describe("The full URL of the YouTube video from which to retrieve the transcript. This is the standard URL you would use to watch the video in a browser (e.g., 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')."),
      chunkSize: z.number().optional().describe("Optional: The maximum number of characters for each transcript chunk. If provided, the transcript will be split into chunks of this size. Useful for processing very long transcripts in smaller, manageable parts."),
      chunkBySilence: z.boolean().optional().describe("Optional: If true, the transcript will be chunked based on periods of silence in the audio. This can help in segmenting the transcript into more natural conversational or thematic breaks."),
      silenceThreshold: z.number().optional().describe("Optional: When chunkBySilence is true, this specifies the minimum duration of silence (in milliseconds) to consider as a chunk break. A higher value means longer pauses are required to create a new chunk."),
    }),
    execute: async (params) => {
      const transcript = await services.YoutubeService.getTranscript(params.videoUrl, {
        chunkSize: params.chunkSize,
        chunkBySilence: params.chunkBySilence,
        silenceThreshold: params.silenceThreshold
      });
      return { type: "text", text: JSON.stringify(transcript) };
    }
  });
}