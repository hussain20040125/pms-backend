const Inspection = require('../models/Inspection');

exports.uploadPhoto = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

  // Optionally log a timeline event if inspectionId is provided
  if (req.body.inspectionId) {
    try {
      await Inspection.updateOne(
        { _id: req.body.inspectionId },
        {
          $push: {
            timeline: {
              $each: [{ event: 'PHOTO_UPLOADED', timestamp: new Date(), details: 'Photo uploaded for checkpoint' }],
              $slice: -50,
            },
          },
        }
      );
    } catch {
      // Non-fatal — photo URL still returned even if timeline update fails
    }
  }

  res.json({ url: req.file.path });
};
