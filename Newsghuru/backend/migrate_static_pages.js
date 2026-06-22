const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const mongoose = require("mongoose");
const connectDB = require("./db");

const migrateStaticPages = async () => {
  try {
    console.log("Connecting to Database...");
    await connectDB();

    const StaticPage = require("./models/StaticPage");

    // Step 1: Drop the old unique index on slug (it will conflict with our new compound index)
    try {
      await StaticPage.collection.dropIndex("slug_1");
      console.log("✅ Dropped old unique index on slug");
    } catch (e) {
      console.log("ℹ️  Old slug index not found or already dropped, skipping...");
    }

    // Step 2: Tag existing pages (which have no language) as Tamil
    const existingPages = await StaticPage.find({});
    console.log(`Found ${existingPages.length} existing static pages`);

    for (const page of existingPages) {
      if (!page.language) {
        page.language = "ta";
        await page.save();
        console.log(`✅ Tagged "${page.slug}" as Tamil`);
      }
    }

    // Step 3: Delete all existing pages and re-seed both Tamil and English
    await StaticPage.deleteMany({});
    console.log("✅ Cleared all static pages for fresh seeding");

    // Tamil pages
    const tamilPages = [
      {
        title: "யார் நாம்?",
        slug: "about",
        language: "ta",
        content: `<h2><strong>யார் நாம்?</strong></h2>
<p>நியூஸ் குரு (NewsGhuru) என்பது உடனுக்குடன் நம்பகமான செய்திகளை தமிழ் மொழியில் வழங்கும் ஒரு முன்னணி டிஜிட்டல் செய்தித் தளமாகும். நேர்மை, வேகம், மற்றும் துல்லியம் ஆகிய கொள்கைகளின் அடிப்படையில் நாங்கள் செயல்படுகிறோம்.</p>
<h3><strong>எங்கள் நோக்கம்</strong></h3>
<p>தமிழ் பேசும் உலகளாவிய வாசகர்களுக்கு அரசியல், விளையாட்டு, பொழுதுபோக்கு, வணிகம், கல்வி மற்றும் தொழில்நுட்பம் சார்ந்த செய்திகளை உடனுக்குடன் வழங்குவதே எங்களது முதன்மையான நோக்கமாகும்.</p>`
      },
      {
        title: "தனியுரிமைக் கொள்கை",
        slug: "privacy",
        language: "ta",
        content: `<h2><strong>1. அறிமுகம்</strong></h2>
<p>நியூஸ் குரு உங்கள் தனியுரிமையை மதிக்கிறது மற்றும் உங்கள் தனிப்பட்ட தகவல்களைப் பாதுகாப்பதில் உறுதியாக உள்ளது. இந்தத் தனியுரிமைக் கொள்கை, எங்களது சேவைகளைப் பயன்படுத்தும் போது உங்களிடமிருந்து நாங்கள் சேகரிக்கும் தகவல்களை எவ்வாறு கையாளுகிறோம் என்பதை விளக்குகிறது.</p>
<h2><strong>2. நாங்கள் சேகரிக்கும் தகவல்கள்</strong></h2>
<p>எங்கள் வலைத்தளத்தை நீங்கள் பயன்படுத்தும்போது, சந்தா செலுத்தும் போது அல்லது தொடர்பு கொள்ளும் போது நீங்கள் வழங்கும் பெயர் மற்றும் மின்னஞ்சல் முகவரி, மற்றும் குக்கீகள் மூலம் பகுப்பாய்வு தரவுகளை சேகரிக்கலாம்.</p>
<h2><strong>3. தரவுப் பாதுகாப்பு</strong></h2>
<p>உங்கள் தனிப்பட்ட தகவல்கள் எந்தவொரு மூன்றாம் தரப்பினருக்கும் விற்கப்படவோ அல்லது பகிரப்படவோ மாட்டாது. உங்கள் தகவல்களின் பாதுகாப்பை உறுதிசெய்ய நாங்கள் தகுந்த பாதுகாப்பு நடைமுறைகளைப் பின்பற்றுகிறோம்.</p>`
      },
      {
        title: "விதிமுறைகள் மற்றும் நிபந்தனைகள்",
        slug: "terms",
        language: "ta",
        content: `<h2><strong>1. விதிமுறைகளை ஒப்புக்கொள்ளுதல்</strong></h2>
<p>நியூஸ் குரு வலைத்தளத்தை அணுகுவதன் அல்லது பயன்படுத்துவதன் மூலம், இந்த விதிமுறைகள் மற்றும் நிபந்தனைகளுக்குக் கட்டுப்பட ஒப்புக்கொள்கிறீர்கள். இந்த விதிமுறைகளை நீங்கள் ஏற்கவில்லை எனில், எங்கள் வலைத்தளத்தைப் பயன்படுத்த வேண்டாம் என கேட்டுக்கொள்ளப்படுகிறீர்கள்.</p>
<h2><strong>2. அறிவுசார் சொத்துரிமை</strong></h2>
<p>எங்கள் வலைத்தளத்தில் உள்ள கட்டுரைகள், செய்திகள், படங்கள், லோகோக்கள் மற்றும் பிற உள்ளடக்கங்கள் அனைத்தும் நியூஸ் குருவின் சொத்தாகும். எங்கள் முன் அனுமதியின்றி இவற்றை நகலெடுக்கவோ, வெளியிடவோ அல்லது விநியோகிக்கவோ கூடாது.</p>`
      },
      {
        title: "மறுப்புரை",
        slug: "disclaimer",
        language: "ta",
        content: `<h2><strong>மறுப்புரை</strong></h2>
<p>இங்குள்ள தகவல்கள் அனைத்தும் பொதுவான விழிப்புணர்வு மற்றும் தகவல் நோக்கங்களுக்காக மட்டுமே வழங்கப்படுகின்றன. நியூஸ் குரு தளம் துல்லியமான மற்றும் நம்பகமான தகவல்களை வழங்க அனைத்து முயற்சிகளையும் மேற்கொள்கிறது, இருப்பினும் தகவல்களின் முழுமை, நம்பகத்தன்மை அல்லது துல்லியம் குறித்து நாங்கள் எந்தவிதமான உத்தரவாதமும் அளிக்கவில்லை.</p>
<h3><strong>1. செய்திகளின் துல்லியம்</strong></h3>
<p>நியூஸ் குரு தளம் பல்வேறு செய்திக் குறிப்புகள், செய்தியாளர்கள் மற்றும் முகமைகளின் அடிப்படையில் செய்திகளை வெளியிடுகிறது. இச்செய்திகளின் உண்மைத்தன்மையை சரிபார்க்க நாங்கள் முழு முயற்சி எடுக்கிறோம். எனினும், ஏதேனும் பிழைகள் அல்லது விடுபடல்களுக்கு இந்த நிர்வாகம் பொறுப்பேற்காது.</p>`
      },
      {
        title: "தொடர்பு கொள்ள",
        slug: "contact",
        language: "ta",
        content: `<h2><strong>தொடர்பு விவரங்கள்</strong></h2>
<p>நியூஸ் குரு தளம் தொடர்பான செய்திகள், விளம்பரங்கள் அல்லது கூடுதல் கேள்விகளுக்கு எங்களைத் தொடர்பு கொள்ள விரும்பினால், கீழே உள்ள தொடர்பு படிவத்தைப் பயன்படுத்தவும் அல்லது மின்னஞ்சல் மூலம் எங்களைத் தொடர்பு கொள்ளவும்.</p>
<p>மின்னஞ்சல்: <strong>info@newsghuru.in</strong></p>
<p>முகவரி: சென்னை, தமிழ்நாடு, இந்தியா</p>`
      },
      {
        title: "எங்களுடன் விளம்பரம் செய்யுங்கள்",
        slug: "advertise",
        language: "ta",
        content: `<h2><strong>வணிக விளம்பரங்கள்</strong></h2>
<p>நியூஸ் குரு தளம் தினசரி லட்சக்கணக்கான தமிழ் வாசகர்களைக் கொண்டுள்ளது. எங்கள் தளத்தில் விளம்பரம் செய்வதன் மூலம் உங்கள் வணிகத்தின் எல்லைகளை விரிவாக்கலாம்.</p>
<p>விளம்பர வாய்ப்புகள், கட்டணங்கள் மற்றும் விவரங்களைப் பெற கீழே உள்ள விண்ணப்பப் படிவத்தை சமர்ப்பிக்கவும். எங்கள் விளம்பரப் பிரிவு உங்களை விரைவில் தொடர்பு கொள்ளும்.</p>`
      }
    ];

    // English pages
    const englishPages = [
      {
        title: "About Us",
        slug: "about",
        language: "en",
        content: `<h2><strong>About Us</strong></h2>
<p>NewsGhuru is a leading digital news platform delivering reliable and timely news in English. We operate on the principles of integrity, speed, and accuracy.</p>
<h3><strong>Our Mission</strong></h3>
<p>Our primary mission is to deliver breaking news across politics, sports, entertainment, business, education, and technology to our global readership. We are committed to keeping our readers informed with real-time coverage of events that matter.</p>`
      },
      {
        title: "Privacy Policy",
        slug: "privacy",
        language: "en",
        content: `<h2><strong>1. Introduction</strong></h2>
<p>NewsGhuru values your privacy and is committed to protecting your personal information. This Privacy Policy explains how we collect and use information when you use our services.</p>
<h2><strong>2. Information We Collect</strong></h2>
<p>We may collect information when you use our website, subscribe to services, or contact us. This includes your name, email address, and other contact details. We may also collect analytics data through cookies.</p>
<h2><strong>3. Data Security</strong></h2>
<p>We implement appropriate security measures to ensure your personal data is not accessed by unauthorized third parties or compromised. Your personal information will not be sold or shared with any third party.</p>`
      },
      {
        title: "Terms & Conditions",
        slug: "terms",
        language: "en",
        content: `<h2><strong>1. Acceptance of Terms</strong></h2>
<p>By accessing or using the NewsGhuru website, you agree to be bound by these terms and conditions. If you do not accept these terms, you should not use our website.</p>
<h2><strong>2. Intellectual Property Rights</strong></h2>
<p>All articles, news, images, logos, and other content on our website belong to NewsGhuru. Copying, publishing, or distributing them without prior written permission is prohibited.</p>`
      },
      {
        title: "Disclaimer",
        slug: "disclaimer",
        language: "en",
        content: `<h2><strong>Disclaimer</strong></h2>
<p>All information provided on our website is for general awareness and informational purposes only. NewsGhuru strives to provide accurate and reliable information, but we do not give any warranty or guarantee regarding completeness, reliability, or accuracy of the information.</p>
<h3><strong>1. Accuracy of News</strong></h3>
<p>NewsGhuru publishes news based on various reports, reporters, and sources. We make every effort to verify the authenticity of the news, but the management does not take responsibility for any inadvertent errors.</p>`
      },
      {
        title: "Contact Us",
        slug: "contact",
        language: "en",
        content: `<h2><strong>Contact Details</strong></h2>
<p>If you have any queries, advertisement requests, or feedback regarding NewsGhuru, feel free to contact us using the contact form below or via email.</p>
<p>Email: <strong>info@newsghuru.in</strong></p>
<p>Address: Chennai, Tamil Nadu, India</p>`
      },
      {
        title: "Advertise With Us",
        slug: "advertise",
        language: "en",
        content: `<h2><strong>Business Advertisements</strong></h2>
<p>NewsGhuru reaches hundreds of thousands of readers daily. By advertising on our platform, you can expand your business reach to a highly engaged audience.</p>
<p>To learn about advertising opportunities, rates, and details, please submit the application form below. Our advertising team will get in touch with you shortly.</p>`
      }
    ];

    // Insert all pages
    const allPages = [...tamilPages, ...englishPages];
    for (const page of allPages) {
      await StaticPage.create({
        title: page.title,
        slug: page.slug,
        language: page.language,
        content: page.content,
        lastUpdated: new Date()
      });
      console.log(`✅ Seeded: ${page.title} [${page.language}]`);
    }

    console.log(`\n🚀 Migration Complete! Seeded ${allPages.length} static pages (${tamilPages.length} Tamil + ${englishPages.length} English)`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
};

migrateStaticPages();
