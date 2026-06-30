async function checkShort(videoId) {
  const url = `https://www.youtube.com/shorts/${videoId}`;
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "manual" });
    console.log(`VideoId: ${videoId}`);
    console.log(`Status: ${response.status}`);
    console.log(`Location Header: ${response.headers.get("location")}`);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

checkShort("pzk5FQjbcag");
