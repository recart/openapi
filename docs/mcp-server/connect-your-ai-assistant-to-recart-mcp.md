# Connect your AI assistant to Recart (MCP)

Learn how to connect Claude, ChatGPT or your coding assistant to Recart so you can ask about your results in plain language.

Recart's MCP server lets an AI assistant like Claude, ChatGPT, Codex or Cursor read your Recart data, so you can ask about your popups, A/B tests, flows and subscriber sources in plain language instead of clicking through the dashboard. Before you start you'll need admin access to your Recart account to create an API key, and the assistant you want to connect installed and ready.

**Table of contents:**

* [What your assistant can access](#access)
* [Setup Steps](#setup-steps)
  * [Step 1: Create an API key](#setup-steps)
  * [Step 2: Add Recart to your assistant](#step2)
  * [Step 3: Ask away](#step3)
* [Good to know](#good-to-know)

### What your assistant can access

The Recart MCP server gives a connected assistant **read-only** access to your account. It can look up:

* Your opt-in tools (popups) and their statistics
* Your popup A/B tests and their results
* Your automated and campaign flows
* Where your subscribers came from

The assistant cannot create, edit, send or delete anything in Recart. Everything it reads comes from the account tied to the API key you give it, so it only ever sees your own store's data.

### Setup Steps

### Step 1: Create an API key

Your assistant signs in to Recart with an API key.

1. In the Recart app, open [**Settings**](http://app.recart.com/settings), then the [**API & MCP**](http://app.recart.com/settings/api) tab
2. In the **API keys** section, click **Create new key**
3. Name the key after the assistant you're connecting, for example "Claude" or "ChatGPT", so you can revoke that one key later without affecting your other integrations
4. Copy the key and keep it somewhere safe — you'll paste it into the assistant in the next step

**Important note:** Keep the key private. Anyone holding it can read your Recart data. For more detail on API keys, see [How do I Generate an API Key for Integrations?](https://help.recart.com/en/articles/api-key-generation)

### Step 2: Add Recart to your assistant

Pick the assistant you use below and follow its steps. In every snippet, replace `YOUR_API_KEY` with the key you created in step 1.

You'll find the same snippets on the **API & MCP** tab in the app, each with a copy button.

#### Claude Desktop

1. Install Node.js if you don't have it yet — the connection runs through a small bridge that needs it
2. In Claude Desktop, open **Settings**, then **Developer**, then **Edit Config**. This opens `claude_desktop_config.json`
3. Add the entry below inside `mcpServers`, replace the placeholder with your API key, and save
4. Quit Claude Desktop fully and reopen it. Recart appears under **Developer** once it connects

```
{
  "mcpServers": {
    "recart": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.recart.com/mcp", "--header", "X-Recart-API-Key: YOUR_API_KEY"]
    }
  }
}
```

The Claude web app only accepts OAuth connectors today, so use Claude Desktop instead.

#### ChatGPT

**Important note:** ChatGPT needs a Business or Enterprise workspace, and a workspace admin has to create the app once before anyone can connect.

1. **Workspace admin:** One-time setup for the whole workspace. In ChatGPT open **Settings**, then **Apps**, then **Create**. *Needs a Business or Enterprise workspace.
2. **Workspace admin:** Enter the settings below. ChatGPT asks only for the header name here, not for the key. Accept the notice, create the app and publish it.
3. **Each user:** Open **Settings**, then **Plugins**, pick **Recart** and click **Connect**. Paste your **API key** on its own.
4. Until someone has connected, the app shows "No actions are available". That is expected.

```
Name: Recart MCP server
URL: https://mcp.recart.com/mcp
Authentication: Access token / API key
Header scheme: Custom Header
Header name: X-Recart-API-Key
```

The key is entered when you connect, never in the app settings. Keep the key private: anyone holding it can read your Recart data.

#### Claude Code

1. Run the command below in your terminal, replacing the placeholder with your API key
2. Start Claude Code and ask it about your Recart data

```
claude mcp add --scope user --transport http recart https://mcp.recart.com/mcp --header "X-Recart-API-Key: YOUR_API_KEY"
```

#### Codex

1. Open `~/.codex/config.toml`, or create it if it doesn't exist
2. Add the block below, replacing the placeholder with your API key, and save
3. Start Codex and ask it about your Recart data

```
[mcp_servers.recart]
url = "https://mcp.recart.com/mcp"
http_headers = { "X-Recart-API-Key" = "YOUR_API_KEY" }
```

#### Cursor

1. Open `~/.cursor/mcp.json`, or .cursor/mcp.json inside a project to limit it to that project. Create the file if it doesn't exist
2. Add the entry below, replacing the placeholder with your API key, and save
3. Cursor picks the server up on its own. If it doesn't, reload the window

```
{
  "mcpServers": {
    "recart": {
      "url": "https://mcp.recart.com/mcp",
      "headers": { "X-Recart-API-Key": "YOUR_API_KEY" }
    }
  }
}
```

### Step 3: Ask away

Once the assistant is connected, ask it about your store in your own words. For example:

* How did my popups perform last month?
* Which variant is winning my welcome popup A/B test?
* Where did my new SMS subscribers come from this month?

If your assistant is connected to more than one store, say which one you mean — by store name or domain — and it will use that account.

### Good to know

* **The connection is read-only.** Your assistant can look at your data but can't change anything in Recart
* **Flow statistics are not exposed yet** — the assistant can list your automated and campaign flows, but not their performance numbers
* **One key per assistant.** Naming each key after the assistant it belongs to means you can revoke a single connection later without breaking your other integrations
* **Revoking a key cuts the connection immediately.** Delete the key in the **API keys** section of the **API & MCP** tab, then remove the entry from the assistant's config
* **Numbers come straight from Recart.** Opt-in rates count unique sessions rather than subscribers, the same way they do in your dashboard, so an assistant's summary matches what you see in the app

#### Need help?

If you have any questions, do not hesitate to contact the **Customer Support team**, we are happy to help. 😊
