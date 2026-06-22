const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const connectDB = require("./db");
const User = require("./models/User");
const News = require("./models/News");
const Video = require("./models/Video");
const Short = require("./models/Short");

const seedEnglishData = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    // 1. Get or Create Reporter, Editor, Admin users
    let reporter = await User.findOne({ role: "reporter" });
    if (!reporter) {
      reporter = await User.create({
        name: "English Reporter",
        email: "reporter.en@newsghuru.com",
        password: "password123",
        role: "reporter"
      });
      console.log("✅ Created mock English Reporter");
    }

    let editor = await User.findOne({ role: "editor" });
    if (!editor) {
      editor = await User.create({
        name: "English Editor",
        email: "editor.en@newsghuru.com",
        password: "password123",
        role: "editor"
      });
      console.log("✅ Created mock English Editor");
    }

    let admin = await User.findOne({ role: "admin" });
    if (!admin) {
      admin = await User.create({
        name: "English Admin",
        email: "admin.en@newsghuru.com",
        password: "password123",
        role: "admin"
      });
      console.log("✅ Created mock English Admin");
    }

    // 2. Clear existing English news, videos, shorts (to avoid duplicates)
    console.log("Clearing existing English content...");
    await News.deleteMany({ language: "en" });
    await Video.deleteMany({ language: "en" });
    await Short.deleteMany({ language: "en" });

    // 3. Define News Articles for All Categories
    const newsArticles = [
      // politics
      {
        title: "US Election 2026: Debates Heat Up as Candidates Detail Policy Platforms",
        description: "As the 2026 electoral cycle draws closer, candidates from both parties are outlining key differences in economic policy, health care reforms, and national security strategies in nationwide debates.",
        shortDescription: "Debates heat up as candidates detail policy platforms on economy, health, and security.",
        category: "politics",
        image: "/images/trump-middleeast-politics.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 12000,
        comments: 24,
        time: "10 mins ago"
      },
      {
        title: "Bipartisan Coalition Unveils Sweeping Infrastructure Funding Bill",
        description: "Legislators from across the political spectrum have proposed a joint bill aimed at repairing aging highways, bridges, and electric grids with a trillion-dollar modernization package.",
        shortDescription: "Joint bill proposed to repair aging highways, bridges, and grids with a trillion-dollar package.",
        category: "politics",
        image: "/images/modi-cabinet-meeting.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 8500,
        comments: 15,
        time: "45 mins ago"
      },
      {
        title: "Local Governments Pilot Direct Democracy Digital Voting Platforms",
        description: "Several municipalities are introducing secure blockchain-based feedback systems to let citizens vote directly on local zoning and community budget allocation projects.",
        shortDescription: "Municipalities introduce blockchain systems for direct votes on local projects and budgets.",
        category: "politics",
        image: "/images/assembly-speaker.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 3100,
        comments: 9,
        time: "2 hours ago"
      },
      // sports
      {
        title: "Championship Clash: Underdog Team Pulls Off Stunning Final-Minute Victory",
        description: "In a spectacular game that will go down in history, the underdogs mounted a thrilling fourth-quarter comeback to win the league cup with a field goal as time expired.",
        shortDescription: "Underdogs mount fourth-quarter comeback to win the league cup as time expired.",
        category: "sports",
        image: "/images/rcb-final-ipl2026.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 15400,
        comments: 42,
        time: "15 mins ago"
      },
      {
        title: "Tennis Legend Announces Retirement After Historic Grand Slam Run",
        description: "Following a career spanning two decades and 24 Grand Slam singles titles, the sports icon announced today that this season will be their last competitive appearance.",
        shortDescription: "Tennis icon announces retirement after 24 Grand Slam titles and two decades of dominance.",
        category: "sports",
        image: "/images/messi-injury-worldcup.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 22000,
        comments: 88,
        time: "1 hour ago"
      },
      {
        title: "New Training Technologies Revolutionizing Athlete Recovery Protocols",
        description: "From hyperbaric chambers to AI-driven muscle strain analysis, modern athletic trainers are utilizing next-generation tech to keep players healthy longer.",
        shortDescription: "Hyperbaric chambers and AI analytics help players recover faster and prevent injuries.",
        category: "sports",
        image: "/images/vaishali-fund.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 4500,
        comments: 11,
        time: "3 hours ago"
      },
      // technology
      {
        title: "Next-Gen AI Models Unveiled with Human-Like Multi-Step Reasoning",
        description: "Leading research organizations have released neural networks capable of planning, coding, and debugging their own algorithms with minimal human instruction.",
        shortDescription: "New AI networks plan, write code, and debug algorithms with minimal human input.",
        category: "tech",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 42000,
        comments: 150,
        time: "5 mins ago"
      },
      {
        title: "Quantum Computing Startup Achieves Stable Room-Temperature Qubits",
        description: "A breakthrough in material science has allowed researchers to maintain quantum coherence at room temperature, bringing commercial quantum computers closer to reality.",
        shortDescription: "Material science breakthrough maintains quantum coherence at room temperature.",
        category: "tech",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 18000,
        comments: 64,
        time: "2 hours ago"
      },
      {
        title: "Electric Flight Takes Off: Zero-Emission Commuter Planes Pass Flight Certification",
        description: "Regulatory bodies have approved the first commercial-grade electric passenger aircraft for regional flights, marking a green milestone for aviation history.",
        shortDescription: "Regulators approve first regional electric passenger aircraft for flight services.",
        category: "tech",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 9500,
        comments: 33,
        time: "4 hours ago"
      },
      // cinema
      {
        title: "Cannes Film Festival 2026: Opening Night Features Blockbuster Drama and Glitz",
        description: "The annual festival commenced with a star-studded red carpet and the premiere of an acclaimed historical drama that received an 8-minute standing ovation.",
        shortDescription: "Festival starts with star-studded red carpet and premier historical drama screening.",
        category: "cinema",
        image: "/images/seeman-baby-news.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 31000,
        comments: 92,
        time: "30 mins ago"
      },
      {
        title: "Streaming Giant Secures Exclusive Rights to Upcoming Sci-Fi Trilogy",
        description: "In a record-breaking multi-million dollar distribution deal, the digital platform acquired worldwide streaming rights to the highly anticipated space opera.",
        shortDescription: "Multi-million dollar deal brings highly anticipated space opera trilogy to online streams.",
        category: "cinema",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 25000,
        comments: 110,
        time: "3 hours ago"
      },
      {
        title: "Indie Filmmakers Leverage AI Visual Tools to Create Cinematic Masterpieces",
        description: "Independent creators are combining traditional direction with generative background rendering, producing high-end VFX on a micro-budget.",
        shortDescription: "Creators use AI rendering for background VFX to make cinema-quality micro-budget films.",
        category: "cinema",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 8900,
        comments: 29,
        time: "5 hours ago"
      },
      // business
      {
        title: "Market Update: Global Indices Surge as Inflation Rates Stabilize",
        description: "Stocks rallied globally following the latest economic reports indicating inflation has returned to the target 2% range, sparking investor optimism.",
        shortDescription: "Global stocks rally as inflation reports fall back to the central target range.",
        category: "business",
        image: "/images/gold-price-drop-today.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 29000,
        comments: 38,
        time: "10 mins ago"
      },
      {
        title: "E-Commerce Logistics Adapt to Meet Surge in Next-Hour Deliveries",
        description: "Fulfillment companies are investing heavily in automated drone networks and micro-hubs to satisfy the growing consumer demand for instantaneous local shipping.",
        shortDescription: "Logistics companies deploy drones and micro-hubs for next-hour delivery networks.",
        category: "business",
        image: "/images/cng-price-hike-new.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 11200,
        comments: 21,
        time: "2 hours ago"
      },
      {
        title: "Green Energy Investments Outpace Fossil Fuels for Third Consecutive Year",
        description: "Venture capital and sovereign wealth funds poured record amounts into solar, wind, and battery storage projects worldwide, signaling an accelerating transition.",
        shortDescription: "Renewables receive record funding globally, pacing ahead of legacy fossil fuels.",
        category: "business",
        image: "/images/petrol-diesel-price-andhra.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 14500,
        comments: 54,
        time: "6 hours ago"
      },
      // education
      {
        title: "National Digital Literacy Initiative Launched in Primary Schools",
        description: "A new education ministry curriculum introduces basic computational logic and critical web-literacy skills starting from the third grade.",
        shortDescription: "New curriculum introduces basic computational logic and web literacy to third graders.",
        category: "education",
        image: "/images/schools-reopen-june4.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 6500,
        comments: 18,
        time: "1 hour ago"
      },
      {
        title: "Universities Expand Remote-Access Specialized Engineering Labs",
        description: "Institutions are partnering with hardware companies to allow remote students to configure physical servers and microchips via virtual interfaces.",
        shortDescription: "Virtual interfaces let remote students configure physical servers and silicon chips.",
        category: "education",
        image: "/images/rajmohan-school-inspection.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 4300,
        comments: 8,
        time: "3 hours ago"
      },
      {
        title: "Adult Education Enrollment Surges as Professionals Upskill for AI Roles",
        description: "Traditional universities and online academies report record sign-ups for data analysis and prompt-engineering certificate programs.",
        shortDescription: "Sign-ups double for coding, prompt design, and data analysis certifications.",
        category: "education",
        image: "/images/schools-reopen-june4.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 9200,
        comments: 47,
        time: "5 hours ago"
      },
      // tamil (Tamil Nadu)
      {
        title: "Tamil Nadu Unveils Ultra-Modern Tech Hub in Coimbatore to Boost Startup Growth",
        description: "The state government inaugurated a massive startup ecosystem facility in Coimbatore, offering incubation, lab facilities, and grants for tech startups.",
        shortDescription: "Coimbatore startup facility opens to provide grants, labs, and support networks.",
        category: "tamil",
        image: "/images/cm-vijay-delhi-trip.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 18700,
        comments: 31,
        time: "20 mins ago"
      },
      {
        title: "Eco-Tourism Project Launched in Nilgiris to Protect Bio-Diversity",
        description: "A new forest department initiative introduces community-led conservation tours to preserve local flora and fauna while supporting indigenous livelihoods.",
        shortDescription: "Nilgiri communities lead conservation tours to preserve flora, fauna, and local jobs.",
        category: "tamil",
        image: "/images/bakrid-wishes-cm.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 12400,
        comments: 19,
        time: "1 hour ago"
      },
      {
        title: "Chennai Metro Rail Phase 2 Work Expands with New Tunneling Achievements",
        description: "Construction teams completed a major underground tunnel breakthrough today, keeping the city's massive public transit expansion project on schedule.",
        shortDescription: "Underground tunnel breakthrough completed to keep metro transit on schedule.",
        category: "tamil",
        image: "/images/special-buses.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 29500,
        comments: 67,
        time: "4 hours ago"
      },
      // india
      {
        title: "India Achieves Historic Space Milestone with Successful Lunar South Pole Rover Landing",
        description: "ISRO scientists celebrated today as the lunar lander deployed its rover successfully on the south pole, transmitting crystal-clear water ice analysis reports.",
        shortDescription: "ISRO south pole lander deploys rover to analyze ice deposits and geology.",
        category: "india",
        image: "/images/cm-vijay-delhi-visit.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 76000,
        comments: 420,
        time: "10 mins ago"
      },
      {
        title: "New High-Speed Bullet Train Corridors Approved for Major Industrial Cities",
        description: "The railway ministry has greenlit three new routes to connect high-volume trade centers with trains running at speeds exceeding 300 km/h.",
        shortDescription: "Routes approved to run bullet trains exceeding 300 km/h between industrial hubs.",
        category: "india",
        image: "/images/special-buses.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 33000,
        comments: 112,
        time: "2 hours ago"
      },
      {
        title: "Solar Energy Park in Rajasthan Becomes World's Largest Operational Facility",
        description: "Spanning thousands of acres, the renewable project reached its full grid-connection capacity, generating power for millions of households daily.",
        shortDescription: "Rajasthan solar plant reaches full grid capacity to power millions of homes.",
        category: "india",
        image: "/images/cng-price-hike-new.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 27000,
        comments: 80,
        time: "5 hours ago"
      },
      // world
      {
        title: "UN Climate Summit Approves Global Treaty to Phase Out Single-Use Plastics",
        description: "Delegates from over 190 nations signed a binding agreement to drastically restrict single-use plastic production and fund sustainable material alternatives.",
        shortDescription: "UN delegates from 190 nations sign plastic restriction pact and green fund.",
        category: "world",
        image: "/images/iran-us-tension.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 45000,
        comments: 195,
        time: "30 mins ago"
      },
      {
        title: "International Space Station Welcomes Historic All-Civilian Science Crew",
        description: "A capsule carrying researchers from four different continents docked safely today to conduct micro-gravity medicine and crop-growth experiments.",
        shortDescription: "Space capsule carrying multi-national civilian team docks with orbital lab.",
        category: "world",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 29000,
        comments: 90,
        time: "3 hours ago"
      },
      {
        title: "Global Archaeological Alliance Discovers Ancient Lost City in Amazon Rainforest",
        description: "Using LIDAR laser mapping, scientists uncovered complex urban networks, canals, and agricultural terraces dating back over two thousand years.",
        shortDescription: "LIDAR lasers map complex ancient urban systems under dense rainforest canopy.",
        category: "world",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 52000,
        comments: 260,
        time: "6 hours ago"
      },
      // breaking
      {
        title: "BREAKING NEWS: Global Central Bank Announces Surprise Interest Rate Cut",
        description: "In an unexpected policy shift, the monetary authority cut key interest rates by 50 basis points to stimulate global economic expansion.",
        shortDescription: "Monetary bank cuts target rates by 50 basis points to support investment markets.",
        category: "breaking",
        image: "/images/gold-price-drop-today.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 89000,
        comments: 540,
        time: "Just Now"
      },
      {
        title: "BREAKING: Medical Breakthrough in Universal Flu Vaccine Passes Clinical Phase 2",
        description: "Researchers announced a newly formulated vaccine that targets stable core components of influenza viruses, providing lifetime protection.",
        shortDescription: "Experimental flu shot targeting virus core components yields lifetime immunity in phase 2.",
        category: "breaking",
        image: "/images/newsghuru.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 67000,
        comments: 310,
        time: "12 mins ago"
      },
      {
        title: "BREAKING NEWS: Heavy Rains Trigger Early Monsoon Alerts for Coastal Regions",
        description: "Weather agencies have issued red alerts for several coastal provinces as a major depression brings torrential downpours ahead of the normal season.",
        shortDescription: "Meteorology office warns provinces of flooding risks from early low-pressure system.",
        category: "breaking",
        image: "/images/heavy-rain-alert.jpg",
        language: "en",
        status: "published",
        reporterId: reporter._id,
        editorId: editor._id,
        views: 45000,
        comments: 220,
        time: "35 mins ago"
      }
    ];

    console.log(`Inserting ${newsArticles.length} News Articles...`);
    await News.insertMany(newsArticles);
    console.log("✅ News articles seeded successfully!");

    // 4. Seed English Videos
    const videos = [
      {
        title: "Inside India's Clean Energy Boom: Rajasthan Solar Megastructure",
        thumbnail: "https://picsum.photos/seed/vid1/640/360",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "A detailed walkthrough of the Rajasthan Solar Park, highlighting the engineering feats behind generating clean energy for millions of households.",
        category: "General",
        isFeatured: true,
        isTrending: true,
        views: 12400,
        language: "en"
      },
      {
        title: "The Future of Artificial Intelligence: Next-Gen Reasoning Models",
        thumbnail: "https://picsum.photos/seed/vid2/640/360",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Exploring the latest multi-step planning and self-debugging capabilities of new artificial intelligence models.",
        category: "Technology",
        isFeatured: false,
        isTrending: false,
        views: 9320,
        language: "en"
      },
      {
        title: "ISRO Lander Rover Mission: Complete Journey and Discoveries",
        thumbnail: "https://picsum.photos/seed/vid3/640/360",
        youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Documentary explaining how ISRO launched, landed, and traversed the Lunar south pole to investigate water-ice deposits.",
        category: "Science",
        isFeatured: false,
        isTrending: true,
        views: 25400,
        language: "en"
      }
    ];

    console.log(`Inserting ${videos.length} Videos...`);
    await Video.insertMany(videos);
    console.log("✅ Videos seeded successfully!");

    // 5. Seed English Shorts
    const shorts = [
      {
        title: "AI Self-Coding Breakthrough! 💻",
        thumbnail: "https://picsum.photos/seed/sh1/360/640",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Technology",
        description: "AI is now planning, writing, and debugging its own code. What's next?",
        isFeatured: true,
        isEnabled: true,
        status: "Published",
        language: "en"
      },
      {
        title: "Bullet Train in India: Status Update! 🚄",
        thumbnail: "https://picsum.photos/seed/sh2/360/640",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "India",
        description: "New high-speed rails under construction! Speeding at 300+ km/h.",
        isFeatured: false,
        isEnabled: true,
        status: "Published",
        language: "en"
      },
      {
        title: "Underdog Winning Moment! 🏆",
        thumbnail: "https://picsum.photos/seed/sh3/360/640",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        category: "Sports",
        description: "A spectacular last-second field goal wins the championship!",
        isFeatured: true,
        isEnabled: true,
        status: "Published",
        language: "en"
      }
    ];

    console.log(`Inserting ${shorts.length} Shorts...`);
    await Short.insertMany(shorts);
    console.log("✅ Shorts seeded successfully!");

    console.log("\n🚀 Seeding Complete! All English sections populated successfully.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedEnglishData();
