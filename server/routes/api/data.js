
/**
 * Developed by Engagement Lab, 2019
 * ==============
 * Route to retrieve simple data queries
 * @class api
 * @author Johnny Richardson
 *
 * ==========
 */
const { keystone } = global;

const buildData = async (type, key, res) => {
  const intro = keystone.list('Intro').model;

  let data = null;
  const getRes = [];

  if (type === 'intro') {
    // Get intro text
    data = intro.findOne({});
  }

  try {
    getRes.push(await data.exec());
    res.json(getRes);
  } catch (e) {
    res.status(500).json({
      e,
    });
  }
};

/*
 * Get data
 */
exports.get = function (req, res) {
  return buildData(req.params.type, req.params.key, res);
};
