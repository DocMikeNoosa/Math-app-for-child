/* Year 4 (Australian Curriculum) — extra chapters to make a full school year, plus top-ups for short chapters. */
(function () {
  const { mc, tf, inp, num, gen, write, dict, star } = LA.Q;

  const ANTARCTICA = `Antarctica is the coldest, windiest and driest continent on Earth. Almost all of it is covered by an ice sheet that is, on average, about two kilometres thick. In winter the temperature can drop below minus 60 degrees Celsius.\n\nNo people live in Antarctica permanently, but scientists from many countries stay at research stations. Australia has three stations on the continent: Mawson, Davis and Casey. Scientists study the ice to learn about Earth’s climate long ago, and they study the animals.\n\nPenguins, seals and whales live in and around Antarctica. Emperor penguins huddle together in huge groups to survive the winter storms. Tiny shrimp-like animals called krill are food for many of these animals.\n\nAn agreement called the Antarctic Treaty says that Antarctica must be used only for peaceful purposes and science.`;
  const STORM = `The wind howled around the tent like a pack of wild dogs. Jack pulled his sleeping bag up to his chin. “It’s just a storm,” Dad said, but Jack noticed he had already packed the torch, the first-aid kit and the car keys into his jacket.\n\nAt midnight, a branch cracked somewhere above them. Dad was out of the tent in a second. “Car. Now. Bring your shoes,” he said in a calm, quiet voice.\n\nThey sat in the car, rain drumming on the roof, and watched the shadowy trees swing. In the morning, a huge branch lay exactly where their tent had been. Jack looked at Dad. Dad squeezed his shoulder and said nothing at all.`;

  /* ---------- English ---------- */
  LA.extendSubject('y4.english', [
    {
      id: 'word-study-4', term: 1, strand: 'Language', bridge: 'vocabulary',
      title: 'Word study: building words',
      summary: 'Prefixes and suffixes and their meanings, homophones, word families and precise vocabulary.',
      lessons: [
        { id: 'affixes', title: 'Prefixes, suffixes and meaning', minutes: 12, blocks: [{ type: 'read', text: 'Prefixes: **un-, dis-, im-, in-** (not), **re-** (again), **pre-** (before), **mis-** (wrongly), **sub-** (under).\nSuffixes: **-ful, -less, -ness, -ment, -er, -est, -ly, -able**.\n\nKnowing them helps you work out new words: *mis*-*understand*-*ing*.' }, { type: 'vocab', words: [['prefix', 'added to the start of a word', 'przedrostek'], ['suffix', 'added to the end of a word', 'przyrostek']] }], practice: [gen('prefix', {}, 4), gen('suffix', {}, 4)] },
        { id: 'homophones', title: 'Homophones', minutes: 10, blocks: [{ type: 'read', text: '**Homophones** sound the same but are spelt differently and mean different things:\n- their / there / they’re\n- to / too / two\n- where / wear\n- which / witch\n- hear / here' }], practice: [gen('homophone', {}, 6)] },
        { id: 'families', title: 'Word families and precise words', minutes: 12, blocks: [{ type: 'read', text: '**Word families** share a base: *act, action, actor, active, react*.\n\nGood writers choose **precise** words: instead of *said* → whispered, shouted, explained; instead of *went* → raced, wandered, crept.' }], practice: [gen('synonym', {}, 3), gen('antonym', {}, 2), mc('Which word is most precise for walking very quietly?', ['crept', 'went', 'moved'], 0, '“crept” shows how.', { fixed: true }), mc('Which word is in the same family as “sign”?', ['signature', 'sing', 'sigh'], 0, 'sign → signature, signal.')] },
        { id: 'spell-4', title: 'Spelling dictation', minutes: 10, blocks: [{ type: 'read', text: 'Listen and write each word. Think: prefix? suffix? double letter? silent letter?' }], practice: [dict('different', 'Each penguin looks a little different.'), dict('beautiful', 'What a beautiful sunset.'), dict('important', 'It is important to listen.'), dict('surprise', 'The party was a surprise.'), dict('thought', 'I thought about the question.'), dict('through', 'We walked through the forest.'), dict('enough', 'Do we have enough water?'), dict('question', 'Ask a question.')] },
      ],
      quiz: { n: 10, items: [gen('prefix', {}, 2), gen('suffix', {}, 2), gen('homophone', {}, 3), gen('synonym', {}, 2)] },
      challenge: [star(mc('What does “sub” mean in “submarine”?', ['under', 'again', 'not'], 0, 'Submarine = under the sea.', { fixed: true })), star(inp('Make an adjective from “comfort” meaning “able to give comfort”.', ['comfortable'], 'comfort + able.'))],
    },
    {
      id: 'comprehension-4', term: 2, strand: 'Literacy', bridge: 'reading',
      title: 'Reading comprehension',
      summary: 'Literal and inferential questions, author’s purpose, fact and opinion, and summarising.',
      lessons: [
        { id: 'antarctica', title: 'Information text: Antarctica', minutes: 15, blocks: [{ type: 'read', title: 'Antarctica', text: ANTARCTICA }, { type: 'vocab', words: [['continent', 'one of Earth’s seven large land masses', 'kontynent'], ['research station', 'a base where scientists live and work', 'stacja badawcza'], ['treaty', 'a formal agreement between countries', 'traktat']] }], practice: [
          mc('How thick is the Antarctic ice sheet on average?', ['about 2 km', 'about 2 m', 'about 20 km'], 0, '“about two kilometres thick”.', { fixed: true }),
          mc('Who lives in Antarctica?', ['scientists at research stations, for a time', 'nobody ever', 'big cities of people'], 0, 'No one lives there permanently.', { fixed: true }),
          mc('Which is one of Australia’s stations?', ['Mawson', 'Uluru', 'Kosciuszko'], 0, 'Mawson, Davis and Casey.'),
          mc('Why do emperor penguins huddle?', ['to survive the cold winter storms', 'to play', 'to hide from scientists'], 0, 'For warmth.', { fixed: true }),
          mc('What does the Antarctic Treaty say?', ['Antarctica is for peace and science', 'one country owns it', 'mining is encouraged'], 0, 'Peaceful purposes and science.', { fixed: true }),
        ] },
        { id: 'storm', title: 'Narrative: The Storm (inference)', minutes: 15, blocks: [{ type: 'read', title: 'The Storm', text: STORM }], practice: [
          mc('Why had Dad packed the torch, first-aid kit and keys?', ['he was ready in case they needed to leave quickly', 'he was going shopping', 'he had forgotten to unpack'], 0, 'Inference: he was worried but calm.', { fixed: true }),
          mc('What does “howled like a pack of wild dogs” suggest?', ['the wind was loud and scary', 'there were real dogs', 'it was a quiet night'], 0, 'A simile for a frightening sound.', { fixed: true }),
          mc('How did Dad feel, even though he “said nothing at all”?', ['relieved and thankful they were safe', 'angry at Jack', 'bored'], 0, 'The squeeze shows feeling without words.', { fixed: true }),
          mc('Which word best describes Dad?', ['calm and protective', 'careless', 'silly'], 0, 'He stayed calm and kept Jack safe.', { fixed: true }),
        ] },
        { id: 'fact-opinion', title: 'Fact, opinion and author’s purpose', minutes: 12, blocks: [{ type: 'read', text: 'A **fact** can be checked (Antarctica is a continent). An **opinion** is what someone thinks (Antarctica is the most beautiful place).\n\nAuthor’s **purpose**: to **inform**, to **persuade**, or to **entertain**.' }], practice: [mc('Which is an opinion?', ['Penguins are the best animals.', 'Penguins are birds.', 'Antarctica is cold.'], 0, '“the best” is a judgement.', { fixed: true }), mc('What is the main purpose of the Antarctica text?', ['to inform', 'to persuade', 'to entertain'], 0, 'It gives facts.', { fixed: true }), mc('What is the main purpose of “The Storm”?', ['to entertain', 'to inform', 'to persuade'], 0, 'It is a story.', { fixed: true })] },
        { id: 'summarise', title: 'Summarising', minutes: 12, blocks: [{ type: 'read', text: 'A **summary** retells only the **most important** ideas, in your own words, much shorter than the text.\n\nTip: one sentence per paragraph.' }], practice: [write('Summarise the Antarctica text in 4 sentences (one per paragraph).', ['4 sentences', 'Only main ideas', 'Own words'], 40, { homework: true })] },
      ],
      quiz: { n: 8, items: [mc('A fact is…', ['something that can be checked', 'what someone feels'], 0, 'Facts can be checked.', { fixed: true }), mc('A summary should be…', ['short with only main ideas', 'longer than the text'], 0, 'Short.', { fixed: true }), mc('Krill are…', ['tiny shrimp-like animals', 'big whales'], 0, 'Food for many animals.', { fixed: true }), mc('Entertaining is the purpose of most…', ['stories', 'instructions'], 0, 'Stories.', { fixed: true })] },
      challenge: [star(mc('Why does the author of “The Storm” never say Dad was scared?', ['readers infer it from his actions, which is more powerful', 'Dad was not scared', 'the author forgot'], 0, 'Show, don’t tell.', { fixed: true }))],
    },
    {
      id: 'grammar-4', term: 4, strand: 'Language', bridge: 'punctuation',
      title: 'Grammar and punctuation toolkit',
      summary: 'Verb tense consistency, contractions and possessive apostrophes, direct speech punctuation, and word classes.',
      lessons: [
        { id: 'tense-4', title: 'Keep the tense the same', minutes: 10, blocks: [{ type: 'read', text: 'Stay in one tense: ✗ *Yesterday I go to the beach and swam.* ✓ *Yesterday I **went** to the beach and **swam**.*' }], practice: [gen('pastTense', {}, 5), mc('Which sentence keeps the same tense?', ['She opened the door and smiled.', 'She opens the door and smiled.'], 0, 'Both verbs are past.', { fixed: true })] },
        { id: 'apostrophes-4', title: 'Apostrophes: contraction or possession?', minutes: 12, blocks: [{ type: 'read', text: 'Contraction: missing letters — *they’re* (they are), *it’s* (it is).\nPossession: belonging — *the teacher’s desk*, *the teachers’ room* (many teachers).' }], practice: [gen('contraction', {}, 3), gen('apostrophe', {}, 4)] },
        { id: 'speech-4', title: 'Punctuating direct speech', minutes: 12, blocks: [{ type: 'read', text: 'Put the spoken words inside **quotation marks**, with the punctuation inside too:\n*“Watch out!” yelled Mia.*\n*Dad asked, “Are you ready?”*\nStart a **new line** for each new speaker.' }], practice: [mc('Which is punctuated correctly?', ['“Come here,” said Sam.', '“Come here” said Sam.', 'Come here, “said Sam.”'], 0, 'Comma inside the quotation marks.', { fixed: true }), mc('Which is correct?', ['Mum asked, “Where is my hat?”', 'Mum asked, “Where is my hat”?'], 0, 'The question mark goes inside.', { fixed: true }), gen('punctuate', {}, 2)] },
        { id: 'classes-4', title: 'Word classes', minutes: 10, blocks: [{ type: 'read', text: 'Nouns, verbs, adjectives, adverbs — plus **pronouns** (she, they, it), **prepositions** (under, beside, after) and **conjunctions** (and, but, because).' }], practice: [gen('wordClass', {}, 6)] },
      ],
      quiz: { n: 10, items: [gen('pastTense', {}, 2), gen('contraction', {}, 2), gen('apostrophe', {}, 2), gen('wordClass', {}, 2), gen('punctuate', {}, 2)] },
      challenge: [star(mc('Choose the correct sentence.', ['“It’s too cold,” said the penguins’ keeper.', '“Its too cold,” said the penguin’s keepers’.', 'It’s too cold said the penguins keeper.'], 0, 'it’s = it is; penguins’ = belonging to many penguins.', { fixed: true }))],
    },
  ]);
  LA.addLessons('y4.english.narrative', [
    { id: 'plan-narrative', title: 'Planning a narrative', minutes: 12, blocks: [{ type: 'read', text: 'Plan with **orientation** (who, where, when) → **complication** (a problem) → **series of events** → **resolution** (how it is solved). Give your character a want and an obstacle.' }], practice: [mc('Which part introduces the problem?', ['complication', 'orientation', 'resolution'], 0, 'The complication.', { fixed: true }), mc('What does the orientation tell the reader?', ['who, where and when', 'how it ends'], 0, 'It sets the scene.', { fixed: true }), mc('Which is a strong complication?', ['A storm traps the campers on an island.', 'They had breakfast.'], 0, 'A real problem to solve.', { fixed: true })] },
  ], [mc('The resolution is…', ['how the problem is solved', 'the first sentence'], 0, 'Resolution.', { fixed: true }), mc('“Show, don’t tell” means…', ['use actions and details to show feelings', 'write “he was sad”'], 0, 'Show feelings through details.', { fixed: true }), mc('A narrative’s purpose is mainly to…', ['entertain', 'instruct'], 0, 'Entertain.', { fixed: true })]);
  LA.addLessons('y4.english.persuasive', [
    { id: 'structure-persuasive', title: 'Structure of an exposition', minutes: 12, blocks: [{ type: 'read', text: '**Introduction** states your opinion → **arguments** in paragraphs, each with a reason and evidence → **conclusion** restates the opinion. Use **modal words**: must, should, certainly, clearly.' }], practice: [mc('What comes first in a persuasive text?', ['your opinion', 'the conclusion', 'a joke'], 0, 'State your position.', { fixed: true }), mc('Which is a strong modal word?', ['must', 'might', 'perhaps'], 0, '“must” is high modality.', { fixed: true }), mc('Each argument paragraph needs…', ['a reason and evidence', 'only a title'], 0, 'Reason + evidence.', { fixed: true })] },
  ], [mc('A persuasive text tries to…', ['convince the reader', 'tell a fairy tale'], 0, 'Persuade.', { fixed: true }), mc('Which is evidence?', ['A survey found 8 in 10 kids want more sport.', 'I think sport is fun.'], 0, 'Evidence can be checked.', { fixed: true }), mc('The conclusion…', ['restates the opinion', 'introduces new arguments'], 0, 'Restates.', { fixed: true })]);
  LA.addLessons('y4.english.poetry', [
    { id: 'poem-forms', title: 'Poem forms: haiku, limerick, acrostic', minutes: 12, blocks: [{ type: 'read', text: '**Haiku**: 3 lines, 5–7–5 syllables, often about nature.\n**Limerick**: 5 lines, funny, rhyme pattern AABBA.\n**Acrostic**: the first letters of each line spell a word.' }], practice: [mc('How many syllables in the lines of a haiku?', ['5, 7, 5', '7, 7, 7', '4, 4, 4'], 0, '5–7–5.', { fixed: true }), mc('A limerick is usually…', ['funny', 'sad'], 0, 'Humorous.', { fixed: true }), write('Write a haiku about the beach (5–7–5 syllables).', ['3 lines', '5–7–5 syllables', 'A nature image'], 10, { homework: true })] },
  ], [mc('Which poem spells a word with the first letters?', ['acrostic', 'haiku'], 0, 'Acrostic.', { fixed: true }), mc('“The sun smiled” is…', ['personification', 'a simile'], 0, 'The sun acts like a person.', { fixed: true }), mc('“As brave as a lion” is…', ['a simile', 'a metaphor'], 0, 'Uses “as”.', { fixed: true })]);

  /* ---------- Maths ---------- */
  LA.extendSubject('y4.maths', [
    {
      id: 'mental-4', term: 1, strand: 'Number', bridge: 'add-sub', order: 3,
      title: 'Mental strategies and estimation',
      summary: 'Adding and subtracting larger numbers mentally, compensation, rounding to estimate and checking reasonableness.',
      lessons: [
        { id: 'compensate', title: 'Compensation strategy', minutes: 12, blocks: [{ type: 'read', text: '**Round, then fix**: 348 + 199 → 348 + 200 = 548, take 1 → **547**.\n**Subtract**: 625 − 298 → 625 − 300 = 325, add 2 → **327**.' }], practice: [gen('add', { digits: 3 }, 3), gen('sub', { digits: 3, regroup: true }, 3), num('536 + 299 = ?', 835, '536 + 300 − 1.')] },
        { id: 'estimate-4', title: 'Estimating with rounding', minutes: 12, blocks: [{ type: 'read', text: 'Round to the nearest 10, 100 or 1000 to estimate: 4 812 + 2 195 ≈ 5 000 + 2 000 = **7 000**.\n\nAn estimate tells you if your exact answer is **reasonable**.' }], practice: [gen('round', { to: 100, min: 100, max: 9999 }, 2), gen('round', { to: 1000, min: 1000, max: 99999 }, 2), gen('estimate', {}, 3)] },
        { id: 'inverse', title: 'Inverse operations to check', minutes: 10, blocks: [{ type: 'read', text: 'Addition ↔ subtraction, multiplication ↔ division.\n\n7 × 8 = 56 → 56 ÷ 8 = 7. Use the inverse to **check** or to find a **missing number**: ☐ × 6 = 42 → 42 ÷ 6 = 7.' }], practice: [gen('missing', { max: 1000 }, 3), gen('divFact', { tables: [6, 7, 8, 9] }, 3)] },
      ],
      quiz: { n: 10, items: [gen('add', { digits: 3 }, 2), gen('sub', { digits: 3, regroup: true }, 2), gen('estimate', {}, 2), gen('round', { to: 1000, min: 1000, max: 99999 }, 2), gen('missing', { max: 1000 }, 2)] },
      challenge: [star(num('2 999 + 3 457 = ?', 6456, '3 000 + 3 457 − 1.')), star(num('Estimate to the nearest thousand, then work out exactly: 4 990 + 4 990 = ?', 9980, '≈ 10 000; exact 9 980.'))],
    },
    {
      id: 'mult-strategies', term: 2, strand: 'Number', bridge: 'mul-div', order: 5,
      title: 'Multiplication and division strategies',
      summary: 'Facts to 10 × 10, multiplying by 10 and 100, partitioning to multiply 2-digit by 1-digit, division with remainders.',
      lessons: [
        { id: 'facts-4', title: 'Facts to 10 × 10', minutes: 10, blocks: [{ type: 'read', text: 'Tricky facts: 6 × 7 = 42, 7 × 8 = 56, 6 × 8 = 48, 7 × 7 = 49, 8 × 8 = 64, 9 × 6 = 54. Use a fact you know: 7 × 8 = 7 × 4 doubled = 28 × 2 = 56.' }], practice: [gen('mulFact', { tables: [6, 7, 8, 9] }, 6), gen('divFact', { tables: [6, 7, 8, 9] }, 2)] },
        { id: 'partition', title: 'Partitioning to multiply', minutes: 12, blocks: [{ type: 'read', text: '**34 × 6** → 30 × 6 = 180, 4 × 6 = 24 → 180 + 24 = **204**.\n\nThis is the area model: split the rectangle into tens and ones.' }, { type: 'vocab', words: [['partition', 'split a number into parts', 'rozkład na części'], ['product', 'the answer to a multiplication', 'iloczyn']] }], practice: [gen('mul2by1', { maxA: 99, maxB: 9 }, 5), gen('mulBy10', { maxN: 99, ks: [10, 100] }, 2)] },
        { id: 'remainders-4', title: 'Division with remainders', minutes: 12, blocks: [{ type: 'read', text: '**29 ÷ 4 = 7 r 1** because 4 × 7 = 28 and 1 is left over.\n\nIn problems, think about the remainder: 29 kids, 4 per car → 8 cars needed!' }], practice: [gen('divRem', { maxDiv: 9, maxQ: 12, rem: true }, 4), num('29 children, 4 children per car. How many cars are needed?', 8, '7 r 1 → one more car for the last child.')] },
      ],
      quiz: { n: 10, items: [gen('mulFact', { tables: [6, 7, 8, 9] }, 3), gen('mul2by1', { maxA: 99, maxB: 9 }, 3), gen('divRem', { maxDiv: 9, maxQ: 12, rem: true }, 2), gen('mulBy10', {}, 2)] },
      challenge: [star(gen('mul2by1', { maxA: 999, maxB: 9 }, 2)), star(num('125 × 8 = ?', 1000, '100 × 8 + 25 × 8 = 800 + 200.'))],
    },
    {
      id: 'problem-solving-4', term: 3, strand: 'Number', bridge: 'word-problems', order: 9,
      title: 'Problem solving and money',
      summary: 'Multi-step problems, money with change and budgets, and checking that answers are reasonable.',
      lessons: [
        { id: 'multistep-4', title: 'Multi-step problems', minutes: 15, blocks: [{ type: 'read', text: 'Read twice. Underline the question. Plan the steps. Calculate. Check: is it reasonable?' }], practice: [gen('twoStep', {}, 4), gen('mulWord', { tables: [6, 7, 8, 9] }, 1), gen('divWord', { tables: [6, 7, 8, 9] }, 1)] },
        { id: 'money-4', title: 'Money: totals, change and budgets', minutes: 12, blocks: [{ type: 'read', text: 'Add prices, then count up to find change: $20 − $13.65 → $13.65 + 35c = $14, + $6 = $20 → **$6.35** change.\n\nAustralia rounds cash totals to the nearest 5 cents (there are no 1c or 2c coins).' }], practice: [gen('moneyTotal', {}, 2), gen('moneyChange', {}, 2), gen('budget', {}, 2)] },
      ],
      quiz: { n: 8, items: [gen('twoStep', {}, 3), gen('moneyChange', {}, 3), gen('budget', {}, 2)] },
      challenge: [star(num('Movie tickets cost $14 for adults and $9 for children. How much for 2 adults and 3 children?', 55, '28 + 27 = 55.')), star(num('You have $50. You buy 3 books at $12.50 each. How much change (in dollars)?', 12.5, '3 × 12.50 = 37.50; 50 − 37.50 = 12.50.'))],
    },
    {
      id: 'year-review-4', term: 4, strand: 'Review', bridge: 'review', order: 20,
      title: 'Year 4 maths review',
      summary: 'Mixed revision of the whole year in end-of-year and NAPLAN style.',
      lessons: [
        { id: 'r-number', title: 'Number and place value review', minutes: 15, blocks: [{ type: 'read', text: 'Place value to tens of thousands, the four operations, and checking.' }], practice: [gen('placeValue', { min: 1000, max: 99999 }, 2), gen('add', { digits: 4 }, 1), gen('sub', { digits: 4 }, 1), gen('mulFact', { tables: [6, 7, 8, 9] }, 2), gen('divRem', { maxDiv: 9, maxQ: 12 }, 2)] },
        { id: 'r-fractions', title: 'Fractions and decimals review', minutes: 15, blocks: [{ type: 'read', text: 'Equivalent fractions, comparing, tenths and hundredths, money.' }], practice: [gen('equivFraction', {}, 2), gen('fractionCompare', {}, 2), gen('decimalTenths', {}, 1), gen('decimalHundredths', {}, 1), gen('decimalCompare', {}, 2)] },
        { id: 'r-measure', title: 'Measurement, space and data review', minutes: 15, blocks: [{ type: 'read', text: 'Time and the 24-hour clock, area and perimeter, angles, symmetry, data and chance.' }], practice: [gen('clock24', {}, 2), gen('duration', { maxLen: 180 }, 1), gen('areaRect', { max: 12 }, 1), gen('perimeter', {}, 1), gen('symmetry', {}, 1), gen('readGraph', { scale: 5 }, 1), gen('chance', {}, 1)] },
      ],
      quiz: { n: 12, items: [gen('placeValue', { min: 1000, max: 99999 }, 2), gen('mulFact', { tables: [6, 7, 8, 9] }, 2), gen('equivFraction', {}, 2), gen('decimalCompare', {}, 2), gen('clock24', {}, 2), gen('areaRect', { max: 12 }, 2)] },
      challenge: [star(gen('twoStep', {}, 2)), star(gen('decimalAdd', {}, 2))],
    },
  ]);

  /* ---------- Science ---------- */
  LA.extendSubject('y4.science', [
    {
      id: 'earth-surface', term: 2, strand: 'Earth and space sciences', bridge: 'rocks-soil',
      title: 'Earth’s changing surface',
      summary: 'Weathering and erosion by water, wind and ice; how people change the land; protecting soil.',
      lessons: [
        { id: 'weathering', title: 'Weathering', minutes: 12, blocks: [{ type: 'read', text: '**Weathering** is rock **breaking down** into smaller pieces where it is. Causes: water freezing in cracks (ice wedging), heating and cooling, plant roots, rain and chemicals.' }, { type: 'vocab', words: [['weathering', 'rock breaking down where it is', 'wietrzenie'], ['erosion', 'moving broken rock and soil away', 'erozja'], ['sediment', 'bits of rock, sand and soil carried and dropped', 'osad']] }], practice: [mc('Weathering is…', ['rock breaking down where it is', 'rock being carried away'], 0, 'Breaking down.', { fixed: true }), mc('How can water break rock?', ['it freezes in cracks and expands', 'it makes rock sticky'], 0, 'Ice takes more space than water.', { fixed: true }), mc('Which can cause weathering?', ['plant roots growing in cracks', 'a quiet library'], 0, 'Roots push rocks apart.', { fixed: true })] },
        { id: 'erosion', title: 'Erosion and deposition', minutes: 12, blocks: [{ type: 'read', text: '**Erosion** is the **moving** of weathered rock and soil by **water, wind, ice or gravity**. When the moving stops, the material is **deposited** (dropped) — forming beaches, sand dunes and river deltas.\n\nThe Twelve Apostles in Victoria were carved by waves eroding the cliffs.' }], practice: [mc('Erosion is…', ['moving rock and soil away', 'rock breaking where it is'], 0, 'Moving away.', { fixed: true }), mc('Which can cause erosion?', ['wind, water and ice', 'only sunshine'], 0, 'All three move material.', { fixed: true }), mc('Sand dunes are formed by…', ['wind depositing sand', 'volcanoes'], 0, 'Wind.', { fixed: true })] },
        { id: 'protect-soil', title: 'People and soil', minutes: 10, blocks: [{ type: 'read', text: 'Clearing trees and overgrazing leave soil bare, so wind and rain wash it away. We protect soil by **planting trees and grasses**, building **terraces** on hills, using **mulch** and keeping to paths.' }], practice: [mc('How can we reduce soil erosion?', ['plant trees and grasses', 'clear all plants', 'drive over dunes'], 0, 'Roots hold soil.', { fixed: true }), write('Explain why walking on marked paths at the beach protects sand dunes.', ['What happens to plants', 'What happens to the sand', 'Why it matters'], 20, { homework: true })] },
      ],
      quiz: { n: 8, items: [mc('Deposition means…', ['dropping material', 'breaking rock'], 0, 'Dropping.', { fixed: true }), mc('The Twelve Apostles were shaped by…', ['waves', 'people with tools'], 0, 'Wave erosion.', { fixed: true }), mc('Roots help to…', ['hold soil in place', 'cause floods'], 0, 'Hold soil.', { fixed: true })] },
      challenge: [star(mc('Order these: weathering, deposition, erosion.', ['weathering → erosion → deposition', 'erosion → weathering → deposition'], 0, 'Break, move, drop.', { fixed: true }))],
    },
    {
      id: 'life-cycles-4', term: 1, strand: 'Biological sciences', bridge: 'life-cycles',
      title: 'Life cycles and survival',
      summary: 'Flowering plant life cycle and pollination, animal life cycles compared, and how living things depend on each other.',
      lessons: [
        { id: 'plant-cycle', title: 'Flowering plant life cycle', minutes: 12, blocks: [{ type: 'read', text: '**Seed → germination → seedling → adult plant → flower → pollination → fruit with seeds** → seeds are spread → and again!\n\n**Pollination**: pollen moves from one flower to another — carried by bees, birds, bats or wind.' }, { type: 'vocab', words: [['germinate', 'when a seed starts to grow', 'kiełkować'], ['pollination', 'moving pollen between flowers', 'zapylanie']] }], practice: [mc('What carries pollen?', ['bees, birds, bats and wind', 'rocks', 'clouds only'], 0, 'Pollinators.', { fixed: true }), mc('What grows from a pollinated flower?', ['fruit with seeds', 'roots only', 'a new flower immediately'], 0, 'Fruit with seeds.', { fixed: true }), mc('When a seed starts to grow it…', ['germinates', 'pollinates'], 0, 'Germination.', { fixed: true })] },
        { id: 'animal-cycles', title: 'Comparing animal life cycles', minutes: 12, blocks: [{ type: 'read', text: '- **Butterfly**: egg → caterpillar → pupa (chrysalis) → adult (complete metamorphosis)\n- **Frog**: egg → tadpole → froglet → adult\n- **Kangaroo**: tiny joey born → grows in pouch → leaves the pouch → adult\n- **Chicken**: egg → chick → adult' }], practice: [mc('Which stage comes after caterpillar?', ['pupa', 'egg', 'tadpole'], 0, 'Pupa (chrysalis).', { fixed: true }), mc('Where does a newborn joey grow?', ['in its mother’s pouch', 'in an egg', 'in a nest'], 0, 'In the pouch.', { fixed: true }), mc('Which animal changes from a tadpole?', ['frog', 'butterfly', 'kangaroo'], 0, 'Frog.', { fixed: true })] },
        { id: 'depend', title: 'Living things depend on each other', minutes: 10, blocks: [{ type: 'read', text: 'Plants need pollinators; animals need plants for food and shelter; decomposers (fungi, worms, bacteria) break down dead things and return nutrients to the soil.' }], practice: [mc('What do decomposers do?', ['break down dead things and return nutrients', 'make flowers', 'pollinate'], 0, 'They recycle nutrients.', { fixed: true }), mc('Why are bees important to farmers?', ['they pollinate crops', 'they eat pests only'], 0, 'Pollination → fruit and seeds.', { fixed: true })] },
      ],
      quiz: { n: 8, items: [mc('Complete metamorphosis has a…', ['pupa stage', 'pouch stage'], 0, 'Pupa.', { fixed: true }), mc('Pollen is moved by…', ['pollinators and wind', 'roots'], 0, 'Pollinators.', { fixed: true }), mc('Fungi are…', ['decomposers', 'producers'], 0, 'Decomposers.', { fixed: true })] },
      challenge: [star(mc('Why do some flowers have bright colours and sweet nectar?', ['to attract pollinators', 'to scare animals away', 'to keep warm'], 0, 'Attract pollinators.', { fixed: true }))],
    },
  ]);

  /* ---------- HASS ---------- */
  LA.extendSubject('y4.hass', [
    {
      id: 'environments', term: 3, strand: 'Geography', bridge: 'sustainability',
      title: 'Natural environments and resources',
      summary: 'Natural resources (renewable and non-renewable), water as a resource, and how people manage environments.',
      lessons: [
        { id: 'resources', title: 'Natural resources', minutes: 12, blocks: [{ type: 'read', text: '**Natural resources** come from nature: water, soil, forests, fish, minerals, sunlight, wind.\n- **Renewable**: can be replaced naturally (sunlight, wind, trees if replanted)\n- **Non-renewable**: will run out (coal, oil, gas, many minerals)' }, { type: 'vocab', words: [['renewable', 'can be replaced naturally', 'odnawialny'], ['non-renewable', 'will run out', 'nieodnawialny'], ['resource', 'something useful that people use', 'zasób']] }], practice: [mc('Which is renewable?', ['wind', 'coal', 'oil'], 0, 'Wind keeps blowing.', { fixed: true }), mc('Which is non-renewable?', ['coal', 'sunlight', 'water from rain'], 0, 'Coal takes millions of years to form.', { fixed: true })] },
        { id: 'water', title: 'Water: a precious resource', minutes: 12, blocks: [{ type: 'read', text: 'Australia is the **driest inhabited continent**. Water comes from rivers, dams, groundwater and desalination. The **Murray–Darling Basin** supplies water for farms and towns.\n\nSaving water: short showers, fixing leaks, rainwater tanks, watering gardens early.' }], practice: [mc('Australia is the driest…', ['inhabited continent', 'ocean'], 0, 'Antarctica is drier but uninhabited.', { fixed: true }), mc('Which river system supplies many farms?', ['Murray–Darling', 'Vistula'], 0, 'The Murray–Darling Basin.', { fixed: true }), write('List 4 ways your family could save water.', ['4 ideas', 'Explain one'], 20, { homework: true })] },
        { id: 'manage', title: 'Caring for environments', minutes: 10, blocks: [{ type: 'read', text: 'People manage environments through **national parks**, **recycling**, **reducing waste**, **revegetation** (replanting) and **First Nations land management**, such as cultural burning that has cared for Country for thousands of years.' }], practice: [mc('Replanting native plants is called…', ['revegetation', 'deforestation'], 0, 'Revegetation.', { fixed: true }), mc('Which helps the environment?', ['reducing waste', 'leaving lights on'], 0, 'Reduce waste.', { fixed: true })] },
      ],
      quiz: { n: 6, items: [mc('Sunlight is…', ['renewable', 'non-renewable'], 0, 'Renewable.', { fixed: true }), mc('A dam stores…', ['water', 'coal'], 0, 'Water.', { fixed: true }), mc('Cultural burning is a practice of…', ['First Nations land management', 'city councils only'], 0, 'Traditional land care.', { fixed: true })] },
      challenge: [star(mc('Why is it important to use non-renewable resources carefully?', ['they will run out and can harm the environment', 'they grow back quickly'], 0, 'Finite resources.', { fixed: true }))],
    },
  ]);
  LA.addLessons('y4.hass.belonging', [
    { id: 'communities-4', title: 'Diverse communities', minutes: 12, blocks: [{ type: 'read', text: 'Australia is one of the most **culturally diverse** countries: about half of Australians were born overseas or have a parent who was. People belong to many groups — family, school, sport, culture, faith, language (like Polish Saturday school!).' }, { type: 'tip', text: 'Talk together about Tosia’s two cultures — Polish and Australian — and what she enjoys from each.' }], practice: [mc('Australia is…', ['culturally diverse', 'one culture only'], 0, 'Many cultures.', { fixed: true }), mc('Which is a group people can belong to?', ['a language community', 'a cloud'], 0, 'Language communities are groups.', { fixed: true }), write('Write about two groups you belong to and what they mean to you.', ['Two groups', 'Why they matter'], 25, { homework: true })] },
  ], [mc('Belonging means…', ['feeling part of a group', 'being alone'], 0, 'Being part of a group.', { fixed: true }), mc('Diversity means…', ['many different backgrounds', 'everyone the same'], 0, 'Difference.', { fixed: true }), mc('Which can help people feel welcome?', ['including others and learning about their culture', 'ignoring them'], 0, 'Inclusion.', { fixed: true })]);
  LA.addLessons('y4.tech.privacy', [
    { id: 'passwords', title: 'Strong passwords and safe sharing', minutes: 12, blocks: [{ type: 'read', text: 'A strong password is **long** (12+ characters) and mixes words, numbers and symbols — a **passphrase** like *Purple!Kangaroo7Jumps*. Never share passwords except with a parent. Before posting, ask: would I be happy for anyone to see this forever?' }], practice: [mc('Which password is strongest?', ['Purple!Kangaroo7Jumps', 'password', '123456'], 0, 'Long and mixed.', { fixed: true }), mc('Who can you share your password with?', ['a parent or carer', 'your best friend', 'anyone online'], 0, 'Only a trusted adult.', { fixed: true }), tf('Things posted online can be hard to delete.', true, 'They can be copied and saved.')] },
  ], [mc('A passphrase is…', ['a long password made of words', 'a short code'], 0, 'Long, memorable.', { fixed: true }), mc('Personal information includes…', ['your address and school', 'your favourite colour only'], 0, 'Keep it private.', { fixed: true }), mc('If something online upsets you…', ['tell a trusted adult', 'keep it secret'], 0, 'Tell an adult.', { fixed: true })]);
  LA.addLessons('y4.arts.media', [
    { id: 'sound-design', title: 'Sound and music in media', minutes: 12, blocks: [{ type: 'read', text: 'Sound changes how we feel: fast drums = excitement, soft piano = calm or sad, silence = suspense. **Sound effects** (footsteps, rain) make scenes believable.' }], practice: [mc('What music suits a tense chase scene?', ['fast, loud drums', 'a soft lullaby'], 0, 'Fast and loud builds excitement.', { fixed: true }), mc('Silence in a film can create…', ['suspense', 'confusion only'], 0, 'Suspense.', { fixed: true })] },
  ], [mc('Sound effects make a scene…', ['more believable', 'shorter'], 0, 'Believable.', { fixed: true }), mc('The audience is…', ['the people a media work is made for', 'the camera'], 0, 'The viewers.', { fixed: true })]);
})();
