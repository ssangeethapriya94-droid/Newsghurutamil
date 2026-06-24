const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./db");
const RasiPalan = require("./models/RasiPalan");
const TempleBlog = require("./models/TempleBlog");
const User = require("./models/User");

const seedData = async () => {
  try {
    console.log("Connecting to database for seeding...");
    await connectDB();
    console.log("Connected.");

    // Find a creator user (admin or editor)
    let creator = await User.findOne({ role: { $in: ["admin", "editor"] } });
    if (!creator) {
      // Fallback: use first user or create one
      creator = await User.findOne();
    }
    if (!creator) {
      console.log("No users found in database! Please register or seed users first.");
      process.exit(1);
    }
    console.log(`Using user: ${creator.name} (${creator.role}) as content creator.`);

    // Clear existing Anmigam data to avoid duplicates on double runs
    await RasiPalan.deleteMany({});
    await TempleBlog.deleteMany({});
    console.log("Cleared old Rasi Palan and Temple Blog records.");

    // 1. Seed Rasi Palan (Tamil)
    const predictionsTa = [
      { rasiKey: "aries", name: "மேஷம்", description: "இன்று புதிய முயற்சிகளில் வெற்றி கிடைக்கும். வேலை தொடர்பான செயலில் முன்னேற்றம் உண்டாகும். மன அமைதி கூடும்." },
      { rasiKey: "taurus", name: "ரிஷபம்", description: "பணவரவு அதிகரிக்கும். குடும்பத்தில் மகிழ்ச்சி நிலவும். தேவையான செலவுகள் இருக்கும். நண்பர்களின் சந்திப்பு மகிழ்ச்சி தரும்." },
      { rasiKey: "gemini", name: "மிதுனம்", description: "நண்பர்களின் உதவி கிடைக்கும். புதிய வாய்ப்புகள் திறக்கும். வியாபாரத்தில் நல்ல முன்னேற்றம். ஆரோக்கியத்தில் கவனம் தேவை." },
      { rasiKey: "cancer", name: "கடகம்", description: "மனதில் இருந்த கவலைகள் நீங்கும். உடல்நலம் சீராகும். பயணங்கள் சாதகமாக அமையும். தொழில் வாய்ப்புகள் பெருகும்." },
      { rasiKey: "leo", name: "சிம்மம்", description: "புதிய முயற்சிகள் வெற்றி தரும். தொழில் முன்னேற்றம் சிறப்பாக இருக்கும். ஆக்கப்பூர்வமான எண்ணங்கள் தோன்றும்." },
      { rasiKey: "virgo", name: "கன்னி", description: "பணியில் பாராட்டுகள் கிடைக்கும். நிதிநிலை மேம்படும். குடும்பத்தில் அமைதி நிலவும். சுப செய்திகள் வந்து சேரும்." },
      { rasiKey: "libra", name: "துலாம்", description: "இன்று சுப விரையங்கள் ஏற்படும். கணவன் மனைவி இடையே அன்பு கூடும். உத்தியோகத்தில் சக ஊழியர்களின் ஆதரவு கிட்டும்." },
      { rasiKey: "scorpio", name: "விருச்சிகம்", description: "முயற்சிகள் சாதகமாகும். எடுத்த காரியம் வெற்றியைத் தரும். வரவுக்கு ஏற்ற செலவுகள் வந்து சேரும். தியானம் நன்மை பயக்கும்." },
      { rasiKey: "sagittarius", name: "தனுசு", period: "22 நவம்பர் - 21 டிசம்பர்", description: "பயணங்களால் ஆதாயம் கூடும். சுப காரிய பேச்சுகள் வெற்றியைத் தரும். வியாபாரத்தில் லாபம் இரட்டிப்பாகும்." },
      { rasiKey: "capricorn", name: "மகரம்", description: "விடாமுயற்சி விஸ்வரூப வெற்றி தரும். தேவையற்ற வாக்குவாதங்களை தவிர்க்கவும். உத்தியோகத்தில் புதிய பொறுப்புகள் கூடும்." },
      { rasiKey: "aquarius", name: "கும்பம்", description: "உறவினர்கள் மூலம் நல்ல செய்தி வரும். உறவில் விரிசல்கள் மறையும். வெளியூர் பயணங்களால் நன்மைகள் ஏற்படும்." },
      { rasiKey: "pisces", name: "மீனம்", description: "மனம் மகிழும் சம்பவங்கள் நடைபெறும். பொருளாதார நிலை உயரும். உத்தியோகத்தில் மேலதிகாரிகளின் பாராட்டு கிடைக்கும்." }
    ];

    // Seed Tamil Daily for June 24, 25, 26, 2026
    const daysTa = [
      { date: "2026-06-24", day: "புதன்கிழமை", title: "இன்றைய ராசிபலன்" },
      { date: "2026-06-25", day: "வியாழக்கிழமை", title: "இன்றைய ராசிபலன்" },
      { date: "2026-06-26", day: "வெள்ளிக்கிழமை", title: "இன்றைய ராசிபலன்" }
    ];

    for (const d of daysTa) {
      await RasiPalan.create({
        language: "ta",
        periodType: "day",
        date: new Date(d.date + "T00:00:00.000Z"),
        dayName: d.day,
        title: d.title,
        status: "published",
        predictions: predictionsTa,
        createdBy: creator._id,
        publishedAt: new Date()
      });
    }

    // Seed Tamil Weekly for June 19 to June 25, 2026
    const weeklyPredictionsTa = predictionsTa.map(p => ({
      ...p,
      description: "இந்த வாரம் " + p.description + " ஆரோக்கியமான உணவும், தகுந்த ஓய்வும் உடலை புத்துணர்ச்சியாக வைத்திருக்க உதவும்."
    }));
    await RasiPalan.create({
      language: "ta",
      periodType: "week",
      date: new Date("2026-06-19T00:00:00.000Z"),
      endDate: new Date("2026-06-25T00:00:00.000Z"),
      title: "வார ராசிபலன்",
      status: "published",
      predictions: weeklyPredictionsTa,
      createdBy: creator._id,
      publishedAt: new Date()
    });

    // Seed Tamil Monthly for June 1 to June 30, 2026
    const monthlyPredictionsTa = predictionsTa.map(p => ({
      ...p,
      description: "இந்த மாதம் " + p.description + " புதிய முதலீடுகள் செய்ய உகந்த காலம். பெரியோர்களின் ஆசி கிட்டும்."
    }));
    await RasiPalan.create({
      language: "ta",
      periodType: "month",
      date: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-06-30T00:00:00.000Z"),
      title: "மாத ராசிபலன்",
      status: "published",
      predictions: monthlyPredictionsTa,
      createdBy: creator._id,
      publishedAt: new Date()
    });


    // 2. Seed Rasi Palan (English)
    const predictionsEn = [
      { rasiKey: "aries", name: "Aries", description: "Success in new ventures is highlighted today. Career prospects will improve. Keep yourself calm and focused." },
      { rasiKey: "taurus", name: "Taurus", description: "Financial gains are expected today. Happiness will prevail in the family. Spend wisely on important items." },
      { rasiKey: "gemini", name: "Gemini", description: "You will receive support from your friends. New opportunities will open up. Business looks promising." },
      { rasiKey: "cancer", name: "Cancer", description: "Mental worries will dissipate today. Health will remain stable. Travels will bring favorable outcomes." },
      { rasiKey: "leo", name: "Leo", description: "Your efforts will show positive results. Career growth is likely. Creative ideas will emerge." },
      { rasiKey: "virgo", name: "Virgo", description: "Recognition at work is on cards. Financial situation will improve. Family peace is assured." },
      { rasiKey: "libra", name: "Libra", description: "Favorable atmosphere at work. Bonding between partners will strengthen. Colleagues will support you." },
      { rasiKey: "scorpio", name: "Scorpio", description: "Projects will show success. Financial balance will be maintained. Daily meditation brings inner peace." },
      { rasiKey: "sagittarius", name: "Sagittarius", description: "Travels will yield financial gains. Suitors will find good matches. Business returns are high." },
      { rasiKey: "capricorn", name: "Capricorn", description: "Persistence will lead to massive success. Avoid unnecessary arguments. New responsibilities at work." },
      { rasiKey: "aquarius", name: "Aquarius", description: "Good news will arrive through relatives. Relationships will improve. Outstation travels bring gains." },
      { rasiKey: "pisces", name: "Pisces", description: "Delightful events will occur. Economic status will rise. Supervisors will appreciate your efforts." }
    ];

    // Seed English Daily for June 24, 25, 26, 2026
    const daysEn = [
      { date: "2026-06-24", day: "Wednesday", title: "Today's Horoscope" },
      { date: "2026-06-25", day: "Thursday", title: "Today's Horoscope" },
      { date: "2026-06-26", day: "Friday", title: "Today's Horoscope" }
    ];

    for (const d of daysEn) {
      await RasiPalan.create({
        language: "en",
        periodType: "day",
        date: new Date(d.date + "T00:00:00.000Z"),
        dayName: d.day,
        title: d.title,
        status: "published",
        predictions: predictionsEn,
        createdBy: creator._id,
        publishedAt: new Date()
      });
    }

    // Seed English Weekly for June 19 to June 25, 2026
    const weeklyPredictionsEn = predictionsEn.map(p => ({
      ...p,
      description: "This week " + p.description + " Proper rest and a healthy diet will keep you energized throughout the week."
    }));
    await RasiPalan.create({
      language: "en",
      periodType: "week",
      date: new Date("2026-06-19T00:00:00.000Z"),
      endDate: new Date("2026-06-25T00:00:00.000Z"),
      title: "Weekly Horoscope",
      status: "published",
      predictions: weeklyPredictionsEn,
      createdBy: creator._id,
      publishedAt: new Date()
    });

    // Seed English Monthly for June 1 to June 30, 2026
    const monthlyPredictionsEn = predictionsEn.map(p => ({
      ...p,
      description: "This month " + p.description + " Favorable period for long-term investments. Blessings of elders will guide you."
    }));
    await RasiPalan.create({
      language: "en",
      periodType: "month",
      date: new Date("2026-06-01T00:00:00.000Z"),
      endDate: new Date("2026-06-30T00:00:00.000Z"),
      title: "Monthly Horoscope",
      status: "published",
      predictions: monthlyPredictionsEn,
      createdBy: creator._id,
      publishedAt: new Date()
    });

    console.log("✅ Seeded Daily, Weekly, Monthly Rasi Palan for Tamil & English.");


    // 3. Seed Temple Blogs (Tamil)
    await TempleBlog.create({
      title: "மதுரை மீனாட்சி அம்மன் கோவில் வரலாறு மற்றும் சிறப்புகள்",
      subtitle: "பாண்டிய மன்னர்களின் கலைநயம்",
      description: "மதுரையின் மையப்பகுதியில் அமைந்துள்ள உலகப் புகழ்பெற்ற அருள்மிகு மீனாட்சி சுந்தரேசுவரர் திருக்கோவிலின் வரலாற்றுச் சிறப்புகள்.",
      content: `
        <p>மதுரை மீனாட்சி சுந்தரேசுவரர் கோவில் என்பது தமிழ்நாட்டின் மதுரை நகரில் அமைந்துள்ள ஒரு வரலாற்றுச் சிறப்புமிக்க இந்துக் கோவிலாகும். இக்கோவில் சிவபெருமானுக்கும் (சுந்தரேசுவரர்) அவரது துணைவியாரான பார்வதி தேவிக்கும் (மீனாட்சி) அர்ப்பணிக்கப்பட்டுள்ளது.</p>
        <h3>வரலாற்று முக்கியத்துவம்</h3>
        <p>பாண்டிய மன்னர்களால் கட்டப்பட்ட இத்திருக்கோவில் கலை மற்றும் கட்டிடக்கலைக்கு சிறந்த சான்றாகும். இங்குள்ள ஆயிரங்கால் மண்டபம் மற்றும் அதில் செதுக்கப்பட்டுள்ள சிலைகள் பார்ப்போர் வியக்கும் வண்ணம் அமைந்துள்ளன. இக்கோவிலின் கிழக்குக் கோபுரம் மிக உயரமான கோபுரங்களில் ஒன்றாகும்.</p>
        <h3>வழிபாட்டு நேரங்கள்</h3>
        <p>தினமும் காலை 5:00 மணி முதல் பகல் 12:30 மணி வரையிலும், மாலை 4:00 மணி முதல் இரவு 10:00 மணி வரையிலும் கோவில் திறந்திருக்கும்.</p>
      `,
      templeName: "அருள்மிகு மீனாட்சி சுந்தரேசுவரர் திருக்கோவில்",
      location: "மதுரை, தமிழ்நாடு",
      language: "ta",
      status: "published",
      createdBy: creator._id,
      publishedAt: new Date()
    });

    await TempleBlog.create({
      title: "தஞ்சை பிரகதீஸ்வரர் கோவில் - இராஜராஜ சோழனின் பிரம்மாண்டம்",
      subtitle: "சோழர் கட்டிடக்கலையின் உச்சக்கட்டம்",
      description: "ஆயிரம் ஆண்டுகளைக் கடந்தும் கம்பீரமாக நிற்கும் தஞ்சை பெரிய கோவிலின் கட்டிடக்கலை இரகசியங்கள் மற்றும் வரலாறு.",
      content: `
        <p>தஞ்சை பெரிய கோவில் அல்லது பிரகதீஸ்வரர் கோவில் சோழப் பேரரசன் முதலாம் இராஜராஜ சோழனால் கட்டப்பட்டது. இது யுனெஸ்கோ உலக பாரம்பரிய சின்னங்களில் ஒன்றாகும். இந்த மாபெரும் கோவில் முற்றிலும் கருங்கற்களால் ஆனது.</p>
        <h3>கட்டிடக்கலை சிறப்புகள்</h3>
        <p>கோவிலின் முக்கிய கோபுரம் (விமானம்) 216 அடி உயரம் கொண்டது. இதன் உச்சியில் உள்ள கும்பம் சுமார் 80 டன் எடையுள்ள ஒரே கல்லால் ஆனது. இக்கோவிலின் நிழல் தரையில் விழாது என்ற பரவலான கருத்து உள்ளது. பிரம்மாண்டமான நந்தி ஒரே கல்லால் செதுக்கப்பட்டுள்ளது.</p>
        <h3>தரிசன விவரங்கள்</h3>
        <p>தினமும் காலை 6:00 மணி முதல் பகல் 12:30 மணி வரையிலும், மாலை 4:00 மணி முதல் இரவு 8:30 மணி வரையிலும் பெரிய கோவில் திறந்திருக்கும்.</p>
      `,
      templeName: "தஞ்சை பெரிய கோவில்",
      location: "தஞ்சாவூர், தமிழ்நாடு",
      language: "ta",
      status: "published",
      createdBy: creator._id,
      publishedAt: new Date()
    });


    // 4. Seed Temple Blogs (English)
    await TempleBlog.create({
      title: "Madurai Meenakshi Temple History and Legends",
      subtitle: "The pride of Pandya architecture",
      description: "Read about the historical significance and timings of the world-famous Meenakshi Amman Temple in Madurai.",
      content: `
        <p>Meenakshi Sundareswarar Temple is a historic Hindu temple located on the southern bank of the Vaigai River in the temple city of Madurai, Tamil Nadu. It is dedicated to Goddess Meenakshi (a form of Parvati) and her consort, Sundareswarar (a form of Shiva).</p>
        <h3>Architectural Highlights</h3>
        <p>The temple forms the heart and lifeline of the 2,500-year-old city of Madurai. The complex houses 14 gopurams (gateway towers), ranging from 45-50m in height. The Hall of Thousand Pillars is an architectural marvel where each pillar produces a different musical note when tapped.</p>
        <h3>Visiting Hours</h3>
        <p>Open daily from 5:00 AM to 12:30 PM, and from 4:00 PM to 10:00 PM.</p>
      `,
      templeName: "Meenakshi Amman Temple",
      location: "Madurai, Tamil Nadu",
      language: "en",
      status: "published",
      createdBy: creator._id,
      publishedAt: new Date()
    });

    await TempleBlog.create({
      title: "Thanjavur Brihadisvara Temple - The Great Chola Icon",
      subtitle: "Unveiling the architectural secrets of Big Temple",
      description: "Explore the mysteries and Chola history behind the 1000-year-old Brihadisvara Temple of Tanjore.",
      content: `
        <p>The Brihadisvara Temple, also called Rajarajesvaram, is a UNESCO World Heritage Site located in Thanjavur, Tamil Nadu. Built by the Chola Emperor Rajaraja I, it remains one of the largest temple complexes in India.</p>
        <h3>Engineering Wonders</h3>
        <p>Built entirely out of granite, the vimana (temple tower) rises 216 feet high and is capped by a massive octagonal monolithic stone dome (Kumbam) weighing around 80 tons. A giant monolith statue of Nandi (sacred bull) guards the portal.</p>
        <h3>Timings</h3>
        <p>Open daily from 6:00 AM to 12:30 PM, and 4:00 PM to 8:30 PM.</p>
      `,
      templeName: "Brihadisvara Temple",
      location: "Thanjavur, Tamil Nadu",
      language: "en",
      status: "published",
      createdBy: creator._id,
      publishedAt: new Date()
    });

    console.log("✅ Seeded English Temple Blogs.");
    console.log("\n⭐️ ANMIGAM SEEDING COMPLETED SUCCESSFULLY!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
};

seedData();
