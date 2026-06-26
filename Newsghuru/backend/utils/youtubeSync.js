const Short = require("../models/Short");
const Video = require("../models/Video");

// Helper to detect if a YouTube video is a vertical Short or a horizontal Video
async function isVerticalShort(videoId) {
  try {
    const url = `https://www.youtube.com/shorts/${videoId}`;
    const response = await fetch(url, { method: "HEAD", redirect: "manual" });
    if (response.status === 200) {
      return true;
    }
    
    // Fallback: If it redirects, fetch the watch page HTML and parse streaming formats
    if (response.status >= 300 && response.status < 400) {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const watchRes = await fetch(watchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });
      const html = await watchRes.text();
      const marker = "ytInitialPlayerResponse = ";
      const startIdx = html.indexOf(marker);
      if (startIdx !== -1) {
        let jsonStart = startIdx + marker.length;
        let braceCount = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < html.length; i++) {
          if (html[i] === '{') {
            braceCount++;
          } else if (html[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i + 1;
              break;
            }
          }
        }
        if (jsonEnd !== -1) {
          const jsonStr = html.substring(jsonStart, jsonEnd).trim().replace(/;$/, '');
          const playerResponse = JSON.parse(jsonStr);
          const streamingData = playerResponse.streamingData || {};
          const formats = (streamingData.formats || []).concat(streamingData.adaptiveFormats || []);
          for (const f of formats) {
            if (f.width && f.height && f.height > f.width) {
              return true;
            }
          }
        }
      }
    }
    return false;
  } catch (err) {
    console.error(`[YouTube Sync] Error checking layout for ${videoId}:`, err.message);
    return false;
  }
}

