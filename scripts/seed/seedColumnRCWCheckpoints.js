/**
 * Seed: add 11 checkpoints for "Column & RCW" trade, scoped to "Nature Park Hotel".
 * Run: node scripts/seed/seedColumnRCWCheckpoints.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../../.env') });

const Trade      = require('../../src/models/Trade');
const CheckPoint = require('../../src/models/CheckPoint');
const Project    = require('../../src/models/Project');

const CHECKPOINTS = [
  'Retaining Wall',
  'Outer Plaster',
  'Column Steel Binding',
  'Column Layout and Starter',
  'Column Concreting',
  'Column Curing (up to 7 days)',
  'Slab Shuttering',
  'Slab Steel Binding',
  'Slab Electrical Conduiting',
  'Slab Concreting',
  'Slab Curing (up to 10 days)',
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const trade = await Trade.findOne({ name: /column.*rcw/i });
  if (!trade) {
    console.error('Trade "Column & RCW" not found. Aborting.');
    process.exit(1);
  }
  console.log(`Found trade: ${trade.name} (${trade._id})`);

  const project = await Project.findOne({ name: /nature park hotel/i });
  if (!project) {
    console.error('Project "Nature Park Hotel" not found. Aborting.');
    process.exit(1);
  }
  console.log(`Found project: ${project.name} (${project._id})`);

  // Remove existing project-scoped checkpoints for this trade (safe to re-run)
  const deleted = await CheckPoint.deleteMany({ tradeId: trade._id, projectId: project._id });
  console.log(`Removed ${deleted.deletedCount} existing project-scoped checkpoints.`);

  const docs = CHECKPOINTS.map((title, i) => ({
    tradeId:       trade._id,
    projectId:     project._id,
    order:         i + 1,
    title,
    standard:      '',
    howToCheck:    '',
    photoRequired: false,
    isHidden:      false,
  }));

  await CheckPoint.insertMany(docs);
  console.log(`Inserted ${docs.length} checkpoints for "${trade.name}" → "${project.name}".`);

  await mongoose.disconnect();
  console.log('Done.');
}

run().catch(err => { console.error(err); process.exit(1); });
