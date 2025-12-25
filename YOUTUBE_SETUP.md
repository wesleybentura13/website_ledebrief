# YouTube Episodes Setup

To display YouTube episodes on your website, you need to get your YouTube channel ID and configure it.

## Step 1: Get Your YouTube Channel ID

1. Go to your YouTube channel: https://www.youtube.com/@ledebrief_podcast
2. Right-click on the page and select "View Page Source" (or press `Cmd+Option+U` on Mac, `Ctrl+U` on Windows)
3. Press `Cmd+F` (Mac) or `Ctrl+F` (Windows) to open the search box
4. Search for `"channelId"`
5. You'll find something like: `"channelId":"UCxxxxxxxxxxxxxxxxxxxxx"`
6. Copy the channel ID (the part after the colon, including the quotes)

## Step 2: Set the Channel ID

### Option A: Environment Variable (Recommended)

Create a `.env.local` file in the root of your project and add:

```
NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=UCxxxxxxxxxxxxxxxxxxxxx
```

Replace `UCxxxxxxxxxxxxxxxxxxxxx` with your actual channel ID.

### Option B: Manual Update

You can also manually update the episodes in `src/lib/episodes.ts` by adding `youtubeId` to each episode:

```typescript
{
  slug: "episode-slug",
  title: "Episode Title",
  // ... other fields
  youtubeId: "VIDEO_ID_HERE", // Add this
  thumbnailUrl: "https://img.youtube.com/vi/VIDEO_ID_HERE/maxresdefault.jpg" // Optional
}
```

## Step 3: Test

1. Restart your development server: `npm run dev`
2. Navigate to `/episodes` page
3. The episodes should automatically load from your YouTube channel in the same order as on YouTube

## Notes

- Episodes are fetched from YouTube's RSS feed, which is public and doesn't require an API key
- The episodes will be displayed in the same order as on your YouTube channel
- Each episode will have a thumbnail and an embedded YouTube player
- Videos can be played directly on your website

## Troubleshooting

If episodes don't load:
1. Make sure your channel ID is correct
2. Ensure your YouTube channel has public videos
3. Check the browser console for any errors
4. Verify the channel ID format (should start with "UC" and be 24 characters long)


