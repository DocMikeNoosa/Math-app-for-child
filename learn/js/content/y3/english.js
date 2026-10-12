/* Year 3 English — Australian Curriculum v9.0 strands: Language, Literature, Literacy */
(function () {
  const { mc, tf, inp, gen, write } = LA.Q;

  const STORY_KOOKA = `## The Kookaburra Who Lost His Laugh
Every morning, Kip the kookaburra woke the whole gully with his laugh. "Koo-koo-koo-kaa-kaa-kaa!" The wallabies stretched, the possums yawned, and the sun peeped over the gum trees.

But one Tuesday, Kip opened his beak and nothing came out. Not a chuckle. Not even a giggle. The gully stayed dark and sleepy.

"What will we do?" whispered Wren, a tiny blue fairy-wren. "Without Kip, nobody will wake up!"

Kip felt worried. He flew to the creek and drank some cool water. He tried again. Only a small squeak came out.

Then Wren had an idea. She told Kip the silliest joke she knew: "Why did the koala get the job? Because he was *koala-fied*!"

Kip's eyes twinkled. His feathers shook. And then — "KOO-KOO-KOO-KAA-KAA-KAA!" — the biggest laugh the gully had ever heard rang out across the trees.

From that day on, Wren told Kip a new joke every morning, just to be sure.`;

  const INFO_PLATYPUS = `## The Platypus
The platypus is one of Australia's most unusual animals. It lives in creeks and rivers in eastern Australia, including Tasmania.

**Body:** A platypus has a flat bill like a duck, a wide tail like a beaver and webbed feet for swimming. Its thick brown fur keeps it warm and dry in cold water.

**Food:** Platypuses hunt at night and at dawn and dusk. They dive to the bottom of the river and find worms, shrimps and insect larvae. They close their eyes and ears underwater and use their bill to sense movement.

**Babies:** The platypus is a **monotreme** — a mammal that lays eggs. The mother lays one to three eggs in a burrow. When the babies hatch, she feeds them milk.

**Did you know?** The male platypus has a sharp spur on each back leg that can deliver venom.`;

  const LISTEN_SCHOOL = `Good morning, Year 3. Here are today's notices. Tomorrow is our class excursion to the museum. Please bring a packed lunch, a water bottle and a hat. The bus leaves at nine o'clock sharp, so be at school by half past eight. We will see the dinosaur skeletons first, and then the First Nations gallery after lunch. Remember to wear your school uniform and comfortable shoes. If it rains, bring a raincoat. We will be back at school by three o'clock.`;

  LA.addSubject(3, {
    id: 'english',
    intro: 'Reading, writing, spelling, grammar, punctuation, listening and speaking — with stories, information texts, persuasive writing and poetry.',
    chapters: [
      {
        id: 'sentences', term: 1, strand: 'Language',
        title: 'Sentences and punctuation',
        summary: 'Write complete sentences with capital letters, full stops, question marks, exclamation marks and commas in lists.',
        outcomes: ['Know what makes a complete sentence', 'Use capital letters and end punctuation', 'Join ideas with and, but, so', 'Use commas in a list'],
        lessons: [
          {
            id: 'what-is-sentence', title: 'What is a sentence?', minutes: 10,
            blocks: [
              { type: 'read', text: `A **sentence** is a group of words that makes **complete sense** on its own.\n\nEvery sentence:\n- starts with a **capital letter**\n- has a **verb** (a doing or being word)\n- ends with a **full stop (.)**, **question mark (?)** or **exclamation mark (!)**\n\n✅ The dog ran to the beach.\n❌ ran to the beach (Who ran? It doesn't make complete sense.)` },
              { type: 'example', title: 'Three kinds of sentences', text: '- **Statement** (tells): We went to the park.\n- **Question** (asks): Did you go to the park?\n- **Exclamation** (strong feeling): What a huge park!\n- **Command** (tells someone to do something): Go to the park.' },
            ],
            practice: [
              mc('Which one is a complete sentence?', ['The koala climbed the tree.', 'climbed the tall tree', 'The koala in the tree', 'up the tree quickly'], 0, 'It starts with a capital letter, has a subject (the koala) and a verb (climbed), and ends with a full stop.'),
              mc('Which punctuation mark goes at the end? "Where is my hat"', ['?', '.', '!', ','], 0, 'It is asking something, so it needs a question mark.'),
              mc('Which punctuation mark goes at the end? "Watch out for that snake"', ['!', '?', ',', ':'], 0, 'It shows a strong feeling or warning, so use an exclamation mark.'),
              mc('What kind of sentence is: "Please close the door."', ['Command', 'Question', 'Exclamation', 'Not a sentence'], 0, 'It tells someone to do something — a command.'),
              tf('"my sister likes swimming." is punctuated correctly.', false, 'A sentence must start with a capital letter: "My sister likes swimming."'),
            ],
          },
          {
            id: 'capitals', title: 'Capital letters', minutes: 10,
            blocks: [
              { type: 'read', text: `Use a **capital letter** for:\n- the **first word** of a sentence\n- the word **I**\n- **names of people and pets**: Ava, Mr Chen, Rex\n- **names of places**: Sydney, Uluru, Murray River, Australia\n- **days and months**: Monday, March\n- **special days**: Christmas, Anzac Day, NAIDOC Week\n- **titles** of books and films` },
            ],
            practice: [
              mc('Which word needs a capital letter? "we visited perth in july."', ['we, perth and july', 'only we', 'visited and in', 'only perth'], 0, '"We" starts the sentence, Perth is a place and July is a month.'),
              mc('Which sentence is correct?', ['On Saturday, Jack and I went to Bondi Beach.', 'On saturday, jack and i went to bondi beach.', 'on Saturday, Jack and I went to Bondi beach.', 'On Saturday, Jack and i went to Bondi Beach.'], 0, 'Saturday, Jack, I, Bondi Beach all need capitals, and so does the first word.'),
              tf('Days of the week always start with a capital letter.', true, 'Monday, Tuesday, Wednesday… are proper nouns, so they get capitals.'),
              inp('Rewrite with capitals: "i live in brisbane."', ['I live in Brisbane.', 'I live in Brisbane'], 'The first word and the word I need a capital. Brisbane is a place name.'),
            ],
          },
          {
            id: 'compound', title: 'Joining sentences: and, but, so', minutes: 12,
            blocks: [
              { type: 'read', text: `A **simple sentence** has one idea: *I was hungry.*\n\nA **compound sentence** joins two ideas that are equally important with a joining word (conjunction):\n- **and** — adds more: I was hungry **and** I was tired.\n- **but** — shows a difference: I was hungry **but** there was no food.\n- **so** — shows a result: I was hungry **so** I made a sandwich.\n- **or** — gives a choice: We can walk **or** we can ride.` },
            ],
            practice: [
              mc('Choose the best joining word: "It was raining ___ we took an umbrella."', ['so', 'but', 'or', 'and'], 0, 'Taking an umbrella is the result of the rain, so we use "so".'),
              mc('Choose the best joining word: "I like apples ___ I don\'t like pears."', ['but', 'so', 'or', 'because'], 0, '"But" shows a difference between two ideas.'),
              mc('Choose the best joining word: "Would you like juice ___ water?"', ['or', 'so', 'but', 'and'], 0, '"Or" gives a choice.'),
              mc('Which is a compound sentence?', ['Mia kicked the ball and it flew over the fence.', 'Mia kicked the ball.', 'The red ball.', 'Kicked the ball hard.'], 0, 'It joins two complete ideas with "and".'),
            ],
          },
          {
            id: 'commas', title: 'Commas in lists', minutes: 10,
            blocks: [
              { type: 'read', text: `When we list three or more things, we put **commas** between them and use **and** (or **or**) before the last one.\n\n*At the zoo we saw kangaroos, koalas, wombats and emus.*\n\nWe don't usually put a comma before "and" in a simple list.` },
            ],
            practice: [
              mc('Which sentence uses commas correctly?', ['I packed a hat, sunscreen, a towel and goggles.', 'I packed a hat sunscreen, a towel, and, goggles.', 'I packed, a hat, sunscreen a towel and goggles.', 'I packed a hat sunscreen a towel and goggles.'], 0, 'Commas separate the items, with "and" before the last item.'),
              mc('How many commas are needed? "We need eggs flour milk and sugar."', ['2', '1', '3', '4'], 0, 'eggs, flour, milk and sugar — two commas.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'nouns-adjectives', term: 1, strand: 'Language',
        title: 'Nouns, adjectives and noun groups',
        summary: 'Common and proper nouns, adjectives that describe, and building interesting noun groups.',
        lessons: [
          {
            id: 'nouns', title: 'Common and proper nouns', minutes: 10,
            blocks: [
              { type: 'read', text: `A **noun** names a person, place, animal or thing.\n- **Common nouns** are general: girl, city, dog, river\n- **Proper nouns** are special names and start with a capital: Zara, Melbourne, Rex, Murray River\n- **Collective nouns** name a group: a **mob** of kangaroos, a **flock** of birds, a **school** of fish` },
            ],
            practice: [
              mc('Which word is a proper noun?', ['Canberra', 'city', 'building', 'street'], 0, 'Canberra is the special name of a place, so it is a proper noun.'),
              mc('Which word is a noun? "The happy dog barked loudly."', ['dog', 'happy', 'barked', 'loudly'], 0, '"Dog" names an animal.'),
              mc('What is a group of kangaroos called?', ['a mob', 'a flock', 'a herd', 'a school'], 0, 'A group of kangaroos is called a mob.'),
              gen('plural', {}, 2),
            ],
          },
          {
            id: 'adjectives', title: 'Adjectives', minutes: 10,
            blocks: [
              { type: 'read', text: `An **adjective** describes a noun. It tells us **what kind**, **how many** or **which one**.\n\n*the **tall**, **spotted** giraffe* · ***three** **noisy** cockatoos*\n\nAdjectives can compare:\n- big → bigger → biggest\n- good → better → best\n- beautiful → more beautiful → most beautiful` },
            ],
            practice: [
              mc('Find the adjective: "The sleepy wombat crawled into its burrow."', ['sleepy', 'wombat', 'crawled', 'burrow'], 0, '"Sleepy" describes the wombat.'),
              mc('Which is correct? "This is the ___ day of the year!"', ['hottest', 'hotter', 'hot', 'most hot'], 0, 'Comparing more than two things uses -est: hottest.'),
              mc('Which is correct? "My bike is ___ than yours."', ['faster', 'fastest', 'more fast', 'fast'], 0, 'Comparing two things uses -er: faster.'),
              gen('suffix', {}, 2),
            ],
          },
          {
            id: 'noun-groups', title: 'Noun groups', minutes: 10,
            blocks: [
              { type: 'read', text: `A **noun group** is a noun plus the words that tell us more about it.\n\n*dog* → *the dog* → *the big dog* → *the big, fluffy dog with a red collar*\n\nGood writers build noun groups to help readers picture things.` },
            ],
            practice: [
              mc('Which noun group gives the most detail?', ['the old, rusty bike with a flat tyre', 'the bike', 'a bike', 'bike'], 0, 'It tells us more about the bike: old, rusty and with a flat tyre.'),
              mc('What is the main noun in "a shiny red apple"?', ['apple', 'shiny', 'red', 'a'], 0, 'The other words describe the apple.'),
              write('Write two sentences about your favourite animal. Use at least one noun group with two adjectives (e.g. "the soft, grey koala").', ['Two complete sentences', 'Capital letters and full stops', 'A noun group with two adjectives'], 15),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'verbs-adverbs', term: 1, strand: 'Language',
        title: 'Verbs, tense and adverbs',
        summary: 'Doing, saying and being verbs, past/present/future tense, and adverbs that tell how, when and where.',
        lessons: [
          {
            id: 'verbs', title: 'Verbs', minutes: 10,
            blocks: [
              { type: 'read', text: `A **verb** is a doing, saying, thinking or being word. Every sentence needs one!\n- **Doing:** run, jump, swim, eat\n- **Saying:** said, shouted, whispered, asked\n- **Thinking/feeling:** think, know, love, wonder\n- **Being/having:** am, is, are, was, were, has, have` },
            ],
            practice: [
              mc('Find the verb: "The emu ran across the paddock."', ['ran', 'emu', 'across', 'paddock'], 0, '"Ran" is the action.'),
              mc('Which is a saying verb?', ['whispered', 'jumped', 'happy', 'table'], 0, '"Whispered" is a way of saying something.'),
              mc('Which verb is better than "said" for someone who is angry?', ['shouted', 'whispered', 'giggled', 'asked'], 0, '"Shouted" shows anger more clearly.'),
            ],
          },
          {
            id: 'tense', title: 'Past, present and future', minutes: 12,
            blocks: [
              { type: 'read', text: `**Tense** tells us **when** something happens.\n- **Past** (already happened): I **walked** to school. I **ran**.\n- **Present** (happening now): I **walk** to school. I **am running**.\n- **Future** (will happen): I **will walk** to school.\n\nMost verbs add **-ed** for the past, but some are **irregular**: go → went, see → saw, eat → ate.` },
            ],
            practice: [gen('pastTense', {}, 4), mc('Which sentence is in the future tense?', ['We will go to the beach tomorrow.', 'We went to the beach.', 'We are at the beach.', 'We go to the beach.'], 0, '"Will go" tells us it hasn\'t happened yet.')],
          },
          {
            id: 'adverbs', title: 'Adverbs', minutes: 10,
            blocks: [
              { type: 'read', text: `An **adverb** tells us more about a verb.\n- **How?** quickly, slowly, carefully, loudly\n- **When?** yesterday, soon, now, later\n- **Where?** here, outside, everywhere, upstairs\n\nMany "how" adverbs end in **-ly**: quick → quickly, happy → happily.` },
            ],
            practice: [
              mc('Find the adverb: "The turtle swam slowly to the shore."', ['slowly', 'turtle', 'swam', 'shore'], 0, '"Slowly" tells us how it swam.'),
              mc('What does the adverb tell us? "We will go to the park tomorrow."', ['when', 'how', 'where', 'who'], 0, '"Tomorrow" tells us when.'),
              inp('Change the adjective into an adverb: happy → ?', ['happily'], 'Change the y to i and add -ly: happily.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'spelling', term: 2, strand: 'Language',
        title: 'Spelling patterns',
        summary: 'Syllables, plurals, prefixes and suffixes, homophones and contractions.',
        lessons: [
          {
            id: 'syllables', title: 'Syllables and sounding out', minutes: 10,
            blocks: [
              { type: 'read', text: `Breaking long words into **syllables** (beats) makes them easier to spell.\n\n*kan-ga-roo* (3) · *um-brel-la* (3) · *hel-i-cop-ter* (4)\n\nEvery syllable has a **vowel sound** (a, e, i, o, u, and sometimes y).\n\n> Clap the beats, then spell one syllable at a time.` },
            ],
            practice: [gen('syllables', {}, 4)],
          },
          {
            id: 'prefix-suffix', title: 'Prefixes and suffixes', minutes: 12,
            blocks: [
              { type: 'read', text: `A **prefix** goes at the **start** of a word and changes its meaning:\n- **un-** (not): unhappy · **re-** (again): replay · **dis-** (not): dislike · **pre-** (before): preview · **mis-** (wrongly): misspell\n\nA **suffix** goes at the **end**:\n- **-ful** (full of): helpful · **-less** (without): careless · **-ly** (in a way): quickly · **-ness**: kindness · **-er / -est**: faster, fastest\n\nSpelling rules: happy → happ**i**ness (y to i) · make → mak**ing** (drop e) · run → ru**nn**ing (double)` },
            ],
            practice: [gen('prefix', {}, 3), gen('suffix', {}, 3)],
          },
          {
            id: 'homophones', title: 'Homophones', minutes: 12,
            blocks: [
              { type: 'read', text: `**Homophones** sound the same but are spelt differently and mean different things.\n- **there** (a place) · **their** (belongs to them) · **they're** (they are)\n- **to** (towards) · **too** (also / too much) · **two** (2)\n- **see** (with your eyes) · **sea** (the ocean)\n- **its** (belongs to it) · **it's** (it is)` },
            ],
            practice: [gen('homophone', {}, 6)],
          },
          {
            id: 'contractions', title: 'Contractions', minutes: 10,
            blocks: [
              { type: 'read', text: `A **contraction** squashes two words together. An **apostrophe (')** shows where letters are missing.\n- do not → don't · I am → I'm · we will → we'll · it is → it's · they are → they're\n- will not → **won't** (a tricky one!)` },
            ],
            practice: [gen('contraction', {}, 5)],
          },
        ],
        quiz: { n: 12, items: [gen('syllables', {}, 2), gen('prefix', {}, 2), gen('suffix', {}, 2), gen('homophone', {}, 3), gen('contraction', {}, 2), gen('plural', {}, 1)] },
      },
      {
        id: 'reading', term: 2, strand: 'Literacy',
        title: 'Reading and understanding',
        summary: 'Find information that is stated (literal) and work out what is meant (inferential).',
        lessons: [
          {
            id: 'literal', title: 'Right there: finding information', minutes: 15,
            blocks: [
              { type: 'read', text: `Some answers are **right there** in the text. We call these **literal** questions.\n\nStrategy:\n1. Read the question carefully. Find the **key word**.\n2. **Scan** the text for that word.\n3. Read the sentence around it to find the answer.` },
              { type: 'read', title: 'Read the story', text: STORY_KOOKA },
            ],
            practice: [
              mc('What was the kookaburra’s name?', ['Kip', 'Wren', 'Koa', 'Kenny'], 0, 'The story says "Kip the kookaburra".'),
              mc('On which day did Kip lose his laugh?', ['Tuesday', 'Monday', 'Friday', 'Sunday'], 0, '"But one Tuesday…"'),
              mc('What kind of bird is Wren?', ['a blue fairy-wren', 'a kookaburra', 'a magpie', 'a parrot'], 0, '"Wren, a tiny blue fairy-wren".'),
              mc('Where did Kip go to drink water?', ['the creek', 'the beach', 'a puddle', 'the farm'], 0, '"He flew to the creek and drank some cool water."'),
            ],
          },
          {
            id: 'inferential', title: 'Think and search: reading between the lines', minutes: 15,
            blocks: [
              { type: 'read', text: `Sometimes the author doesn't tell us everything. We use **clues** in the text plus **what we already know** to work it out. This is called **inferring**.\n\nExample: *"Kip felt worried."* The author tells us that. But when the text says *"The gully stayed dark and sleepy"*, we can **infer** that the animals rely on Kip to wake them up.` },
              { type: 'read', title: 'Read the story again', text: STORY_KOOKA },
            ],
            practice: [
              mc('Why did the gully stay dark and sleepy?', ['Kip did not laugh to wake everyone up.', 'It was night-time forever.', 'The sun was broken.', 'There was a storm.'], 0, 'Every morning Kip’s laugh woke the gully, so without it everyone kept sleeping.'),
              mc('How did Kip feel at the end of the story?', ['happy and relieved', 'angry', 'scared', 'bored'], 0, 'His eyes twinkled and he laughed loudly — he was happy his laugh came back.'),
              mc('Why did Wren tell Kip a joke every morning after that?', ['To make sure he kept his laugh', 'Because she was bored', 'To wake herself up', 'Because Kip asked her to stop'], 0, '"…just to be sure" — she wanted to make sure he would always laugh.'),
              mc('What word best describes Wren?', ['helpful', 'lazy', 'mean', 'shy'], 0, 'She came up with an idea to help Kip.'),
            ],
          },
          {
            id: 'info-text', title: 'Reading an information text', minutes: 15,
            blocks: [
              { type: 'read', text: `**Information texts** give facts. They often have a **title**, **headings**, **bold words** and **diagrams** to help you find information quickly.` },
              { type: 'read', title: 'Read the text', text: INFO_PLATYPUS },
              { type: 'vocab', words: [['monotreme', 'a mammal that lays eggs'], ['larvae', 'baby insects that look like worms'], ['venom', 'a poison made by an animal'], ['burrow', 'a hole or tunnel an animal digs to live in']] },
            ],
            practice: [
              mc('Where do platypuses live?', ['creeks and rivers in eastern Australia', 'deserts in central Australia', 'the ocean', 'tall trees'], 0, 'The first paragraph says creeks and rivers in eastern Australia.'),
              mc('What is a monotreme?', ['a mammal that lays eggs', 'a type of fish', 'a bird with a bill', 'an insect'], 0, 'The text explains it in bold: a mammal that lays eggs.'),
              mc('Why does the text have headings like "Body" and "Food"?', ['to help readers find information quickly', 'to make it rhyme', 'to tell a story', 'to make it longer'], 0, 'Headings organise information into sections.'),
              tf('The platypus uses its eyes to find food underwater.', false, 'It closes its eyes underwater and uses its bill to sense movement.'),
              mc('What does the platypus eat?', ['worms, shrimps and insect larvae', 'gum leaves', 'grass', 'fruit'], 0, 'See the "Food" section.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'listening', term: 2, strand: 'Literacy',
        title: 'Listening and speaking',
        summary: 'Listen carefully for key information, and speak clearly when presenting to others.',
        lessons: [
          {
            id: 'listen-notices', title: 'Listening for key information', minutes: 12,
            blocks: [
              { type: 'read', text: `Good listeners:\n- look at the speaker\n- listen for **key words** (who, what, when, where, why)\n- picture what they hear\n- ask questions if they don't understand\n\nNow it's your turn. Press **🎧 Listen** to hear the teacher's notices, then answer the questions.` },
              { type: 'listen', title: 'Class notices', text: LISTEN_SCHOOL },
            ],
            practice: [
              mc('Where is the class going?', ['the museum', 'the zoo', 'the beach', 'the library'], 0, 'The teacher says the excursion is to the museum.', { listen: true }),
              mc('What time does the bus leave?', ['9 o’clock', 'half past 8', '3 o’clock', '10 o’clock'], 0, '"The bus leaves at nine o\'clock sharp."', { listen: true }),
              mc('What should you bring if it rains?', ['a raincoat', 'an umbrella', 'gumboots', 'a towel'], 0, '"If it rains, bring a raincoat."', { listen: true }),
              mc('What will they see first?', ['dinosaur skeletons', 'the First Nations gallery', 'paintings', 'a movie'], 0, '"We will see the dinosaur skeletons first."', { listen: true }),
              mc('Which of these do you NOT need to bring?', ['money', 'a packed lunch', 'a hat', 'a water bottle'], 0, 'The teacher asked for lunch, water bottle and hat — money was not mentioned.', { listen: true }),
            ],
          },
          {
            id: 'presenting', title: 'Speaking to an audience', minutes: 12,
            blocks: [
              { type: 'read', text: `When you give a talk (like news or a presentation):\n- **Plan**: beginning (hello + topic), middle (2–3 interesting facts), end (summary + "any questions?")\n- **Voice**: loud enough, clear, not too fast\n- **Body**: stand tall, look at your audience, use hand gestures\n- **Listeners**: sit quietly, look at the speaker, ask a question at the end` },
              { type: 'activity', text: 'Prepare a 1-minute talk about your favourite place. Practise it out loud for a grown-up or your toys. Remember: beginning, middle, end!' },
            ],
            practice: [
              mc('What should you do when giving a talk?', ['Look at the audience and speak clearly', 'Look at the floor and whisper', 'Speak as fast as you can', 'Turn your back'], 0, 'Eye contact and a clear voice help people understand you.'),
              mc('What should the audience do?', ['Listen quietly and ask questions at the end', 'Talk to friends', 'Interrupt often', 'Play games'], 0, 'Good listeners are respectful and ask questions at the end.'),
              mc('What goes at the beginning of a talk?', ['Hello and your topic', 'Your last fact', 'Questions from the audience', 'Goodbye'], 0, 'Start by greeting the audience and saying what you will talk about.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'narrative', term: 3, strand: 'Literature',
        title: 'Stories (narratives)',
        summary: 'How stories are built: characters, setting, orientation, complication and resolution — then write your own.',
        lessons: [
          {
            id: 'structure', title: 'The structure of a story', minutes: 12,
            blocks: [
              { type: 'read', text: `Most stories have three parts:\n1. **Orientation** — introduces the **characters** (who), the **setting** (where and when)\n2. **Complication** — a **problem** happens\n3. **Resolution** — the problem is **solved**\n\nIn *The Kookaburra Who Lost His Laugh*:\n- Orientation: Kip wakes the gully every morning\n- Complication: Kip loses his laugh\n- Resolution: Wren's joke makes him laugh again` },
            ],
            practice: [
              mc('Which part of a story introduces the characters and setting?', ['Orientation', 'Complication', 'Resolution', 'Glossary'], 0, 'The orientation sets the scene.'),
              mc('What is the complication?', ['The problem in the story', 'The happy ending', 'The title', 'The author’s name'], 0, 'The complication is when something goes wrong.'),
              mc('In "Goldilocks and the Three Bears", what is the setting?', ['the bears’ house in the woods', 'a school', 'the beach', 'a spaceship'], 0, 'The setting is where it happens — the bears’ house in the woods.'),
            ],
          },
          {
            id: 'characters', title: 'Characters and setting', minutes: 12,
            blocks: [
              { type: 'read', text: `Authors help us know a **character** by showing:\n- what they **look like**\n- what they **say** and **do**\n- how they **feel** and **think**\n\nThe **setting** is where and when the story happens. Authors use describing words so we can picture it: *"The red dirt glowed in the late afternoon sun."*\n\n> Show, don't tell! Instead of "Sam was scared", write "Sam's knees shook and his heart thumped."` },
            ],
            practice: [
              mc('Which sentence SHOWS that a character is happy?', ['Lily skipped down the path, humming a tune.', 'Lily was happy.', 'Lily walked.', 'Lily had a hat.'], 0, 'Skipping and humming show us she is happy without saying it.'),
              mc('Which sentence describes a setting?', ['Waves crashed onto the empty beach at sunset.', 'Tom was kind.', 'She said hello.', 'They ate lunch quickly.'], 0, 'It tells us where (beach) and when (sunset).'),
            ],
          },
          {
            id: 'write-story', title: 'Write your own story', minutes: 20,
            blocks: [
              { type: 'read', text: `Plan your story first:\n- **Who** is your main character? What are they like?\n- **Where** and **when** does it happen?\n- **What problem** happens?\n- **How** is it solved?\n\nThen write it with a beginning, middle and end. Use paragraphs, interesting verbs and noun groups.` },
            ],
            practice: [write('Write a short story about an animal who finds something surprising in the bush. Include an orientation, a complication and a resolution.', ['Orientation: who, where, when', 'A problem (complication)', 'The problem is solved (resolution)', 'Capital letters and full stops', 'At least one noun group and one interesting verb'], 80)],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'informative', term: 3, strand: 'Literacy',
        title: 'Information reports',
        summary: 'Features of information texts and writing a report with facts and headings.',
        lessons: [
          {
            id: 'features', title: 'Features of information texts', minutes: 12,
            blocks: [
              { type: 'read', text: `Information texts are **non-fiction** — they give true facts.\n\nFeatures that help readers:\n- **title** and **headings**\n- **table of contents** (at the front) and **index** (at the back)\n- **glossary** — a list of tricky words and their meanings\n- **diagrams**, **photos** and **captions**\n- **bold words** for important terms\n\nThey use **facts**, not opinions, and are written in the **present tense** ("Koalas eat gum leaves").` },
            ],
            practice: [
              mc('Where would you find the meaning of a tricky word in an information book?', ['the glossary', 'the title', 'the cover', 'the caption'], 0, 'A glossary lists words and their meanings.'),
              mc('Which is a fact?', ['Koalas sleep for up to 20 hours a day.', 'Koalas are the cutest animal.', 'Everyone loves koalas.', 'Koalas are boring.'], 0, 'A fact can be checked and proven. The others are opinions.'),
              mc('What is a caption?', ['words that explain a picture', 'the name of the author', 'the last page', 'a type of heading'], 0, 'Captions sit under pictures to explain them.'),
              tf('Information texts are usually made-up stories.', false, 'Information texts give true facts — they are non-fiction.'),
            ],
          },
          {
            id: 'write-report', title: 'Write an information report', minutes: 20,
            blocks: [
              { type: 'read', text: `An **information report** has:\n1. **Title**\n2. **Introduction** — what the report is about\n3. **Paragraphs with headings** — e.g. Appearance, Habitat, Food\n4. **Conclusion** — an interesting final fact\n\nUse facts, present tense and technical words.` },
            ],
            practice: [write('Write an information report about an Australian animal (e.g. echidna, wombat, emu). Use headings like Appearance, Habitat and Food.', ['A title', 'An introduction sentence', 'At least two headings with facts', 'Present tense', 'Facts, not opinions'], 70)],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'persuasive', term: 3, strand: 'Literacy',
        title: 'Persuasive texts',
        summary: 'Opinions, reasons and persuasive language — then write to convince your reader.',
        lessons: [
          {
            id: 'opinions', title: 'Facts, opinions and reasons', minutes: 12,
            blocks: [
              { type: 'read', text: `A **persuasive text** tries to make the reader agree with an **opinion**.\n\nIt has:\n1. **Introduction** — state your opinion: *"I believe every school should have a vegie garden."*\n2. **Reasons** — each with an explanation: *"Firstly, students learn where food comes from…"*\n3. **Conclusion** — repeat your opinion strongly\n\n**Persuasive words:** I believe, should, must, definitely, clearly, everyone knows, firstly, secondly, finally` },
            ],
            practice: [
              mc('Which sentence is an opinion?', ['Summer is the best season.', 'Summer is in December, January and February in Australia.', 'There are four seasons.', 'Winter is colder than summer in Hobart.'], 0, '"Best" is what someone thinks — not everyone agrees.'),
              mc('Which word is most persuasive?', ['must', 'might', 'maybe', 'could'], 0, '"Must" sounds strong and certain.'),
              mc('What should the conclusion of a persuasive text do?', ['Repeat the opinion strongly', 'Start a new story', 'Ask the reader to disagree', 'List the characters'], 0, 'The conclusion restates the opinion to convince the reader.'),
            ],
          },
          {
            id: 'write-persuasive', title: 'Write a persuasive text', minutes: 20,
            blocks: [{ type: 'read', text: `Choose a side and give at least **two reasons**. Use joining words like *firstly*, *also*, *because* and *finally*.` }],
            practice: [write('Should children have homework? Write a persuasive text giving your opinion and at least two reasons.', ['Opinion stated in the introduction', 'At least two reasons with explanations', 'Persuasive words (should, must, I believe)', 'A conclusion that restates the opinion'], 70)],
          },
        ],
        quiz: { n: 6, items: [
          mc('What is the purpose of a persuasive text?', ['to convince the reader to agree with an opinion', 'to tell a made-up story', 'to give instructions', 'to describe a picture'], 0, 'Persuasive texts try to change what the reader thinks or does.'),
          mc('Which sentence gives a reason?', ['Firstly, homework helps us practise what we learn at school.', 'Homework is a word.', 'I have a pencil.', 'The end.'], 0, 'A reason explains why the writer holds their opinion.'),
          mc('Which word shows the writer is sure?', ['definitely', 'maybe', 'perhaps', 'possibly'], 0, '"Definitely" is a strong, persuasive word.'),
        ] },
      },
      {
        id: 'poetry', term: 4, strand: 'Literature',
        title: 'Poetry and playing with words',
        summary: 'Rhyme, rhythm, alliteration, onomatopoeia and similes in poems.',
        lessons: [
          {
            id: 'rhyme-rhythm', title: 'Rhyme and rhythm', minutes: 12,
            blocks: [
              { type: 'read', text: `Poems often use **rhyme** (words that end with the same sound) and **rhythm** (a beat).\n\n*The **wombat** dug a hole so **deep**,\nThen curled up tight and fell a**sleep**.*\n\n"Deep" and "asleep" rhyme. Clap the beat as you read it aloud!` },
              { type: 'listen', title: 'A poem to listen to', text: 'Down by the billabong, still and cool, the frogs all gather for singing school. Croak goes the big one, peep goes the small, splash goes the turtle, the loudest of all!' },
            ],
            practice: [
              mc('Which word rhymes with "cool"?', ['school', 'cold', 'call', 'cook'], 0, 'Cool and school end with the same "ool" sound.', { listen: true }),
              mc('Which word rhymes with "tree"?', ['bee', 'try', 'tray', 'treat'], 0, 'Tree and bee both end with the "ee" sound.'),
              mc('In the poem, what goes "splash"?', ['the turtle', 'the big frog', 'the small frog', 'the fish'], 0, '"Splash goes the turtle".', { listen: true }),
            ],
          },
          {
            id: 'devices', title: 'Alliteration, onomatopoeia and similes', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Alliteration:** words close together start with the same sound — *Silly snakes slide slowly.*\n- **Onomatopoeia:** words that sound like the noise — *buzz, crash, sizzle, pop, splash*\n- **Simile:** compares two things using **like** or **as** — *as fast as a cheetah*, *her smile was like sunshine*` },
            ],
            practice: [
              mc('Which is alliteration?', ['Seven slippery seals swam south.', 'The dog barked.', 'Bang! Crash!', 'As tall as a tree.'], 0, 'Many words start with the "s" sound.'),
              mc('Which word is onomatopoeia?', ['sizzle', 'happy', 'table', 'slowly'], 0, '"Sizzle" sounds like the noise it describes.'),
              mc('Which is a simile?', ['as quiet as a mouse', 'the quiet mouse', 'a mouse squeaked', 'mice are small'], 0, 'It compares using "as".'),
              write('Write a short poem (4 lines) about the beach or the bush. Try to use rhyme and one simile.', ['4 lines', 'At least one pair of rhyming words', 'A simile using like or as'], 20),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'pronouns-speech', term: 4, strand: 'Language',
        title: 'Pronouns, conjunctions and speech marks',
        summary: 'Use pronouns to avoid repeating, join ideas with because/when/if, and punctuate what people say.',
        lessons: [
          {
            id: 'pronouns', title: 'Pronouns', minutes: 10,
            blocks: [
              { type: 'read', text: `A **pronoun** takes the place of a noun so we don't repeat it.\n\n*Ava likes cricket. **Ava** plays every Saturday.* → *Ava likes cricket. **She** plays every Saturday.*\n\nPronouns: I, me, you, he, him, she, her, it, we, us, they, them\nOwning pronouns: my, mine, your, his, her, its, our, their` },
            ],
            practice: [
              mc('Choose the pronoun: "Jack and Leo went to the beach. ___ built a sandcastle."', ['They', 'He', 'We', 'It'], 0, 'Two people → "They".'),
              mc('Choose the pronoun: "The dog wagged ___ tail."', ['its', 'it\'s', 'his', 'their'], 0, '"Its" shows the tail belongs to the dog (no apostrophe).'),
              mc('Which word is a pronoun? "Grandma gave me a book."', ['me', 'Grandma', 'gave', 'book'], 0, '"Me" stands in for the speaker\'s name.'),
            ],
          },
          {
            id: 'conjunctions', title: 'Because, when, if, although', minutes: 10,
            blocks: [
              { type: 'read', text: `Some conjunctions add **extra information** to a main idea:\n- **because** (why): We stayed inside **because** it was raining.\n- **when** (time): I eat lunch **when** the bell rings.\n- **if** (condition): We can swim **if** it is hot.\n- **although** (surprise): I went outside **although** it was cold.` },
            ],
            practice: [
              mc('Choose the best word: "I wore my hat ___ it was sunny."', ['because', 'although', 'but', 'or'], 0, '"Because" tells why.'),
              mc('Choose the best word: "You can have dessert ___ you eat your vegies."', ['if', 'because', 'although', 'so'], 0, '"If" shows a condition.'),
              mc('Choose the best word: "She finished the race ___ her leg was sore."', ['although', 'because', 'if', 'so'], 0, '"Although" shows something surprising.'),
            ],
          },
          {
            id: 'quotation', title: 'Speech marks (quotation marks)', minutes: 12,
            blocks: [
              { type: 'read', text: `**Quotation marks** (" ") go around the **exact words** someone says.\n\n*"Can we go to the park?" asked Mia.*\n*Dad replied, "Yes, after lunch."*\n\nRules:\n- Start the spoken words with a capital letter\n- Punctuation (. , ? !) goes **inside** the closing quotation marks\n- Start a new line when a new person speaks` },
            ],
            practice: [
              mc('Which sentence is punctuated correctly?', ['"Let\'s play cricket," said Noah.', 'Let\'s play cricket, "said Noah."', '"Let\'s play cricket", said Noah', 'Let\'s play "cricket" said Noah.'], 0, 'The spoken words and the comma go inside the quotation marks.'),
              mc('What are the spoken words? Mum said, "Put your shoes on."', ['Put your shoes on.', 'Mum said', 'Mum said put', 'your shoes'], 0, 'The words inside the quotation marks are what Mum said.'),
              tf('A new line starts when a new person speaks.', true, 'This helps readers know who is talking.'),
            ],
          },
          {
            id: 'dictionary', title: 'Alphabetical order and dictionaries', minutes: 10,
            blocks: [
              { type: 'read', text: `Dictionaries list words in **alphabetical order**. If the first letters match, look at the **second** letter, then the third.\n\n*bat, bear, bird, bull* — look at the 2nd letters: a, e, i, u.\n\n**Guide words** at the top of a dictionary page show the first and last word on that page.` },
            ],
            practice: [gen('alphaOrder', {}, 4)],
          },
        ],
        quiz: { n: 10 },
      },
    ],
  });
})();
