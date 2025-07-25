# @inlustris/youtube-mcp

![NPM Version](https://img.shields.io/npm/v/@inlustris/youtube-mcp)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6)

A Model Context Protocol (MCP) server to get YouTube video transcripts.

This server allows you to fetch the transcript of any YouTube video by providing its URL. It's built with FastMCP, making it easy to integrate with any MCP-compatible client, including large language models and other developer tools.

## ✨ Features

- **YouTube Transcript Fetching**: Get the full transcript of any YouTube video.
- **MCP Compliant**: Exposes the functionality through a standard MCP resource.
- **Easy Integration**: Works with any MCP-compatible client.
- **Built with FastMCP**: A lightweight and efficient MCP server implementation.

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or higher)

### Installation

```bash
npm install -g @inlustris/youtube-mcp
```

### Running the Server

Once installed, you can run the server from your terminal:

```bash
youtube-mcp
```

The server will start and listen for requests on stdio.

## 📖 Usage

The server exposes a single MCP resource:

- **`youtube:transcript:{videoId}`**: Fetches the transcript for the given YouTube video ID.

### Example with `mcp-cli`

You can use `mcp-cli` to interact with the server:

```bash
# In one terminal, start the server
youtube-mcp

# In another terminal, use mcp-cli to get a transcript
mcp-cli --command "youtube-mcp" get youtube:transcript:dQw4w9WgXcQ
```

This will return the transcript of the video with the ID `dQw4w9WgXcQ`.

### MCP Client Configuration

To configure an MCP client (like Cursor) to use this server, you can add the following to your client's MCP configuration (e.g., in `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "youtube": {
      "command": "npx",
      "args": [
        "-y",
        "@inlustris/youtube-mcp@latest"
      ]
    }
  }
}
```

## 🛠️ Development

For development, you can run the server in watch mode:

```bash
npm run dev
```

You can also run the HTTP server for testing:

```bash
npm run start:http
```

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request on the [GitHub repository](https://github.com/cactusaurelius/mcp-yt-transcript).

## 📄 License

This project is licensed under the MIT License.
