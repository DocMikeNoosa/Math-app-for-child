/* Year 3 The Arts — Australian Curriculum v9.0: Visual Arts, Music, Drama, Dance, Media Arts */
(function () {
  const { mc, tf, write } = LA.Q;

  LA.addSubject(3, {
    id: 'arts',
    intro: 'Visual arts, music, drama, dance and media arts — making, responding and exploring art from many cultures.',
    chapters: [
      {
        id: 'visual', term: 1, strand: 'Visual Arts',
        title: 'Visual arts: the elements of art',
        summary: 'Line, shape, colour, texture and pattern — and art from First Nations Australians and other cultures.',
        lessons: [
          {
            id: 'elements', title: 'Line, shape, colour and texture', minutes: 12,
            blocks: [
              { type: 'read', text: `Artists use the **elements of art**:\n- **Line** — straight, curved, zigzag, thick, thin, dotted\n- **Shape** — geometric (circles, squares) or organic (leaf and cloud shapes)\n- **Colour** — the **primary colours** are **red, yellow and blue**. Mixing two primaries makes a **secondary colour**: red + yellow = **orange**, yellow + blue = **green**, blue + red = **purple**\n- **Texture** — how something feels or looks like it feels (rough, smooth, fluffy)\n- **Pattern** — repeated lines, shapes or colours\n\n**Warm colours** (red, orange, yellow) feel hot and exciting. **Cool colours** (blue, green, purple) feel calm.` },
              { type: 'activity', text: 'Make a colour wheel: paint or colour the three primary colours, then mix them to make the three secondary colours in between.' },
            ],
            practice: [
              mc('Which are the three primary colours?', ['red, yellow and blue', 'red, green and orange', 'black, white and grey', 'purple, green and orange'], 0, 'Red, yellow and blue cannot be made by mixing other colours.'),
              mc('What colour do you get by mixing blue and yellow?', ['green', 'purple', 'orange', 'brown'], 0, 'Blue + yellow = green.'),
              mc('Which is a warm colour?', ['orange', 'blue', 'green', 'purple'], 0, 'Orange reminds us of fire and sunshine.'),
              mc('What does "texture" mean in art?', ['how something feels or looks like it feels', 'the size of a painting', 'the colour blue', 'the name of an artist'], 0, 'Texture is about surface — rough, smooth, bumpy.'),
              mc('Red + blue makes…', ['purple', 'green', 'orange', 'yellow'], 0, 'Red and blue mix to make purple.'),
            ],
          },
          {
            id: 'first-nations-art', title: 'Art from First Nations Australians and around the world', minutes: 12,
            blocks: [
              { type: 'read', text: `First Nations Australians have created art for tens of thousands of years — among the oldest continuing art traditions on Earth. Art forms include **rock art**, **bark painting**, **carving**, **weaving** and **body painting**, and in the Central and Western Desert, **dot painting** on canvas since the 1970s.\n\nArtworks often share stories about **Country**, ancestors, animals and important knowledge. Some designs and stories belong to particular families or communities, so it's important to be **respectful** and not copy sacred symbols.\n\nArt is made all around the world: Chinese ink painting, Indonesian batik, Pacific Island tapa cloth and European oil paintings.` },
            ],
            practice: [
              mc('Which is a traditional First Nations art form?', ['bark painting', 'comic books', 'video games', 'graffiti on trains'], 0, 'Bark painting has been practised for a very long time, especially in Arnhem Land.'),
              tf('Some First Nations designs belong to particular communities and should not be copied.', true, 'Being respectful means not copying sacred or owned designs.'),
              mc('What do many First Nations artworks share?', ['stories about Country and culture', 'shopping lists', 'football scores', 'adverts'], 0, 'Art is a way of passing on knowledge and stories.'),
              write('Look at an artwork (in a book, gallery or online with an adult). Describe the lines, shapes and colours you see, and how the artwork makes you feel.', ['Mentions lines or shapes', 'Mentions colours', 'Says how it makes you feel'], 25),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'music', term: 2, strand: 'Music',
        title: 'Music: beat, rhythm and pitch',
        summary: 'Keep a steady beat, clap rhythms, and explore pitch, dynamics and tempo.',
        lessons: [
          {
            id: 'beat-rhythm', title: 'Beat and rhythm', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Beat** is the steady pulse of music — like a heartbeat. You tap your foot to it.\n- **Rhythm** is the pattern of long and short sounds — often the pattern of the words.\n\nSay "**Kook-a-bur-ra sits**" and clap each syllable — that's the **rhythm**. Now tap your knee evenly while you say it — that's the **beat**.\n\nIn music, a **ta** is one beat long and **ti-ti** is two half beats.` },
              { type: 'activity', text: 'Clap the rhythm of your name, then of these words: "Wom-bat", "Kan-ga-roo", "Ech-id-na". Can you clap them while a grown-up taps a steady beat?' },
            ],
            practice: [
              mc('The steady pulse in music is called the…', ['beat', 'pitch', 'melody', 'volume'], 0, 'The beat is steady like a heartbeat.'),
              mc('The pattern of long and short sounds is called…', ['rhythm', 'beat', 'tempo', 'dynamics'], 0, 'Rhythm is the pattern of sounds.'),
              mc('How many claps are in the rhythm of "kan-ga-roo"?', ['3', '1', '2', '4'], 0, 'Kan-ga-roo has 3 syllables, so 3 claps.'),
            ],
          },
          {
            id: 'pitch-dynamics', title: 'Pitch, dynamics and tempo', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Pitch** — how **high** or **low** a sound is (a bird chirp is high, a tuba is low)\n- **Dynamics** — how **loud** or **soft** (in music, *forte* = loud, *piano* = soft)\n- **Tempo** — how **fast** or **slow** the music is\n- **Melody** — a tune made of different pitches\n\nThe **didgeridoo** (yidaki), from northern Australia, makes a low droning sound. The **clapsticks** keep the beat.` },
            ],
            practice: [
              mc('How high or low a sound is, is called its…', ['pitch', 'tempo', 'rhythm', 'beat'], 0, 'Pitch is high or low.'),
              mc('What does tempo mean?', ['how fast or slow music is', 'how loud music is', 'how high the notes are', 'the words of a song'], 0, 'Tempo is speed.'),
              mc('In music, "forte" means…', ['loud', 'soft', 'fast', 'slow'], 0, 'Forte is Italian for strong/loud.'),
              mc('Which instrument makes a low droning sound and comes from northern Australia?', ['didgeridoo (yidaki)', 'violin', 'flute', 'triangle'], 0, 'The didgeridoo makes a deep drone.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'drama-dance', term: 3, strand: 'Drama and Dance',
        title: 'Drama and dance',
        summary: 'Use voice, movement and role in drama, and body, energy, space and time in dance.',
        lessons: [
          {
            id: 'drama', title: 'Drama: role, voice and movement', minutes: 12,
            blocks: [
              { type: 'read', text: `In **drama** we pretend to be someone else — this is called being **in role**.\n\nActors use:\n- **Voice** — loud/soft, high/low, fast/slow, different accents\n- **Facial expression** — show feelings with your face\n- **Gesture** — hand and arm movements\n- **Movement** — how a character walks and moves\n- **Space** — where you stand on the stage\n\nA **freeze frame** (tableau) is when actors freeze like a photo to show a moment in a story.` },
              { type: 'activity', text: 'Act out how these characters would walk and say "Hello!": a tired old wombat, an excited puppy, a grumpy giant, a shy mouse.' },
            ],
            practice: [
              mc('Pretending to be a character in drama is called being…', ['in role', 'in tempo', 'in pitch', 'in colour'], 0, 'Actors go "in role".'),
              mc('What is a freeze frame?', ['when actors freeze like a photo to show a moment', 'a cold stage', 'a type of dance', 'a costume'], 0, 'A freeze frame captures a moment.'),
              mc('How could you show a character is sad?', ['Slow movements, head down, quiet voice', 'Jumping and shouting', 'Big smile', 'Running fast'], 0, 'Body language shows feelings.'),
            ],
          },
          {
            id: 'dance', title: 'Dance: body, energy, space and time', minutes: 12,
            blocks: [
              { type: 'read', text: `The elements of **dance**:\n- **Body** — what body parts move, body shapes (curled, stretched, twisted)\n- **Energy** — *how* you move: strong, gentle, sharp, smooth, floppy\n- **Space** — levels (high, medium, low), directions (forwards, sideways), pathways\n- **Time** — fast, slow, stillness, moving to the beat\n\nDances tell stories and express feelings. Many cultures have traditional dances — First Nations dances often show animals and stories of Country.` },
              { type: 'activity', text: 'Create a 4-move dance about an Australian animal. Use one high, one low, one fast and one slow movement. Perform it for your family!' },
            ],
            practice: [
              mc('Moving at high, medium or low levels uses which dance element?', ['space', 'energy', 'time', 'colour'], 0, 'Levels are part of space.'),
              mc('Moving in a strong, sharp way is about…', ['energy', 'time', 'space', 'body parts'], 0, 'Energy is how you move.'),
              mc('Freezing still in a dance is part of which element?', ['time', 'energy', 'space', 'pitch'], 0, 'Stillness is about timing.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'media', term: 4, strand: 'Media Arts',
        title: 'Media arts: telling stories with images and sound',
        summary: 'How photos, videos and ads are made to tell stories and send messages.',
        lessons: [
          {
            id: 'media-stories', title: 'Shots, sounds and messages', minutes: 12,
            blocks: [
              { type: 'read', text: `**Media arts** includes photos, films, animations, ads, podcasts and games.\n\nCamera **shots**:\n- **Long shot** — shows the whole scene and setting\n- **Medium shot** — shows a person from the waist up\n- **Close-up** — shows a face or object up close to show feelings or detail\n\n**Sound** changes the mood: spooky music makes a scene scary; happy music makes it fun.\n\n**Advertisements** are made to make you want something. Ask: *Who made this? What do they want me to think or buy?*` },
              { type: 'activity', text: 'With an adult’s phone or tablet, take three photos of a toy: a long shot, a medium shot and a close-up. Which one shows the most feeling?' },
            ],
            practice: [
              mc('Which shot shows a character’s feelings most clearly?', ['close-up', 'long shot', 'aerial shot', 'wide shot'], 0, 'A close-up shows facial expressions in detail.'),
              mc('Why do ads use bright colours and catchy music?', ['to make you want the product', 'to teach maths', 'to make you sleepy', 'for no reason'], 0, 'Ads are designed to persuade.'),
              mc('What can spooky music do in a film?', ['make a scene feel scary', 'make it funnier', 'change the colours', 'stop the film'], 0, 'Sound creates mood.'),
              write('Plan a 4-picture storyboard for a short ad about why kids should drink water. Describe each picture and the words or sounds.', ['4 pictures described', 'A clear message', 'Mentions shots or sounds'], 30),
            ],
          },
        ],
        quiz: { n: 4, items: [
          mc('Which is an example of media arts?', ['an animation', 'a clay pot', 'a ballet', 'a pencil sketch'], 0, 'Animations, films, photos, podcasts and games are media arts.'),
          mc('A long shot is used to show…', ['the whole scene and setting', 'just a person’s eyes', 'only the sound', 'the credits'], 0, 'Long shots show where the action is happening.'),
        ] },
      },
    ],
  });
})();
