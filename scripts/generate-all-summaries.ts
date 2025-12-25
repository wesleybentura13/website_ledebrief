/**
 * Script to generate summaries for all episodes
 * Run with: npx tsx scripts/generate-all-summaries.ts
 */

import https from "https";

const CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || "UCQp1rnvqh08DCfw3ul_D5oA";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

interface Episode {
  youtubeId: string;
  title: string;
  episodeNumber: number;
}

async function fetchEpisodes(): Promise<Episode[]> {
  return new Promise((resolve, reject) => {
    const url = `${API_BASE_URL}/api/fetch-episodes?channelId=${CHANNEL_ID}`;
    
    https.get(url, { rejectUnauthorized: false }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          const episodes = (jsonData.episodes || []).map((ep: any) => {
            // Extract episode number from title
            const match = ep.title.match(/^#(\d+)/);
            const episodeNumber = match ? parseInt(match[1], 10) : 0;
            
            return {
              youtubeId: ep.youtubeId,
              title: ep.title,
              episodeNumber,
            };
          });
          resolve(episodes);
        } catch (error) {
          reject(error);
        }
      });
    }).on("error", reject);
  });
}

async function generateSummary(videoId: string, title: string, episodeNumber: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(`${API_BASE_URL}/api/newsletter/generate-summary`);
    const postData = JSON.stringify({
      videoId,
      title,
      episodeNumber,
    });

    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
      rejectUnauthorized: false,
    };

    const client = urlObj.protocol === "https:" ? https : require("http");
    const req = client.request(options, (res: any) => {
      let data = "";
      res.on("data", (chunk: Buffer) => {
        data += chunk.toString();
      });
      res.on("end", () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            console.log(`✅ Épisode #${episodeNumber}: Résumé généré avec succès`);
            resolve();
          } else {
            console.error(`❌ Épisode #${episodeNumber}: ${result.error || "Erreur inconnue"}`);
            if (result.details) {
              console.error(`   Détails: ${result.details}`);
            }
            reject(new Error(result.error || "Erreur inconnue"));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log("🚀 Démarrage de la génération des résumés...\n");

  try {
    // Fetch all episodes
    console.log("📥 Récupération de la liste des épisodes...");
    const episodes = await fetchEpisodes();
    console.log(`✅ ${episodes.length} épisodes trouvés\n`);

    // Sort by episode number (oldest first to process in order)
    episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);

    // Generate summary for each episode
    let successCount = 0;
    let errorCount = 0;

    for (const episode of episodes) {
      if (!episode.youtubeId) {
        console.log(`⏭️  Épisode #${episode.episodeNumber}: Pas de videoId, ignoré`);
        continue;
      }

      console.log(`\n📝 Traitement de l'épisode #${episode.episodeNumber}: ${episode.title}`);
      
      try {
        await generateSummary(episode.youtubeId, episode.title, episode.episodeNumber);
        successCount++;
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`   Erreur: ${error instanceof Error ? error.message : String(error)}`);
        errorCount++;
      }
    }

    console.log(`\n\n✨ Terminé !`);
    console.log(`   ✅ Réussis: ${successCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📊 Total: ${episodes.length}`);
  } catch (error) {
    console.error("❌ Erreur fatale:", error);
    process.exit(1);
  }
}

main();

