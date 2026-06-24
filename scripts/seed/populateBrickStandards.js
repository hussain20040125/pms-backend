/**
 * One-time script: populate standard + howToCheck for all 23 Brick/Block Masonry checkpoints.
 * Run: node seed/populateBrickStandards.js
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const Trade      = require('../models/Trade');
const CheckPoint = require('../models/CheckPoint');

const STANDARDS = {
  'Brick Work Layout': {
    standard:   'Layout must match approved architectural drawing; corners set with builder\'s square (90°); first course bed mortar joint 10 mm (±2 mm); chalk line / thread line used for alignment.',
    howToCheck: 'Verify setting-out dimensions with measuring tape; check right angles with a builder\'s square; confirm first course mortar joint thickness.',
  },
  'Brick Work up to 1 m Height': {
    standard:   'Wall plumb within 3 mm per metre; horizontal courses level (±3 mm in 3 m); mortar joints fully filled (no hollow joints); course stagger (stretcher bond) maintained.',
    howToCheck: 'Check plumb with spirit level or plumb bob every 600 mm; check level with 3-m straight edge; tap bricks lightly to detect hollow mortar joints.',
  },
  'Concrete Band': {
    standard:   'Width equal to wall thickness; minimum depth 75 mm; M15 grade concrete; longitudinal reinforcement as per drawing; properly cured for 7 days.',
    howToCheck: 'Measure depth of band; verify rebar dia and spacing match drawing; confirm concrete grade as per mix design record.',
  },
  'Brick Work up to Second Band': {
    standard:   'Wall plumb and level maintained from first band; courses aligned with layout string; mortar joints 10 mm; no hollow joints; bricks fully wetted before use.',
    howToCheck: 'Check plumb and level at every 600 mm; inspect mortar joints visually; verify brick soaking records.',
  },
  'Concrete 2nd Band': {
    standard:   'Same specification as 1st concrete band (M15, min 75 mm deep, rebar as per drawing); properly shuttered before pour; cured minimum 7 days.',
    howToCheck: 'Measure band depth; check rebar placement; confirm curing records.',
  },
  'Brick Work up to Beam Bottom': {
    standard:   'Wall plumb within 3 mm / m; last course flush with beam soffit level; no hollow or cracked joints; corbelling/raking course done where specified.',
    howToCheck: 'Check plumb with spirit level; measure to beam soffit level; inspect corner joints with a thin rod to detect hollow mortar.',
  },
  'Curing after Completion of Brick Work (7 Days)': {
    standard:   'Wet curing for minimum 7 consecutive days; all wall surfaces kept continuously moist; no white efflorescence marks.',
    howToCheck: 'Check site daily register for curing records; inspect wall surface for dry patches; confirm start and end date of curing.',
  },
  'Electrical Conduiting': {
    standard:   'Conduits laid as per approved electrical drawing; minimum 25 mm concrete/mortar cover; ISI-marked PVC conduits; conduit dia as per wire count; junction boxes at bends.',
    howToCheck: 'Compare conduit routing with electrical drawing; measure cover depth; check ISI marking on conduit; verify pull wire is inserted.',
  },
  'Electrical Conduiting Repairing': {
    standard:   'Chases patched with cement mortar 1:3; repaired surface flush (±1 mm) with existing wall face; no cracks after 24 hours; conduit box frames properly set.',
    howToCheck: 'Use straight edge to check flush level of repaired surface; inspect for cracks after 24 hours; confirm box frame is level and plumb.',
  },
  'Bathroom and Kitchen PVC Pipe Fitting': {
    standard:   'Pipes laid as per plumbing drawing; min 1:80 slope for drainage; ISI-marked UPVC pipes; joints leak-free; sleeves provided at slab crossings.',
    howToCheck: 'Check slope with spirit level (min 12 mm fall per metre); flood test with water and observe for 30 minutes; verify ISI mark on pipes.',
  },
  'Plumbing Repairing': {
    standard:   'All plumbing chases filled with CM 1:3; penetrations through slabs/walls sealed with non-shrink mortar; water hammer or loose pipe not acceptable.',
    howToCheck: 'Inspect all chase repairs; verify slab penetrations are sealed; pressure test visible portions.',
  },
  'Chicken Mesh on Beam and Brick Work Concrete Joint': {
    standard:   '150 mm wide galvanised chicken mesh (20 gauge, 12 mm aperture) fixed at all RCC-to-brick junctions; overlap min 75 mm each side; fully embedded in first plaster coat.',
    howToCheck: 'Measure mesh width and overlap; check fixings (staples or nails every 200 mm); confirm mesh is taut and fully covers the junction.',
  },
  'Plaster Work': {
    standard:   '12 mm thick cement–sand plaster in ratio 1:6; surface plane (max deviation 3 mm under 3-m straight edge); no hollow patches; no surface cracks; chamfer at edges.',
    howToCheck: 'Check thickness with a depth gauge; use 3-m straight edge to measure surface deviation; tap surface to detect hollow plaster; inspect edges and corners.',
  },
  'Curing after Plaster Work (7 Days)': {
    standard:   'Continuous wet curing for 7 days; no dry patches or map cracking; curing to begin within 24 hours of plaster application.',
    howToCheck: 'Inspect daily; check curing log; look for shrinkage cracks or dry patches; spray test water and confirm surface absorption.',
  },
  'Base Preparation and Leveling for Tiles': {
    standard:   'Base level within ±3 mm under 3-m straight edge; surface clean, dust-free and free of laitance; slope as per drawing (e.g., 1:100 toward floor trap); bed thickness min 25 mm for floor tiles.',
    howToCheck: 'Check level with 3-m straight edge and feeler gauge; verify slope with spirit level; confirm surface roughness for bonding.',
  },
  'Tiling': {
    standard:   'Joints aligned and uniform (as per tile size); max surface deviation 2 mm under 3-m straight edge; no lippage > 1 mm; hollow tiles < 5% of area; grouting fully filled.',
    howToCheck: 'Use 3-m straight edge; tap tiles to check for hollow sound; use lippage gauge; check joint alignment with thread line; inspect grout fill.',
  },
  'Door Installation': {
    standard:   'Frame plumb and level (max 2 mm deviation); door opens and closes without binding; gap between door and frame 3–5 mm all around; fixings into masonry at max 600 mm centres; anti-rust treatment on frame anchors.',
    howToCheck: 'Check plumb and level with spirit level; open and close door manually; measure gap with feeler gauge; verify anchor spacing.',
  },
  'Electrical Wiring': {
    standard:   'Wiring as per approved single-line drawing; colour coding as per IS 732; wires secured in conduit (no slack outside conduit); continuity and insulation resistance test (IR > 1 MΩ) passed; ISI-marked cables.',
    howToCheck: 'Compare wiring with drawing; check colour coding; perform continuity test with multimeter; perform IR test with megger; verify ISI mark on cables.',
  },
  '1st Coat Putty': {
    standard:   'Surface smooth; no ridges, brush marks or pinholes; uniform thickness 1–1.5 mm; fully dry (min 6 hours) before 2nd coat; putty applied on POP-free wall.',
    howToCheck: 'Inspect surface under raking light for ridges or brush marks; check dryness; verify no pinholes or misses.',
  },
  '2nd Coat Putty': {
    standard:   'Surface perfectly smooth after sanding with 180-grit paper; no pinholes or brush marks; uniform whiteness; thickness 0.5–1 mm; fully dry before painting.',
    howToCheck: 'Inspect under raking light; run hand over surface for smoothness; confirm sanding dust removed; check dryness.',
  },
  'Electrical Switch Board and Plate Installation': {
    standard:   'Switch/socket plates level and plumb (max 1 mm deviation); flush with wall face; no visible gaps between plate and wall; all switches and sockets functional; earth connections made.',
    howToCheck: 'Check level with spirit level; inspect for gaps; operate all switches and sockets; verify earth continuity.',
  },
  '1st Coat Paint': {
    standard:   'Uniform coverage (no misses, runs or drips); correct colour as per schedule; surface dry before 2nd coat (min 4 hours); 100% coverage with no pinholes.',
    howToCheck: 'Inspect under raking light for misses and runs; cross-check colour with approved sample; check dryness.',
  },
  'Bathroom and Kitchen C.P. Fitting': {
    standard:   'CP fittings as per approved schedule; securely fixed to wall/slab; no leaks at joints; flushing, flow and drainage functioning correctly; chrome finish free of scratches.',
    howToCheck: 'Open each fitting fully and check flow rate; inspect all joints for leaks after 30-minute soak; check flush mechanism; inspect chrome finish.',
  },
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  const trade = await Trade.findOne({ name: 'Brick / Block Masonry' });
  if (!trade) { console.error('Trade not found.'); process.exit(1); }

  let updated = 0;
  for (const [title, vals] of Object.entries(STANDARDS)) {
    const res = await CheckPoint.updateOne(
      { tradeId: trade._id, title },
      { $set: { standard: vals.standard, howToCheck: vals.howToCheck } }
    );
    if (res.matchedCount === 0) {
      console.warn(`  ⚠ Not found: "${title}"`);
    } else {
      console.log(`  ✓ Updated: "${title}"`);
      updated++;
    }
  }

  console.log(`\nDone. ${updated} / ${Object.keys(STANDARDS).length} checkpoints updated.`);
  await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });
