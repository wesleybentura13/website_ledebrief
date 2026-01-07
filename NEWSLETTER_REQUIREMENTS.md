# Newsletter System - Requirements & Setup

## ✅ What's Been Built

### 1. **API Routes Created**
- ✅ `/api/newsletter/transcript` - Fetches YouTube video transcriptions
- ✅ `/api/newsletter/generate-summary` - Generates AI summaries from transcriptions
- ✅ `/api/newsletter/content` - Returns newsletter content (public vs subscriber-only)
- ✅ `/api/newsletter` (POST) - Handles newsletter subscriptions

### 2. **Storage System**
- ✅ `data/newsletter-subscribers.json` - Stores subscriber emails
- ✅ `data/newsletter-content.json` - Stores episode summaries

### 3. **Newsletter Page**
- ✅ `/newsletter` - Displays all summaries except last 5 episodes
- ✅ Shows locked content notice for non-subscribers
- ✅ Links to subscribe

## 🔧 What You Need to Set Up

### 1. **OpenAI API Key** (Required for summaries)

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys: https://platform.openai.com/api-keys
4. Create a new API key
5. Add to `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-api-key-here
   ```

**Cost**: ~$0.15 per 1M tokens. Summarizing a podcast transcript (~5000 words) costs approximately $0.01-0.02.

### 2. **Email Service** (Required for sending newsletters)

Recommended: **Resend** (free tier: 3,000 emails/month)

1. Go to https://resend.com/
2. Sign up
3. Get API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   RESEND_FROM_NAME=Le Débrief Podcast
   ```

**Note**: You'll need to verify your domain in Resend to send emails. For testing, you can use `onboarding@resend.dev` as the from email.

## 📋 How to Use

### Step 1: Generate Summary for an Episode

When a new episode is published, call the API to generate a summary:

```bash
curl -X POST http://localhost:3000/api/newsletter/generate-summary \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "ze3z6oR4s1c",
    "title": "#34- NOTRE FRÈRE A RÉALISÉ SON RÊVE !",
    "episodeNumber": 34
  }'
```

Or create an admin page/script to do this automatically.

### Step 2: View Newsletter Content

- Public: http://localhost:3000/newsletter (shows all except last 5)
- Subscribers: Will see all content (when subscriber check is implemented)

### Step 3: Subscribe to Newsletter

Users can subscribe via:
- Homepage form (to be added)
- Newsletter page form (to be added)

## ✅ Email Newsletter System

When you generate a summary for a new episode, the system **automatically sends emails** to all subscribers with:
- Personalized greeting (using subscriber's first name)
- Episode title and summary
- YouTube link
- Full transcript (first 2000 characters, with link to full transcript)
- Professional HTML email template

**Email sending happens automatically** when you call `/api/newsletter/generate-summary` - no additional steps needed!

## 🎯 Next Steps

1. **Add subscription form to homepage** - Form to collect emails
2. **Add subscription form to newsletter page** - Another entry point
3. **Implement subscriber authentication** - Check if user is subscribed
4. **Auto-generate summaries** - Create a script/cron job to auto-generate summaries for new episodes
5. ~~**Email sending**~~ ✅ **DONE** - Emails are sent automatically when summaries are generated
6. **Admin dashboard** - Interface to manage summaries and subscribers

## 📝 Notes

- Transcriptions are fetched from YouTube's automatic captions
- Summaries use OpenAI GPT-4o-mini (cost-effective)
- Last 5 episodes are locked for subscribers only
- All data stored in JSON files (can upgrade to database later)

## 🚀 Testing

1. Test transcription fetching:
   ```bash
   curl "http://localhost:3000/api/newsletter/transcript?videoId=ze3z6oR4s1c"
   ```

2. Test summary generation (requires OpenAI API key):
   ```bash
   curl -X POST http://localhost:3000/api/newsletter/generate-summary \
     -H "Content-Type: application/json" \
     -d '{"videoId": "ze3z6oR4s1c", "title": "Test Episode", "episodeNumber": 1}'
   ```

3. View newsletter content:
   ```bash
   curl "http://localhost:3000/api/newsletter/content"
   ```


