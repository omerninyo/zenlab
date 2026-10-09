# Apple HIG & Tooling MCP Discovery & Integration Guide
*How target projects locate, verify, and register MCP servers autonomously*

---

## 1. Where Does the Target Project Get the Apple HIG MCP?

The **Apple Human Interface Guidelines (HIG)** MCP server is an official open-source package published on the public npm registry:
- **npm package name**: `apple-hig-mcp`
- **GitHub repository**: `https://github.com/tmaasen/apple-hig-mcp`
- **Binary command**: `apple-hig-mcp` (or executable directly on-the-fly via `npx -y apple-hig-mcp`)

Because it is an npm package, **no manual downloading or compiling is required**. Any environment with Node.js (>= 18) can invoke it immediately.

---

## 2. The 3-Tier Discovery & Resolution Order

When an AI agent or developer enters a new project using this design system, the system checks for `apple-hig` in this exact order:

```
┌────────────────────────────────────────────────────────┐
│ 1. Local PATH / Global Binary Check                     │
│    Is `apple-hig-mcp` binary available in PATH?        │
│    (e.g., /opt/homebrew/bin/apple-hig-mcp)             │
└──────────────────────────┬─────────────────────────────┘
                           │ If NO
┌──────────────────────────▼─────────────────────────────┐
│ 2. Dynamic On-Demand Execution (Zero Install)           │
│    Execute via npx:                                    │
│    `npx -y apple-hig-mcp`                              │
│    Downloads and caches automatically in ~/.npm/_npx   │
└──────────────────────────┬─────────────────────────────┘
                           │ If Offline / Project DevDep
┌──────────────────────────▼─────────────────────────────┐
│ 3. Project Dev Dependency                              │
│    `npm install -D apple-hig-mcp`                      │
│    `npx apple-hig-mcp`                                 │
└────────────────────────────────────────────────────────┘
```

---

## 3. Automated One-Command Setup

The design system includes an autonomous setup and diagnosis script:
```bash
node design-system/scripts/setup-mcp.js
```

### What this script does automatically:
1. Probes for `apple-hig-mcp` in your system `PATH`.
2. Automatically generates or updates `.mcp.json` at the root of the project.
3. Automatically generates or updates `.cursor/mcp.json` for Cursor IDE users.
4. Checks global configurations for **Google Antigravity**, **Claude Code**, and **Claude Desktop**.
5. Tests executable capability.

---

## 4. IDE & Agent Specific Registration

### A. Google Antigravity
If your target project is opened in Google Antigravity:
1. Antigravity automatically detects workspace `.mcp.json` at the project root.
2. Alternatively, to register it globally across all workspaces:
   ```bash
   agy mcp add apple-hig -- npx -y apple-hig-mcp
   ```

### B. Cursor IDE
Cursor reads `.cursor/mcp.json` automatically:
1. Ensure `.cursor/mcp.json` exists (created by `setup-mcp.js`).
2. Go to **Cursor Settings -> Features -> MCP**.
3. You will see `apple-hig` with a green indicator.

### C. Claude Code CLI
In your target project terminal, run:
```bash
claude mcp add apple-hig npx -y apple-hig-mcp
```

### D. Claude Desktop
Add the configuration to `claude_desktop_config.json`:
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
```json
{
  "mcpServers": {
    "apple-hig": {
      "command": "npx",
      "args": ["-y", "apple-hig-mcp"]
    }
  }
}
```

---

## 5. How to Verify Connection

Ask your AI agent in the target project:
> *"Query apple-hig get_component_spec for Button and show me the corner radii and minimum hit target"*

Expected tool response:
The agent calls `apple-hig -> get_component_spec` and returns the official macOS/iOS HIG specification with the 44pt touch requirement and Liquid Glass material tokens.
