# chromia-game-lite

This is a sample express server that you can deploy functions for G.A.M.E lite for an AI Agent to send $CHR out

## Guide

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run src/index.ts
```

## Development Setup

1. Start the local development server:
```bash
bun run src/index.ts
```

2. Create a public domain using [ngrok](https://download.ngrok.com) or any other tunneling service:

```bash
ngrok http http://localhost:3000
```

3. Go to https://game-lite.virtuals.io/ and:
   - Upload your `game-list.json` file
   - Update the function URL from localhost:3000 to your ngrok URL

4. Test the functionality:
   - Create a tweet with the format: "send 0.001 $CHR to xxxxxxx"
   - Use the tweet ID to simulate the AI Agent's response


## Production Guide

1. Set Environment Variables:
   - Set `NODE_ENV=production`
   - Set `SERVER_SECRET_KEY` with a secure random string
   
2. Configure Application:
   - Update `game-lite.json` with your production `SERVER_SECRET_KEY` settings
   - Ensure all sensitive credentials are properly secured
   
3. Deployment Steps:
   - Build the application: `bun build src/index.ts`
   - Deploy to your production server
   - Set up SSL/TLS for secure HTTPS connections
   
4. Security Considerations:
   - Keep your `SERVER_SECRET_KEY` secure and never commit it to version control
   - Regularly rotate security credentials
