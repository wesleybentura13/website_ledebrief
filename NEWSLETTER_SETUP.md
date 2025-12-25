# Newsletter Setup Guide

## Overview

The newsletter system automatically:
1. Fetches transcriptions from YouTube videos
2. Generates summaries from transcriptions
3. Stores newsletter content
4. Shows all summaries except the last 5 episodes (subscriber-only)
5. Sends email newsletters to subscribers

## Required Setup

### 1. OpenAI API Key (for summarization)

1. Go to https://platform.openai.com/
2. Create an account or sign in
3. Go to API Keys section
4. Create a new API key
5. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

### 2. Email Service (Resend - Recommended)

1. Go to https://resend.com/
2. Sign up for a free account
3. Verify your domain (or use their test domain)
4. Get your API key
5. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   ```

### 3. Database/Storage

For now, we're using JSON files for storage. You can upgrade to a database later:
- `data/newsletter-subscribers.json` - stores subscriber emails
- `data/newsletter-content.json` - stores episode summaries

## How It Works

1. **Fetch Transcriptions**: When a new episode is published, the system fetches the YouTube transcription
2. **Generate Summary**: Uses OpenAI to create a concise summary from the transcription
3. **Store Content**: Saves the summary with episode metadata
4. **Display**: Newsletter page shows all summaries except the last 5 (which are subscriber-only)
5. **Send Emails**: When a new episode is published, subscribers receive an email with the summary

## API Endpoints

- `GET /api/newsletter/content` - Get all newsletter content (public + subscriber-only based on auth)
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/generate-summary` - Generate summary for an episode (admin)
- `GET /api/newsletter/transcript/:videoId` - Fetch transcription for a YouTube video

## Next Steps

1. Set up OpenAI API key
2. Set up Resend account
3. Test transcription fetching
4. Test summary generation
5. Create newsletter page UI

