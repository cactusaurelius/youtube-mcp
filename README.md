# @inlustris/youtube-mcp

**No-fuss YouTube transcripts for MCP - no API keys required!**

![NPM Version](https://img.shields.io/npm/v/@inlustris/youtube-mcp)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)

A Model Context Protocol (MCP) server for YouTube video transcripts and search.

*No fuss setup - no Google API keys required!* Just install and start extracting transcripts.

## Features

- Get YouTube video transcripts with timestamps
- Search YouTube videos and channels
- Get channel video lists
- Chunking support for large transcripts

## Installation

```bash
npm install -g @inlustris/youtube-mcp
```

## Configuration

Add to your MCP client config (e.g., `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": ["-y", "@inlustris/youtube-mcp@latest"]
    }
  }
}
```

## Available Tools

### `get_transcript`
Get video transcript from YouTube URL.

Parameters:
- `videoUrl` (required): YouTube video URL
- `chunkSize` (optional): Max characters per chunk
- `chunkBySilence` (optional): Split by silence breaks
- `silenceThreshold` (optional): Silence duration in ms

### `search_videos`
Search YouTube videos.

Parameters:
- `query` (required): Search terms
- `sortBy` (optional): `relevance`, `date`, `rating`, `viewCount`, `title`

### `search_channels`
Search YouTube channels.

Parameters:
- `query` (required): Search terms
- `sortBy` (optional): `relevance`, `date`, `rating`, `viewCount`, `title`, `videoCount`

### `get_channel_videos`
Get videos from a channel.

Parameters:
- `channelId` (required): YouTube channel ID
- `maxResults` (optional): Number of videos (max 200)

## Development

```bash
npm install
npm run dev        # Development server
npm run start:http # HTTP server for testing
```

## License

MIT

## Keywords

YouTube transcript, MCP server, Model Context Protocol, YouTube API, video transcript extraction, AI tools, TypeScript, FastMCP, YouTube search, channel analysis, video content analysis, transcript chunking, Claude Desktop, Cursor IDE, AI development tools, YouTube data extraction, video processing, content analysis, automated transcription
