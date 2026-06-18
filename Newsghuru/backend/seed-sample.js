const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load ENV variables
dotenv.config({ path: path.join(__dirname, ".env") });

const connectDB = require("./db");
const User = require("./models/User");
const News = require("./models/News");
const Category = require("./models/Category");
const Advertisement = require("./models/Advertisement");

const seedSampleData = async () => {
  try {
    await connectDB();
    console.log("Seeding sample data...");

    // 1. Find or create a reporter user
    let reporter = await User.findOne({ role: { $in: ["reporter", "admin"] } });
    if (!reporter) {
      reporter = await User.create({
        name: "Sample Reporter",
        email: "sample.reporter@newsghuru.com",
        password: "reporterpassword123",
        role: "reporter"
      });
      console.log("✅ Created mock reporter user:", reporter.email);
    } else {
      console.log("Found existing user for author ID:", reporter.email);
    }

    // 2. Ensure default categories are seeded (Mongoose check)
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      const defaultCategories = [
        { name: "Politics", slug: "politics" },
        { name: "Sports", slug: "sports" },
        { name: "Entertainment", slug: "entertainment" },
        { name: "Technology", slug: "technology" },
        { name: "Education", slug: "education" },
        { name: "India", slug: "india" },
        { name: "World", slug: "world" },
        { name: "Cinema", slug: "cinema" },
        { name: "Tamil", slug: "tamil" },
        { name: "Breaking", slug: "breaking" }
      ];
      await Category.insertMany(defaultCategories);
      console.log("✅ Default categories seeded");
    }

    // 3. Clear existing sample news & ads if they exist to keep it fresh
    await News.deleteMany({ title: /பாராளுமன்றத்தில்|கிரிக்கெட்|திரையுலகில்|விண்வெளியில்/ });
    await Advertisement.deleteMany({ title: /Festival|Diwali|Brand|Mobile|Promotion/ });

    // 4. Create sample Tamil News articles
    const sampleNews = [
      {
        title: "பாராளுமன்றத்தில் புதிய கல்விக் கொள்கை விவாதம்: தமிழக அரசு எதிர்ப்பு",
        subtitle: "புதிய கல்வி கொள்கையின் அம்சங்கள் குறித்து விவாதிக்கப்பட்டது",
        description: "<p>பாராளுமன்றத்தில் புதிய கல்விக் கொள்கை குறித்த விவாதம் இன்று நடைபெற்றது. இதில் தமிழக அரசு மற்றும் எதிர்க்கட்சிகள் தங்களின் கடும் எதிர்ப்பை பதிவு செய்தன. மாநில சுயாட்சியைப் பாதிக்கும் வகையில் கொள்கை வடிவமைக்கப்பட்டுள்ளது என குற்றம் சாட்டப்பட்டது.</p><p>இந்த கொள்கை மாநிலங்களின் கல்வி உரிமையை பறிப்பதாக அமைந்துள்ளது. ஏழை மற்றும் நடுத்தர மக்களின் கல்வி வாய்ப்புகளை குறைக்கும் என விவாதத்தில் சுட்டிக்காட்டப்பட்டது.</p><p>அரசு இந்த கொள்கையை திரும்பப் பெற வேண்டும் அல்லது தேவையான திருத்தங்களைச் செய்ய வேண்டும் என தமிழக எம்பிக்கள் வலியுறுத்தினர்.</p>",
        shortDescription: "மாநில சுயாட்சியைப் பாதிக்கும் வகையில் கொள்கை வடிவமைக்கப்பட்டுள்ளது என குற்றம் சாட்டப்பட்டது.",
        image: "https://images.unsplash.com/photo-1541829019-259276a7f157?w=1200",
        coverImage: "https://images.unsplash.com/photo-1541829019-259276a7f157?w=1200",
        category: "politics",
        location: "டெல்லி",
        tags: "கல்வி, பாராளுமன்றம், விவாதம்",
        reporterId: reporter._id,
        status: "published",
        time: "10:30 AM",
        publishedAt: new Date()
      },
      {
        title: "ஐபிஎல் கிரிக்கெட்: சென்னை சூப்பர் கிங்ஸ் அணி அபார வெற்றி!",
        subtitle: "மும்பை இந்தியன்ஸ் அணியை 7 விக்கெட் வித்தியாசத்தில் வீழ்த்தியது",
        description: "<p>மும்பையில் நடைபெற்ற விறுவிறுப்பான ஐபிஎல் கிரிக்கெட் லீக் போட்டியில், சென்னை சூப்பர் கிங்ஸ் அணி மும்பை இந்தியன்ஸ் அணியை 7 விக்கெட் வித்தியாசத்தில் வீழ்த்தி அபார வெற்றி பெற்றது.</p><p>முதலில் பேட்டிங் செய்த மும்பை அணி 20 ஓவர்களில் 165 ரன்கள் மட்டுமே எடுத்தது. சென்னை அணியின் பந்துவீச்சாளர்கள் சிறப்பாக செயல்பட்டு ரன் குவிப்பை கட்டுப்படுத்தினர்.</p><p>பின்னர் களமிறங்கிய சென்னை அணி 18.2 ஓவர்களில் 3 விக்கெட்டுகளை மட்டுமே இழந்து இலக்கை எட்டியது. ருதுராஜ் கெய்க்வாட் அதிரடியாக விளையாடி அரைசதம் கடந்தார்.</p>",
        shortDescription: "சென்னை சூப்பர் கிங்ஸ் அணி மும்பை இந்தியன்ஸ் அணியை 7 விக்கெட் வித்தியாசத்தில் வீழ்த்தி அபார வெற்றி பெற்றது.",
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200",
        coverImage: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200",
        category: "sports",
        location: "மும்பை",
        tags: "கிரிக்கெட், ஐபிஎல், சென்னை",
        reporterId: reporter._id,
        status: "published",
        time: "09:45 PM",
        publishedAt: new Date()
      },
      {
        title: "தமிழ் திரையுலகில் புதிய சாதனை: வசூலில் சாதனை படைக்கும் தனுஷின் திரைப்படம்",
        subtitle: "உலகளவில் 100 கோடி ரூபாயை கடந்து சாதனை படைத்தது",
        description: "<p>நடிகர் தனுஷ் நடிப்பில் வெளியான புதிய திரைப்படம் உலகளவில் 100 கோடி ரூபாய் வசூலை கடந்து சாதனை படைத்துள்ளது. படத்திற்கு ரசிகர்கள் மத்தியில் பெரும் வரவேற்பு கிடைத்துள்ளது.</p><p>இப்படத்தின் கதைக்களம் மற்றும் இசை ரசிகர்களை பெரிதும் கவர்ந்துள்ளது. திரையரங்குகளில் குடும்பங்கள் கூட்டமாக வந்து படத்தை ரசித்து வருகின்றனர்.</p><p>திரையுலக விமர்சகர்கள் மற்றும் பிரபலங்கள் தனுஷின் நடிப்பு மற்றும் இயக்குநரின் திறமையை பாராட்டி வருகின்றனர். வரும் நாட்களிலும் வசூல் அதிகரிக்கும் என எதிர்பார்க்கப்படுகிறது.</p><p>இந்த ஆண்டின் மிகப்பெரிய பிளாக்பஸ்டர் படமாக இது உருவெடுத்துள்ளது.</p><p>படக்குழுவினர் தங்களின் மகிழ்ச்சியை சமூக வலைத்தளங்களில் பகிர்ந்து கொண்டுள்ளனர்.</p>",
        shortDescription: "நடிகர் தனுஷ் நடிப்பில் வெளியான புதிய திரைப்படம் உலகளவில் 100 கோடி ரூபாய் வசூலை கடந்து சாதனை படைத்துள்ளது.",
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200",
        coverImage: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200",
        category: "cinema",
        location: "சென்னை",
        tags: "சினிமா, தனுஷ், வசூல்",
        reporterId: reporter._id,
        status: "published",
        time: "02:15 PM",
        publishedAt: new Date()
      },
      {
        title: "விண்வெளியில் சாதனை படைத்த இஸ்ரோ: புதிய செயற்கைக்கோள் வெற்றிகரமாக விண்ணில் ஏவப்பட்டது",
        subtitle: "ஸ்ரீஹரிகோட்டாவில் இருந்து பிஎஸ்எல்வி ராக்கெட் மூலம் பாய்ந்தது",
        description: "<p>ஸ்ரீஹரிகோட்டாவில் உள்ள சதீஷ் தவான் விண்வெளி மையத்தில் இருந்து இஸ்ரோ அமைப்பின் புதிய செயற்கைக்கோள் பிஎஸ்எல்வி ராக்கெட் மூலம் வெற்றிகரமாக விண்ணில் ஏவப்பட்டது.</p><p>இந்த செயற்கைக்கோள் புவி கண்காணிப்பு மற்றும் தகவல் தொடர்புகளுக்காக பயன்படுத்தப்படும். ஏவப்பட்ட 18 நிமிடங்களில் திட்டமிட்ட சுற்றுப்பாதையில் செயற்கைக்கோள் நிலைநிறுத்தப்பட்டது.</p><p>இஸ்ரோ விஞ்ஞானிகள் இந்த வெற்றியை கட்டித்தழுவி கொண்டாடினர். உலக நாடுகள் பல இஸ்ரோவிற்கு தங்களின் வாழ்த்துக்களை தெரிவித்து வருகின்றன.</p>",
        shortDescription: "இஸ்ரோ அமைப்பின் புதிய செயற்கைக்கோள் பிஎஸ்எல்வி ராக்கெட் மூலம் வெற்றிகரமாக விண்ணில் ஏவப்பட்டது.",
        image: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200",
        coverImage: "https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200",
        category: "breaking",
        location: "ஸ்ரீஹரிகோட்டா",
        tags: "இஸ்ரோ, செயற்கைக்கோள், விண்வெளி",
        reporterId: reporter._id,
        status: "published",
        time: "07:30 AM",
        publishedAt: new Date()
      }
    ];
    await News.insertMany(sampleNews);
    console.log("✅ Seeded 4 sample news articles");

    // 5. Create active advertisement campaigns
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const sampleAds = [
      {
        title: "Diwali Festival Grand Sale 2026",
        advertiserName: "ABC Textiles Chennai",
        advertiserEmail: "contact@abctextiles.com",
        advertiserPhone: "9840123456",
        companyName: "ABC Textiles",
        description: "970x250 Large Top Banner promotion for festival offers",
        image: "https://placehold.co/970x250/3b82f6/ffffff?text=Diwali+Mega+Sale+-+ABC+Textiles",
        targetUrl: "https://www.abctextiles.com",
        position: "TOP_BANNER",
        priority: "High",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        clicks: 42,
        impressions: 1205,
        ctr: 3.49,
        isActive: true
      },
      {
        title: "Aarions Mobile App Launch",
        advertiserName: "Aarions Tech Solutions",
        advertiserEmail: "info@aarions.com",
        advertiserPhone: "9884123123",
        companyName: "Aarions",
        description: "300x250 Right Sidebar campaign for app downloads",
        image: "https://placehold.co/300x250/ef4444/ffffff?text=Download+Aarions+Mobile+App",
        targetUrl: "https://www.aarions.com",
        position: "SIDEBAR",
        priority: "Medium",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        clicks: 25,
        impressions: 840,
        ctr: 2.98,
        isActive: true
      },
      {
        title: "NewsGhuru Premium Subscription",
        advertiserName: "NewsGhuru Marketing",
        advertiserEmail: "billing@newsghuru.com",
        advertiserPhone: "044123456",
        companyName: "NewsGhuru",
        description: "Section Banner ad between sports and entertainment",
        image: "https://placehold.co/970x90/10b981/ffffff?text=Go+Ad-Free+With+NewsGhuru+Premium",
        targetUrl: "https://www.newsghuru.com/subscribe",
        position: "SECTION_BANNER",
        priority: "Medium",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        clicks: 18,
        impressions: 950,
        ctr: 1.89,
        isActive: true
      },
      {
        title: "Brand Welcome Popup Offer",
        advertiserName: "Dinamalar Tamil Partners",
        advertiserEmail: "ads@dinamalarpartners.com",
        advertiserPhone: "9876543210",
        companyName: "Dinamalar Partners",
        description: "Center Popup Ad which appears on load",
        image: "https://placehold.co/600x500/8b5cf6/ffffff?text=Welcome+Special+-+Flat+50%+Off",
        targetUrl: "https://www.dinamalarpartners.com",
        position: "POPUP_ADVERTISEMENT",
        priority: "High",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        popupDelay: 3,
        popupAutoClose: 10,
        clicks: 56,
        impressions: 410,
        ctr: 13.66,
        isActive: true
      },
      {
        title: "Floating Summer Discount Coupon",
        advertiserName: "Summer Cool Drinks",
        advertiserEmail: "cool@summerdrinks.com",
        advertiserPhone: "9003123456",
        companyName: "Summer Cool",
        description: "Bottom Right Floating Ad with close button",
        image: "https://placehold.co/300x250/f59e0b/ffffff?text=Summer+Discount+Coupon+-+Save+30%",
        targetUrl: "https://www.summercool.com/coupons",
        position: "FLOATING_ADVERTISEMENT",
        priority: "Low",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        clicks: 12,
        impressions: 620,
        ctr: 1.94,
        isActive: true
      },
      {
        title: "Article In-Line Promo Campaign",
        advertiserName: "Vikatan Books",
        advertiserEmail: "books@vikatan.com",
        advertiserPhone: "9840234567",
        companyName: "Vikatan Publications",
        description: "In-article advertisement slot",
        image: "https://placehold.co/728x90/3b82f6/ffffff?text=Read+Premium+Tamil+Novels+Online+-+Vikatan",
        targetUrl: "https://books.vikatan.com",
        position: "ARTICLE_ADVERTISEMENT",
        priority: "High",
        status: "Active",
        startDate: yesterday,
        endDate: nextMonth,
        clicks: 38,
        impressions: 1100,
        ctr: 3.45,
        isActive: true
      }
    ];

    await Advertisement.insertMany(sampleAds);
    console.log("✅ Seeded 6 sample advertisements");

    console.log("Database seeded successfully! 🎉");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding database failed:", error);
    process.exit(1);
  }
};

seedSampleData();
