const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Information = require('./models/Information');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    console.log("Connected to DB");
    
    // Update Information
    const infoItems = await Information.find();
    let count = 0;
    for (let info of infoItems) {
        let updated = false;
        if (info.image && info.image.startsWith('http://newsghurutamilbackend.onrender.com')) {
            info.image = info.image.replace('http://', 'https://');
            updated = true;
        }
        if (updated) {
            await info.save();
            count++;
        }
    }
    console.log(`Finished updating ${count} information articles.`);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
