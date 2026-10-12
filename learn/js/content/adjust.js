/* Adjustments to the Australian workbooks for this learner:
   - PE (movement) chapters are removed because PE is done at school; the Health topics stay.
   - Chapters get a shared `bridge` tag where the Polish programme teaches the same topic. */
(function () {
  const LA = window.LA;
  LA.dropChapters('y3.hpe', ['active', 'movement']);
  LA.dropChapters('y4.hpe', ['fitness', 'strategies']);
  const tags = {
    'y3.maths.place-value': 'place-value', 'y3.maths.add-sub': 'add-sub', 'y3.maths.times-tables': 'times-tables', 'y3.maths.mul-div': 'mul-div', 'y3.maths.money': 'money', 'y3.maths.fractions': 'fractions',
    'y3.maths.measurement': 'measurement', 'y3.maths.time': 'time', 'y3.maths.shapes-angles': 'shapes', 'y3.maths.data': 'data', 'y3.maths.chance': 'chance', 'y3.maths.location': 'maps',
    'y4.maths.place-value': 'place-value', 'y4.maths.add-sub': 'add-sub', 'y4.maths.times-tables': 'times-tables', 'y4.maths.mul-div': 'mul-div', 'y4.maths.fractions': 'fractions', 'y4.maths.decimals-money': 'money',
    'y4.maths.measurement': 'measurement', 'y4.maths.time': 'time', 'y4.maths.shapes-angles': 'shapes', 'y4.maths.data': 'data', 'y4.maths.location': 'maps',
    'y3.science.living': 'living', 'y3.science.life-cycles': 'life-cycles', 'y3.science.states': 'states-of-matter', 'y3.science.earth-materials': 'rocks-soil', 'y3.science.heat': 'heat',
    'y4.science.habitats': 'food-chains', 'y4.science.water-cycle': 'water-cycle', 'y4.science.forces': 'forces', 'y4.science.materials': 'materials',
    'y3.hass.mapping-australia': 'maps-geo', 'y4.hass.continents': 'continents', 'y3.hass.rules': 'rules', 'y4.hass.local-government': 'local-community', 'y3.hass.climate': 'weather', 'y3.hass.celebrations': 'celebrations',
    'y3.english.sentences': 'sentences', 'y3.english.nouns-adjectives': 'parts-of-speech', 'y3.english.verbs-adverbs': 'parts-of-speech', 'y3.english.narrative': 'narrative', 'y3.english.poetry': 'poetry',
    'y4.english.word-groups': 'parts-of-speech', 'y4.english.narrative': 'narrative', 'y4.english.poetry': 'poetry', 'y4.english.punctuation': 'punctuation', 'y4.english.procedures': 'instructions',
    'y3.hpe.healthy-eating': 'healthy-eating', 'y3.hpe.safety': 'safety', 'y4.hpe.safety': 'safety', 'y4.hpe.nutrition': 'healthy-eating',
    'y3.tech.algorithms': 'algorithms', 'y4.tech.algorithms': 'algorithms', 'y3.arts.music': 'music', 'y4.arts.music': 'music',
  };
  Object.keys(tags).forEach((k) => { if (LA.index.chapters[k]) LA.index.chapters[k].bridge = tags[k]; });
})();
