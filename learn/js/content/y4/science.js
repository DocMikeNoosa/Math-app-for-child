/* Year 4 Science — Australian Curriculum v9.0 (Science understanding AC9S4U01–U04, Science as a human endeavour, Science inquiry) */
(function () {
  const { mc, tf, inp, write } = LA.Q;

  LA.addSubject(4, {
    id: 'science',
    intro: 'Habitats and food chains, the water cycle, forces (friction, gravity, magnetism), materials and their uses, and scientific investigations.',
    chapters: [
      {
        id: 'habitats', term: 1, strand: 'Biological sciences', code: 'AC9S4U01',
        title: 'Habitats and food chains',
        summary: 'How living things in a habitat depend on each other, and food chains as models of feeding relationships.',
        lessons: [
          {
            id: 'habitats', title: 'Habitats and living together', minutes: 12,
            blocks: [
              { type: 'read', text: `A **habitat** is the place where a living thing lives and gets everything it needs: **food, water, shelter** and space.\n\nAustralian habitats include rainforests, deserts, wetlands, coral reefs, grasslands and eucalypt forests.\n\nLiving things in a habitat **depend on each other**:\n- Animals eat plants or other animals\n- Plants provide shelter (koalas in gum trees, birds in tree hollows)\n- Bees and birds **pollinate** flowers\n- Fungi and worms **break down** dead things and return nutrients to the soil` },
              { type: 'vocab', words: [['habitat', 'the natural home of a living thing'], ['organism', 'any living thing'], ['interdependence', 'living things relying on each other'], ['decomposer', 'a living thing that breaks down dead material, like fungi and worms']] },
            ],
            practice: [
              mc('What does a habitat provide?', ['food, water and shelter', 'only food', 'toys', 'only sunlight'], 0, 'A habitat meets an organism’s needs.'),
              mc('Which animal depends on eucalypt (gum) trees for food and shelter?', ['koala', 'shark', 'camel', 'penguin'], 0, 'Koalas eat gum leaves and live in gum trees.'),
              mc('What do decomposers do?', ['break down dead material and return nutrients to the soil', 'make their own food from sunlight', 'hunt other animals', 'pollinate flowers'], 0, 'Fungi, bacteria and worms are decomposers.'),
              mc('Many Australian birds and possums nest in…', ['tree hollows', 'sand dunes', 'icebergs', 'caves only'], 0, 'Tree hollows take many years to form, which is why old trees matter.'),
            ],
          },
          {
            id: 'food-chains', title: 'Food chains', minutes: 15,
            blocks: [
              { type: 'read', text: `A **food chain** shows **who eats whom** and how **energy** passes from one living thing to the next. The arrows point in the direction energy flows (to the eater).\n\n**Grass → kangaroo → dingo**\n\n- **Producers** make their own food from sunlight — **plants** (grass, gum leaves, algae). Every food chain starts with a producer.\n- **Consumers** eat other living things:\n  - **Herbivores** eat plants (kangaroo, koala)\n  - **Carnivores** eat animals (dingo, wedge-tailed eagle)\n  - **Omnivores** eat both (emu, possum, humans)\n- A **predator** hunts **prey**.\n\nIf one part of a food chain disappears, the others are affected. If foxes eat too many bandicoots, the plants and insects the bandicoots ate also change.` },
              { type: 'example', title: 'Ocean food chain', text: 'Algae (phytoplankton) → krill → whale\nAlgae is the producer; krill and whales are consumers.' },
            ],
            practice: [
              mc('What does every food chain start with?', ['a producer (plant)', 'a carnivore', 'a decomposer', 'a predator'], 0, 'Plants make energy from sunlight.'),
              mc('In "grass → wallaby → dingo", which is the herbivore?', ['wallaby', 'grass', 'dingo', 'none'], 0, 'The wallaby eats grass.'),
              mc('An animal that eats both plants and animals is a…', ['omnivore', 'herbivore', 'carnivore', 'producer'], 0, 'Omnivores eat both.'),
              mc('In a food chain, the arrow means…', ['"is eaten by" — energy moves to the eater', '"is bigger than"', '"lives next to"', '"is friends with"'], 0, 'Arrows show the flow of energy.'),
              mc('In "leaves → caterpillar → magpie", what would happen if all caterpillars disappeared?', ['Magpies would have less food', 'Magpies would have more food', 'Leaves would disappear', 'Nothing'], 0, 'Magpies depend on caterpillars for food.'),
              mc('A wedge-tailed eagle that hunts rabbits is a…', ['predator', 'producer', 'herbivore', 'decomposer'], 0, 'It hunts prey, so it is a predator.'),
            ],
          },
        ],
        quiz: { n: 9 },
      },
      {
        id: 'water-cycle', term: 2, strand: 'Earth and space sciences', code: 'AC9S4U02',
        title: 'The water cycle',
        summary: 'Where water comes from and how it moves between the sky, land and ocean through evaporation, condensation and precipitation.',
        lessons: [
          {
            id: 'cycle', title: 'Evaporation, condensation and precipitation', minutes: 15,
            blocks: [
              { type: 'read', text: `The Earth's water is used again and again in the **water cycle**:\n1. **Evaporation** — the Sun heats water in oceans, lakes and rivers. It turns into an invisible gas called **water vapour** and rises into the air.\n2. **Condensation** — high up, the air is cooler. Water vapour cools and turns into tiny droplets, forming **clouds**.\n3. **Precipitation** — when droplets join and get heavy, they fall as **rain**, **hail**, **sleet** or **snow**.\n4. **Collection** — water flows into rivers, lakes, oceans and soaks into the ground (**groundwater**). Then the cycle starts again!\n\nPlants also release water vapour from their leaves — this is called **transpiration**.` },
              { type: 'visual', svg: '<svg viewBox="0 0 340 170" width="100%" style="max-width:420px" role="img" aria-label="water cycle diagram"><rect x="0" y="130" width="340" height="40" fill="#74c0fc"/><text x="40" y="155" font-size="12" fill="#0b2e4f">ocean / lake</text><path d="M200 130 L250 70 L300 130 Z" fill="#8ce99a"/><circle cx="40" cy="30" r="18" fill="#ffd43b"/><ellipse cx="190" cy="35" rx="45" ry="16" fill="#ced4da"/><text x="160" y="40" font-size="11" fill="#212529">clouds</text><path d="M70 120 C80 90 90 70 140 45" fill="none" stroke="#e8590c" stroke-width="2.5" marker-end="url(#a)"/><text x="62" y="95" font-size="11" fill="currentColor">evaporation ↑</text><text x="150" y="20" font-size="11" fill="currentColor">condensation</text><path d="M215 55 l-6 18 M228 55 l-6 18 M241 55 l-6 18" stroke="#1971c2" stroke-width="2"/><text x="245" y="70" font-size="11" fill="currentColor">precipitation ↓</text><path d="M260 128 C240 140 200 140 180 138" fill="none" stroke="#1971c2" stroke-width="2" marker-end="url(#a)"/><text x="190" y="125" font-size="11" fill="currentColor">collection</text><defs><marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="currentColor"/></marker></defs></svg>' },
              { type: 'vocab', words: [['evaporation', 'liquid water turning into water vapour (gas)'], ['condensation', 'water vapour cooling and turning back into liquid droplets'], ['precipitation', 'water falling from clouds as rain, hail, sleet or snow'], ['transpiration', 'plants releasing water vapour through their leaves']] },
            ],
            practice: [
              mc('What makes water evaporate from the ocean?', ['heat from the Sun', 'the Moon', 'fish', 'wind only'], 0, 'The Sun’s heat turns liquid water into vapour.'),
              mc('Clouds form when water vapour…', ['cools and condenses into droplets', 'heats up', 'turns into rock', 'freezes the ocean'], 0, 'Cooling turns vapour into tiny droplets — condensation.'),
              mc('Rain, hail and snow are all types of…', ['precipitation', 'evaporation', 'condensation', 'transpiration'], 0, 'Precipitation is water falling from clouds.'),
              mc('Put in order: condensation, evaporation, precipitation', ['evaporation, condensation, precipitation', 'precipitation, evaporation, condensation', 'condensation, precipitation, evaporation', 'evaporation, precipitation, condensation'], 0, 'Water evaporates, condenses into clouds, then falls.'),
              tf('The water you drink today may once have been in the ocean.', true, 'Water is recycled over and over in the water cycle.'),
              mc('What is transpiration?', ['plants releasing water vapour from their leaves', 'rain falling', 'rivers flowing to the sea', 'ice melting'], 0, 'Plants "breathe out" water vapour.'),
            ],
          },
          {
            id: 'water-use', title: 'Water in Australia', minutes: 12,
            blocks: [
              { type: 'read', text: `Australia is the **driest inhabited continent**. Water is precious!\n\nWe get water from **dams**, **rivers**, **groundwater** (bores), **rainwater tanks** and in some cities, **desalination plants** that remove salt from seawater.\n\nWays to save water: take shorter showers, turn off the tap while brushing teeth, fix leaks, water gardens in the cool morning, use a rainwater tank.\n\nFirst Nations peoples have long known where to find water in dry country — soaks, rock holes and springs — and passed this knowledge on through stories and songlines.` },
            ],
            practice: [
              mc('Australia is the driest…', ['inhabited continent', 'ocean', 'planet', 'country in Europe'], 0, 'Only Antarctica is drier, and no one lives there permanently.'),
              mc('What does a desalination plant do?', ['removes salt from seawater', 'makes rain', 'grows plants', 'freezes water'], 0, 'It turns seawater into fresh drinking water.'),
              mc('Which is a good way to save water?', ['turn off the tap while brushing your teeth', 'take very long showers', 'hose the driveway', 'leave taps dripping'], 0, 'This can save many litres every day.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'forces', term: 3, strand: 'Physical sciences', code: 'AC9S4U03',
        title: 'Forces: pushes, pulls, friction, gravity and magnetism',
        summary: 'How objects push and pull on each other, and how friction, gravity and magnetism affect motion.',
        lessons: [
          {
            id: 'push-pull', title: 'Pushes and pulls', minutes: 12,
            blocks: [
              { type: 'read', text: `A **force** is a **push** or a **pull**. Forces can:\n- make things **start moving**\n- make things **stop** or **slow down**\n- make things **speed up**\n- **change direction**\n- **change shape** (squashing playdough)\n\n**Contact forces** need objects to touch (kicking a ball, friction).\n**Non-contact forces** work at a distance (**gravity**, **magnetism**).\n\nA bigger force makes a bigger change. Kick a footy gently and it goes a short way; kick hard and it flies!` },
            ],
            practice: [
              mc('A force is a…', ['push or pull', 'type of energy drink', 'colour', 'sound'], 0, 'Forces are pushes or pulls.'),
              mc('Kicking a ball is a…', ['push (contact force)', 'non-contact force', 'magnetic force', 'not a force'], 0, 'Your foot touches and pushes the ball.'),
              mc('Which is a non-contact force?', ['gravity', 'kicking', 'pushing a trolley', 'friction'], 0, 'Gravity pulls without touching.'),
              mc('What can a force NOT do?', ['make an object disappear', 'change an object’s shape', 'make it speed up', 'change its direction'], 0, 'Forces change motion or shape, but can’t make things vanish.'),
            ],
          },
          {
            id: 'friction-gravity', title: 'Friction and gravity', minutes: 15,
            blocks: [
              { type: 'read', text: `**Friction** is a force that **slows things down** when surfaces rub together.\n- Rough surfaces (carpet, gravel) have **more** friction\n- Smooth surfaces (ice, polished floors) have **less** friction\n- Friction is useful: shoe grips, bike brakes, tyres on the road\n- Friction makes **heat** — rub your hands together!\n\n**Gravity** is a pulling force that pulls everything **towards the centre of the Earth**. It's why things fall down and why we don't float away. **Weight** is the pull of gravity on an object.\n\n**Air resistance** is a kind of friction from air — parachutes use it to slow down.` },
              { type: 'activity', text: 'Roll a toy car down a ramp onto different surfaces: carpet, tiles, a towel, foil. Measure how far it goes on each. Which surface has the most friction?' },
            ],
            practice: [
              mc('Which surface has the most friction?', ['sandpaper', 'ice', 'glass', 'a polished floor'], 0, 'Rough surfaces create more friction.'),
              mc('Why do shoes have grips on the soles?', ['to increase friction so you don’t slip', 'to make them heavy', 'to look nice only', 'to reduce friction'], 0, 'More friction gives more grip.'),
              mc('What force makes an apple fall from a tree?', ['gravity', 'magnetism', 'friction', 'wind only'], 0, 'Gravity pulls things towards Earth.'),
              mc('A parachute slows a skydiver using…', ['air resistance', 'magnetism', 'electricity', 'gravity only'], 0, 'The large parachute catches air, creating resistance.'),
              tf('Friction can produce heat.', true, 'Rubbing surfaces together makes heat.'),
            ],
          },
          {
            id: 'magnets', title: 'Magnetism', minutes: 12,
            blocks: [
              { type: 'read', text: `**Magnets** attract (pull) some metals — mostly **iron**, **steel** and nickel. They do **not** attract wood, plastic, paper, aluminium cans or copper.\n\nEvery magnet has a **north pole** and a **south pole**:\n- **Opposite poles attract** (N and S pull together)\n- **Like poles repel** (N and N push apart; S and S push apart)\n\nMagnetism is a **non-contact** force — it works through air, paper and even water. A **compass** needle is a magnet that points towards Earth's magnetic north.` },
            ],
            practice: [
              mc('Which object would a magnet attract?', ['a steel paperclip', 'a plastic ruler', 'a wooden pencil', 'an aluminium can'], 0, 'Steel contains iron, which is magnetic.'),
              mc('What happens when two north poles face each other?', ['They repel (push apart)', 'They attract', 'Nothing', 'They melt'], 0, 'Like poles repel.'),
              mc('What happens when a north pole faces a south pole?', ['They attract', 'They repel', 'They spin', 'Nothing'], 0, 'Opposite poles attract.'),
              tf('Magnets can attract through a sheet of paper.', true, 'Magnetism is a non-contact force.'),
              mc('A compass works because its needle is a…', ['magnet', 'piece of wood', 'battery', 'thermometer'], 0, 'The magnetic needle lines up with Earth’s magnetic field.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'materials', term: 3, strand: 'Chemical sciences', code: 'AC9S4U04',
        title: 'Natural and manufactured materials',
        summary: 'Properties of natural and made materials like fibres, metals, glass and plastics, and how properties relate to uses.',
        lessons: [
          {
            id: 'natural-made', title: 'Natural and manufactured materials', minutes: 12,
            blocks: [
              { type: 'read', text: `**Natural materials** come from plants, animals or the ground: **wood**, **wool**, **cotton**, **leather**, **stone**, **clay**.\n\n**Manufactured (processed) materials** are made by people changing natural materials: **plastic** (from oil), **glass** (from sand), **steel** (from iron ore), **paper** (from wood), **concrete**, **nylon**.\n\n**Fibres** are long, thin threads used to make fabric — natural fibres like wool and cotton, or manufactured fibres like polyester and nylon.` },
            ],
            practice: [
              mc('Which is a natural material?', ['wool', 'plastic', 'glass', 'nylon'], 0, 'Wool comes from sheep.'),
              mc('Glass is made from…', ['sand', 'wood', 'wool', 'oil'], 0, 'Sand is melted at very high temperatures to make glass.'),
              mc('Most plastics are made from…', ['oil', 'cotton', 'sand', 'rocks only'], 0, 'Plastic is mostly made from oil (petroleum).'),
              mc('Paper is made from…', ['wood', 'metal', 'glass', 'wool'], 0, 'Paper is made from wood pulp.'),
              mc('Which is a manufactured fibre?', ['polyester', 'cotton', 'wool', 'silk'], 0, 'Polyester is made in factories.'),
            ],
          },
          {
            id: 'properties-uses', title: 'Properties and uses', minutes: 15,
            blocks: [
              { type: 'read', text: `We choose materials because of their **properties**:\n- **Strong** — can hold weight (steel for bridges)\n- **Flexible** — bends without breaking (rubber, fabric)\n- **Rigid** — keeps its shape (wood, metal)\n- **Waterproof** — doesn't let water through (plastic, rubber)\n- **Transparent** — you can see through it (glass, clear plastic)\n- **Absorbent** — soaks up liquid (cotton, paper towel)\n- **Conductor / insulator** of heat and electricity (metals conduct; plastic and wood insulate)\n\nWe also think about **sustainability**: Can it be **reused** or **recycled**? Plastic can last hundreds of years in the environment, so reducing single-use plastic helps.` },
              { type: 'activity', text: 'Test which material is most absorbent: drip 10 drops of water onto paper towel, cotton fabric, plastic and foil. Which soaks it up?' },
            ],
            practice: [
              mc('Why are windows made of glass?', ['It is transparent', 'It is absorbent', 'It is flexible', 'It is magnetic'], 0, 'You can see through glass.'),
              mc('Which property makes a towel useful?', ['absorbent', 'waterproof', 'transparent', 'rigid'], 0, 'Towels soak up water.'),
              mc('Why are electrical wires covered in plastic?', ['Plastic is an insulator and keeps us safe', 'Plastic conducts electricity', 'Plastic is shiny', 'It makes wires heavier'], 0, 'Plastic stops electricity escaping.'),
              mc('Which material is best for a raincoat?', ['waterproof plastic', 'paper', 'cotton wool', 'glass'], 0, 'Raincoats must be waterproof and flexible.'),
              mc('Steel is used for bridges because it is…', ['strong', 'transparent', 'absorbent', 'soft'], 0, 'Steel can hold heavy loads.'),
              write('Choose an object at home (e.g. a lunchbox, a chair, a raincoat). What materials is it made from, and why are those materials a good choice?', ['Names the object', 'Lists the materials', 'Links properties to the use'], 25),
            ],
          },
        ],
        quiz: { n: 9 },
      },
      {
        id: 'inquiry', term: 4, strand: 'Science inquiry',
        title: 'Investigating like a scientist',
        summary: 'Plan fair tests, identify variables, measure accurately, use tables and graphs, and draw conclusions.',
        lessons: [
          {
            id: 'variables', title: 'Variables and fair tests', minutes: 12,
            blocks: [
              { type: 'read', text: `In a fair test there are **variables** (things that can change):\n- **Independent variable** — the ONE thing you **change** (e.g. the type of surface)\n- **Dependent variable** — the thing you **measure** (e.g. how far the car rolls)\n- **Controlled variables** — everything you **keep the same** (same car, same ramp height, same push)\n\nRepeat your test **3 times** and find the typical result — this makes results more **reliable**.` },
            ],
            practice: [
              mc('In a fair test, the one thing you change is the…', ['independent variable', 'dependent variable', 'controlled variable', 'conclusion'], 0, 'You change only the independent variable.'),
              mc('Testing which paper plane flies furthest: what do you measure?', ['the distance it flies', 'the colour of the paper', 'the person throwing', 'the time of day'], 0, 'Distance is the dependent variable — what you measure.'),
              mc('Why should you repeat a test several times?', ['to make results more reliable', 'to waste time', 'to change the result', 'it doesn’t matter'], 0, 'Repeating reduces the effect of mistakes.'),
            ],
          },
          {
            id: 'communicate', title: 'Recording, graphing and concluding', minutes: 12,
            blocks: [
              { type: 'read', text: `- Record measurements in a **table** with headings and units\n- Show results in a **column graph** to compare\n- Look for **patterns**: "The rougher the surface, the shorter the distance."\n- Write a **conclusion** that answers your question, and say whether your prediction was correct\n- Think: How could the test be improved?\n\nScientists all over the world — including Australian scientists who study the reef, bushfires and native animals — share findings so others can check and build on them.` },
            ],
            practice: [
              mc('Which graph is best for comparing results from different surfaces?', ['a column graph', 'a map', 'a timeline', 'a picture of a cat'], 0, 'Column graphs compare categories.'),
              mc('A conclusion should…', ['answer the question using the results', 'be a new question only', 'list materials', 'be a guess'], 0, 'Conclusions are based on evidence.'),
              write('Plan a fair test: "Does the height of a ramp change how far a toy car rolls?" Name the independent, dependent and controlled variables, and say how you will record results.', ['Independent variable', 'Dependent variable', 'At least two controlled variables', 'How results will be recorded'], 40),
            ],
          },
        ],
        quiz: { n: 6 },
      },
    ],
  });
})();
