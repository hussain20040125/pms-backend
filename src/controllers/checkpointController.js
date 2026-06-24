const asyncHandler = require('../middleware/asyncHandler');
const CheckPoint = require('../models/CheckPoint');

exports.getAll = asyncHandler(async (req, res) => {
  const { tradeId, projectId } = req.query;
  const base = { isHidden: { $ne: true } };
  if (tradeId) base.tradeId = tradeId;

  if (projectId) {
    // Prefer project-specific checkpoints; fall back to global (null projectId) if none defined
    const specific = await CheckPoint.find({ ...base, projectId }).sort({ order: 1 }).lean();
    if (specific.length > 0) return res.json(specific);
    return res.json(await CheckPoint.find({ ...base, projectId: null }).sort({ order: 1 }).lean());
  }

  res.json(await CheckPoint.find({ ...base, projectId: null }).sort({ order: 1 }).lean());
});
