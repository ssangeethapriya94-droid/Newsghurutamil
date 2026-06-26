const connectDB = require("./db");
const mongoose = require("mongoose");
const fetch = require("node-fetch"); // Or use native fetch if Node version supports it

function getDurationSeconds(durationStr) {
  if (!durationStr) return 0;
  const matches = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  const hours = parseInt(matches[1] || 0);
  const minutes = parseInt(matches[2] || 0);
  const seconds = parseInt(matches[3] || 0);
  return hours * 3600 + minutes * 60 + seconds;
}

async function run() {
  const apiKey = process.env.YOUTUBE_API_KEY || "AIzaSyD5PhXSeiw_KQS9FOwxqwRpQKrpM-9mWPY";
  const channelId = "UCwLcAVYQc738R4ENb_eB7-A"; // English channel

  const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=50&type=video`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.error) {
    console.error("Search Error:", searchData.error);
    return;
  }

  const items = searchData.items || [];
  console.log(`Found ${items.length} items from search.`);
  if (items.length === 0) return;

  const videoIds = items.map(item => item.id.videoId);

  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds.join(",")}&part=snippet,contentDetails`;
  const detailsRes = await fetch(detailsUrl);
  const detailsData = await detailsRes.json();

  if (detailsData.error) {
    console.error("Details Error:", detailsData.error);
    return;
  }

  const videos = detailsData.items || [];
  console.log("\n--- DETAILED VIDEOS ---");
  videos.forEach(v => {
    const duration = v.contentDetails?.duration || "";
    const secs = getDurationSeconds(duration);
    console.log(`ID: ${v.id} | Duration: ${duration} (${secs}s) | Title: ${v.snippet?.title}`);
  });
}

run().catch(console.error);
