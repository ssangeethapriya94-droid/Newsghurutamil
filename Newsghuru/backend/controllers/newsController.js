const News = require("../models/News");


// GET ALL NEWS
exports.getNews = async (req, res) => {
  const news = await News.find();

  res.json(news);
};


// ADD NEWS
exports.addNews = async (req, res) => {
  const news = await News.create(req.body);

  res.json(news);
};


// DELETE NEWS
exports.deleteNews = async (req, res) => {
  await News.findByIdAndDelete(req.params.id);

  res.json({
    message: "Deleted",
  });
};