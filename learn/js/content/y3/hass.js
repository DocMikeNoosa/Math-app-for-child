/* Year 3 HASS — Australian Curriculum v9.0: History, Geography, Civics and citizenship, plus HASS skills */
(function () {
  const { mc, tf, inp, write } = LA.Q;

  const STATES_TABLE = '<table class="report" style="max-width:520px;margin:0 auto"><tr><th>State / Territory</th><th>Capital city</th></tr><tr><td>New South Wales (NSW)</td><td>Sydney</td></tr><tr><td>Victoria (Vic)</td><td>Melbourne</td></tr><tr><td>Queensland (Qld)</td><td>Brisbane</td></tr><tr><td>South Australia (SA)</td><td>Adelaide</td></tr><tr><td>Western Australia (WA)</td><td>Perth</td></tr><tr><td>Tasmania (Tas)</td><td>Hobart</td></tr><tr><td>Northern Territory (NT)</td><td>Darwin</td></tr><tr><td>Australian Capital Territory (ACT)</td><td>Canberra — also the national capital</td></tr></table>';

  LA.addSubject(3, {
    id: 'hass',
    intro: 'History of your community, celebrations and symbols, mapping Australia and our neighbours, places and climates, and why we have rules.',
    chapters: [
      {
        id: 'community-change', term: 1, strand: 'History', code: 'AC9HS3K01',
        title: 'Our community: then and now',
        summary: 'How and why local communities change over time, and how people from many backgrounds have contributed.',
        lessons: [
          {
            id: 'change', title: 'How communities change', minutes: 12,
            blocks: [
              { type: 'read', text: `Every community has a **history**. Places change over time:\n- **Buildings** — old shops become cafes, farms become suburbs\n- **Transport** — horses and carts → trams and trains → cars and buses\n- **Technology** — letters → telephones → the internet\n- **People** — new families move in from all over Australia and the world\n\nChanges have **causes** (why it happened) and **effects** (what happened because of it). Example: a new railway line (cause) → more people move to the town and new shops open (effect).\n\nFirst Nations Australians have lived on and cared for the land where every Australian community stands for more than 60,000 years. Every place has a First Nations name and history.` },
              { type: 'vocab', words: [['history', 'the study of the past'], ['cause', 'the reason something happens'], ['effect', 'what happens because of something'], ['continuity', 'things that stay the same over time']] },
            ],
            practice: [
              mc('A new highway is built to a country town. What is a likely EFFECT?', ['More visitors come to the town', 'The town disappears', 'It stops raining', 'Nothing changes'], 0, 'Easier travel means more people can visit.'),
              mc('What does "cause" mean?', ['the reason something happens', 'what happens next', 'a type of building', 'a map'], 0, 'A cause is why something happened.'),
              mc('How has communication changed over time?', ['Letters → telephones → internet', 'Internet → letters → telephones', 'It has not changed', 'Telephones were invented first'], 0, 'Letters came first, then telephones, then the internet.'),
              tf('First Nations Australians have lived in Australia for more than 60,000 years.', true, 'They are the world’s oldest continuing cultures.'),
            ],
          },
          {
            id: 'sources', title: 'Finding out about the past', minutes: 12,
            blocks: [
              { type: 'read', text: `Historians use **sources** — clues from the past:\n- **Photographs** and old maps\n- **Objects** (artefacts) like old tools, toys and coins\n- **Interviews** with older people (oral history)\n- **Letters, diaries** and **newspapers**\n- **Buildings** and **monuments**\n\nWe ask questions: *Who? What? When? Where? Why? How has it changed?*` },
              { type: 'activity', text: 'Interview a grandparent or older neighbour. Ask: What was school like when you were 8? What games did you play? How did you get to school? What has changed in our town?' },
            ],
            practice: [
              mc('Which is a source about the past?', ['an old photograph', 'a video game you got today', 'tomorrow’s weather', 'a new phone'], 0, 'Old photographs show how things used to be.'),
              mc('Talking to an older person about their memories is called…', ['oral history', 'geography', 'a sport', 'a map'], 0, 'Oral history is spoken memories of the past.'),
              mc('A monument usually helps us remember…', ['important people or events', 'shopping lists', 'football scores', 'the weather'], 0, 'Monuments remember people and events.'),
            ],
          },
          {
            id: 'contributions', title: 'People who shaped our community', minutes: 12,
            blocks: [
              { type: 'read', text: `Communities are built by many people from **diverse backgrounds**:\n- **First Nations peoples** — the Traditional Owners and custodians of the land\n- **Settlers and migrants** from Britain, Ireland, China, Italy, Greece, Vietnam, Lebanon, India and many more countries\n- **Volunteers** — firefighters (like the RFS/CFA), surf lifesavers, coaches\n\nFor example, Chinese miners came to Australia during the gold rushes in the 1850s and opened market gardens and shops. Many towns still have their temples and buildings today.` },
            ],
            practice: [
              mc('Who are the Traditional Owners of the land?', ['First Nations peoples', 'the newest families', 'the government', 'tourists'], 0, 'First Nations peoples are the Traditional Owners and custodians.'),
              mc('Why did many Chinese people come to Australia in the 1850s?', ['the gold rushes', 'to go skiing', 'for the Olympics', 'to build the internet'], 0, 'Many came looking for gold.'),
              write('Write 3 sentences about a person or group who has helped your community (e.g. volunteers, a local leader, a club). What did they do?', ['Names the person or group', 'Says what they did', 'Says why it helped'], 25),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'celebrations', term: 1, strand: 'History', code: 'AC9HS3K02',
        title: 'Celebrations, commemorations and symbols',
        summary: 'Important days, symbols and emblems that are part of Australia’s identity and diversity.',
        lessons: [
          {
            id: 'days', title: 'Important days in Australia', minutes: 12,
            blocks: [
              { type: 'read', text: `A **celebration** is a happy occasion. A **commemoration** remembers an important person or event.\n\n- **Australia Day (26 January)** — marks the arrival of the First Fleet in 1788. Many First Nations people call it **Survival Day** or **Invasion Day**, and it can be a day of sadness, so Australians have different views about it.\n- **Anzac Day (25 April)** — remembers Australians and New Zealanders who served and died in wars. Many people go to a **dawn service**.\n- **Remembrance Day (11 November)** — a minute of silence at 11 am.\n- **NAIDOC Week (July)** — celebrates First Nations histories, cultures and achievements.\n- **National Reconciliation Week (27 May – 3 June)** — about building respect between First Nations and other Australians.\n- **Harmony Week (March)** — celebrates Australia's cultural diversity.\n\nFamilies also celebrate cultural and religious days like Christmas, Lunar New Year, Diwali, Eid and Easter.` },
            ],
            practice: [
              mc('On which day do many Australians go to a dawn service?', ['Anzac Day', 'Christmas', 'Easter Monday', 'Harmony Day'], 0, 'Anzac Day dawn services remember those who served.'),
              mc('What does NAIDOC Week celebrate?', ['First Nations histories, cultures and achievements', 'The first car in Australia', 'Sport only', 'Summer holidays'], 0, 'NAIDOC Week celebrates First Nations peoples.'),
              mc('What is a commemoration?', ['A day to remember an important person or event', 'A birthday party', 'A type of food', 'A holiday at the beach'], 0, 'Commemorations remember people and events.'),
              mc('Why do some people feel sad on 26 January?', ['It marks the start of colonisation, which harmed First Nations peoples', 'Because school starts', 'Because it is cold', 'Because shops close'], 0, 'For many First Nations people it marks the loss of land and culture.'),
              mc('Remembrance Day is on…', ['11 November', '25 April', '26 January', '25 December'], 0, 'At 11 am on 11 November we have a minute’s silence.'),
            ],
          },
          {
            id: 'symbols', title: 'Australian symbols and emblems', minutes: 12,
            blocks: [
              { type: 'read', text: `**Symbols** and **emblems** stand for something important.\n\n**Flags:**\n- **Australian National Flag** — the Union Jack, the Commonwealth Star (7 points) and the Southern Cross\n- **Australian Aboriginal Flag** — black (the people), red (the earth and connection to land), yellow circle (the sun)\n- **Torres Strait Islander Flag** — green (land), blue (sea), black lines (the people), a white **dhari** (headdress) and a star\n\n**Other emblems:**\n- **Coat of arms** — a kangaroo and an emu hold a shield. Both can't easily walk backwards — a symbol of moving forward!\n- **National floral emblem** — the golden wattle\n- **National colours** — green and gold\n- **National anthem** — "Advance Australia Fair"` },
            ],
            practice: [
              mc('Which two animals are on Australia’s coat of arms?', ['kangaroo and emu', 'koala and wombat', 'platypus and echidna', 'dingo and goanna'], 0, 'The kangaroo and emu hold the shield.'),
              mc('What does the yellow circle on the Aboriginal Flag stand for?', ['the sun', 'a coin', 'the moon', 'a flower'], 0, 'Yellow represents the sun, the giver of life.'),
              mc('What is Australia’s national floral emblem?', ['golden wattle', 'red rose', 'waratah', 'sunflower'], 0, 'The golden wattle is the national flower.'),
              mc('What is shown on the Torres Strait Islander Flag?', ['a white dhari (headdress) and a star', 'a kangaroo', 'the Union Jack', 'a boomerang'], 0, 'The dhari and star are on the Torres Strait Islander Flag.'),
              mc('What are Australia’s national colours?', ['green and gold', 'red and white', 'blue and black', 'purple and silver'], 0, 'Green and gold, like the wattle.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'mapping-australia', term: 2, strand: 'Geography', code: 'AC9HS3K03',
        title: 'Mapping Australia',
        summary: 'States, territories and capital cities, First Nations Countries/Places, and how to read maps.',
        lessons: [
          {
            id: 'states', title: 'States, territories and capitals', minutes: 15,
            blocks: [
              { type: 'read', text: `Australia has **6 states** and **2 main mainland territories**. Each has a **capital city**. **Canberra** is the capital of the whole country, where Federal Parliament meets.` },
              { type: 'visual', svg: STATES_TABLE },
              { type: 'tip', text: 'Tasmania is the island state to the south. The Northern Territory is in the middle-top. Western Australia is the biggest state.' },
            ],
            practice: [
              mc('What is the capital city of Australia?', ['Canberra', 'Sydney', 'Melbourne', 'Perth'], 0, 'Canberra is the national capital.'),
              mc('What is the capital of Queensland?', ['Brisbane', 'Cairns', 'Darwin', 'Gold Coast'], 0, 'Brisbane is the capital of Queensland.'),
              mc('Which state is an island?', ['Tasmania', 'Victoria', 'Queensland', 'South Australia'], 0, 'Tasmania is south of Victoria across Bass Strait.'),
              mc('Which is the largest state?', ['Western Australia', 'Victoria', 'Tasmania', 'New South Wales'], 0, 'WA covers about one-third of Australia.'),
              mc('Darwin is the capital of…', ['the Northern Territory', 'Western Australia', 'Queensland', 'South Australia'], 0, 'Darwin is the capital of the NT.'),
              num('How many states does Australia have?', 6, 'NSW, Vic, Qld, SA, WA and Tas = 6 states.'),
            ],
          },
          {
            id: 'countries', title: 'First Nations Countries and Places', minutes: 12,
            blocks: [
              { type: 'read', text: `Long before Australia had states, it was made up of **hundreds of First Nations Countries**, each with its own **language**, **laws**, **lands** and **culture**. Before 1788 there were more than 250 languages.\n\nThe boundaries of Countries often follow natural features like **rivers**, **mountains** and **coastlines**. For example, Sydney is on the Country of the **Gadigal** people of the Eora Nation, Melbourne is on the lands of the **Wurundjeri** and other peoples of the Kulin Nation, and Uluru is on **Anangu** Country.\n\nThat's why we hear an **Acknowledgement of Country** at events — showing respect to the Traditional Owners.\n\nTorres Strait Islander peoples come from the islands between Queensland and Papua New Guinea. They call their islands and seas **Places**.` },
            ],
            practice: [
              mc('Before 1788, about how many First Nations languages were spoken in Australia?', ['more than 250', '1', '10', '3'], 0, 'There were more than 250 languages.'),
              mc('What is an Acknowledgement of Country?', ['Showing respect to the Traditional Owners of the land', 'A type of map', 'A sports game', 'A song about the weather'], 0, 'It recognises and respects the Traditional Owners.'),
              mc('Boundaries of First Nations Countries often follow…', ['rivers, mountains and coastlines', 'roads', 'shopping centres', 'railway lines'], 0, 'Natural features often mark boundaries.'),
              mc('Uluru is on the Country of the…', ['Anangu', 'Gadigal', 'Wurundjeri', 'Noongar'], 0, 'Anangu are the Traditional Owners of Uluru.'),
            ],
          },
          {
            id: 'map-skills', title: 'Reading maps', minutes: 12,
            blocks: [
              { type: 'read', text: `Maps help us find places. A good map has **BOLTSS**:\n- **B**order — a frame around the map\n- **O**rientation — a compass arrow showing north\n- **L**egend (key) — explains the symbols\n- **T**itle — what the map shows\n- **S**cale — how distances on the map compare to real distances\n- **S**ource — who made it\n\nCompass points: North (top), South (bottom), East (right), West (left).` },
            ],
            practice: [
              mc('What part of a map explains what the symbols mean?', ['legend', 'title', 'border', 'source'], 0, 'The legend (key) explains the symbols.'),
              mc('On most maps, which direction is at the top?', ['North', 'South', 'East', 'West'], 0, 'Maps usually have north at the top.'),
              mc('What does the scale on a map tell you?', ['how map distances compare to real distances', 'the weather', 'the map’s colour', 'who made it'], 0, 'The scale lets you work out real distances.'),
              mc('Brisbane is on the east coast. Perth is on the ___ coast.', ['west', 'east', 'north', 'south'], 0, 'Perth is on the west coast of Australia.'),
            ],
          },
        ],
        quiz: { n: 10 },
      },
      {
        id: 'neighbours', term: 2, strand: 'Geography', code: 'AC9HS3K03',
        title: 'Australia’s neighbours',
        summary: 'Locate the countries and regions near Australia and compare their places.',
        lessons: [
          {
            id: 'near-countries', title: 'Our nearest neighbours', minutes: 12,
            blocks: [
              { type: 'read', text: `Australia is a continent and an island in the **Southern Hemisphere**, between the **Indian Ocean** and the **Pacific Ocean**.\n\nOur closest neighbours:\n- **Papua New Guinea** — just north, across the Torres Strait\n- **Indonesia** — north-west; made up of thousands of islands\n- **Timor-Leste** — north-west, across the Timor Sea\n- **New Zealand** — south-east, across the Tasman Sea\n- **Pacific Island nations** like **Fiji, Solomon Islands, Vanuatu, Samoa, Tonga** — to the east\n\nThe region of Australia, New Zealand and the Pacific islands is called **Oceania**.` },
            ],
            practice: [
              mc('Which country is just north of Australia across the Torres Strait?', ['Papua New Guinea', 'New Zealand', 'Fiji', 'Japan'], 0, 'PNG is our closest northern neighbour.'),
              mc('Which sea is between Australia and New Zealand?', ['Tasman Sea', 'Coral Sea', 'Timor Sea', 'Red Sea'], 0, 'The Tasman Sea separates Australia and New Zealand.'),
              mc('Australia is in which hemisphere?', ['Southern', 'Northern', 'Western only', 'Arctic'], 0, 'Australia is south of the equator.'),
              mc('Which country is made of thousands of islands to the north-west?', ['Indonesia', 'New Zealand', 'Samoa', 'Tonga'], 0, 'Indonesia has over 17,000 islands.'),
              mc('What is the name of the region that includes Australia, NZ and the Pacific islands?', ['Oceania', 'Europe', 'Antarctica', 'Asia Minor'], 0, 'This region is called Oceania.'),
            ],
          },
          {
            id: 'compare-places', title: 'Comparing places', minutes: 12,
            blocks: [
              { type: 'read', text: `Places can be compared by their **features**, **climate** and how **people live**.\n\n- **Fiji** — tropical islands, warm all year, coral reefs, villages and the city of Suva\n- **New Zealand** — mountains, snow in winter, green farms, cities like Auckland and Wellington\n- **Papua New Guinea** — rainforests, mountains, more than 800 languages!\n\nWhat's the same and different compared with where you live?` },
            ],
            practice: [
              mc('Which neighbour has more than 800 languages?', ['Papua New Guinea', 'New Zealand', 'Fiji', 'Tonga'], 0, 'PNG has one of the most languages of any country.'),
              mc('Which country is known for mountains and snow in winter?', ['New Zealand', 'Fiji', 'Samoa', 'Timor-Leste'], 0, 'New Zealand has snowy mountains like the Southern Alps.'),
              write('Choose one of Australia’s neighbours. Write 3 ways it is similar to or different from where you live.', ['Names the country', 'At least 3 comparisons', 'Uses words like same, different, both'], 30),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'places-features', term: 3, strand: 'Geography', code: 'AC9HS3K05',
        title: 'Natural, managed and constructed features',
        summary: 'Compare places by their natural, managed and constructed features.',
        lessons: [
          {
            id: 'feature-types', title: 'Three kinds of features', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Natural features** are made by nature: mountains, rivers, beaches, deserts, forests (e.g. Uluru, the Great Barrier Reef)\n- **Managed features** are natural things that people look after or change: farms, national parks, parks and gardens, plantation forests\n- **Constructed features** are built by people: houses, roads, bridges, dams, the Sydney Opera House\n\nMost places have a mix of all three!` },
            ],
            practice: [
              mc('Which is a natural feature?', ['a mountain', 'a bridge', 'a school', 'a wheat farm'], 0, 'Mountains are made by nature.'),
              mc('Which is a managed feature?', ['a national park', 'a volcano', 'a skyscraper', 'a road'], 0, 'National parks are natural areas looked after by people.'),
              mc('Which is a constructed feature?', ['the Sydney Harbour Bridge', 'the Murray River', 'a rainforest', 'a beach'], 0, 'People built the Harbour Bridge.'),
              mc('A dairy farm is a…', ['managed feature', 'natural feature', 'constructed feature', 'not a feature'], 0, 'Farms use natural land managed by people.'),
              mc('The Great Barrier Reef is a…', ['natural feature', 'constructed feature', 'managed feature only', 'building'], 0, 'The reef was made by nature (living corals).'),
            ],
          },
          {
            id: 'compare-towns', title: 'City, country and coast', minutes: 12,
            blocks: [
              { type: 'read', text: `Australian places are very different:\n- **Cities** (e.g. Melbourne) — many constructed features, lots of people, trams, tall buildings\n- **Country towns** (e.g. Dubbo) — farms (managed), fewer people, wide spaces\n- **Coastal towns** (e.g. Byron Bay) — beaches (natural), tourism\n- **Outback** (e.g. Alice Springs) — desert, red earth, hot days and cold nights\n\nPeople choose where to live for jobs, family, climate and lifestyle.` },
            ],
            practice: [
              mc('Which place would have the most constructed features?', ['a big city', 'a desert', 'a rainforest', 'an empty beach'], 0, 'Cities have many buildings, roads and bridges.'),
              mc('Alice Springs is in the…', ['outback', 'snow fields', 'rainforest of Tasmania', 'middle of Sydney'], 0, 'Alice Springs is in the centre of Australia.'),
              write('Describe where you live. List one natural, one managed and one constructed feature near you.', ['One natural feature', 'One managed feature', 'One constructed feature', 'Complete sentences'], 25),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'climate', term: 3, strand: 'Geography',
        title: 'Weather and climate around Australia',
        summary: 'The difference between weather and climate, and Australia’s climate zones.',
        lessons: [
          {
            id: 'weather-climate', title: 'Weather vs climate', minutes: 12,
            blocks: [
              { type: 'read', text: `**Weather** is what it's like outside **today** — sunny, rainy, windy, hot or cold.\n**Climate** is the usual weather of a place over **many years**.\n\nAustralia's climate zones:\n- **Tropical** (north: Darwin, Cairns) — hot all year, a **wet season** and a **dry season**\n- **Desert / arid** (centre: Alice Springs) — very dry, hot days, cold nights\n- **Temperate** (south: Melbourne, Hobart, Perth) — four seasons, mild summers, cool winters\n- **Subtropical** (Brisbane) — warm, humid summers\n\nMany First Nations peoples know **more than four seasons**, based on changes in plants, animals and weather on their Country. For example, seasonal calendars from the Top End describe six or more seasons, each linked to when certain plants flower and animals breed.` },
            ],
            practice: [
              mc('"It is raining this afternoon" describes the…', ['weather', 'climate', 'season', 'landform'], 0, 'Weather is what’s happening now.'),
              mc('Which city has a tropical climate with wet and dry seasons?', ['Darwin', 'Hobart', 'Melbourne', 'Adelaide'], 0, 'Darwin is in the tropics.'),
              mc('What is the climate like in the desert?', ['very dry with hot days and cold nights', 'snowy all year', 'rainy every day', 'always mild'], 0, 'Deserts get very little rain.'),
              tf('Many First Nations seasonal calendars have more than four seasons.', true, 'They are based on careful observation of plants, animals and weather.'),
              mc('Climate means…', ['the usual weather of a place over many years', 'today’s temperature', 'a single storm', 'tomorrow’s forecast'], 0, 'Climate is the long-term pattern.'),
            ],
          },
        ],
        quiz: { n: 5 },
      },
      {
        id: 'rules', term: 4, strand: 'Civics and citizenship', code: 'AC9HS3K06',
        title: 'Rules in our community',
        summary: 'Who makes rules, why rules are important, and what happens when rules are broken.',
        lessons: [
          {
            id: 'why-rules', title: 'Why do we have rules?', minutes: 12,
            blocks: [
              { type: 'read', text: `**Rules** tell us how to behave. They help keep us **safe**, make things **fair**, and help people **get along**.\n\n**Who makes rules?**\n- **Families** make home rules (bedtime, screen time)\n- **Schools** make school rules (walk in corridors, wear a hat outside)\n- **Clubs and sports** have rules for games\n- **Councils** make local rules (dogs on leads in parks)\n- **Governments** make **laws** for everyone (road rules, wearing a seatbelt)\n\nRules made by governments are called **laws**.` },
            ],
            practice: [
              mc('Why do schools have a "No hat, no play" rule?', ['To protect students from sunburn', 'To make hats popular', 'To sell hats', 'For no reason'], 0, 'Australia has strong sun — hats keep us safe.'),
              mc('Rules made by governments for everyone are called…', ['laws', 'games', 'chores', 'wishes'], 0, 'Laws are rules made by governments.'),
              mc('Who makes the rule "Dogs must be on a lead in this park"?', ['the local council', 'your teacher', 'your best friend', 'the dog'], 0, 'Local councils make rules for parks and streets.'),
              mc('Which is a reason for rules?', ['to keep people safe and treat everyone fairly', 'to make life boring', 'to make people angry', 'to stop all fun'], 0, 'Rules help keep us safe and fair.'),
            ],
          },
          {
            id: 'consequences', title: 'Consequences and making fair rules', minutes: 12,
            blocks: [
              { type: 'read', text: `A **consequence** is what happens when a rule is followed or broken.\n- Breaking a game rule → a penalty or free kick\n- Breaking a school rule → time out or a talk with the teacher\n- Breaking a law (like speeding) → a fine\n\nGood rules are **fair**, **clear** and **easy to understand**. Many classes vote to decide their class rules. **Voting** lets everyone have a say.` },
            ],
            practice: [
              mc('What is a consequence?', ['what happens because of an action', 'a type of rule-maker', 'a sport', 'a holiday'], 0, 'Consequences follow actions.'),
              mc('What might happen if a driver breaks the speed limit?', ['They might get a fine', 'They win a prize', 'Nothing ever', 'They get a new car'], 0, 'Breaking road laws can lead to fines.'),
              mc('How can a class make rules fairly?', ['By discussing and voting', 'One student decides', 'By drawing from a hat', 'No one decides'], 0, 'Voting gives everyone a say.'),
              write('Write three rules for a fair game of handball and explain why each rule is important.', ['Three clear rules', 'A reason for each rule'], 30),
            ],
          },
          {
            id: 'helping', title: 'Being an active citizen', minutes: 10,
            blocks: [
              { type: 'read', text: `A **citizen** is a member of a community. Active citizens help make their community better:\n- picking up litter and recycling\n- helping neighbours\n- volunteering (Clean Up Australia Day, sports clubs)\n- being respectful of people from different backgrounds\n- voting (adults over 18 must vote in Australian elections)` },
            ],
            practice: [
              mc('Which is an example of being an active citizen?', ['joining Clean Up Australia Day', 'dropping litter', 'ignoring rules', 'being rude to neighbours'], 0, 'Helping clean up makes the community better.'),
              mc('In Australia, adults must vote from what age?', ['18', '8', '12', '30'], 0, 'Voting is compulsory for Australian citizens aged 18 and over.'),
              tf('Volunteers work to help others without being paid.', true, 'Volunteers give their time freely.'),
            ],
          },
        ],
        quiz: { n: 9 },
      },
    ],
  });

  function num(q, a, e) { return LA.Q.num(q, a, e); }
})();
