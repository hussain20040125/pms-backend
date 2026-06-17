exports.uploadPhoto = (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
  res.json({ url: req.file.path });
};