// Helper to convert ISO 8601 duration (e.g. PT1M23S) to seconds
function getDurationSeconds(durationStr) {
  if (!durationStr) return 0;
  const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

const CATEGORY_KEYWORDS = {
  sports: [
    "sport", "cricket", "football", "dhoni", "kohli", "ipl", "olympic", "chess", 
    "praggnanandhaa", "carlsen", "asia cup", "kabaddi", "விளையாட்ட", "கிரிக்கெட்", 
    "கால்பந்து", "சதுரங்கம்", "கபடி", "ஐபிஎல்", "உலகக்கோப்பை", "உலகக் கோப்பை", "ரோஹித்", 
    "தோனி", "கோலி", "டென்னிஸ்", "wimbledon", "t20", "fifa", "pant", "rahul", "bumrah", "jadeja",
    "தங்க பதக்கம்", "வெண்கல பதக்கம்", "வெள்ளி பதக்கம்", "பதக்கம்", "நீரஜ் சோப்ரா", "சோப்ரா", "champion"
  ],
  politics: [
    "politics", "political", "election", "stalin", "modi", "dmk", "admk", "bjp", 
    "congress", "seeman", "ntk", "ops", "eps", "minister", "parliament", "assembly", 
    "president", "அரசியல்", "தேர்த", "திமுக", "அதிமுக", "பாஜக", "காங்கிரஸ்", "சீமான்", 
    "அமைச்ச", "நாடாளுமன்ற", "சட்டமன்ற", "அதிப", "ஆளுந", "governor", "rahul gandhi",
    "உதயநிதி", "எடப்பாடி", "அண்ணாமலை", "annamalai", "stalin", "ops", "eps", "cbi", "ed", "ips",
    "மக்களவை", "சட்டசபை", "கூட்டணி", "பதவி விலகல்", "திமுக அரசு", "அதிமுக அரசு",
    "தலைமைச் செயலக", "செயலக", "அரசு", "ஆணைய", "கூட்டணி", "காவிரி மேலாண்மை",
    // Expanded Tamil political keywords
    "ஸ்டாலின்", "மோடி", "கருணாநிதி", "முதல்வர்", "முதலமைச்சர்", "பிரதமர்", "ஜனாதிபதி",
    "அமலாக்கத்துறை", "லஞ்ச ஒழிப்பு", "தவெக", "டிவிகே", "ஓபிஎஸ்", "இபிஎஸ்", 
    "அழகிரி", "பெரியார்", "ஜெயலலிதா", "கட்சி", "கட்சிகள்", "கைது", "ஆணையம்", 
    "நீதிமன்ற", "உயர்நீதிமன்ற", "உச்சநீதிமன்ற", "வழக்கு", "விசாரணை", "பேட்டி", 
    "டிரம்ப்", "பைடன்", "துரைமுருகன்", "பொன்முடி", "செந்தில் பாலாஜி", "அன்பில் மகேஷ்",
    "போராட்டம்", "கோரிக்கை", "கலைஞர்"
  ],
  cinema: [
    "cinema", "movie", "film", "teaser", "trailer", "review", "director", "actor", 
    "actress", "song", "box office", "jawan", "shah rukh", "suhana khan", "nayanthara", 
    "vijay", "ajith", "rajini", "arrahman", "rahman", "இசை", "பாடல்", "திரைப்பட", 
    "படம்", "சினிமா", "நடிகர்", "நடிகை", "இயக்குனர்", "இயக்குநர்", "விமர்சனம்", "டிரெய்லர்", "டீசர்",
    "kavin", "dhanush", "suriya", "kamal", "singers", "sk", "sivakarthikeyan", "விஜய்", 
    "அஜித்", "சூர்யா", "தனுஷ்", "ரஜினி", "கமல்", "நயன்தாரா", "ரகுமான்", "அனிருத்", "anirudh",
    "leo", "jailer", "thangalaan", "kanguva", "viduthalai", "vetrimaaran", "lokesh", "nelson",
    "மாரிமுத்து", "விஜய் ஆண்டனி", "வசந்தபாலன்", "ரசிகர்கள்", "ரசிகர்களின்", "அரங்கம்", "audiolaunch", "விக்ரம்", "லியோ"
  ],
  anmigam: [
    "spiritual", "temple", "anmigam", "god", "worship", 
    "prayers", "tirupati", "baba", "shivan", "murugan", "kovil", "கோவில்", "கோயில்", 
    "ஆன்மீக", "வழிபாடு", "பரிகார", "பூஜை", "சுவாமி", "பக்தி",
    "பரிகாரங்கள்", "வழிபாடுகள்", "விநாயகர்", "முருகன்", "சிவன்", "பெருமாள்", "அம்மன்", 
    "கிரிவலம்", "பவுர்ணமி", "பௌர்ணமி", "திருவண்ணாமலை", "பிரார்த்தனை"
  ],
  jothidam: [
    "horoscope", "astrology", "rasi", "palan", "rasipalan", "rasi palan", "jothidam", 
    "ஜோதிடம்", "ஜோசியம்", "ராசிபலன்", "சனிப் பெயர்ச்சி", "குரு பெயர்ச்சி", "ராகு கேது", 
    "astregal", "astrological"
  ],
  business: [
    "business", "market", "gold", "share price", "finance", "economy", "rupee", "gst", 
    "corporate", "bse", "nse", "inflation", "பங்குச் சந்தை", "தங்கம்", "பங்கு", "விலை", 
    "நிதி", "வணிகம்", "பொருளாதாரம்", "பட்ஜெட்", "வெள்ளி விலை", "தங்க விலை", "வெள்ளி", "சென்செக்ஸ்",
    "நிஃப்டி", "sensex", "nifty", "trade", "investment"
  ],
  education: [
    "education", "school", "exam", "student", "teacher", "university", "college", 
    "result", "hsc", "sslc", "cbse", "notebook", "கல்வி", "பள்ளி", "தேர்வு", "கல்லூரி", 
    "பல்கலைக்கழகம்", "மாணவர்", "மாணவ", "ஆசிரியர்", "பள்ளிகள்", "மாணவர்கள்", "தேர்வுகள்",
    "மதிப்பெண்", "cutoff", "neos", "ugc", "neet", "நீட்", "திருக்குறள்", "thirukkural", "thirukural", "குறள்", "kural"
  ],
  tamil: [
    "tamil nadu", "tamilnadu", "chennai", "coimbatore", "madurai", "trichy", "salem", 
    "tngovt", "tamil news", "தமிழ்நாடு", "தமிழகம்", "தமிழக", "சென்னை", "மதுரை", "கோவை", 
    "திருச்சி", "சேலம்", "நெல்லை", "கொங்கு", "தமிழா", "தமிழக அரசு", "மின்சார வாரியம்", 
    "மின் கட்டண", "போக்குவரத்து", "நாகப்பட்டினம்", "தஞ்சாவூர்", "நெய்வேலி", "nlc",
    "மீனவர்கள்", "மீனவர்", "காவிரி"
  ],
  india: [
    "india", "delhi", "mumbai", "kolkata", "bengaluru", "national", "இந்தியா", 
    "டெல்லி", "மும்பை", "இந்திய", "நாடாளுமன்ற", "விண்கல", "isro", "aditya l1", 
    "chandrayaan", "chandraayan", "vikram lander", "spaceresearch", "luna", "இஸ்ரோ",
    "ஸ்ரீஹரிகோட்டா", "ஏவுகணை", "rocket", "ஆதித்யா", "சந்திரயா", "விண்கல", "விக்ரம் லேண்ட"
  ],
  world: [
    "world", "global", "international", "us", "usa", "russia", "china", "ukraine", 
    "biden", "trump", "luna-25", "nasa", "ulagam", "உலகம்", "சர்வதேச", "உலக", 
    "அமெரிக்கா", "அமெரிக்க", "america", "ரஷ்யா", "சீனா", "உக்ரைன்", "வெளிநாடு", "டிரம்ப்", "பைடன்", "புதின்",
    "israel", "gaza", "ஹமாஸ்", "இஸ்ரேல்", "பாலஸ்தீனம்", "singapore", "சிங்கப்பூர்"
  ],
  tech: [
    "tech", "technology", "mobile", "gadget", "smart phone", "iphone", "android", 
    "ai", "artificial intelligence", "app", "software", "தொழில்நுட்பம்", "கைபேசி", 
    "செயலி", "மென்பொருள்", "மொபைல்", "ஸ்மார்ட்போன்", "வாட்ஸ்அப்", "whatsapp", "instagram",
    "facebook", "twitter", "ஃபேஸ்புக்", "ட்விட்டர்", "ஏஐ"
  ]
};

// Political context words that override cinema keyword matches
const POLITICAL_CONTEXT_WORDS = [
  "முதல்வர்", "முதலமைச்சர்", "அமைச்சர்", "அரசியல்", "chief minister", "cm ",
  "லஞ்ச ஒழிப்பு", "திமுக", "அதிமுக", "பாஜக", "dmk", "admk", "bjp", "congress",
  "election", "தேர்தல்", "கட்சி", "parliament", "assembly", "அரசு", "செயலக",
  "மந்திரி", "கைது", "வழக்கு", "விசாரணை", "நீதிமன்ற", "ஊழல்", "cbi", "ed",
  "போராட்டம்", "பேட்டி", "ஜனாதிபதி", "பிரதமர்", "governor", "ஆளுநர்",
  "கருணாநிதி", "பெரியார்", "ஸ்டாலின்", "அழகிரி", "dvk", "tvk", "tvk"
];

function matchKeyword(text, kw) {
  const cleanKw = kw.toLowerCase();
  
  // Specific exclusions to avoid incorrect substring matches
  if (cleanKw === "முருகன்" && text.includes("துரைமுருகன்")) return false;
  if (cleanKw === "murugan" && text.includes("duraimurugan")) return false;
  if (cleanKw === "விக்ரம்" && text.includes("விக்ரம் லேண்ட")) return false;
  if (cleanKw === "படம்" && text.includes("புகைப்படம்")) return false;
  if (cleanKw === "நிதி" && (text.includes("கருணாநிதி") || text.includes("நிதிஷ்") || text.includes("நிதிஸ்"))) return false;

  // Suppress cinema match for 'விஜய்' / 'vijay' / 'ajith' when political context is found
  // e.g., "முதல்வர் விஜய்" should NOT match cinema, it refers to CM Vijay (politician)
  const cinemaAmbiguousKws = ["விஜய்", "vijay", "அஜித்", "ajith", "kamal", "கமல்"];
  if (cinemaAmbiguousKws.includes(cleanKw)) {
    const hasPoliticalContext = POLITICAL_CONTEXT_WORDS.some(pw => text.includes(pw.toLowerCase()));
    if (hasPoliticalContext) return false;
  }
  
  // Enforce word boundaries for short English keywords (2 to 4 letters)
  if (/^[a-z0-9]{2,4}$/i.test(cleanKw)) {
    const regex = new RegExp('\\b' + cleanKw + '\\b', 'i');
    return regex.test(text);
  }
  
  return text.includes(cleanKw);
}

// Detect category based on title, description, and tags
function detectCategory(title, description, tags = []) {
  const cleanTitle = (title || "").toLowerCase();
  const cleanTags = (tags || []).map(t => t.toLowerCase());

  // Clean description of generic social/ad/hashtag footers
  const cleanDescForMatching = (desc) => {
    if (!desc) return "";
    let lines = desc.split("\n").filter(line => {
      const lower = line.toLowerCase();
      return !lower.includes("http") && !lower.includes("facebook") && !lower.includes("instagram") && !lower.includes("twitter") && !lower.includes("linkedin");
    });
    let text = lines.join(" ");
    text = text.replace(/#\w+/g, "");
    return text.toLowerCase();
  };
  const cleanedDesc = cleanDescForMatching(description);

  let bestCategory = "latest";
  let maxScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;

    // Check title matches (highly weighted - 1000 points per match)
    for (const kw of keywords) {
      if (matchKeyword(cleanTitle, kw)) {
        score += 1000;
      }
    }

    // Check tags matches (medium weighted - 10 points per match)
    let tagMatches = 0;
    for (const kw of keywords) {
      if (cleanTags.some(t => matchKeyword(t, kw))) {
        tagMatches++;
      }
    }
    if (tagMatches > 0) {
      score += 10;
    }

    // Check description matches (low weighted - 1 point per match, capped at 2 points)
    let descMatches = 0;
    for (const kw of keywords) {
      if (matchKeyword(cleanedDesc, kw)) {
        descMatches++;
      }
    }
    score += Math.min(descMatches, 2); 

    // Use >= so that categories listed earlier (like politics before cinema) win on ties
    if (score > 0 && score >= maxScore) {
      maxScore = score;
      bestCategory = category;
    }
  }

  // If score is too low, fall back to "latest"
  if (maxScore < 3) {
    return "latest";
  }

  return bestCategory;
}

async function syncChannel(channelId, language) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || !channelId) {
    console.error(`[YouTube Sync] Missing credentials/IDs for ${language} channel.`);
    return;
  }

  try {
    console.log(`[YouTube Sync] Starting sync for ${language} channel: ${channelId}`);
    
    // Resolve the uploads playlist ID by replacing the second character of the channel ID with U
    const uploadsPlaylistId = channelId.replace(/^UC/, "UU");
    let pageToken = "";
    let totalItemsFetched = 0;
    let allVideoIds = [];
    
    // Page through the uploads playlist (3 pages max, up to 150 items)
    for (let page = 1; page <= 3; page++) {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=contentDetails&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}`;
      const playlistRes = await fetch(playlistUrl);
      const playlistData = await playlistRes.json();
      
      if (playlistData.error) {
        throw new Error(playlistData.error.message);
      }
      
      const items = playlistData.items || [];
      if (items.length === 0) break;
      
      allVideoIds.push(...items.map(item => item.contentDetails.videoId));
      totalItemsFetched += items.length;
      
      pageToken = playlistData.nextPageToken;
      if (!pageToken) break;
    }
    
    console.log(`[YouTube Sync] Retrieved ${totalItemsFetched} upload IDs from playlist.`);
    
    if (allVideoIds.length === 0) {
      console.log(`[YouTube Sync] No upload IDs found for ${language} channel.`);
      return;
    }
    
    // Chunk the detailed metadata requests (limit 50 IDs per request)
    const chunkSize = 50;
    let shortsCount = 0;
    let videosCount = 0;
    
    for (let i = 0; i < allVideoIds.length; i += chunkSize) {
      const chunkIds = allVideoIds.slice(i, i + chunkSize);
      
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${chunkIds.join(",")}&part=snippet,contentDetails`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      
      if (detailsData.error) {
        throw new Error(detailsData.error.message);
      }
      
      const videos = detailsData.items || [];
      
      // Determine layout (Short vs Video) in parallel for this chunk of videos
      const videoLayouts = await Promise.all(
        videos.map(async (v) => {
          const isShort = await isVerticalShort(v.id);
          return { id: v.id, isShort };
        })
      );
      const layoutMap = new Map(videoLayouts.map(item => [item.id, item.isShort]));
      
      for (const video of videos) {
        const videoId = video.id;
        const snippet = video.snippet || {};
        const contentDetails = video.contentDetails || {};
        
        const title = snippet.title || "";
        const description = snippet.description || "";
        const publishedAt = snippet.publishedAt ? new Date(snippet.publishedAt) : new Date();
        const tags = snippet.tags || [];
        const durationStr = contentDetails.duration || "";
        const durationSeconds = getDurationSeconds(durationStr);
        
        const category = detectCategory(title, description, tags);
        
        // Best high-res thumbnail selection
        const thumbnail = snippet.thumbnails?.maxres?.url || 
                          snippet.thumbnails?.high?.url || 
                          snippet.thumbnails?.medium?.url || 
                          snippet.thumbnails?.default?.url || 
                          "";
        
        const isShort = layoutMap.get(videoId);
        
        if (isShort) {
          // Clean up standard video if it was previously misclassified as a Video
          await Video.deleteOne({ youtubeVideoId: videoId });
          
          // Upsert to Short model
          await Short.findOneAndUpdate(
            { youtubeVideoId: videoId },
            {
              $set: {
                title: title,
                thumbnail: thumbnail,
                videoUrl: `https://www.youtube.com/embed/${videoId}`,
                category: category,
                description: description,
                isFeatured: false,
                isEnabled: true,
                status: "Published",
                language: language,
                publishedAt: publishedAt
              }
            },
            { upsert: true, returnDocument: 'after' }
          );
          shortsCount++;
        } else {
          // Clean up short if it was previously misclassified as a Short
          await Short.deleteOne({ youtubeVideoId: videoId });
          
          // Upsert to Video model
          await Video.findOneAndUpdate(
            { youtubeVideoId: videoId },
            {
              $set: {
                title: title,
                thumbnail: thumbnail,
                youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
                description: description,
                category: category,
                isFeatured: false,
                isTrending: false,
                language: language,
                youtubeVideoId: videoId,
                publishedAt: publishedAt
              }
            },
            { upsert: true, returnDocument: 'after' }
          );
          videosCount++;
        }
      }
    }
    
    console.log(`[YouTube Sync] Finished ${language} channel sync: Saved ${shortsCount} Shorts, ${videosCount} Videos.`);
  } catch (err) {
    console.error(`[YouTube Sync] Error syncing ${language} channel:`, err.message);
  }
}

async function runSync() {
  const englishChannelId = process.env.ENGLISH_CHANNEL_ID;
  const tamilChannelId = process.env.TAMIL_CHANNEL_ID;

  if (englishChannelId) {
    await syncChannel(englishChannelId, "en");
  }
  if (tamilChannelId) {
    await syncChannel(tamilChannelId, "ta");
  }
}

module.exports = { runSync, detectCategory, CATEGORY_KEYWORDS };
