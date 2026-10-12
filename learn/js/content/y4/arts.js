/* Year 4 The Arts — Australian Curriculum v9.0: Visual Arts, Music, Drama, Dance, Media Arts */
(function () {
  const { mc, tf, write } = LA.Q;

  LA.addSubject(4, {
    id: 'arts',
    intro: 'Colour theory, form and space, music notation and ensembles, drama scripts and dance choreography, and media messages.',
    chapters: [
      {
        id: 'visual', term: 1, strand: 'Visual Arts',
        title: 'Visual arts: colour, space and artists',
        summary: 'Tints, shades and complementary colours, foreground and background, and responding to artworks.',
        lessons: [
          {
            id: 'colour', title: 'Colour theory', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Primary colours:** red, yellow, blue\n- **Secondary colours:** orange, green, purple (mix two primaries)\n- **Complementary colours** sit **opposite** on the colour wheel: red–green, blue–orange, yellow–purple. Side by side, they make each other look brighter!\n- A **tint** is a colour mixed with **white** (lighter): red + white = pink\n- A **shade** is a colour mixed with **black** (darker): blue + black = navy\n- **Monochromatic** artwork uses tints and shades of just one colour` },
              { type: 'activity', text: 'Choose one colour. Paint a strip of 5 squares from its lightest tint to its darkest shade.' },
            ],
            practice: [
              mc('What is the complementary colour of blue?', ['orange', 'green', 'purple', 'red'], 0, 'Blue and orange are opposite on the colour wheel.'),
              mc('Adding white to a colour makes a…', ['tint', 'shade', 'primary colour', 'complementary colour'], 0, 'Tints are lighter.'),
              mc('Adding black to a colour makes a…', ['shade', 'tint', 'secondary colour', 'warm colour'], 0, 'Shades are darker.'),
              mc('Which pair are complementary colours?', ['red and green', 'red and orange', 'blue and purple', 'yellow and orange'], 0, 'Red and green are opposite each other.'),
            ],
          },
          {
            id: 'space-respond', title: 'Space, perspective and responding to art', minutes: 12,
            blocks: [
              { type: 'read', text: `Artists create a feeling of **space** (depth):\n- **Foreground** (front) — objects are larger and more detailed\n- **Middle ground**\n- **Background** (back) — objects are smaller, paler and less detailed\n- **Overlapping** shapes shows what is in front\n\nWhen **responding** to art, use the **See–Think–Wonder** routine:\n- What do I **see**? (lines, colours, shapes, subject)\n- What do I **think** is happening or what does it mean?\n- What do I **wonder**? (questions for the artist)\n\nAustralian artists to explore include **Albert Namatjira** (Arrernte artist known for watercolour landscapes of Central Australia), **Emily Kame Kngwarreye** and **Margaret Preston**.` },
            ],
            practice: [
              mc('In a landscape painting, faraway mountains are usually painted…', ['smaller and paler', 'larger and brighter', 'in the foreground', 'with lots of detail'], 0, 'Distant objects look smaller and fainter.'),
              mc('The part of a picture that seems closest to you is the…', ['foreground', 'background', 'horizon', 'frame'], 0, 'The foreground is at the front.'),
              mc('Albert Namatjira is famous for…', ['watercolour landscapes of Central Australia', 'building bridges', 'writing music', 'acting in films'], 0, 'Namatjira was an Arrernte artist known for his watercolours.'),
              write('Use See–Think–Wonder to respond to an artwork you like (from a book, gallery or online with an adult).', ['What you see', 'What you think it means', 'A question you wonder about'], 30),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'music', term: 2, strand: 'Music',
        title: 'Music: notation, instruments and ensembles',
        summary: 'Read simple rhythm notation, explore instrument families, and understand how music is structured.',
        lessons: [
          {
            id: 'notation', title: 'Reading rhythm', minutes: 12,
            blocks: [
              { type: 'read', text: `Music is written with **notes**. Each note shows **how long** to play:\n- **Crotchet** (quarter note) — **1 beat** — say "ta"\n- **Quavers** (two eighth notes, joined) — **½ beat each** — say "ti-ti"\n- **Minim** (half note) — **2 beats** — say "ta-a"\n- **Semibreve** (whole note) — **4 beats**\n- A **rest** means silence\n\nMusic is grouped into **bars** separated by bar lines. In **4/4 time** there are **4 beats in every bar**.` },
              { type: 'activity', text: 'Clap this pattern: ta ta ti-ti ta | ta-a ta ta | ti-ti ti-ti ta ta | semibreve (hold for 4). Count 1-2-3-4 for each bar.' },
            ],
            practice: [
              mc('How many beats is a crotchet (quarter note)?', ['1', '2', '4', '½'], 0, 'A crotchet is one beat — "ta".'),
              mc('How many beats is a minim (half note)?', ['2', '1', '4', '3'], 0, 'A minim lasts 2 beats.'),
              mc('In 4/4 time, how many beats are in each bar?', ['4', '3', '2', '1'], 0, 'The top 4 means 4 beats per bar.'),
              mc('What does a rest mean in music?', ['silence', 'play loudly', 'play fast', 'stop the song forever'], 0, 'A rest is a moment of silence.'),
              mc('How many quavers make one beat?', ['2', '1', '4', '3'], 0, 'Two quavers (ti-ti) fit in one beat.'),
            ],
          },
          {
            id: 'instruments', title: 'Instrument families and structure', minutes: 12,
            blocks: [
              { type: 'read', text: `Instruments in an orchestra are grouped into **families**:\n- **Strings** — violin, viola, cello, double bass (bowed or plucked strings)\n- **Woodwind** — flute, clarinet, oboe, bassoon (blow air)\n- **Brass** — trumpet, trombone, French horn, tuba (buzz lips)\n- **Percussion** — drums, xylophone, cymbals (hit, shake or scrape)\n\nMusic has **structure**: a song may have **verses** and a **chorus** that repeats. **Ostinato** is a short pattern repeated over and over.\n\nAn **ensemble** is a group of musicians performing together.` },
            ],
            practice: [
              mc('Which family does the trumpet belong to?', ['brass', 'strings', 'woodwind', 'percussion'], 0, 'Trumpets are played by buzzing lips into a mouthpiece.'),
              mc('Which instrument is in the string family?', ['cello', 'flute', 'drum', 'tuba'], 0, 'The cello has strings played with a bow.'),
              mc('A short pattern repeated over and over is called an…', ['ostinato', 'orchestra', 'opera', 'octave'], 0, 'Ostinato means a repeated pattern.'),
              mc('The part of a song that repeats with the same words is usually the…', ['chorus', 'verse', 'introduction', 'bridge'], 0, 'The chorus repeats.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'drama-dance', term: 3, strand: 'Drama and Dance',
        title: 'Drama scripts and dance choreography',
        summary: 'Read and perform scripts with tension and character, and choreograph dances with structure.',
        lessons: [
          {
            id: 'scripts', title: 'Scripts and tension in drama', minutes: 12,
            blocks: [
              { type: 'read', text: `A **script** is the written form of a play. It includes:\n- **character names** before their lines (no quotation marks!)\n- **stage directions** in brackets or italics telling actors what to do: *(whispering)*, *(walks to the door)*\n\nDrama uses **tension** to keep the audience interested — a problem, a secret, a deadline, a mystery.\n\n*MIA: (looking around nervously) Did you hear that?*\n*JACK: Hear what?*\n*MIA: That scratching… under the floor.*` },
              { type: 'activity', text: 'Write a 6-line script between two characters who find a mysterious box. Perform it with someone at home, using stage directions.' },
            ],
            practice: [
              mc('In a script, what do stage directions tell actors?', ['what to do and how to say lines', 'the title of the play', 'the price of tickets', 'who wrote it'], 0, 'Stage directions guide actions and voice.'),
              tf('Scripts use quotation marks around what characters say.', false, 'Scripts put the character’s name first, then the line — no quotation marks.'),
              mc('Which creates tension in drama?', ['a mysterious noise and a ticking clock', 'everyone sitting calmly', 'a long list of facts', 'the lights being on'], 0, 'Mystery and deadlines build tension.'),
            ],
          },
          {
            id: 'choreography', title: 'Choreographing a dance', minutes: 12,
            blocks: [
              { type: 'read', text: `**Choreography** is planning and putting dance movements together.\n\nChoreographers use:\n- **Motifs** — a short movement phrase that repeats and changes\n- **Unison** — everyone moving the same at the same time\n- **Canon** — dancers do the same movement one after another (like a Mexican wave)\n- **Structure** — beginning, middle, end (or ABA)\n- the elements: **body, energy, space, time, relationships**` },
              { type: 'activity', text: 'Create a 16-count dance motif inspired by the water cycle (evaporating, forming clouds, raining). Perform it in unison with family, then try it in canon!' },
            ],
            practice: [
              mc('Dancers doing the same move one after another is called…', ['canon', 'unison', 'freeze', 'solo'], 0, 'Canon is like a ripple or Mexican wave.'),
              mc('Everyone moving together at the same time is…', ['unison', 'canon', 'contrast', 'a solo'], 0, 'Unison means together.'),
              mc('A short movement phrase that repeats is a…', ['motif', 'script', 'costume', 'rhythm only'], 0, 'Motifs can be repeated and changed.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'media', term: 4, strand: 'Media Arts',
        title: 'Media arts: audience and messages',
        summary: 'How media is made for an audience and purpose, camera angles, and creating a short media work.',
        lessons: [
          {
            id: 'angles', title: 'Camera angles, audience and purpose', minutes: 12,
            blocks: [
              { type: 'read', text: `**Camera angles** change how we feel about a subject:\n- **Low angle** (camera looks up) — subject looks **big and powerful**\n- **High angle** (camera looks down) — subject looks **small or weak**\n- **Eye level** — feels **normal and equal**\n\nEvery media text has an **audience** (who it's for) and a **purpose** (to entertain, inform or persuade).\n\nMedia creators must respect **copyright** — only use music and images you have permission to use — and ask permission before filming people.` },
              { type: 'activity', text: 'Photograph a toy from a low angle, a high angle and eye level. How does it look different in each?' },
            ],
            practice: [
              mc('Which angle makes a character look powerful?', ['low angle (looking up)', 'high angle (looking down)', 'eye level', 'close-up of feet'], 0, 'Looking up makes things seem big and powerful.'),
              mc('A cartoon for young children has which audience?', ['young children', 'business people', 'grandparents only', 'scientists'], 0, 'It is made for young children.'),
              mc('Before filming a friend, you should…', ['ask their permission', 'film secretly', 'post it straight away', 'not tell anyone'], 0, 'Always ask permission before filming people.'),
              write('Plan a 30-second video advertising a school event. Describe the audience, purpose, three shots (with angles) and music or sounds.', ['Audience', 'Purpose', 'Three shots with angles', 'Sound or music'], 40),
            ],
          },
        ],
        quiz: { n: 4, items: [
          mc('Which angle makes a character look small or weak?', ['high angle (looking down)', 'low angle (looking up)', 'eye level', 'a long shot'], 0, 'Looking down on a subject makes it seem small.'),
          mc('Why must media creators think about copyright?', ['They should only use music and images they have permission to use', 'So their video is longer', 'Copyright makes colours brighter', 'It doesn’t matter'], 0, 'Copyright protects other creators’ work.'),
        ] },
      },
    ],
  });
})();
