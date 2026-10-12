/* Year 3 (Australian Curriculum) — extra chapters to make a full school year, plus top-ups for short chapters.
   Word banks carry the Polish meaning as a third item (shown under the English definition). */
(function () {
  const { mc, tf, inp, num, gen, write, dict, star } = LA.Q;

  const PLATYPUS = `The platypus is one of the strangest animals in the world, and it lives only in eastern Australia. It has a bill like a duck, a tail like a beaver and webbed feet like an otter.\n\nPlatypuses live in creeks and rivers. They dig burrows in the riverbank. When a platypus dives, it closes its eyes, ears and nose. It finds food — worms, shrimps and insect larvae — by sensing tiny electrical signals with its bill.\n\nThe platypus is a **monotreme**: a mammal that lays eggs. The mother lays one to three eggs and keeps them warm. When the babies hatch, she feeds them milk.\n\nMale platypuses have a sharp spur on each back leg that can deliver venom. If you ever see one in the wild, watch quietly from a distance.`;
  const GARDEN = `Mia's grandma had the best vegetable patch on Wattle Street. Every Saturday, Mia helped her water the tomatoes and pull out weeds.\n\nOne morning, Mia noticed holes in the lettuce leaves. "Something has been eating our lunch," Grandma laughed. That night they crept outside with a torch. Sliding across a leaf was a fat, shiny snail.\n\n"What should we do?" Mia whispered. Grandma smiled. "We'll move him to the bush at the end of the street, and plant some marigolds. Snails don't like them."\n\nBy the next month the lettuce was crisp and green, and the marigolds glowed orange along the fence.`;
  const KOALA = `**Koalas**\n\n**What are they?** Koalas are marsupials. A baby koala, called a joey, grows in its mother's pouch for about six months.\n\n**Where do they live?** Koalas live in eucalyptus forests in eastern and south-eastern Australia.\n\n**What do they eat?** Koalas eat almost only eucalyptus leaves. The leaves are tough and have little energy, so koalas sleep up to 20 hours a day.\n\n**Threats** Koalas are threatened by land clearing, bushfires, dogs and cars. Planting eucalyptus trees helps them.`;

  /* ---------- English ---------- */
  LA.extendSubject('y3.english', [
    {
      id: 'word-study', term: 2, strand: 'Language', bridge: 'vocabulary',
      title: 'Word study and spelling patterns',
      summary: 'Prefixes and suffixes, synonyms and antonyms, alphabetical order and dictionary skills, syllables and compound words.',
      outcomes: ['Use prefixes and suffixes to change meaning', 'Choose synonyms and antonyms', 'Put words in alphabetical order to the second letter'],
      lessons: [
        {
          id: 'prefix-suffix', title: 'Prefixes and suffixes', minutes: 12,
          blocks: [
            { type: 'read', text: 'A **prefix** goes at the **start** of a word and changes its meaning:\n- **un**happy = not happy\n- **re**build = build again\n- **dis**agree = not agree\n\nA **suffix** goes at the **end**:\n- help**ful** = full of help\n- care**less** = without care\n- quick**ly** = in a quick way\n\nWatch the spelling: happy → happ**i**ness (y changes to i).' },
            { type: 'vocab', words: [['prefix', 'letters added to the start of a word', 'przedrostek'], ['suffix', 'letters added to the end of a word', 'przyrostek'], ['base word', 'the word you start with', 'rdzeń / wyraz podstawowy']] },
          ],
          practice: [gen('prefix', {}, 4), gen('suffix', {}, 4)],
        },
        {
          id: 'syn-ant', title: 'Synonyms and antonyms', minutes: 12,
          blocks: [{ type: 'read', text: '**Synonyms** mean the same or nearly the same: big → large, happy → glad.\n**Antonyms** mean the opposite: hot → cold, early → late.\n\nWriters use synonyms so they don’t repeat the same word: *The dog was big. It had large paws.*' }, { type: 'vocab', words: [['synonym', 'a word with the same meaning', 'synonim'], ['antonym', 'a word with the opposite meaning', 'antonim']] }],
          practice: [gen('synonym', {}, 4), gen('antonym', {}, 4)],
        },
        {
          id: 'alpha', title: 'Alphabetical order and dictionaries', minutes: 12,
          blocks: [{ type: 'read', text: 'Dictionaries list words in **alphabetical order**. If the first letters are the same, look at the **second** letter, then the third.\n\n*bat, bee, bird, boat, bus*\n\nThe two **guide words** at the top of a dictionary page show the first and last words on that page.' }, { type: 'tip', text: 'English has 26 letters; Polish has 32. In English “ch” is sorted as c + h, and there is no ł or ż.' }],
          practice: [gen('alphaOrder', {}, 5), mc('Which word would come between the guide words “cat” and “cow”?', ['cloud', 'apple', 'dog', 'zebra'], 0, 'c-l comes after c-a and before c-o.')],
        },
        {
          id: 'syllables', title: 'Syllables and compound words', minutes: 10,
          blocks: [{ type: 'read', text: 'Clap the **syllables** (beats): kan-ga-roo (3), but-ter-fly (3), dog (1).\n\nA **compound word** joins two words: sun + flower = **sunflower**, foot + ball = **football**.' }],
          practice: [gen('syllables', {}, 4), mc('Which is a compound word?', ['rainbow', 'rabbit', 'river', 'rocket'], 0, 'rain + bow.'), mc('Which two words make “toothbrush”?', ['tooth + brush', 'to + thbrush', 'tooth + rush'], 0, 'tooth + brush.', { fixed: true })],
        },
      ],
      quiz: { n: 10, items: [gen('prefix', {}, 2), gen('suffix', {}, 2), gen('synonym', {}, 2), gen('antonym', {}, 2), gen('alphaOrder', {}, 2)] },
      challenge: [star(inp('Add a prefix to “possible” to make it mean “not possible”.', ['impossible'], '“im-” means not before p, b and m: impossible, imbalance.')), star(mc('What does the suffix “-ology” mean in “biology”?', ['the study of', 'full of', 'not', 'again'], 0, 'Biology = the study of living things.'))],
    },
    {
      id: 'comprehension', term: 3, strand: 'Literacy', bridge: 'reading',
      title: 'Reading for meaning',
      summary: 'Finding information, main idea, inferring and using text features in information texts and stories.',
      outcomes: ['Find literal information', 'Infer what is not said directly', 'Identify the main idea of a paragraph'],
      lessons: [
        {
          id: 'platypus', title: 'Information text: the platypus', minutes: 15,
          blocks: [{ type: 'read', title: 'The Platypus', text: PLATYPUS }, { type: 'vocab', words: [['burrow', 'a hole an animal digs to live in', 'nora'], ['monotreme', 'a mammal that lays eggs', 'stekowiec'], ['venom', 'poison from an animal', 'jad']] }],
          practice: [
            mc('Where does the platypus live?', ['only in eastern Australia', 'all over the world', 'in the desert', 'in the ocean'], 0, '“it lives only in eastern Australia”.'),
            mc('How does a platypus find food underwater?', ['with its eyes', 'by sensing electrical signals with its bill', 'by smell', 'by listening'], 1, 'Its eyes, ears and nose are closed underwater.'),
            mc('What is a monotreme?', ['a mammal that lays eggs', 'a fish', 'a bird that cannot fly', 'a reptile'], 0, 'Stated in paragraph 3.'),
            tf('Platypus babies drink milk.', true, '“she feeds them milk.”'),
            mc('Why should you watch a platypus from a distance?', ['males have a venomous spur', 'they bite like sharks', 'they are very fast', 'they are invisible'], 0, 'Last paragraph.'),
          ],
        },
        {
          id: 'garden', title: 'Story: Grandma’s garden (inferring)', minutes: 15,
          blocks: [{ type: 'read', title: 'Grandma’s Garden', text: GARDEN }, { type: 'read', text: 'To **infer** is to work something out from clues — the author doesn’t say it directly. *They crept outside with a torch* → it was dark, and they didn’t want to scare the animal.' }],
          practice: [
            mc('What was making holes in the lettuce?', ['a snail', 'a possum', 'a bird', 'the wind'], 0, 'They found a snail on a leaf.'),
            mc('Why did they go outside at night?', ['snails come out at night', 'it was cooler for gardening', 'Grandma wanted to see the stars'], 0, 'Inference: the culprit was easier to find at night.'),
            mc('How would you describe Grandma?', ['kind and clever', 'angry and mean', 'lazy', 'scared'], 0, 'She laughs, moves the snail gently and finds a smart solution.'),
            mc('What does “glowed” tell you about the marigolds?', ['they were bright', 'they were electric', 'they were dying'], 0, 'Glowed = looked bright.', { fixed: true }),
          ],
        },
        {
          id: 'koala-report', title: 'Text features: headings and facts', minutes: 12,
          blocks: [{ type: 'read', title: 'Koalas', text: KOALA }, { type: 'read', text: '**Headings** tell you what each part is about, so you can find information quickly — you don’t always need to read from the top.' }],
          practice: [
            mc('Under which heading would you find what koalas eat?', ['What do they eat?', 'Threats', 'Where do they live?'], 0, 'The heading matches the question.', { fixed: true }),
            mc('Why do koalas sleep so much?', ['eucalyptus leaves give little energy', 'they are lazy', 'they are nocturnal hunters'], 0, 'Stated under “What do they eat?”.', { fixed: true }),
            num('About how many months does a joey grow in the pouch?', 6, 'About six months.'),
            mc('Which is NOT a threat to koalas?', ['planting eucalyptus trees', 'bushfires', 'land clearing', 'cars'], 0, 'Planting trees helps them.'),
          ],
        },
        {
          id: 'main-idea', title: 'Main idea and supporting details', minutes: 12,
          blocks: [{ type: 'read', text: 'The **main idea** is what a paragraph is mostly about. **Supporting details** tell you more.\n\n*Wombats are strong diggers. They have short, powerful legs and long claws. A wombat burrow can be 20 metres long.*\n\nMain idea: wombats are strong diggers. The other sentences are details that support it.' }],
          practice: [
            mc('Paragraph: “Bees are busy workers. They collect nectar, build honeycomb and look after the young.” Main idea?', ['bees are busy workers', 'bees build honeycomb', 'nectar is sweet'], 0, 'The other sentences give examples.', { fixed: true }),
            mc('Which sentence is a supporting detail for “Uluru is an important place”?', ['It is sacred to the Anangu people.', 'Sydney has a harbour.', 'I like camping.'], 0, 'It explains why Uluru is important.', { fixed: true }),
            write('Write a paragraph about your favourite animal: one main-idea sentence and three supporting details.', ['Main idea sentence', '3 supporting details', 'Capital letters and full stops'], 30, { homework: true }),
          ],
        },
      ],
      quiz: { n: 8, items: [
        mc('A platypus is a…', ['monotreme', 'reptile', 'fish'], 0, 'A mammal that lays eggs.', { fixed: true }),
        mc('To infer means to…', ['work something out from clues', 'copy the text', 'read the title only'], 0, 'Inferring uses clues.', { fixed: true }),
        mc('Headings help you…', ['find information quickly', 'spell words', 'count pages'], 0, 'They organise the text.', { fixed: true }),
        mc('The main idea is…', ['what a paragraph is mostly about', 'the last word', 'the title of the book'], 0, 'Main idea = mostly about.', { fixed: true }),
        mc('Koalas eat mostly…', ['eucalyptus leaves', 'grass', 'insects'], 0, 'Eucalyptus.', { fixed: true }),
      ] },
      challenge: [star(mc('Why might the author compare the platypus to a duck, a beaver and an otter?', ['to help readers picture an unusual animal using animals they know', 'because it is related to them', 'to make it funny only'], 0, 'Comparisons help readers imagine.', { fixed: true }))],
    },
    {
      id: 'grammar-review', term: 4, strand: 'Language', bridge: 'punctuation',
      title: 'Grammar and punctuation review',
      summary: 'Past tense, contractions, apostrophes of possession, sentence punctuation and word classes.',
      lessons: [
        { id: 'past', title: 'Past tense verbs', minutes: 10, blocks: [{ type: 'read', text: 'Most verbs add **-ed** for the past: jump → jumped. Some double the last letter: hop → hop**p**ed. Some change completely (irregular): go → **went**, see → **saw**, eat → **ate**.' }], practice: [gen('pastTense', {}, 6)] },
        { id: 'contractions', title: 'Contractions', minutes: 10, blocks: [{ type: 'read', text: 'A **contraction** joins two words; the **apostrophe** shows where letters are missing: do not → don’t, I am → I’m, it is → it’s.\n\nCareful: **it’s** = it is. **its** = belonging to it (no apostrophe!).' }], practice: [gen('contraction', {}, 5), mc('Choose the correct word: “The dog wagged ___ tail.”', ['its', 'it’s'], 0, '“its” shows belonging; “it’s” means “it is”.', { fixed: true })] },
        { id: 'possession', title: 'Apostrophes for belonging', minutes: 12, blocks: [{ type: 'read', text: 'To show something **belongs** to someone, add **’s**: the dog’s bone, Ava’s hat.\n\nPlural ending in s: add just the apostrophe: the birds’ nests (many birds).\n\nIrregular plurals: the children’s toys.' }], practice: [gen('apostrophe', {}, 5)] },
        { id: 'punct-classes', title: 'Punctuation and word classes', minutes: 12, blocks: [{ type: 'read', text: 'Every sentence starts with a capital letter and ends with **. ? or !**\n\nWord classes: **nouns** (things), **verbs** (actions), **adjectives** (describe nouns), **adverbs** (describe verbs).' }], practice: [gen('punctuate', {}, 3), gen('wordClass', {}, 4)] },
      ],
      quiz: { n: 10, items: [gen('pastTense', {}, 2), gen('contraction', {}, 2), gen('apostrophe', {}, 2), gen('punctuate', {}, 2), gen('wordClass', {}, 2)] },
      challenge: [star(mc('Which sentence is correct?', ['The girls’ team won.', 'The girl’s team won (many girls).', 'The girls team’s won.'], 0, 'Many girls → girls’.', { fixed: true }))],
    },
  ]);
  LA.addLessons('y3.english.informative', [
    { id: 'koalas-read', title: 'Reading an information report', minutes: 12,
      blocks: [{ type: 'read', title: 'Koalas', text: KOALA }, { type: 'read', text: 'An information report has: a **title**, an **opening** that says what it is about, **headings** with facts in paragraphs, and sometimes **pictures with captions**. It uses facts, not opinions, and present tense.' }],
      practice: [mc('Which is a fact?', ['Koalas eat eucalyptus leaves.', 'Koalas are the cutest animals.', 'I love koalas.'], 0, 'A fact can be checked.', { fixed: true }), mc('Information reports are usually written in…', ['present tense', 'future tense'], 0, '“Koalas eat…”, “Koalas live…”.', { fixed: true }), mc('What does a caption do?', ['explains a picture', 'ends the report', 'lists the author'], 0, 'Captions explain pictures.', { fixed: true })] },
  ], [mc('An information report uses mostly…', ['facts', 'opinions', 'rhymes'], 0, 'Facts.', { fixed: true }), mc('Headings in a report…', ['organise information into topics', 'are not needed'], 0, 'They group facts.', { fixed: true })]);

  /* ---------- Maths ---------- */
  LA.extendSubject('y3.maths', [
    {
      id: 'mental-strategies', term: 1, strand: 'Number', bridge: 'add-sub', order: 3,
      title: 'Mental strategies',
      summary: 'Bridging to 10 and 100, jump strategy, split strategy, near doubles, estimating and checking.',
      lessons: [
        { id: 'bridge10', title: 'Bridging through 10 and 100', minutes: 12, blocks: [{ type: 'read', text: '**8 + 5**: make 10 first → 8 + 2 = 10, then + 3 = **13**.\n**47 + 6**: 47 + 3 = 50, then + 3 = **53**.\n**96 + 7**: 96 + 4 = 100, then + 3 = **103**.' }, { type: 'vocab', words: [['strategy', 'a smart way to work it out', 'strategia / sposób'], ['estimate', 'a close guess', 'szacować']] }], practice: [gen('add', { digits: 2, regroup: true }, 4), gen('missing', { max: 100 }, 2)] },
        { id: 'jump-split', title: 'Jump and split strategies', minutes: 12, blocks: [{ type: 'read', text: '**Jump**: 56 + 32 → 56 + 30 = 86, + 2 = **88**.\n**Split**: 56 + 32 → 50 + 30 = 80 and 6 + 2 = 8 → **88**.\n**Subtract by jumping back**: 74 − 28 → 74 − 20 = 54, − 8 = **46**.' }], practice: [gen('add', { digits: 2 }, 3), gen('sub', { digits: 2, regroup: true }, 3)] },
        { id: 'estimate-check', title: 'Estimate and check', minutes: 10, blocks: [{ type: 'read', text: 'Round, then add: 389 + 412 ≈ 400 + 400 = **800**. The exact answer (801) should be close.\n\nCheck subtraction with addition: 63 − 27 = 36 because 36 + 27 = 63.' }], practice: [gen('estimate', {}, 3), gen('round', { to: 10, min: 10, max: 999 }, 2), gen('missing', { max: 200 }, 2)] },
      ],
      quiz: { n: 10, items: [gen('add', { digits: 2, regroup: true }, 3), gen('sub', { digits: 2, regroup: true }, 3), gen('estimate', {}, 2), gen('missing', { max: 100 }, 2)] },
      challenge: [star(num('Use a strategy: 199 + 245 = ?', 444, '200 + 245 = 445, minus 1 = 444.')), star(num('1000 − 365 = ?', 635, 'Count up: 365 → 400 (35) → 1000 (600). 635.'))],
    },
    {
      id: 'problem-solving', term: 3, strand: 'Number', bridge: 'word-problems', order: 9,
      title: 'Problem solving',
      summary: 'Choosing the operation, two-step problems, using diagrams and checking answers make sense.',
      lessons: [
        { id: 'which-op', title: 'Which operation?', minutes: 12, blocks: [{ type: 'read', text: 'Look for clues:\n- **altogether, total, sum** → add\n- **left, difference, how many more** → subtract\n- **groups of, each, rows** → multiply\n- **share equally, each gets** → divide\n\nThen ask: does my answer make sense?' }], practice: [gen('addWord', { max: 500 }, 2), gen('mulWord', {}, 2), gen('divWord', {}, 2)] },
        { id: 'two-step', title: 'Two-step problems', minutes: 15, blocks: [{ type: 'read', text: 'Some problems need **two steps**. Write each step.\n\n*Sam buys 3 packs of 6 stickers and gives away 5. How many are left?*\n1. 3 × 6 = 18\n2. 18 − 5 = **13**' }], practice: [gen('twoStep', {}, 4), gen('budget', {}, 1)] },
        { id: 'draw-it', title: 'Draw a diagram', minutes: 12, blocks: [{ type: 'read', text: 'A quick drawing — groups, a number line or a bar — makes a problem easier to see.\n\n*There are 4 tables with 5 children at each.* Draw 4 circles with 5 dots → 20 children.' }], practice: [gen('arrayMul', { maxR: 5, maxC: 6 }, 3), num('A fence has 6 posts in a row, 2 metres apart. How long is the fence?', 10, '6 posts make 5 gaps: 5 × 2 = 10 m.')] },
      ],
      quiz: { n: 8, items: [gen('twoStep', {}, 3), gen('mulWord', {}, 2), gen('divWord', {}, 2), gen('addWord', { max: 500 }, 1)] },
      challenge: [star(num('Ella saves $5 every week. How many weeks until she has $45?', 9, '45 ÷ 5 = 9.')), star(num('Three friends share 27 grapes equally and each eats 4. How many grapes does each friend have left?', 5, '27 ÷ 3 = 9, 9 − 4 = 5.'))],
    },
    {
      id: 'mass-capacity', term: 3, strand: 'Measurement', bridge: 'measurement', order: 8,
      title: 'Mass and capacity',
      summary: 'Grams and kilograms, millilitres and litres, choosing units and reading scales.',
      lessons: [
        { id: 'mass', title: 'Grams and kilograms', minutes: 12, blocks: [{ type: 'read', text: '**Mass** is how heavy something is. **1 kilogram (kg) = 1000 grams (g)**.\n\nA paperclip ≈ 1 g. A loaf of bread ≈ 700 g. A big bag of flour = 1 kg.' }, { type: 'vocab', words: [['mass', 'how heavy something is', 'masa'], ['capacity', 'how much a container holds', 'pojemność']] }], practice: [gen('convertLen', { kinds: ['kg-g'] }, 3), gen('chooseUnit', {}, 2), gen('readScale', {}, 1)] },
        { id: 'capacity', title: 'Millilitres and litres', minutes: 12, blocks: [{ type: 'read', text: '**1 litre (L) = 1000 millilitres (mL)**. A teaspoon ≈ 5 mL, a cup ≈ 250 mL, a milk carton = 1 L or 2 L.\n\nHalf a litre = **500 mL**.' }], practice: [gen('convertLen', { kinds: ['L-mL', 'half-L'] }, 4), mc('Which holds about 1 litre?', ['a milk carton', 'a teaspoon', 'a bathtub'], 0, 'A carton holds 1 L.')] },
        { id: 'scales', title: 'Reading scales', minutes: 10, blocks: [{ type: 'read', text: 'Before reading a scale, work out **what each mark is worth**. If the numbers go 0, 100, 200 and there are 4 gaps between labels, each small mark = 25.' }], practice: [gen('readScale', {}, 4)] },
      ],
      quiz: { n: 8, items: [gen('convertLen', { kinds: ['kg-g', 'L-mL'] }, 4), gen('chooseUnit', {}, 2), gen('readScale', {}, 2)] },
      challenge: [star(num('How many 250 mL cups can you fill from a 2 L bottle?', 8, '2 L = 2000 mL; 2000 ÷ 250 = 8.')), star(num('A bag of apples weighs 1 kg 300 g. How many grams is that?', 1300, '1000 + 300 = 1300 g.'))],
    },
    {
      id: 'year-review', term: 4, strand: 'Review', bridge: 'review', order: 20,
      title: 'Year 3 maths review',
      summary: 'Mixed revision of the whole year — the kind of questions in end-of-year and NAPLAN-style tests.',
      lessons: [
        { id: 'review-number', title: 'Number review', minutes: 15, blocks: [{ type: 'read', text: 'A mix of place value, addition, subtraction, multiplication and division. Show your thinking on paper or with Apple Pencil.' }], practice: [gen('placeValue', { min: 100, max: 9999 }, 2), gen('add', { digits: 3 }, 1), gen('sub', { digits: 3 }, 1), gen('mulFact', { tables: [2, 3, 4, 5, 10] }, 2), gen('divFact', { tables: [2, 3, 4, 5, 10] }, 2)] },
        { id: 'review-fractions-money', title: 'Fractions, money and time review', minutes: 15, blocks: [{ type: 'read', text: 'Fractions of shapes and groups, money totals and change, and telling time.' }], practice: [gen('unitFraction', { dens: [2, 3, 4, 5, 6] }, 2), gen('fractionOf', { dens: [2, 3, 4, 5] }, 1), gen('moneyTotal', {}, 1), gen('moneyChange', {}, 1), gen('readClock', { step: 1 }, 2), gen('duration', {}, 1)] },
        { id: 'review-space-data', title: 'Shapes, location and data review', minutes: 15, blocks: [{ type: 'read', text: 'Shapes and angles, maps and directions, graphs and chance.' }], practice: [gen('shape2d', {}, 2), gen('angleCompare', {}, 1), gen('gridMap', {}, 1), gen('readGraph', {}, 2), gen('chance', {}, 2)] },
      ],
      quiz: { n: 12, items: [gen('placeValue', { min: 100, max: 9999 }, 2), gen('mulFact', {}, 2), gen('fractionOf', {}, 2), gen('moneyChange', {}, 2), gen('readClock', { step: 1 }, 2), gen('readGraph', {}, 2)] },
      challenge: [star(gen('twoStep', {}, 2)), star(gen('mulFact10', {}, 2))],
    },
  ]);

  /* ---------- Science ---------- */
  LA.extendSubject('y3.science', [
    {
      id: 'earth-sky', term: 2, strand: 'Earth and space sciences', bridge: 'earth-sky',
      title: 'Earth, Sun and Moon',
      summary: 'Day and night from Earth’s rotation, the Sun as a star, shadows through the day, and the phases of the Moon.',
      lessons: [
        { id: 'day-night', title: 'Why we have day and night', minutes: 12, blocks: [{ type: 'read', text: 'Earth **spins** (rotates) on its axis once every **24 hours**. The side facing the Sun has **day**; the side facing away has **night**.\n\nThe Sun seems to move across the sky — rising in the **east** and setting in the **west** — but really it is Earth turning.' }, { type: 'activity', text: 'Use a torch as the Sun and a ball as Earth. Put a sticker on the ball (that’s you!) and slowly spin it. When is it day for the sticker?' }, { type: 'vocab', words: [['rotate', 'spin around', 'obracać się'], ['axis', 'an imaginary line Earth spins around', 'oś'], ['orbit', 'the path around the Sun', 'orbita']] }], practice: [mc('What causes day and night?', ['Earth spinning on its axis', 'the Sun going around Earth', 'clouds covering the Sun'], 0, 'Earth rotates every 24 hours.', { fixed: true }), num('How many hours does Earth take to spin once?', 24, '24 hours = 1 day.'), mc('Where does the Sun rise?', ['east', 'west', 'north'], 0, 'East.', { fixed: true }), tf('When it is midday in Sydney, it is the middle of the night or very early morning in Poland.', true, 'Poland is 8–10 hours behind Sydney, so 12 noon in Sydney is about 2–4 am in Poland.')] },
        { id: 'sun-shadows', title: 'The Sun and shadows', minutes: 12, blocks: [{ type: 'read', text: 'The **Sun is a star** — a giant ball of hot gas. It gives us light and heat.\n\n**Shadows** form when an object blocks light. In the morning and afternoon, shadows are **long**; at midday they are **shortest**.\n\nNever look straight at the Sun — it damages your eyes.' }], practice: [mc('When is your shadow shortest?', ['around midday', 'early morning', 'late afternoon'], 0, 'The Sun is highest at midday.', { fixed: true }), mc('The Sun is a…', ['star', 'planet', 'moon'], 0, 'A star.', { fixed: true }), mc('A shadow forms when…', ['an object blocks light', 'it rains', 'the Moon is full'], 0, 'Light cannot pass through.', { fixed: true })] },
        { id: 'moon', title: 'The Moon', minutes: 12, blocks: [{ type: 'read', text: 'The Moon **orbits Earth** about every **29½ days**. It doesn’t make its own light — it **reflects** sunlight.\n\nAs it orbits, we see different amounts of its lit side: **new moon → crescent → first quarter → full moon → last quarter**, and back again. These are **phases**.' }], practice: [mc('Where does moonlight come from?', ['reflected sunlight', 'the Moon is on fire', 'electric lights'], 0, 'The Moon reflects the Sun’s light.', { fixed: true }), mc('About how long is one cycle of Moon phases?', ['about a month', 'one day', 'one year'], 0, 'About 29½ days.', { fixed: true }), mc('When we see the whole lit side of the Moon, it is a…', ['full moon', 'new moon', 'crescent'], 0, 'Full moon.', { fixed: true })] },
      ],
      quiz: { n: 8, items: [mc('Earth spins once every…', ['24 hours', '7 days', '365 days'], 0, '24 hours.', { fixed: true }), mc('The Sun sets in the…', ['west', 'east'], 0, 'West.', { fixed: true }), mc('The Moon orbits…', ['Earth', 'the Sun only', 'Mars'], 0, 'Earth.', { fixed: true }), mc('Long shadows happen…', ['in the morning and late afternoon', 'at midday'], 0, 'When the Sun is low.', { fixed: true })] },
      challenge: [star(mc('How long does Earth take to orbit the Sun?', ['about 365 days', '24 hours', '29 days'], 0, 'One year ≈ 365¼ days.', { fixed: true })), star(mc('Why is it summer in Australia when it is winter in Poland?', ['Earth is tilted, so the Southern and Northern Hemispheres get more direct sunlight at different times of the year', 'Australia is closer to the Moon', 'Poland has more clouds'], 0, 'Earth’s tilt causes the seasons.', { fixed: true }))],
    },
    {
      id: 'animal-groups', term: 1, strand: 'Biological sciences', bridge: 'living',
      title: 'Grouping living things',
      summary: 'Sorting living things by observable features: vertebrates and invertebrates, the five vertebrate groups, using a simple key.',
      lessons: [
        { id: 'vertebrates', title: 'Vertebrates and invertebrates', minutes: 12, blocks: [{ type: 'read', text: '**Vertebrates** have a **backbone**: mammals, birds, fish, reptiles, amphibians.\n**Invertebrates** have **no backbone**: insects, spiders, worms, snails, jellyfish.\n\nMost animals on Earth are invertebrates!' }, { type: 'vocab', words: [['vertebrate', 'an animal with a backbone', 'kręgowiec'], ['invertebrate', 'an animal without a backbone', 'bezkręgowiec']] }], practice: [mc('Which is an invertebrate?', ['spider', 'kangaroo', 'magpie', 'shark'], 0, 'Spiders have no backbone.'), mc('Which is a vertebrate?', ['frog', 'worm', 'snail', 'ant'], 0, 'Frogs have a backbone.'), tf('Insects have a backbone.', false, 'Insects are invertebrates.')] },
        { id: 'five-groups', title: 'The five vertebrate groups', minutes: 15, blocks: [{ type: 'read', text: '- **Mammals**: fur or hair, feed babies milk (kangaroo, human, whale)\n- **Birds**: feathers, beaks, lay eggs (emu, kookaburra)\n- **Fish**: scales, gills, live in water (barramundi)\n- **Reptiles**: dry scaly skin (goanna, crocodile, snake)\n- **Amphibians**: moist skin, live in water then on land (frogs)' }], practice: [mc('An emu is a…', ['bird', 'mammal', 'reptile'], 0, 'Feathers and eggs.', { fixed: true }), mc('A goanna is a…', ['reptile', 'amphibian', 'mammal'], 0, 'Dry, scaly skin.', { fixed: true }), mc('A whale is a…', ['mammal', 'fish'], 0, 'It breathes air and feeds its babies milk.', { fixed: true }), mc('What do fish use to breathe?', ['gills', 'lungs only', 'feathers'], 0, 'Gills.', { fixed: true })] },
        { id: 'keys', title: 'Using a key', minutes: 12, blocks: [{ type: 'read', text: 'A **key** sorts living things with yes/no questions:\n1. Does it have a backbone? Yes → go to 2. No → invertebrate.\n2. Does it have feathers? Yes → bird. No → go to 3.\n3. Does it have fur? Yes → mammal…' }], practice: [mc('Key: backbone? yes. Feathers? no. Fur? yes. What group?', ['mammal', 'bird', 'reptile'], 0, 'Fur → mammal.', { fixed: true }), mc('Key: backbone? no. Six legs? yes. What is it?', ['an insect', 'a spider', 'a fish'], 0, 'Six legs and no backbone → insect.', { fixed: true }), write('Make your own 3-question key to sort: koala, kookaburra, crocodile, beetle.', ['3 yes/no questions', 'Each animal ends in its own box'], 15)] },
      ],
      quiz: { n: 8, items: [mc('Animals without a backbone are…', ['invertebrates', 'vertebrates'], 0, 'Invertebrates.', { fixed: true }), mc('A frog is an…', ['amphibian', 'reptile'], 0, 'Moist skin, water then land.', { fixed: true }), mc('Mammals feed their babies…', ['milk', 'seeds', 'insects'], 0, 'Milk.', { fixed: true }), mc('Which has feathers?', ['kookaburra', 'koala', 'goanna'], 0, 'Birds have feathers.', { fixed: true })] },
      challenge: [star(mc('A platypus lays eggs but has fur and feeds its babies milk. Which group is it in?', ['mammal (a monotreme)', 'bird', 'reptile'], 0, 'Fur and milk make it a mammal.', { fixed: true })), star(mc('Is a spider an insect?', ['No — spiders have 8 legs and 2 body parts', 'Yes'], 0, 'Insects have 6 legs and 3 body parts.', { fixed: true }))],
    },
  ]);

  /* ---------- HASS ---------- */
  LA.extendSubject('y3.hass', [
    {
      id: 'country-place', term: 1, strand: 'History', bridge: 'first-nations',
      title: 'Country and Place',
      summary: 'Aboriginal and Torres Strait Islander Peoples’ connection to Country/Place, Acknowledgement of Country and Welcome to Country, and important places in the local area.',
      lessons: [
        { id: 'country', title: 'Connection to Country', minutes: 12, blocks: [{ type: 'read', text: 'Aboriginal and Torres Strait Islander Peoples have lived in Australia for **more than 60 000 years** — the oldest continuing cultures in the world.\n\n**Country** means much more than land: it includes the land, waters, sky, plants, animals, stories and people. There are **hundreds of different Nations**, each with its own languages and Country.\n\nTorres Strait Islander Peoples often speak of **Place**, including the sea and islands between Cape York and Papua New Guinea.' }, { type: 'vocab', words: [['Country', 'land, waters and sky that a First Nations group belongs to and cares for', 'Kraj / ziemia przodków (w kulturze Aborygenów)'], ['Elder', 'a respected older person who holds knowledge', 'starszy (szanowany członek społeczności)']] }], practice: [mc('For how long have Aboriginal and Torres Strait Islander Peoples lived in Australia?', ['more than 60 000 years', 'about 200 years', 'about 1000 years'], 0, 'More than 60 000 years.', { fixed: true }), mc('“Country” includes…', ['land, waters, sky, animals, stories and people', 'only cities', 'only houses'], 0, 'Country is all of these.', { fixed: true }), tf('There is only one Aboriginal language.', false, 'There were more than 250 languages.')] },
        { id: 'acknowledgement', title: 'Welcome and Acknowledgement of Country', minutes: 10, blocks: [{ type: 'read', text: 'A **Welcome to Country** is given by an **Elder of the Traditional Owners** — welcoming visitors to their Country.\n\nAn **Acknowledgement of Country** can be given by **anyone** to show respect: *“We acknowledge the Traditional Custodians of the land on which we meet, and pay our respects to Elders past and present.”*' }], practice: [mc('Who can give a Welcome to Country?', ['an Elder of the Traditional Owners', 'anyone', 'only the Prime Minister'], 0, 'Only Traditional Owners welcome people to their Country.', { fixed: true }), mc('An Acknowledgement of Country shows…', ['respect for the Traditional Custodians', 'who won a game', 'the weather'], 0, 'Respect.', { fixed: true })] },
        { id: 'local-places', title: 'Important places nearby', minutes: 12, blocks: [{ type: 'read', text: 'Places can be important for different reasons: **sacred sites** (e.g. Uluru for the Anangu), **memorials** (war memorials), **natural places** (rivers, beaches), **community places** (parks, libraries).\n\nWe look after important places so future generations can enjoy them too.' }], practice: [mc('Uluru is sacred to the…', ['Anangu people', 'people of Sydney only', 'Romans'], 0, 'Anangu are the Traditional Owners.', { fixed: true }), write('Choose an important place near you. Describe it and explain why it matters and how we can look after it.', ['Name and description', 'Why it is important', 'How to care for it'], 30, { homework: true })] },
      ],
      quiz: { n: 6, items: [mc('Welcome to Country is given by…', ['an Elder of the Traditional Owners', 'any visitor'], 0, 'Traditional Owners.', { fixed: true }), mc('Aboriginal cultures are…', ['the oldest continuing cultures in the world', 'about 100 years old'], 0, 'Over 60 000 years.', { fixed: true }), mc('Torres Strait Islanders live on islands between Cape York and…', ['Papua New Guinea', 'New Zealand'], 0, 'PNG.', { fixed: true })] },
      challenge: [star(mc('Why do many schools begin assemblies with an Acknowledgement of Country?', ['to show respect for the Traditional Custodians of the land', 'because it is a song', 'to start the holidays'], 0, 'It recognises the continuing connection to Country.', { fixed: true }))],
    },
    {
      id: 'states-capitals', term: 2, strand: 'Geography', bridge: 'maps-geo',
      title: 'States, territories and capital cities',
      summary: 'Australia’s six states and two mainland territories, their capital cities, and Canberra as the national capital.',
      lessons: [
        { id: 'states', title: 'States and territories', minutes: 12, blocks: [{ type: 'read', text: 'Australia has **six states**: New South Wales (NSW), Victoria (VIC), Queensland (QLD), Western Australia (WA), South Australia (SA) and Tasmania (TAS).\n\nIt also has **two mainland territories**: the Northern Territory (NT) and the Australian Capital Territory (ACT).\n\nThe largest state is **Western Australia**; the smallest is **Tasmania** (an island).' }], practice: [num('How many states does Australia have?', 6, 'Six.'), mc('Which is a territory?', ['Northern Territory', 'Victoria', 'Queensland'], 0, 'NT is a territory.', { fixed: true }), mc('The largest state is…', ['Western Australia', 'Tasmania', 'Victoria'], 0, 'WA.', { fixed: true }), mc('Which state is an island?', ['Tasmania', 'New South Wales', 'South Australia'], 0, 'Tasmania.', { fixed: true })] },
        { id: 'capitals', title: 'Capital cities', minutes: 12, blocks: [{ type: 'read', text: '- NSW → **Sydney**\n- VIC → **Melbourne**\n- QLD → **Brisbane**\n- WA → **Perth**\n- SA → **Adelaide**\n- TAS → **Hobart**\n- NT → **Darwin**\n- ACT → **Canberra** — the **national capital**, where Parliament House is.' }], practice: [mc('What is the capital of Queensland?', ['Brisbane', 'Cairns', 'Sydney'], 0, 'Brisbane.', { fixed: true }), mc('What is the capital of Western Australia?', ['Perth', 'Darwin', 'Adelaide'], 0, 'Perth.', { fixed: true }), mc('Australia’s national capital is…', ['Canberra', 'Sydney', 'Melbourne'], 0, 'Canberra.', { fixed: true }), mc('Darwin is the capital of…', ['Northern Territory', 'Tasmania', 'Victoria'], 0, 'NT.', { fixed: true })] },
        { id: 'symbols', title: 'National symbols', minutes: 10, blocks: [{ type: 'read', text: 'Australian symbols: the **Australian flag**, the **Aboriginal flag** and the **Torres Strait Islander flag**; the **coat of arms** (kangaroo and emu — animals that can’t easily walk backwards, a sign of moving forward); the national flower, **golden wattle**; national colours **green and gold**; the anthem **“Advance Australia Fair”**.' }, { type: 'tip', text: 'Compare with Poland: the white eagle, the white-and-red flag and the anthem “Mazurek Dąbrowskiego”.' }], practice: [mc('Which animals are on the coat of arms?', ['kangaroo and emu', 'koala and wombat', 'eagle and lion'], 0, 'Kangaroo and emu.', { fixed: true }), mc('Australia’s national flower is…', ['golden wattle', 'rose', 'waratah'], 0, 'Golden wattle.', { fixed: true }), mc('Australia’s national colours are…', ['green and gold', 'red and white', 'blue and yellow'], 0, 'Green and gold.', { fixed: true })] },
      ],
      quiz: { n: 8, items: [mc('The capital of Victoria is…', ['Melbourne', 'Geelong'], 0, 'Melbourne.', { fixed: true }), mc('The capital of South Australia is…', ['Adelaide', 'Perth'], 0, 'Adelaide.', { fixed: true }), mc('Hobart is in…', ['Tasmania', 'NSW'], 0, 'Tasmania.', { fixed: true }), mc('Parliament House is in…', ['Canberra', 'Sydney'], 0, 'Canberra.', { fixed: true })] },
      challenge: [star(mc('Which is the only state capital on an island?', ['Hobart', 'Darwin', 'Perth'], 0, 'Hobart, Tasmania.', { fixed: true })), star(mc('Why was Canberra chosen as the capital?', ['as a compromise between Sydney and Melbourne', 'because it is the biggest city', 'because it is by the sea'], 0, 'Both cities wanted to be the capital.', { fixed: true }))],
    },
  ]);

  /* ---------- top-ups for short chapters ---------- */
  LA.addLessons('y3.tech.data', [
    { id: 'collect', title: 'Collecting and showing data', minutes: 12, blocks: [{ type: 'read', text: 'We collect data with **surveys** and record it with **tally marks** (||||  = 5). Then we show it in a **table** or a **column graph**, so patterns are easy to see.' }], practice: [gen('tally', {}, 3), gen('readGraph', {}, 3)] },
  ], [gen('tally', {}, 2), gen('readGraph', {}, 2)]);
  LA.addLessons('y3.arts.media', [
    { id: 'storyboard', title: 'Plan with a storyboard', minutes: 12, blocks: [{ type: 'read', text: 'A **storyboard** is a row of boxes showing each shot of a film or animation, with notes about sound and words. Shots: **close-up** (feelings), **mid shot** (action), **long shot** (where we are).' }], practice: [mc('Which shot shows a character’s feelings best?', ['close-up', 'long shot'], 0, 'Close-ups show faces.', { fixed: true }), mc('A storyboard is…', ['a plan of shots in boxes', 'a type of camera'], 0, 'A plan.', { fixed: true }), write('Draw or describe a 4-box storyboard for a 30-second ad about saving water.', ['4 shots', 'Shot type for each', 'Sound or words'], 20)] },
  ], [mc('A long shot shows…', ['where the scene is', 'only the eyes'], 0, 'The whole setting.', { fixed: true }), mc('Media arts includes…', ['films, animation and podcasts', 'only painting'], 0, 'Media = screens and sound.', { fixed: true })]);
})();
