/**
 * One-time fix: replace ALL checkpoints for "Brick / Block Masonry"
 * with the 23 correct construction-flow checkpoints.
 *
 * Run: node seed/fixBrickCheckpoints.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const Trade      = require('../models/Trade');
const CheckPoint = require('../models/CheckPoint');

const NEW_CHECKPOINTS = [
  'Brick Work Layout',
  'Brick Work up to 1 m Height',
  'Concrete Band',
  'Brick Work up to Second Band',
  'Concrete 2nd Band',
  'Brick Work up to Beam Bottom',
  'Curing after Completion of Brick Work (7 Days)',
  'Electrical Conduiting',
  'Electrical Conduiting Repairing',
  'Bathroom and Kitchen PVC Pipe Fitting',
  'Plumbing Repairing',
  'Chicken Mesh on Beam and Brick Work Concrete Joint',
  'Plaster Work',
  'Curing after Plaster Work (7 Days)',
  'Base Preparation and Leveling for Tiles',
  'Tiling',
  'Door Installation',
  'Electrical Wiring',
  '1st Coat Putty',
  '2nd Coat Putty',
  'Electrical Switch Board and Plate Installation',
  '1st Coat Paint',
  'Bathroom and Kitchen C.P. Fitting',
];

async function fix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const trade = await Trade.findOne({ name: 'Brick / Block Masonry' });
  if (!trade) {
    console.error('Trade "Brick / Block Masonry" not found. Aborting.');
    process.exit(1);
  }
  console.log(`Found trade: ${trade.name} (${trade._id})`);

  const deleted = await CheckPoint.deleteMany({ tradeId: trade._id });
  console.log(`Deleted ${deleted.deletedCount} existing checkpoints.`);

  const docs = NEW_CHECKPOINTS.map((title, i) => ({
    tradeId:       trade._id,
    order:         i + 1,
    title,
    standard:      '',
    howToCheck:    '',
    photoRequired: false,
    isHidden:      false,
  }));

  await CheckPoint.insertMany(docs);
  console.log(`Inserted ${docs.length} new checkpoints.`);

  await mongoose.disconnect();
  console.log('Done.');
}

fix().catch(err => { console.error(err); process.exit(1); });
