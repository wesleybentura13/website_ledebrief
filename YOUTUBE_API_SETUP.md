# YouTube Data API Setup (To Get All Videos)

## Why You Need This

YouTube RSS feeds are limited to the **15 most recent videos** only. To display all 34 of your regular videos (excluding shorts), you need the YouTube Data API v3.

## How to Get a YouTube API Key (Free)

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click the project dropdown at the top
   - Click "New Project" or select an existing one
   - Give it a name (e.g., "Le Debrief Podcast")

3. **Enable YouTube Data API v3**
   - Go to "APIs & Services" → "Library"
   - Search for "YouTube Data API v3"
   - Click on it and click "Enable"

4. **Create Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key that appears

5. **Restrict the API Key (Recommended)**
   - Click on the API key you just created
   - Under "API restrictions", select "Restrict key"
   - Choose "YouTube Data API v3"
   - Click "Save"

6. **Add to Your Project**
   - Open your `.env.local` file
   - Add this line:
     ```
     YOUTUBE_API_KEY=your-youtube-api-key-here
     ```
   - Replace `your-youtube-api-key-here` with the API key you copied

7. **Restart Your Dev Server**
   - Stop the server (Ctrl+C)
   - Run `npm run dev` again

## Notes

- The API key is **free** for reasonable usage (10,000 units per day)
- Each video fetch uses about 100 units, so you can fetch ~100 videos per day
- The API key should be kept secret (don't commit `.env.local` to git)
- Once you add the API key, the website will automatically fetch all 34 videos

## Current Status

- ✅ Shorts are filtered out
- ✅ RSS feed works (but limited to 15 most recent videos)
- ✅ YouTube Data API support is ready (just needs your API key)
- ⏳ Waiting for API key to fetch all 34 videos


