// Diagram registry. Loaded on demand; a missing or broken diagram file never breaks the app.
export const DIAGRAM_IDS = [
  // neuro
  'willis', 'neck_vessels', 'venous_sinuses', 'spinal',
  // vascular
  'aorta', 'visceral', 'pelvis_legs', 'upper_limb', 'veins', 'coronary', 'chest_vessels',
  // non-vascular
  'liver_biliary', 'urinary', 'abdomen_organs', 'chest_organs', 'spine_msk', 'neck_organs',
];

let cache = null;
/** All diagrams that load, in DIAGRAM_IDS order. */
export async function loadDiagrams() {
  if (cache) return cache;
  const results = await Promise.allSettled(DIAGRAM_IDS.map((id) => import(`./${id}.js`)));
  cache = results.filter((r) => r.status === 'fulfilled' && r.value?.default?.parts?.length).map((r) => r.value.default);
  return cache;
}
