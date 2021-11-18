const Search = require("../models/Search");

module.exports.index = async (req, res) => {
  const { searchQuery } = req.query;
  const results = await Search.find(searchQuery);
  const data = {
    query: searchQuery,
    results: results,
  };
  res.render("tables/search", { data });
};
