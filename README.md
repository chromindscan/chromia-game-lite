# Chromia G.A.M.E Lite Server
A server implementation that enables $CHR token transactions on the Chromia blockchain through Virtuals.io G.A.M.E Lite integration. This server provides the infrastructure for AI agents to send $CHR tokens.

![telegram-cloud-photo-size-5-6267250037222393690-y](https://github.com/user-attachments/assets/03aa191b-612f-42c2-ab02-c197cd5c0c4e)

## Overview
This repository provides a server-side implementation for integrating with Virtuals.io G.A.M.E (Generative Autonomous Multimodal Entities) Lite. It demonstrates how to set up endpoints that allow AI agents to initiate $CHR token transfers. Use this as a template to build your own G.A.M.E-enabled applications!

## Use Cases
- Automated tipping system for content creators
- Reward distribution for community engagement
- AI-driven token distribution mechanisms
- Gamification rewards system

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


## Adding Custom Functions
The project uses Swagger for API documentation. Add new endpoints using the following format:

```
/**
 * @swagger
 * /endpoint:
 *     get
 *         name: FUNCTION_NAME
 *         summary: FUNCTION_DESCRIPTION
 *         description: HINT
 *         game_lite_supported: true (set it to false to not be included)
 **/
```

Generate updated G.A.M.E Lite configuration:
```bash
bun run script/generateGameLite.ts
```

## Production Guide

1. Setup:
   - Set `NODE_ENV=production`
   - Set `SERVER_SECRET_KEY` with a secure random string
   - Set the `prodAllowedIps` to support Virtuals' IP
   
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


## Security Considerations

- Protect the SERVER_SECRET_KEY
- Implement IP allowlisting
- Use HTTPS for all connections
- Implement rate limiting