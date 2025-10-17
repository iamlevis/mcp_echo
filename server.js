import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const mcp = new McpServer({ name: "toy-ping", version: "0.0.3" });


function getMessage(args) {
  if (!args) return undefined;
  if (typeof args === "string") return args;
  if (typeof args.message === "string") return args.message;
  if (args.arguments && typeof args.arguments.message === "string") return args.arguments.message;
  // sometimes clients use 'input' or 'data'
  if (args.input && typeof args.input.message === "string") return args.input.message;
  if (args.data && typeof args.data.message === "string") return args.data.message;
  return undefined;
}


mcp.tool(
  "ping",
  {
    description: "Replies with pong.",
    inputSchema: {
      type: "object",
      properties: { message: { type: "string" } },
      additionalProperties: true
    },
    outputSchema: {
      type: "object",
      properties: { pong: { type: "boolean" }, echo: { type: "string" } },
      required: ["pong"],
      additionalProperties: false
    }
  },
  async (ctx, args) => {
    console.log("ping ctx:", JSON.stringify(ctx));     // requestId, headers, etc.
    console.log("ping arguments:", JSON.stringify(args)); // { "message": "hello from postman" }

    const message = typeof args?.message === "string" ? args.message : "no message";
    const output = { pong: true, echo: message };
    return {
      content: [
        { type: "text", text: `Ping received: ${message}` },
        { type: "json", json: output }
      ],
      structuredContent: output
    };
  }
);

const app = express();
app.use(express.json());

// Create a transport per request and hand it the body
app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({ enableJsonResponse: true });
  res.on("close", () => transport.close());
  await mcp.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`toy-mcp-ping running on http://localhost:${PORT}/mcp`);
});
