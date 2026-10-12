/* Year 3 Science — Australian Curriculum v9.0 (Science understanding AC9S3U01–U04, Science as a human endeavour, Science inquiry) */
(function () {
  const { mc, tf, inp, write } = LA.Q;

  LA.addSubject(3, {
    id: 'science',
    intro: 'Living things and life cycles, soils and rocks, heat, solids and liquids, and how scientists investigate.',
    chapters: [
      {
        id: 'living', term: 1, strand: 'Biological sciences', code: 'AC9S3U01',
        title: 'Living and non-living things',
        summary: 'What makes something alive? Compare living, non-living and once-living things.',
        lessons: [
          {
            id: 'signs-of-life', title: 'What makes something alive?', minutes: 12,
            blocks: [
              { type: 'read', text: `All **living things** do these things:\n- **Move** (even plants move slowly towards light)\n- **Breathe** / exchange gases\n- **Need food** (energy) and **water**\n- **Grow** and change\n- **Reproduce** (make more of their own kind)\n- **Respond** to things around them\n- **Get rid of waste**\n\n**Non-living** things (like rocks, water and plastic) do not do all of these. **Once-living** (dead) things used to be alive — like a fallen leaf, a wooden chair or a feather.` },
              { type: 'tip', text: 'Fire moves and grows, but it is NOT alive — it doesn’t reproduce like living things or grow from food in the same way. A thing must do ALL of the signs of life.' },
              { type: 'vocab', words: [['reproduce', 'make more of their own kind (babies, seeds, eggs)'], ['respond', 'react to something, like a plant turning towards the sun'], ['once-living', 'something that was alive but is not anymore']] },
            ],
            practice: [
              mc('Which of these is living?', ['a gum tree', 'a rock', 'a plastic bottle', 'a cloud'], 0, 'A gum tree grows, needs water and food (made from sunlight), and makes seeds.'),
              mc('Which of these is once-living?', ['a wooden spoon', 'a koala', 'a pebble', 'glass'], 0, 'Wood comes from a tree that was once alive.'),
              tf('A car is alive because it moves and needs fuel.', false, 'A car does not grow, reproduce or respond like living things.'),
              mc('Which is NOT a sign of life?', ['being shiny', 'growing', 'reproducing', 'needing water'], 0, 'Being shiny has nothing to do with being alive.'),
              mc('A sunflower turning to face the sun shows that living things…', ['respond', 'are shiny', 'are heavy', 'are hard'], 0, 'Responding to light is a sign of life.'),
            ],
          },
          {
            id: 'sorting', title: 'Sorting and grouping living things', minutes: 12,
            blocks: [
              { type: 'read', text: `Scientists **classify** (group) living things by their features.\n\n**Animals** with a backbone (vertebrates): mammals, birds, reptiles, amphibians, fish.\n- **Mammals** have fur or hair and feed babies milk (kangaroo, human, platypus)\n- **Birds** have feathers and lay eggs (emu, cockatoo)\n- **Reptiles** have dry scales (goanna, crocodile)\n- **Amphibians** have moist skin, live on land and in water (frogs)\n- **Fish** have gills and fins (barramundi)\n\n**Plants** make their own food using sunlight.` },
            ],
            practice: [
              mc('Which animal is a mammal?', ['kangaroo', 'emu', 'goanna', 'frog'], 0, 'Kangaroos have fur and feed their joeys milk.'),
              mc('Which group has feathers?', ['birds', 'reptiles', 'fish', 'mammals'], 0, 'Only birds have feathers.'),
              mc('A frog is an…', ['amphibian', 'reptile', 'mammal', 'insect'], 0, 'Frogs have moist skin and live in water and on land.'),
              mc('What do plants need to make their own food?', ['sunlight', 'meat', 'sand only', 'darkness'], 0, 'Plants use sunlight, water and air to make food.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'life-cycles', term: 1, strand: 'Biological sciences', code: 'AC9S3U01',
        title: 'Life cycles of plants and animals',
        summary: 'Compare how plants and animals are born, grow, reproduce and die.',
        lessons: [
          {
            id: 'animal-cycles', title: 'Animal life cycles', minutes: 12,
            blocks: [
              { type: 'read', text: `A **life cycle** shows the stages of life from birth to adult, and back again.\n\n**Frog:** egg (spawn) → tadpole → froglet → adult frog\n**Butterfly:** egg → caterpillar (larva) → chrysalis (pupa) → butterfly\n**Chicken:** egg → chick → adult chicken\n**Kangaroo:** tiny joey born → grows in mother's pouch → young joey → adult\n\nSome animals change shape completely (**metamorphosis**) like frogs and butterflies. Others look like small adults as they grow, like kangaroos.` },
              { type: 'vocab', words: [['life cycle', 'the stages a living thing goes through in its life'], ['metamorphosis', 'a big change in body shape as an animal grows'], ['larva', 'the young worm-like stage of an insect (a caterpillar)'], ['pupa', 'the resting stage where an insect changes (a chrysalis)']] },
            ],
            practice: [
              mc('What comes after the egg in a frog’s life cycle?', ['tadpole', 'froglet', 'adult frog', 'caterpillar'], 0, 'Frog eggs hatch into tadpoles.'),
              mc('What is a caterpillar?', ['the larva of a butterfly', 'an adult butterfly', 'a type of worm', 'a baby bird'], 0, 'The caterpillar is the larva stage.'),
              mc('Where does a newborn kangaroo grow?', ['in its mother’s pouch', 'in an egg', 'in a nest', 'underwater'], 0, 'Kangaroos are marsupials — joeys grow in the pouch.'),
              tf('A butterfly goes through metamorphosis.', true, 'It changes shape completely: caterpillar → chrysalis → butterfly.'),
            ],
          },
          {
            id: 'plant-cycles', title: 'Plant life cycles', minutes: 12,
            blocks: [
              { type: 'read', text: `**Flowering plant life cycle:** seed → seedling (sprouts) → adult plant → flower → fruit with seeds → new seeds\n\n- A seed needs **water**, **warmth** and **air** to start growing (germinate).\n- **Flowers** are **pollinated** by bees, birds, bats or wind.\n- **Seeds** are spread by wind, water and animals.\n\nSome Australian plants, like some banksias and eucalypts, need **fire** or heat to open their seed pods!` },
              { type: 'activity', text: 'Grow a bean seed in a clear cup with wet paper towel. Draw it every 2 days. Label the root, shoot and leaves.' },
            ],
            practice: [
              mc('What does a seed need to start growing?', ['water, warmth and air', 'only darkness', 'salt water', 'nothing'], 0, 'Seeds germinate with water, warmth and air.'),
              mc('Put these in order: seed, flower, seedling, adult plant', ['seed, seedling, adult plant, flower', 'flower, seed, adult plant, seedling', 'seedling, seed, flower, adult plant', 'adult plant, flower, seedling, seed'], 0, 'A seed sprouts into a seedling, grows into an adult plant, which makes flowers.'),
              mc('How are many flowers pollinated?', ['by bees and birds', 'by rocks', 'by snow', 'by cars'], 0, 'Animals like bees and birds carry pollen from flower to flower.'),
              mc('How are plant and animal life cycles alike?', ['Both are born/start small, grow, reproduce and die', 'Both lay eggs', 'Both make food from sunlight', 'Both have fur'], 0, 'All living things grow, reproduce and eventually die.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'earth-materials', term: 2, strand: 'Earth and space sciences', code: 'AC9S3U02',
        title: 'Soils, rocks and minerals',
        summary: 'Compare the properties of soils, rocks and minerals and why they are important resources.',
        lessons: [
          {
            id: 'rocks-minerals', title: 'Rocks and minerals', minutes: 12,
            blocks: [
              { type: 'read', text: `**Rocks** are made of one or more **minerals**. We describe rocks by their **properties**:\n- **colour** · **texture** (rough/smooth) · **hardness** · **layers** · **crystals** · **lustre** (shiny or dull)\n\nThree main types of rock:\n- **Igneous** — formed when hot melted rock (lava/magma) cools, e.g. granite, basalt\n- **Sedimentary** — formed from layers of sand, mud and shells pressed together, e.g. sandstone (Uluru is made of a sandstone called arkose)\n- **Metamorphic** — rocks changed by heat and pressure, e.g. marble, slate` },
              { type: 'read', title: 'Rocks and minerals as resources', text: 'We use rocks and minerals every day: **gold** and **opal** for jewellery, **iron ore** to make steel, **clay** for bricks, **sandstone** for buildings and **sand** for glass. Australia mines lots of iron ore, gold and coal.\n\nFor tens of thousands of years, First Nations Australians have used **ochre** (coloured earth minerals) for painting and ceremony, and stones for making tools and grinding seeds.' },
            ],
            practice: [
              mc('Which word describes how a rock feels?', ['texture', 'colour', 'smell', 'weight'], 0, 'Texture is how something feels — rough, smooth or bumpy.'),
              mc('Sandstone is a ___ rock.', ['sedimentary', 'igneous', 'metamorphic', 'liquid'], 0, 'Sandstone forms from layers of sand pressed together.'),
              mc('Which rock forms from cooled lava?', ['basalt', 'sandstone', 'marble', 'chalk'], 0, 'Basalt is an igneous rock made from cooled lava.'),
              mc('What have First Nations Australians used ochre for?', ['painting and ceremony', 'making plastic', 'fuel for cars', 'making glass'], 0, 'Ochre is a coloured mineral pigment used in art and ceremony.'),
              mc('Glass is made from…', ['sand', 'wood', 'iron', 'clay'], 0, 'Glass is made by melting sand at a very high temperature.'),
            ],
          },
          {
            id: 'soils', title: 'Soils', minutes: 12,
            blocks: [
              { type: 'read', text: `**Soil** is a mixture of tiny bits of broken rock, **humus** (rotting plants and animals), water, air and living things like worms.\n\nSoil types:\n- **Sandy soil** — gritty, big grains, water drains through quickly\n- **Clay soil** — sticky when wet, tiny grains, holds lots of water\n- **Loam** — a mix of sand, clay and humus — best for growing plants\n\nSoil is a precious resource: it grows our food, filters water, and is home to many living things.` },
              { type: 'activity', text: 'Fill two cups with sandy soil and potting mix. Pour the same amount of water into each (with holes in the bottom). Which drains faster?' },
            ],
            practice: [
              mc('Which soil holds the most water?', ['clay', 'sand', 'gravel', 'pebbles'], 0, 'Clay has tiny grains packed tightly, so it holds water.'),
              mc('What is humus?', ['rotting plant and animal material in soil', 'a type of rock', 'a dip for crackers', 'a mineral'], 0, 'Humus adds nutrients to soil.'),
              mc('Why is soil important?', ['It helps grow our food', 'It makes electricity', 'It is used for clothes only', 'It is not important'], 0, 'Plants grow in soil, and we eat plants and animals that eat plants.'),
              tf('Water drains quickly through sandy soil.', true, 'Sandy soil has large grains with big gaps between them.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'heat', term: 3, strand: 'Physical sciences', code: 'AC9S3U03',
        title: 'Heat energy',
        summary: 'Sources of heat and how temperature changes when heat moves from one object to another.',
        lessons: [
          {
            id: 'heat-sources', title: 'Sources of heat', minutes: 10,
            blocks: [
              { type: 'read', text: `**Heat** is a form of energy. **Heat sources** give off heat:\n- The **Sun** (our biggest heat source)\n- **Fire** (campfires, candles, gas stoves)\n- **Electricity** (heaters, ovens, toasters)\n- **Friction** — rub your hands together quickly!\n- **Our bodies** make heat too\n\nWe measure how hot or cold something is with a **thermometer**, in **degrees Celsius (°C)**. Water freezes at 0 °C and boils at 100 °C.` },
            ],
            practice: [
              mc('What is our biggest source of heat?', ['the Sun', 'the Moon', 'a fridge', 'ice'], 0, 'The Sun heats the whole Earth.'),
              mc('What do we use to measure temperature?', ['a thermometer', 'a ruler', 'scales', 'a clock'], 0, 'A thermometer measures temperature in °C.'),
              mc('Rubbing your hands together makes heat by…', ['friction', 'melting', 'freezing', 'magnetism'], 0, 'Friction between surfaces produces heat.'),
              mc('At what temperature does water boil?', ['100 °C', '0 °C', '50 °C', '10 °C'], 0, 'Water boils at 100 °C.'),
            ],
          },
          {
            id: 'heat-transfer', title: 'How heat moves', minutes: 12,
            blocks: [
              { type: 'read', text: `Heat always moves from **hotter** things to **colder** things.\n- A hot drink cools down as heat moves into the air.\n- An ice block melts in your hand because heat moves from your hand to the ice.\n\n**Conductors** let heat move through them easily (metal). That's why a metal spoon in hot soup gets hot!\n**Insulators** slow heat down (wood, plastic, wool, air). Pot handles are often plastic or wood so we don't get burnt.` },
              { type: 'tip', text: 'Stay safe: never touch hot things without an adult. Use oven mitts — they are insulators!' },
            ],
            practice: [
              mc('Heat moves from…', ['hot things to cold things', 'cold things to hot things', 'nowhere', 'up only'], 0, 'Heat always flows from hotter to colder.'),
              mc('Which material is a good heat conductor?', ['metal', 'wood', 'wool', 'plastic'], 0, 'Metals let heat pass through easily.'),
              mc('Why do saucepans have plastic handles?', ['Plastic is an insulator so the handle stays cool', 'Plastic is heavy', 'Plastic conducts heat', 'It looks nice'], 0, 'Insulators slow down heat, keeping the handle cooler.'),
              mc('A cup of hot chocolate is left on the table. What happens?', ['It cools down to room temperature', 'It gets hotter', 'It freezes', 'Nothing'], 0, 'Heat moves from the drink into the cooler air.'),
              tf('A woollen jumper keeps you warm because wool is an insulator.', true, 'Wool traps air and slows down heat leaving your body.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'states', term: 3, strand: 'Chemical sciences', code: 'AC9S3U04',
        title: 'Solids, liquids and changes of state',
        summary: 'Properties of solids and liquids, and how heating or cooling changes their state.',
        lessons: [
          {
            id: 'solids-liquids', title: 'Solids and liquids', minutes: 12,
            blocks: [
              { type: 'read', text: `Everything is made of **matter**. Two states of matter are:\n\n**Solids**\n- keep their own **shape**\n- can be held, cut or stacked\n- e.g. ice, wood, rock, a pencil\n\n**Liquids**\n- **flow** and can be poured\n- take the shape of their **container**\n- e.g. water, milk, honey, oil\n\n(**Gases** like air and steam spread out to fill any space.)` },
            ],
            practice: [
              mc('Which is a liquid?', ['milk', 'ice', 'a brick', 'sand'], 0, 'Milk flows and takes the shape of its container.'),
              mc('Which is a property of a solid?', ['It keeps its shape', 'It can be poured', 'It fills any container', 'It always flows'], 0, 'Solids hold their shape.'),
              mc('Sand can be poured, but it is a solid. Why?', ['Each grain keeps its own shape', 'It is wet', 'It is a gas', 'It flows like water'], 0, 'Each tiny grain is a solid with its own shape.'),
              tf('Honey is a liquid.', true, 'Honey flows (slowly!) and takes the shape of its container.'),
            ],
          },
          {
            id: 'change-state', title: 'Melting and freezing', minutes: 12,
            blocks: [
              { type: 'read', text: `Adding or removing **heat** can change a material's state.\n- **Melting:** solid → liquid when **heated** (ice → water, chocolate melting in the sun)\n- **Freezing (solidifying):** liquid → solid when **cooled** (water → ice in the freezer)\n- **Evaporating:** liquid → gas when heated (puddles drying up)\n- **Condensing:** gas → liquid when cooled (water drops on a cold glass)\n\nMany changes can be **reversed**: melt chocolate, then let it cool and it becomes solid again!` },
              { type: 'activity', text: 'With an adult: put an ice cube, a square of chocolate and a small piece of butter on plates in the sun. Predict which melts first, then check every 5 minutes.' },
            ],
            practice: [
              mc('What happens when you heat ice?', ['It melts into water', 'It gets harder', 'It turns into rock', 'Nothing'], 0, 'Heat changes ice (solid) into water (liquid).'),
              mc('Turning a liquid into a solid by cooling is called…', ['freezing', 'melting', 'boiling', 'pouring'], 0, 'Freezing turns liquid into solid.'),
              mc('Where does the water in a puddle go on a sunny day?', ['It evaporates into the air', 'It sinks into rock', 'It freezes', 'It turns into sand'], 0, 'Heat from the sun makes the water evaporate.'),
              mc('Which change can be reversed?', ['melting chocolate', 'baking a cake', 'burning wood', 'cooking an egg'], 0, 'Melted chocolate can be cooled to become solid again.'),
              mc('Water drops form on the outside of a cold drink. This is…', ['condensation', 'melting', 'evaporation', 'freezing'], 0, 'Water vapour in the air cools on the cold glass and condenses into drops.'),
            ],
          },
        ],
        quiz: { n: 9 },
      },
      {
        id: 'inquiry', term: 4, strand: 'Science inquiry',
        title: 'Thinking like a scientist',
        summary: 'Ask questions, predict, plan fair tests, observe, measure, record and share results.',
        lessons: [
          {
            id: 'fair-test', title: 'Questions, predictions and fair tests', minutes: 12,
            blocks: [
              { type: 'read', text: `Scientists investigate questions in steps:\n1. **Question** — What do I want to find out?\n2. **Predict** — What do I think will happen, and why?\n3. **Plan a fair test** — change only **one thing** and keep everything else the **same**\n4. **Observe and measure** — use your senses and tools\n5. **Record** — tables, drawings, graphs\n6. **Conclude** — what did I find out? Was my prediction right?\n\nExample: *Which material keeps ice frozen longest?* Change only the wrapping material. Keep the ice size, place and time the same.` },
            ],
            practice: [
              mc('In a fair test, how many things should you change?', ['only one', 'two', 'everything', 'none'], 0, 'Change one thing so you know what caused the result.'),
              mc('A prediction is…', ['what you think will happen', 'what happened', 'a measurement', 'a table'], 0, 'A prediction is your best guess before you test.'),
              mc('You test which ball bounces highest. What should stay the same?', ['the height you drop each ball from', 'the type of ball', 'nothing', 'the colour of the ball'], 0, 'Drop every ball from the same height so the test is fair.'),
              mc('Which is the best way to record results of a test?', ['a table', 'a song', 'just remember them', 'a guess'], 0, 'Tables organise results clearly.'),
            ],
          },
          {
            id: 'scientists', title: 'Science in our lives', minutes: 12,
            blocks: [
              { type: 'read', text: `Science knowledge helps us every day — from cooking to building houses to keeping our planet healthy.\n\n**First Nations Australians** have built deep scientific knowledge over more than 60,000 years: observing seasons, animal behaviour and the stars; using fire carefully to care for Country; and knowing which plants are safe to eat or use as medicine.\n\nScientists **share** results so others can check and learn from them. Science ideas can change when new evidence is found.` },
            ],
            practice: [
              mc('How have First Nations Australians used science knowledge?', ['Observing seasons and using fire to care for Country', 'Building rockets', 'Inventing plastic', 'Making video games'], 0, 'Careful observation over thousands of years built deep knowledge of Country and seasons.'),
              tf('Science ideas can change when scientists find new evidence.', true, 'Good scientists change their ideas when evidence shows something new.'),
              mc('Why do scientists share their results?', ['So others can check and learn from them', 'To keep them secret', 'To win prizes only', 'They don’t share'], 0, 'Sharing lets others repeat tests and build on ideas.'),
              write('Plan a fair test: "Which paper towel soaks up the most water?" Write your question, prediction, what you will change, what you will keep the same, and how you will measure.', ['A question', 'A prediction', 'The ONE thing you will change', 'Things you will keep the same', 'How you will measure'], 40),
            ],
          },
        ],
        quiz: { n: 7 },
      },
    ],
  });
})();
