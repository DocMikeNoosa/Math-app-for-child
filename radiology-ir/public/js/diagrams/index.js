// Region registry: true-3D models (neuro / vascular), 2.5D diagrams for the remaining vascular regions,
// and simple organ lists for non-vascular procedures. Missing or broken files never break the app.
import { BODY_PARTS } from '../anatomy.js';
import { expandModel } from '../model3d.js';

export const MODEL_IDS = ['neuro3d', 'body3d'];
export const DIAGRAM_IDS = ['venous_sinuses', 'spinal', 'upper_limb', 'veins', 'chest_vessels'];

// Non-vascular: organ lists (no drawing) per body part
const NV = [['neck', 'Szyja', 'Neck'], ['chest', 'Klatka piersiowa', 'Chest'], ['abdomen', 'Jama brzuszna', 'Abdomen'], ['pelvis', 'Miednica', 'Pelvis'], ['spine', 'Kręgosłup i układ ruchu', 'Spine and MSK'], ['lower_limb', 'Kończyny', 'Limbs']];
export function organLists() {
  return NV.map(([anat, pl, en]) => {
    const part = BODY_PARTS.find((b) => b.id === anat);
    return {
      id: `nv_${anat}`, kind: 'list', branches: ['NonVascular'], anat, label: [pl, en],
      parts: (part?.targets || []).filter((t) => t[3] === 'organ').map(([id, tpl, ten]) => ({ id, label: [tpl, ten], side: '', kind: 'organ', anat })),
    };
  }).filter((d) => d.parts.length);
}

let cache = null;
/** Models first (neuro, vascular), then the 2.5D diagrams, then the organ lists. */
export async function loadDiagrams() {
  if (cache) return cache;
  const load = (path) => import(path).then((m) => m.default).catch(() => null);
  const models = (await Promise.all(MODEL_IDS.map((id) => load(`../models/${id}.js`)))).filter(Boolean).map(expandModel);
  const diagrams = (await Promise.all(DIAGRAM_IDS.map((id) => load(`./${id}.js`)))).filter((d) => d?.parts?.length);
  cache = [...models, ...diagrams, ...organLists()];
  return cache;
}
