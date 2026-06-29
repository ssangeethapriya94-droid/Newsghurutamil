const mongoose = require("mongoose");

const adSettingsSchema = new mongoose.Schema(
  {
    globalRotationInterval: {
      type: Number,
      enum: [10, 15, 20, 30],
      default: 10
    },
    popupEnabled: {
      type: Boolean,
      default: true
    },
    popupDelay: {
      type: Number,
      default: 3
    },
    popupAutoClose: {
      type: Number,
      default: 10
    },
    // Page Details & Sales Contact Access Control
    salesEmail: {
      type: String,
      default: "ads@newsghuru.in"
    },
    salesPhone: {
      type: String,
      default: "+91 88259 48859"
    },
    salesWebsite: {
      type: String,
      default: "newsghuru.in"
    },
    benefitsEn: {
      type: [String],
      default: [
        "Priority publishing",
        "Dedicated account manager",
        "Premium homepage visibility",
        "Monthly analytics reports",
        "Customized campaigns",
        "Co-branded opportunities"
      ]
    },
    benefitsTa: {
      type: [String],
      default: [
        "முன்னுரிமை வெளியீடு (Priority publishing)",
        "பிரத்யேக கணக்கு மேலாளர் (Dedicated account manager)",
        "முகப்பு பக்கத்தில் சிறந்த பார்வைத் திறன் (Premium homepage visibility)",
        "மாதாந்திர பகுப்பாய்வு அறிக்கைகள் (Monthly analytics reports)",
        "தனிப்பயனாக்கப்பட்ட விளம்பரங்கள் (Customized campaigns)",
        "இணை பிராண்டிங் வாய்ப்புகள் (Co-branded opportunities)"
      ]
    },
    paymentTermsEn: {
      type: [String],
      default: [
        "GST will be charged extra as applicable.",
        "100% advance payment is required before campaign activation.",
        "Creative assets should be submitted at least 48 hours before scheduled publication.",
        "Sponsored content will be clearly labeled as Sponsored, Partner Content, or Advertisement.",
        "News Ghuru reserves the right to reject advertisements that do not comply with legal or ethical guidelines."
      ]
    },
    paymentTermsTa: {
      type: [String],
      default: [
        "விதிகளின்படி ஜிஎஸ்டி (GST) தனியாக வசூலிக்கப்படும்.",
        "விளம்பரம் நேரலையாவதற்கு முன் 100% முன்பணம் செலுத்தப்பட வேண்டும்.",
        "திட்டமிடப்பட்ட வெளியீட்டிற்கு குறைந்தபட்சம் 48 மணிநேரத்திற்கு முன்பே விளம்பர படங்கள் சமர்ப்பிக்கப்பட வேண்டும்.",
        "ஸ்பான்சர் செய்யப்பட்ட கட்டுரைகள் Sponsored, Partner Content அல்லது Advertisement எனத் தெளிவாகக் குறிப்பிடப்படும்.",
        "சட்டம், நெறிமுறைகளுக்கு இணங்காத விளம்பரங்களை நிராகரிக்கும் உரிமை நியூஸ் குருவுக்கு உண்டு."
      ]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("AdSettings", adSettingsSchema);
