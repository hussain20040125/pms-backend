/**
 * addBasementElements.js
 * Adds 51 columns (C 001–C 051) and 16 RCW walls to the
 * Nature Park Hotel → Basement → Entire Floor (General) location.
 *
 * Run: node scripts/addBasementElements.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const Project  = require('../src/models/Project');
const Floor    = require('../src/models/Floor');
const Location = require('../src/models/Location');
const Element  = require('../src/models/Element');

// ── Element definitions ───────────────────────────────────────────────────────

const COLUMNS = Array.from({ length: 51 }, (_, i) => ({
  name:  `C ${String(i + 1).padStart(3, '0')}`,
  type:  'COLUMN',
  order: i + 1,
}));

const RCW_WALLS = [
  'RCW 1', 'RCW 2', 'RCW 3', 'RCW 4',  'RCW 5',
  'RCW 6', 'RCW 7',
  'RCW 8/1', 'RCW 8/2',
  'RCW 9', 'RCW 10', 'RCW 11', 'RCW 12',
  'RCW 13', 'RCW 14', 'RCW 15',
].map((name, i) => ({ name, type: 'WALL', order: i + 1 }));

// ─────────────────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  // 1. Find the project (name may be "Nature Park Hotel" or "Nature Park Hotel Fern")
  const project = await Project.findOne({ name: /Nature Park Hotel/i });
  if (!project) throw new Error('Project "Nature Park Hotel" not found. Run seedData.js first.');
  console.log(`Project : ${project.name} (${project._id})`);

  // 2. Find Basement floor
  const floor = await Floor.findOne({ projectId: project._id, code: 'BSMT' });
  if (!floor) throw new Error('Basement floor not found.');
  console.log(`Floor   : ${floor.label} (${floor._id})`);

  // 3. Find "Entire Floor (General)" location
  const location = await Location.findOne({ floorId: floor._id, name: 'Entire Floor (General)' });
  if (!location) throw new Error('"Entire Floor (General)" location not found in Basement.');
  console.log(`Location: ${location.name} (${location._id})`);

  // 4. Remove any previously added elements for this location (safe re-run)
  const existing = await Element.countDocuments({ locationId: location._id });
  if (existing > 0) {
    await Element.deleteMany({ locationId: location._id });
    console.log(`Removed ${existing} existing elements (clean re-run).`);
  }

  // 5. Insert columns + RCW walls
  const docs = [...COLUMNS, ...RCW_WALLS].map(el => ({
    ...el,
    locationId: location._id,
    floorId:    floor._id,
    projectId:  project._id,
  }));

  await Element.insertMany(docs);

  console.log(`\nDone!`);
  console.log(`  Columns added : ${COLUMNS.length}  (C 001 – C 051)`);
  console.log(`  RCW walls added: ${RCW_WALLS.length}  (RCW 1 – RCW 15, incl. RCW 8/1 & RCW 8/2)`);
  console.log(`  Total elements : ${docs.length}`);

  await mongoose.disconnect();
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
