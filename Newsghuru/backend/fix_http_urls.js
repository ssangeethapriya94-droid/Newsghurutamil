const mongoose = require('mongoose');
const dotenv = require('dotenv');
const News = require('./models/News');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    
    // Update News
    const newsItems = await News.find();
    let count = 0;
    for (let news of newsItems) {
        let updated = false;
        if (news.image && news.image.startsWith('http://newsghurutamilbackend.onrender.com')) {
            news.image = news.image.replace('http://', 'https://');
            updated = true;
        }
        if (news.coverImage && news.coverImage.startsWith('http://newsghurutamilbackend.onrender.com')) {
            news.coverImage = news.coverImage.replace('http://', 'https://');
            updated = true;
        }
        if (news.galleryImages && news.galleryImages.length > 0) {
            news.galleryImages = news.galleryImages.map(img => {
                if (img.startsWith('http://newsghurutamilbackend.onrender.com')) {
                    updated = true;
                    return img.replace('http://', 'https://');
                }
                return img;
            });
        }
        if (updated) {
            await news.save();
            count++;
        }
    }
    console.log(`Finished updating ${count} news articles.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
