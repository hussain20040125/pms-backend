const asyncHandler = require('../middleware/asyncHandler');
const Inspection = require('../models/Inspection');

exports.getAll = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.locationId) query.locationId = req.query.locationId;
  if (req.query.tradeId)    query.tradeId    = req.query.tradeId;
  res.json(await Inspection.find(query)
    .populate('projectId', 'name')
    .populate('floorId', 'code label')
    .populate('locationId', 'name')
    .populate('tradeId', 'name')
    .sort({ dateOfCheck: -1 })
    .lean());
});

exports.getOne = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id)
    .populate('projectId')
    .populate('floorId')
    .populate('locationId')
    .populate('tradeId')
    .populate('results.checkPointId');
  if (!inspection) return res.status(404).json({ message: 'Inspection not found.' });
  res.json(inspection);
});

exports.create = asyncHandler(async (req, res) => {
  const doc = {
    ...req.body,
    timeline: [{
      event: 'DRAFT_CREATED',
      timestamp: new Date(),
      details: `Draft started by ${req.body.checkedBy || 'engineer'}`,
    }],
  };
  res.status(201).json(await Inspection.create(doc));
});

exports.update = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!inspection) return res.status(404).json({ message: 'Inspection not found.' });
  res.json(inspection);
});

exports.submit = asyncHandler(async (req, res) => {
  const inspection = await Inspection.findById(req.params.id);
  if (!inspection) return res.status(404).json({ message: 'Inspection not found.' });

  // Apply any last-minute body fields (e.g. final results)
  Object.assign(inspection, req.body);
  inspection.status      = 'SUBMITTED';
  inspection.submittedAt = new Date();

  const total  = inspection.results?.length || 0;
  const filled = inspection.results?.filter(r => r.result !== 'PENDING').length || 0;

  if (inspection.timeline.length < 50) {
    inspection.timeline.push({
      event:     'SUBMITTED',
      timestamp: new Date(),
      details:   `Submitted by ${inspection.checkedBy || 'engineer'} — ${filled} of ${total} filled`,
    });
  }

  await inspection.save();
  res.json(inspection);
});

// GET /api/inspections/draft
exports.getDraft = asyncHandler(async (req, res) => {
  const { locationId, tradeId, elementId, date } = req.query;
  if (!locationId || !tradeId || !date) return res.json({ found: false });

  const start = new Date(date); start.setUTCHours(0, 0, 0, 0);
  const end   = new Date(date); end.setUTCHours(23, 59, 59, 999);

  const query = { locationId, tradeId, status: 'DRAFT', dateOfCheck: { $gte: start, $lte: end } };
  if (elementId && elementId !== 'undefined' && elementId !== 'null' && elementId !== '') query.elementId = elementId;

  const draft = await Inspection.findOne(query).sort({ updatedAt: -1 });
  if (!draft) return res.json({ found: false });
  res.json({ found: true, inspection: draft });
});

// GET /api/inspections/check-duplicate
exports.checkDuplicate = asyncHandler(async (req, res) => {
  const { locationId, tradeId, elementId, date } = req.query;
  if (!locationId || !tradeId || !date) return res.json({ exists: false });

  const start = new Date(date); start.setHours(0, 0, 0, 0);
  const end   = new Date(date); end.setHours(23, 59, 59, 999);

  const query = { locationId, tradeId, status: 'SUBMITTED', dateOfCheck: { $gte: start, $lte: end } };
  if (elementId) query.elementId = elementId;

  const existing = await Inspection.findOne(query).sort({ submittedAt: -1 });
  if (!existing) return res.json({ exists: false });

  res.json({
    exists: true,
    inspection: {
      _id:        existing._id,
      submittedAt: existing.submittedAt,
      checkedBy:  existing.checkedBy,
      filledCount: existing.results.filter(r => r.result !== 'PENDING').length,
      totalCount:  existing.results.length,
    },
  });
});
