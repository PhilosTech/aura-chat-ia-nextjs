<a href="https://github.com/PhilosTech/aura-chat">
  <img alt="Next.js 14 and App Router-ready AI chatbot." src="app/(chat)/opengraph-image.png">
  <h1 align="center">Aura Chat</h1>
</a>

<p align="center">
  An Open-Source AI Chatbot Template Built With Next.js and Supabase.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running locally</strong></a>
</p>
<br/>

## Features

- [Next.js](https://nextjs.org) App Router
  - Advanced routing for seamless navigation and performance
  - React Server Components (RSCs) and Server Actions for server-side rendering and increased performance
- [Supabase](https://supabase.com)
  - Open-source Firebase alternative with Postgres database, authentication, and storage
- [shadcn/ui](https://ui.shadcn.com)
  - Styling with [Tailwind CSS](https://tailwindcss.com)
  - Component primitives from [Radix UI](https://radix-ui.com) for accessibility and flexibility
- Data Persistence
  - Supabase Postgres for saving chat history and user data
  - Supabase Storage for efficient file storage
- Authentication
  - Supabase Auth for simple and secure authentication

## Model Providers

This template uses OpenAI `gpt-4o` as the default model. However, you can switch to other AI providers supported by Supabase and OpenAI-compatible APIs.

## Deploy Your Own

You can deploy your own version of Aura Chat by cloning the repository and setting up Supabase:

```bash
git clone https://github.com/PhilosTech/aura-chat.git
cd aura-chat
```

Set up your environment variables in `.env.local` following `.env.example`.

## Running locally

To run Aura Chat locally, follow these steps:

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server:
   ```bash
   pnpm dev
   ```

Your app should now be running on [localhost:3000](http://localhost:3000/).