import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

// minimal MCP server with one tool: ping
const mcp = new McpServer({ name: "toy-ping", version: "0.0.1" });

mcp.tool(
  {
    name: "ping",
    description: "Replies with pong.",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string", description: "Optional ping message" } },
      required: []
    }
  },
  async (args) => {
    const msg = args?.message ?? "no message";
    return {
      content: [
        { type: "text", text: `Ping received: ${msg}` },
        { type: "json", json: { pong: true, echo: msg } }
      ]
    };
  }
);

// mount MCP at /mcp using Streamable HTTP
const transport = new StreamableHTTPServerTransport({
  app,                 // reuse our Express app
  path: "/mcp"         // your public endpoint will be https://.../mcp
});

await mcp.connect(transport);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`toy-mcp-ping listening on :${PORT} (endpoint: /mcp)`);
});
