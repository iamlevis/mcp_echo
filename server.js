import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { HttpServerTransport } from "@modelcontextprotocol/sdk/server/http.js";

// Create the MCP server with metadata
const server = new Server(
  { name: "toy-ping", version: "0.0.1" },
  { capabilities: { tools: {} } }
);

// Add a single "ping" tool
server.addTool(
  {
    name: "ping",
    description: "Replies with pong.",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string", description: "Optional ping message" } },
      required: [],
    },
  },
  async (input) => {
    const msg = input?.message ?? "no message";
    return {
      content: [
        { type: "text", text: `Ping received: ${msg}` },
        { type: "json", json: { pong: true, echo: msg } },
      ],
    };
  }
);

// Start an HTTP transport (defaults to port 3000)
const PORT = process.env.PORT || 3000;
await server.connect(new HttpServerTransport({ port: PORT }));
console.log(`toy-mcp-ping listening on port ${PORT}`);