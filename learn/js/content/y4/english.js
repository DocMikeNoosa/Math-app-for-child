/* Year 4 English — Australian Curriculum v9.0 strands: Language, Literature, Literacy */
(function () {
  const { mc, tf, inp, gen, write } = LA.Q;

  const STORY = `## The Night of the Big Storm
Ella pressed her nose against the window. Dark clouds rolled over the hills like an angry grey blanket, and the old peppercorn tree in the yard groaned in the wind.

"Grandpa, the chooks!" she cried. "We left them out!"

Grandpa looked up from his crossword. Without a word, he pulled on his oilskin coat and handed Ella the torch. Together they pushed open the back door, and the wind tried to snatch it from their hands.

Rain stung Ella's cheeks as they ran across the paddock. The chooks were huddled under the water tank, feathers soaked and flat. One by one, Ella scooped them up while Grandpa held the gate of the coop against the gale.

When the last chook was safe, Grandpa latched the door and grinned through his dripping beard. "Reckon you've earned a hot Milo," he said.

Back inside, wrapped in a towel, Ella listened to the storm hammering the tin roof. She didn't feel scared anymore. She felt ten feet tall.`;

  const INFO = `## How Bees Make Honey
Honey bees are amazing insects that live together in a colony of up to 60,000 bees. Each colony has one **queen**, thousands of **worker** bees and some **drones**.

**Collecting nectar:** Worker bees visit flowers and suck up a sweet liquid called **nectar** using their long, straw-like tongue. They store it in a special "honey stomach". A bee may visit hundreds of flowers on one trip.

**Making honey:** Back at the hive, the bees pass the nectar from mouth to mouth. This adds special substances called enzymes. Then they put the nectar into wax cells and fan it with their wings until most of the water evaporates. The thick, sweet liquid that is left is **honey**.

**Why bees matter:** As bees move from flower to flower, they carry **pollen**, which helps plants make fruit and seeds. Without bees, we would have far fewer apples, almonds and many other foods.`;

  const LISTEN = `Welcome to the Bush Fire Ready podcast for kids. Today we're talking about how families can be prepared for bushfire season. First, every family should have a bushfire plan and talk about it together. The plan says when you will leave, where you will go and how you will get there. Second, keep the area around your house clean. Rake up dry leaves, clear gutters and keep grass short. Third, pack an emergency kit with a torch, a battery radio, water, medicines and copies of important papers. Finally, know the warning levels. Advice means a fire has started. Watch and Act means conditions are changing and you need to act now. Emergency Warning is the highest level and means you are in danger and need to take action immediately. Remember, leaving early is the safest option.`;

  LA.addSubject(4, {
    id: 'english',
    intro: 'Complex sentences, clauses and punctuation, word origins and spelling, reading for meaning, narrative, persuasive and procedural writing, poetry and points of view.',
    chapters: [
      {
        id: 'clauses', term: 1, strand: 'Language',
        title: 'Clauses and complex sentences',
        summary: 'Main and dependent clauses, and joining them to make complex sentences.',
        lessons: [
          {
            id: 'clauses', title: 'What is a clause?', minutes: 12,
            blocks: [
              { type: 'read', text: `A **clause** is a group of words with a **verb** that tells us about something happening.\n\n- A **main (independent) clause** makes sense on its own: *The dog barked.*\n- A **dependent (subordinate) clause** does **not** make sense on its own. It starts with a word like **because, when, if, although, while, after, before, until**: *because a possum was on the fence*\n\nPut them together: **The dog barked** *because a possum was on the fence.*` },
            ],
            practice: [
              mc('Which is a main clause?', ['The children laughed.', 'because it was funny', 'when the bell rang', 'although it was late'], 0, 'It makes sense on its own and has a verb.'),
              mc('Which is a dependent clause?', ['after we ate lunch', 'We played cricket.', 'Sam scored a goal.', 'It rained.'], 0, '"After we ate lunch" needs a main clause to make complete sense.'),
              mc('How many clauses are in: "I wore a hat because it was sunny."', ['2', '1', '3', '0'], 0, 'Two verbs: wore and was — two clauses.'),
            ],
          },
          {
            id: 'complex', title: 'Simple, compound and complex sentences', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Simple sentence:** one main clause — *The wombat dug a burrow.*\n- **Compound sentence:** two main clauses joined by **and, but, so, or** — *The wombat dug a burrow and it crawled inside.*\n- **Complex sentence:** a main clause + a dependent clause — *The wombat dug a burrow **because it needed shelter**.*\n\nThe dependent clause can go first, followed by a **comma**: *Because it needed shelter, the wombat dug a burrow.*` },
            ],
            practice: [
              mc('What type of sentence is: "We stayed inside because it was raining."', ['complex', 'simple', 'compound', 'not a sentence'], 0, 'Main clause + dependent clause (because…) = complex.'),
              mc('What type of sentence is: "I like apples but my brother likes pears."', ['compound', 'complex', 'simple', 'question'], 0, 'Two main clauses joined by "but" = compound.'),
              mc('Which is punctuated correctly?', ['When the siren sounded, the players left the field.', 'When the siren sounded the players, left the field.', 'When, the siren sounded the players left the field.', 'When the siren sounded the players left, the field.'], 0, 'Put a comma after a dependent clause at the start.'),
              write('Write three complex sentences about your weekend. Use a different conjunction in each (e.g. because, when, although).', ['Three complex sentences', 'Three different conjunctions', 'Correct punctuation'], 25),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'word-groups', term: 1, strand: 'Language',
        title: 'Noun groups, verb groups and adverbials',
        summary: 'Expand noun groups, use precise verb groups and add adverbials (including prepositional phrases).',
        lessons: [
          {
            id: 'noun-verb-groups', title: 'Noun groups and verb groups', minutes: 12,
            blocks: [
              { type: 'read', text: `A **noun group** builds detail around a noun: *the **three** **enormous** grey **elephants** **with long trunks***\n\nA **verb group** is a main verb with helping verbs: *is **running**, **will** **swim**, **has been** **waiting**, **could** **have** **gone***\n\nChoose **precise verbs**: instead of *went*, try *raced, crept, wandered, strolled*. Instead of *said*, try *muttered, explained, exclaimed*.` },
            ],
            practice: [
              mc('Find the verb group: "The kookaburras have been laughing all morning."', ['have been laughing', 'the kookaburras', 'all morning', 'laughing all'], 0, 'Helping verbs "have been" + main verb "laughing".'),
              mc('Which verb best shows someone moving quietly?', ['crept', 'stomped', 'raced', 'thundered'], 0, '"Crept" means moved slowly and quietly.'),
              mc('What is the main noun in "the rusty old ute with a flat tyre"?', ['ute', 'rusty', 'tyre', 'old'], 0, 'Everything else describes the ute.'),
            ],
          },
          {
            id: 'adverbials', title: 'Adverbials and prepositional phrases', minutes: 12,
            blocks: [
              { type: 'read', text: `**Adverbials** add information about **how, when, where** or **why**. They can be one word or a phrase.\n\n**Prepositional phrases** start with a **preposition** (in, on, under, behind, after, during, with, across):\n- *The cat hid **under the bed**.* (where)\n- ***After school**, we went swimming.* (when)\n- *She opened the box **with great care**.* (how)\n\nWhen an adverbial starts the sentence (a **fronted adverbial**), it is often followed by a comma.` },
            ],
            practice: [
              mc('Find the prepositional phrase: "The lizard sunbaked on the warm rock."', ['on the warm rock', 'the lizard', 'sunbaked', 'warm'], 0, 'It starts with the preposition "on" and tells where.'),
              mc('What does the adverbial tell us? "During the night, it rained heavily."', ['when', 'where', 'who', 'why'], 0, '"During the night" tells when.'),
              mc('Which word is a preposition?', ['behind', 'quickly', 'happy', 'jump'], 0, '"Behind" shows position.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'punctuation', term: 1, strand: 'Language',
        title: 'Apostrophes, speech and commas',
        summary: 'Apostrophes for possession and contraction, punctuating direct speech, and commas.',
        lessons: [
          {
            id: 'possession', title: 'Apostrophes of possession', minutes: 15,
            blocks: [
              { type: 'read', text: `An **apostrophe** can show that something **belongs** to someone.\n\n- **One owner:** add **'s** → the **dog's** bone (one dog), **Mia's** hat\n- **More than one owner ending in s:** add **'** after the s → the **dogs'** bones (many dogs), the **girls'** change room\n- **Plural not ending in s:** add **'s** → the **children's** toys, the **men's** shoes\n\n⚠️ Don't use an apostrophe just to make a plural: ~~apple's for sale~~ → **apples** for sale.\n⚠️ **its** (belonging to it) has **no** apostrophe. **it's** = it is.` },
            ],
            practice: [
              mc('Which is correct? "The ___ tail was wagging." (one dog)', ["dog's", "dogs'", 'dogs', "dogs's"], 0, 'One dog owns the tail: dog\'s.'),
              mc('Which is correct? "The three ___ nests were in the tree." (three birds)', ["birds'", "bird's", 'birds', "birds's"], 0, 'Many birds ending in s: add the apostrophe after the s.'),
              mc('Which is correct? "The ___ playground was new."', ["children's", "childrens'", 'childrens', "children'"], 0, '"Children" is already plural and doesn\'t end in s, so add \'s.'),
              mc('Which sentence is correct?', ['The koala hugged its baby.', "The koala hugged it's baby.", "The koala hugged its' baby.", "The koala hugged it is baby."], 0, '"Its" (belonging to it) has no apostrophe.'),
              gen('contraction', {}, 2),
            ],
          },
          {
            id: 'speech', title: 'Punctuating direct speech', minutes: 12,
            blocks: [
              { type: 'read', text: `Rules for **direct speech**:\n1. Put **quotation marks** around the spoken words\n2. Start spoken words with a **capital letter**\n3. Put a comma, full stop, question mark or exclamation mark **inside** the closing quotation mark\n4. If the speaker comes first, put a **comma** before the opening quotation mark\n5. **New speaker, new line**\n\n*"Are you coming to footy training?" asked Leo.*\n*Ava replied, "Yes, I'll meet you there."*` },
            ],
            practice: [
              mc('Which is punctuated correctly?', ['"Watch out!" yelled the coach.', '"Watch out"! yelled the coach.', 'Watch out! "yelled the coach."', '"watch out!" Yelled the coach.'], 0, 'The exclamation mark goes inside the quotation marks.'),
              mc('Which is punctuated correctly?', ['Grandma said, "Dinner is ready."', 'Grandma said "Dinner is ready".', 'Grandma said, "dinner is ready."', 'Grandma said, Dinner is ready."'], 0, 'Comma before the quote, capital letter, full stop inside.'),
              tf('A new line is started each time a different person speaks.', true, 'This makes it clear who is talking.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'spelling', term: 2, strand: 'Language',
        title: 'Spelling and word origins',
        summary: 'Base words, prefixes and suffixes, homophones, and words that come from other languages.',
        lessons: [
          {
            id: 'morphemes', title: 'Base words, prefixes and suffixes', minutes: 12,
            blocks: [
              { type: 'read', text: `A **morpheme** is the smallest part of a word that has meaning.\n\n**un** + **help** + **ful** = unhelpful (not full of help)\n\nKnowing parts helps you spell and understand new words:\n- **re-** (again), **un-/dis-/in-/im-** (not), **pre-** (before), **sub-** (under), **tri-** (three)\n- **-ful, -less, -ness, -ment, -able, -er, -est, -ly**\n\nSpelling rules: **happy → happily** (y → i), **hope → hoping** (drop e), **swim → swimming** (double the last consonant after a short vowel)` },
            ],
            practice: [gen('prefix', {}, 3), gen('suffix', {}, 3), mc('What does "submarine" mean, if "sub" means under and "marine" means sea?', ['under the sea', 'above the sea', 'a fast boat', 'a sea animal'], 0, 'Sub (under) + marine (sea).')],
          },
          {
            id: 'homophones-plurals', title: 'Homophones and tricky plurals', minutes: 12,
            blocks: [{ type: 'read', text: `Check which **homophone** fits the meaning: **there/their/they're**, **your/you're**, **whose/who's**, **its/it's**, **brake/break**, **peace/piece**.\n\nTricky plurals: leaf → leaves, potato → potatoes, child → children, mouse → mice, sheep → sheep.` }],
            practice: [gen('homophone', {}, 4), gen('plural', {}, 3)],
          },
          {
            id: 'origins', title: 'Where words come from', minutes: 12,
            blocks: [
              { type: 'read', text: `English borrows words from many languages:\n- **Greek:** *tele* (far) → telephone, television; *graph* (write) → autograph; *phon* (sound) → microphone\n- **Latin:** *aqua* (water) → aquarium; *port* (carry) → transport; *dict* (say) → dictionary\n- **French:** ballet, café, restaurant\n- **Australian First Nations languages:** **kangaroo** (from the Guugu Yimithirr language), **koala**, **wombat**, **billabong**, **kookaburra** and many place names like **Canberra** and **Wagga Wagga**` },
            ],
            practice: [
              mc('If "tele" means far and "scope" means look, a telescope helps you…', ['look at things far away', 'write things down', 'hear music', 'carry things'], 0, 'Tele (far) + scope (look).'),
              mc('"Aqua" means water. Which word is about water?', ['aquarium', 'autograph', 'transport', 'telephone'], 0, 'An aquarium holds water and fish.'),
              mc('The word "kangaroo" comes from…', ['an Australian First Nations language', 'French', 'Greek', 'Spanish'], 0, 'It comes from the Guugu Yimithirr language of north Queensland.'),
              gen('syllables', {}, 1),
            ],
          },
        ],
        quiz: { n: 10, items: [gen('prefix', {}, 2), gen('suffix', {}, 2), gen('homophone', {}, 3), gen('plural', {}, 2)] },
      },
      {
        id: 'reading', term: 2, strand: 'Literacy',
        title: 'Reading for meaning',
        summary: 'Literal and inferential comprehension, main ideas, vocabulary in context and summarising.',
        lessons: [
          {
            id: 'narrative-comp', title: 'Reading a story closely', minutes: 15,
            blocks: [
              { type: 'read', text: `As you read, **visualise** (make a picture in your mind), **question** and **predict**. Look for clues about how characters **feel** and **change**.` },
              { type: 'read', title: 'Read the story', text: STORY },
            ],
            practice: [
              mc('Why did Ella and Grandpa go out into the storm?', ['to bring the chooks inside the coop', 'to look at the lightning', 'to fix the roof', 'to get the mail'], 0, '"Grandpa, the chooks! We left them out!"'),
              mc('"Dark clouds rolled over the hills like an angry grey blanket" is an example of…', ['a simile', 'a question', 'a fact', 'a command'], 0, 'It compares clouds to a blanket using "like".'),
              mc('How did Ella feel at the end of the story?', ['proud and brave', 'scared', 'bored', 'angry with Grandpa'], 0, '"She felt ten feet tall" means she felt proud.'),
              mc('What does "gale" most likely mean?', ['a very strong wind', 'a type of chicken', 'a gate', 'a light rain'], 0, 'The context (wind, storm) shows a gale is a strong wind.'),
              mc('What can we infer about Grandpa?', ['He is calm and helpful in a crisis', 'He is scared of storms', 'He doesn’t care about the chooks', 'He is lazy'], 0, 'He quietly gets ready and helps without fuss.'),
            ],
          },
          {
            id: 'info-comp', title: 'Main ideas and summarising', minutes: 15,
            blocks: [
              { type: 'read', text: `The **main idea** is what a paragraph is mostly about. Often the first sentence tells you (the **topic sentence**). Other sentences give **supporting details**.\n\nTo **summarise**, retell only the most important ideas in your own words — keep it short!` },
              { type: 'read', title: 'Read the text', text: INFO },
            ],
            practice: [
              mc('What is the main idea of the "Making honey" paragraph?', ['how bees turn nectar into honey', 'how many bees live in a hive', 'why bees sting', 'what flowers look like'], 0, 'The paragraph explains the steps of making honey.'),
              mc('How do bees remove water from nectar?', ['by fanning it with their wings', 'by boiling it', 'by squeezing it', 'by freezing it'], 0, 'They fan it until most of the water evaporates.'),
              mc('Why are bees important to farmers?', ['They carry pollen that helps plants make fruit and seeds', 'They eat pests', 'They make wax candles only', 'They scare birds away'], 0, 'See "Why bees matter".'),
              mc('Which is the best summary of the text?', ['Bees collect nectar, turn it into honey in the hive, and help plants by spreading pollen.', 'Bees are insects.', 'Honey is sweet and sticky.', 'There are 60,000 bees.'], 0, 'A good summary includes the key ideas briefly.'),
              mc('What is nectar?', ['a sweet liquid in flowers', 'a kind of wax', 'pollen', 'a bee’s home'], 0, 'The text defines nectar as a sweet liquid.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'listening', term: 2, strand: 'Literacy',
        title: 'Listening and presenting',
        summary: 'Listen to spoken information to identify key points, and plan and deliver presentations.',
        lessons: [
          {
            id: 'podcast', title: 'Listening to a podcast', minutes: 12,
            blocks: [
              { type: 'read', text: `When listening to spoken information, note the **topic**, the **main points** (often signalled by words like *first, second, finally*) and any **key facts**. Press **🎧 Listen**, then answer the questions.` },
              { type: 'listen', title: 'Bush Fire Ready podcast', text: LISTEN },
            ],
            practice: [
              mc('What is the podcast mostly about?', ['being prepared for bushfire season', 'how to cook a barbecue', 'camping holidays', 'farm animals'], 0, 'The topic is bushfire preparation for families.', { listen: true }),
              mc('What should a bushfire plan include?', ['when you will leave, where you will go and how you will get there', 'your favourite foods', 'a list of games', 'school timetables'], 0, 'The speaker lists when, where and how.', { listen: true }),
              mc('Which item should go in an emergency kit?', ['a battery radio', 'a skateboard', 'a video game', 'a pillow'], 0, 'Torch, battery radio, water, medicines and papers were mentioned.', { listen: true }),
              mc('What is the highest warning level?', ['Emergency Warning', 'Advice', 'Watch and Act', 'Fire Danger'], 0, 'The speaker says Emergency Warning is the highest level.', { listen: true }),
              mc('According to the podcast, what is the safest option?', ['leaving early', 'staying to watch', 'hiding in the car', 'calling a friend'], 0, '"Leaving early is the safest option."', { listen: true }),
            ],
          },
          {
            id: 'present', title: 'Planning a presentation', minutes: 12,
            blocks: [
              { type: 'read', text: `Strong presentations:\n- **Hook** the audience at the start (a question, a surprising fact)\n- Organise **2–3 main points** with examples\n- Use **visual aids** (pictures, slides, objects)\n- **Conclude** with a summary\n- Speak with good **volume, pace, expression and eye contact**\n- Practise and time yourself` },
              { type: 'activity', text: 'Prepare a 2-minute talk teaching your family about an animal or hobby. Start with a hook and use at least one visual aid.' },
            ],
            practice: [
              mc('What is a "hook" in a presentation?', ['an interesting start that grabs attention', 'the last slide', 'a hand gesture', 'a question at the end'], 0, 'A hook makes the audience want to listen.'),
              mc('Which helps the audience understand?', ['visual aids like pictures', 'reading very fast', 'facing the wall', 'mumbling'], 0, 'Pictures support what you say.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'narrative', term: 3, strand: 'Literature',
        title: 'Writing narratives',
        summary: 'Develop characters and settings, use dialogue and paragraphs, and build tension.',
        lessons: [
          {
            id: 'craft', title: 'Author’s craft: show, don’t tell', minutes: 12,
            blocks: [
              { type: 'read', text: `Narratives have an **orientation**, a **complication**, a series of **events** that build **tension**, a **climax**, and a **resolution**.\n\nGood narrative writers:\n- **Show, don't tell** feelings: *Her hands trembled as she reached for the door.*\n- Use **dialogue** to reveal character\n- Use **paragraphs** — a new paragraph for a new time, place, idea or speaker\n- Use **sensory details** (sight, sound, smell, touch, taste)\n- Vary sentence beginnings and lengths. Short sentences build tension. *Then it stopped.*` },
            ],
            practice: [
              mc('Which sentence "shows" that a character is nervous?', ['Jake chewed his nails and kept glancing at the clock.', 'Jake was nervous.', 'Jake sat down.', 'Jake had a red shirt.'], 0, 'Actions reveal the feeling.'),
              mc('When should you start a new paragraph?', ['when the time, place, idea or speaker changes', 'after every sentence', 'only at the end', 'never'], 0, 'Paragraphs organise changes in the story.'),
              mc('What is the climax of a story?', ['the most exciting or tense moment', 'the first sentence', 'the title', 'the list of characters'], 0, 'The climax is the turning point.'),
              mc('Which sentence uses a sense other than sight?', ['The smell of burnt toast drifted down the hall.', 'The house was blue.', 'She saw a bird.', 'The sky was grey.'], 0, 'Smell is a sense.'),
            ],
          },
          {
            id: 'write', title: 'Write a narrative', minutes: 25,
            blocks: [{ type: 'read', text: `Plan with a story map: characters, setting, problem, events, climax, resolution. Then write with paragraphs and some dialogue.` }],
            practice: [write('Write a narrative that begins: "Nobody believed me when I said the old shed at the bottom of the garden was humming…"', ['Orientation with character and setting', 'A problem and rising tension', 'A climax and resolution', 'Paragraphs', 'At least two lines of correctly punctuated dialogue', 'Show-don’t-tell or sensory detail'], 150)],
          },
        ],
        quiz: { n: 4 },
      },
      {
        id: 'persuasive', term: 3, strand: 'Literacy',
        title: 'Persuasive writing',
        summary: 'Arguments, evidence, modal language and emotive words to convince an audience.',
        lessons: [
          {
            id: 'techniques', title: 'Persuasive techniques', minutes: 12,
            blocks: [
              { type: 'read', text: `Persuasive texts (expositions) state a **position** and support it with **arguments** and **evidence**.\n\nStructure: **Introduction** (position) → **Arguments** (one per paragraph, with evidence) → **Conclusion** (restate position).\n\nTechniques:\n- **High modality** words sound certain: *must, definitely, certainly, always*. Low modality: *might, could, perhaps*\n- **Emotive language**: *heartbreaking, unfair, amazing*\n- **Rhetorical questions**: *Wouldn't you want a cleaner beach?*\n- **Facts and statistics**\n- **Connectives**: *firstly, furthermore, in addition, therefore, in conclusion*` },
            ],
            practice: [
              mc('Which word has the highest modality?', ['must', 'might', 'could', 'perhaps'], 0, '"Must" is strong and certain.'),
              mc('"Isn’t it time we protected our oceans?" is an example of…', ['a rhetorical question', 'a fact', 'a simile', 'a command'], 0, 'It is asked to make readers think, not to get an answer.'),
              mc('Which connective introduces a final point?', ['In conclusion', 'Firstly', 'For example', 'However'], 0, '"In conclusion" signals the end.'),
              mc('Which is emotive language?', ['The poor, starving puppy shivered in the cold.', 'The dog is brown.', 'Dogs have four legs.', 'There are 5 dogs.'], 0, 'Words like "poor" and "starving" make readers feel something.'),
            ],
          },
          {
            id: 'write', title: 'Write a persuasive text', minutes: 25,
            blocks: [{ type: 'read', text: `Choose a clear position and give at least three arguments, each in its own paragraph with a reason and evidence.` }],
            practice: [write('Write a persuasive text: "Should our school ban single-use plastic?"', ['Clear position in the introduction', 'At least three arguments in separate paragraphs', 'Evidence or examples', 'High modality words and a rhetorical question', 'A conclusion that restates the position'], 150)],
          },
        ],
        quiz: { n: 4 },
      },
      {
        id: 'procedures', term: 3, strand: 'Literacy',
        title: 'Procedures and explanations',
        summary: 'Write clear instructions and explain how and why things happen.',
        lessons: [
          {
            id: 'procedure', title: 'Writing a procedure', minutes: 12,
            blocks: [
              { type: 'read', text: `A **procedure** tells how to do something. It has:\n- **Goal** (title): *How to Make Damper*\n- **Materials/ingredients** list\n- **Steps** in order, numbered\n\nEach step starts with an **imperative (bossy) verb**: *Mix, Pour, Cut, Bake, Stir*. Use time words: *first, next, then, after that, finally*. Be precise: *Bake for 25 minutes at 200 °C.*` },
            ],
            practice: [
              mc('Which is an imperative verb?', ['Stir', 'Stirring', 'Stirred', 'Stirs'], 0, 'Imperative verbs give commands: Stir the mixture.'),
              mc('What part of a procedure lists what you need?', ['materials/ingredients', 'goal', 'steps', 'conclusion'], 0, 'The materials section lists what you need.'),
              mc('Which step is the most precise?', ['Bake for 25 minutes at 200 °C.', 'Bake it for a while.', 'Cook it.', 'Put it in somewhere hot.'], 0, 'Exact times and temperatures help readers follow along.'),
              write('Write a procedure for making your favourite sandwich. Include a goal, materials and numbered steps with imperative verbs.', ['Goal / title', 'Materials list', 'Numbered steps in order', 'Imperative verbs'], 50),
            ],
          },
          {
            id: 'explanation', title: 'Explanations', minutes: 12,
            blocks: [{ type: 'read', text: `An **explanation** tells **how** or **why** something happens (e.g. *How Rain Forms*). It uses:\n- a **title** that asks or states the process\n- an **introduction**\n- **sequenced paragraphs** with **cause and effect** words: *because, so, as a result, this causes, therefore*\n- **present tense** and **technical vocabulary**\n- often a **diagram**` }],
            practice: [
              mc('Which words show cause and effect?', ['as a result', 'once upon a time', 'I believe', 'yummy'], 0, '"As a result" links a cause to its effect.'),
              mc('What is the purpose of an explanation?', ['to tell how or why something happens', 'to entertain with a story', 'to persuade', 'to list ingredients'], 0, 'Explanations explain processes.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'poetry', term: 4, strand: 'Literature',
        title: 'Poetry and figurative language',
        summary: 'Similes, metaphors, personification, imagery, rhythm and rhyme.',
        lessons: [
          {
            id: 'figurative', title: 'Similes, metaphors and personification', minutes: 12,
            blocks: [
              { type: 'read', text: `**Figurative language** paints pictures in the reader's mind:\n- **Simile** — compares using *like* or *as*: *The ute was as old as the hills.*\n- **Metaphor** — says something **is** something else: *The classroom was a zoo.*\n- **Personification** — gives human qualities to non-human things: *The wind howled. The sun smiled down.*\n- **Onomatopoeia** — words that sound like their meaning: *crackle, thud*\n- **Alliteration** — repeated starting sounds: *giggling green geckos*` },
              { type: 'listen', title: 'Listen to a poem', text: 'The bushfire roared, a hungry beast, it gobbled trees for its smoky feast. The gum leaves trembled, the creek held its breath, the sky turned orange, as dark as death. But then came rain, a gentle friend, who whispered softly, "This is the end."' },
            ],
            practice: [
              mc('"The bushfire roared, a hungry beast" — what kind of figurative language is "a hungry beast"?', ['metaphor', 'simile', 'onomatopoeia', 'fact'], 0, 'It says the fire IS a beast (no like/as).', { listen: true }),
              mc('"The creek held its breath" is…', ['personification', 'a simile', 'alliteration', 'a rhyme'], 0, 'A creek can’t really hold its breath — it’s given a human action.', { listen: true }),
              mc('Which is a simile?', ['Her eyes sparkled like diamonds.', 'Her eyes were diamonds.', 'Her eyes sparkled.', 'She has two eyes.'], 0, 'It compares using "like".'),
              mc('In the poem, what is the rain compared to?', ['a gentle friend', 'a hungry beast', 'a diamond', 'a blanket'], 0, '"Then came rain, a gentle friend".', { listen: true }),
            ],
          },
          {
            id: 'write-poem', title: 'Write a poem', minutes: 15,
            blocks: [{ type: 'read', text: `Try a **cinquain** (5 lines): 1 word (title) · 2 describing words · 3 action words (-ing) · a 4-word feeling phrase · 1 word (synonym for the title).\n\n*Ocean*\n*Wild, blue*\n*Crashing, swirling, roaring*\n*Makes me feel small*\n*Sea*` }],
            practice: [write('Write a poem about weather (storm, drought, rain or heatwave). Use at least one simile, one metaphor or personification.', ['At least 5 lines', 'A simile', 'A metaphor or personification', 'Vivid word choices'], 30)],
          },
        ],
        quiz: { n: 5 },
      },
      {
        id: 'vocabulary', term: 4, strand: 'Language',
        title: 'Vocabulary and cohesion',
        summary: 'Synonyms and antonyms, precise word choice, and linking ideas across a text.',
        lessons: [
          {
            id: 'syn-ant', title: 'Synonyms, antonyms and shades of meaning', minutes: 12,
            blocks: [{ type: 'read', text: `- **Synonyms** mean the same or nearly the same: *big, large, huge, enormous*\n- **Antonyms** mean the opposite: *hot/cold, ancient/modern*\n- **Shades of meaning**: words can be stronger or weaker — *warm → hot → scorching*; *dislike → hate → loathe*\n\nA **thesaurus** helps you find synonyms. Choose the word that fits **exactly**.` }],
            practice: [
              mc('Which is a synonym for "enormous"?', ['huge', 'tiny', 'quick', 'quiet'], 0, 'Enormous and huge both mean very big.'),
              mc('Which is an antonym for "ancient"?', ['modern', 'old', 'historic', 'aged'], 0, 'Ancient means very old; modern means new.'),
              mc('Which word is the strongest?', ['furious', 'annoyed', 'cross', 'grumpy'], 0, 'Furious is extremely angry.'),
              gen('alphaOrder', {}, 1),
            ],
          },
          {
            id: 'cohesion', title: 'Linking ideas (cohesion)', minutes: 12,
            blocks: [{ type: 'read', text: `**Cohesion** means a text flows and sticks together. Writers use:\n- **Pronouns** to refer back: *The **echidna** curled up. **It** was scared.*\n- **Connectives** to link ideas: *however, also, as a result, meanwhile, for example*\n- **Synonyms** to avoid repeating: *the echidna… the spiny animal… the monotreme*\n- **Topic sentences** at the start of paragraphs` }],
            practice: [
              mc('Choose the best connective: "It was raining. ___, we still went to the beach."', ['However', 'Because', 'For example', 'Firstly'], 0, '"However" shows contrast.'),
              mc('What does "it" refer to? "The platypus dived. It searched for food."', ['the platypus', 'the food', 'the river', 'the diver'], 0, '"It" refers back to the platypus.'),
              mc('Which connective gives an example?', ['for example', 'however', 'meanwhile', 'finally'], 0, '"For example" introduces an example.'),
            ],
          },
          {
            id: 'perspective', title: 'Points of view and purpose', minutes: 12,
            blocks: [{ type: 'read', text: `- **First person** — the narrator is in the story: *I, me, we*\n- **Third person** — the narrator is outside the story: *he, she, they*\n\nDifferent characters can see the same event differently. The wolf in *The Three Little Pigs* might tell a very different story!\n\nAuthors write for a **purpose**: to **entertain**, **inform**, **persuade** or **instruct**.` }],
            practice: [
              mc('Which sentence is written in first person?', ['I couldn’t believe my eyes.', 'She couldn’t believe her eyes.', 'They ran home.', 'The dog barked.'], 0, '"I" shows first person.'),
              mc('What is the main purpose of a recipe?', ['to instruct', 'to entertain', 'to persuade', 'to describe a character'], 0, 'Recipes tell you how to do something.'),
              mc('What is the purpose of an advertisement?', ['to persuade', 'to instruct', 'to entertain only', 'to explain science'], 0, 'Ads try to convince you to buy or do something.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
    ],
  });
})();
