/* Year 4 HASS — Australian Curriculum v9.0: History, Geography, Civics and citizenship, plus HASS skills */
(function () {
  const { mc, tf, inp, num, write } = LA.Q;

  LA.addSubject(4, {
    id: 'hass',
    intro: 'First Nations Australians and Country, the First Fleet and the colony at Sydney Cove, continents and environments, sustainability, local government and belonging.',
    chapters: [
      {
        id: 'first-nations', term: 1, strand: 'History', code: 'AC9HS4K01',
        title: 'First Nations Australians and Country',
        summary: 'The diversity of First Nations Australians, their social organisation and continuous connection to Country/Place.',
        lessons: [
          {
            id: 'diversity', title: 'Many nations, many languages', minutes: 12,
            blocks: [
              { type: 'read', text: `**Aboriginal and Torres Strait Islander peoples** are the First Peoples of Australia, with cultures that have continued for **more than 60,000 years** — the oldest continuing cultures in the world.\n\nThey are **not one group**. Before 1788 there were **hundreds of nations**, with more than **250 languages** and many more dialects. Each nation has its own Country, laws, stories, ceremonies, art and ways of life.\n\n**Torres Strait Islander peoples** come from the islands of the Torres Strait between Cape York and Papua New Guinea, with their own distinct cultures linked to the sea.` },
              { type: 'vocab', words: [['Country', 'the land, waters, sky and everything in them that a First Nations group is connected to and cares for'], ['custodian', 'a person who looks after and protects something'], ['kinship', 'the system of family relationships and responsibilities'], ['Elder', 'a respected older person who holds knowledge and guides the community']] },
            ],
            practice: [
              mc('For how long have First Nations cultures continued in Australia?', ['more than 60,000 years', '200 years', '1,000 years', '50 years'], 0, 'They are the oldest continuing cultures on Earth.'),
              mc('Before 1788, about how many First Nations languages were there?', ['more than 250', 'one', 'ten', 'exactly 50'], 0, 'There were more than 250 languages and many dialects.'),
              tf('All First Nations Australians share one language and culture.', false, 'There are hundreds of distinct nations, languages and cultures.'),
              mc('Where are the Torres Strait Islands?', ['between Cape York and Papua New Guinea', 'south of Tasmania', 'near Perth', 'in the middle of Australia'], 0, 'They lie in the Torres Strait, north of Queensland.'),
            ],
          },
          {
            id: 'country-kinship', title: 'Country, kinship and caring for land', minutes: 15,
            blocks: [
              { type: 'read', text: `For First Nations Australians, **Country** is much more than land — it includes waters, sky, plants, animals, stories and spirit. People belong to Country and have a responsibility to **care for it**.\n\n**Social organisation:**\n- **Kinship** systems tell people how they are related and what their responsibilities are to each other\n- **Elders** hold and pass on knowledge, law and stories\n- Knowledge is shared through **stories, song, dance and art**\n\n**Caring for Country:**\n- **Cultural burning** — small, cool fires that reduce fuel, encourage new plant growth and attract animals\n- Moving with the **seasons** to use resources without taking too much\n- Building **fish traps** (like the stone traps at Brewarrina in NSW) and **eel traps** (like at Budj Bim in Victoria — a World Heritage site)\n\nThis connection to Country continues today.` },
            ],
            practice: [
              mc('What does "Country" mean to First Nations Australians?', ['the land, waters, sky and everything connected to them', 'only a nation’s flag', 'a farm', 'a city'], 0, 'Country includes land, waters, sky, plants, animals and spirit.'),
              mc('What is cultural burning?', ['using small, cool fires to care for land', 'burning rubbish', 'a cooking method only', 'a type of bushfire'], 0, 'Cultural burns reduce fuel and help plants regrow.'),
              mc('Who are Elders?', ['respected people who hold and pass on knowledge', 'the youngest children', 'visitors', 'government officials'], 0, 'Elders guide communities and teach culture.'),
              mc('Budj Bim in Victoria is famous for…', ['ancient eel traps', 'gold mines', 'a big city', 'ski fields'], 0, 'The Gunditjmara people built eel traps there thousands of years ago.'),
              mc('How is knowledge passed on in First Nations cultures?', ['through stories, song, dance and art', 'only through textbooks', 'only through television', 'it isn’t'], 0, 'Oral traditions and the arts pass on knowledge.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'first-fleet', term: 1, strand: 'History', code: 'AC9HS4K02',
        title: 'Why the British came: the First Fleet',
        summary: 'The causes of the first British colony in Australia in 1788.',
        lessons: [
          {
            id: 'causes', title: 'Causes of the colony', minutes: 15,
            blocks: [
              { type: 'read', text: `In **1770**, Lieutenant **James Cook** sailed along the east coast of Australia and claimed it for Britain, even though First Nations peoples had lived there for tens of thousands of years.\n\n**Why did Britain set up a colony?**\n1. **Overcrowded prisons** — Britain had many people convicted of crimes (often small ones, like stealing food). Prisons and old ships used as prisons (**hulks**) were overflowing.\n2. **Loss of America** — Britain used to send convicts to its American colonies, but after the **American War of Independence** (1775–1783) it couldn't anymore.\n3. **Trade and strategy** — a base in the Pacific could help British ships and trade, and provide materials like timber and flax.\n\nThe British wrongly treated the land as if it belonged to no one — an idea later called **terra nullius**. This was not true.` },
            ],
            practice: [
              mc('In what year did James Cook sail along Australia’s east coast?', ['1770', '1788', '1901', '1600'], 0, 'Cook sailed up the east coast in 1770.'),
              mc('What was one reason Britain set up a colony in Australia?', ['British prisons were overcrowded', 'to find snow', 'to build the Opera House', 'to hold the Olympics'], 0, 'Overcrowded prisons and hulks were a major cause.'),
              mc('Why couldn’t Britain send convicts to America anymore?', ['America had won its independence', 'America was too cold', 'The ships were broken', 'Convicts refused to go'], 0, 'After the American War of Independence, Britain lost those colonies.'),
              mc('What does "terra nullius" mean?', ['"land belonging to no one" — a false idea', '"land of plenty"', '"new country"', '"great south land"'], 0, 'Terra nullius ignored that First Nations peoples owned and cared for the land.'),
              mc('What were hulks?', ['old ships used as floating prisons', 'large convicts', 'farm animals', 'Australian islands'], 0, 'Hulks were old ships used to hold prisoners.'),
            ],
          },
          {
            id: 'voyage', title: 'The voyage of the First Fleet', minutes: 12,
            blocks: [
              { type: 'read', text: `The **First Fleet** was **11 ships** led by Captain **Arthur Phillip**. It left **Portsmouth**, England, in **May 1787** carrying about **1,500 people** — convicts, marines (soldiers), officers, sailors and some of their families.\n\nThe voyage took about **8 months**. Conditions were crowded and hard; food was salted meat and hard biscuits.\n\nThe fleet arrived at **Botany Bay** in **January 1788**, but Phillip found it unsuitable (poor soil, little fresh water). He chose **Sydney Cove** in Port Jackson instead, and raised the British flag there on **26 January 1788**. This was the land of the **Gadigal** people of the Eora Nation.` },
            ],
            practice: [
              num('How many ships were in the First Fleet?', 11, 'There were 11 ships.'),
              mc('Who was the leader of the First Fleet?', ['Captain Arthur Phillip', 'James Cook', 'Ned Kelly', 'Matthew Flinders'], 0, 'Arthur Phillip became the first Governor of New South Wales.'),
              mc('Why didn’t Phillip stay at Botany Bay?', ['poor soil and little fresh water', 'it was too cold', 'there were no trees', 'it was too far north'], 0, 'Sydney Cove had better water and a sheltered harbour.'),
              mc('Whose land was Sydney Cove?', ['the Gadigal people of the Eora Nation', 'nobody’s', 'the Dutch', 'the Wurundjeri'], 0, 'Sydney Cove is on Gadigal Country.'),
              mc('About how long did the voyage take?', ['8 months', '2 weeks', '3 years', '1 day'], 0, 'They left in May 1787 and arrived in January 1788.'),
            ],
          },
        ],
        quiz: { n: 9 },
      },
      {
        id: 'colony-life', term: 2, strand: 'History', code: 'AC9HS4K03',
        title: 'Life in the early colony',
        summary: 'The experiences of officials, marines, convicts and First Nations peoples in the first British colony.',
        lessons: [
          {
            id: 'convicts', title: 'Convicts, marines and officials', minutes: 15,
            blocks: [
              { type: 'read', text: `Life at Sydney Cove was hard for everyone:\n- **Governor Arthur Phillip** was in charge and had to keep order and stop people starving\n- **Marines** guarded the convicts\n- **Convicts** (men, women and some children) worked clearing land, building huts, making bricks and farming. Punishments for breaking rules could be harsh, including flogging\n\n**Problems:** the soil was poor, seeds brought from England failed, tools broke, and many animals escaped or died. The colony nearly **starved** until supply ships arrived in **1790** (the Second Fleet).\n\nSome convicts later earned their freedom and became farmers or business people — like **Mary Reibey**, a convict who became a successful businesswoman and is on the Australian $20 note.` },
            ],
            practice: [
              mc('What job did the marines have?', ['guarding the convicts', 'cooking for the Governor', 'teaching school', 'building ships'], 0, 'Marines were soldiers who kept order.'),
              mc('Why did the colony nearly starve?', ['crops failed and supplies ran low', 'there was too much food', 'everyone was on holiday', 'it snowed every day'], 0, 'Poor soil and failed crops caused food shortages.'),
              mc('Mary Reibey was…', ['a convict who became a successful businesswoman', 'the first Governor', 'a ship captain', 'a marine'], 0, 'She is on the $20 note.'),
              mc('What kind of work did convicts do?', ['clearing land, building and farming', 'playing sport', 'running banks', 'nothing'], 0, 'Convicts provided the labour to build the colony.'),
            ],
          },
          {
            id: 'impact', title: 'Encounters and impact on First Nations peoples', minutes: 15,
            blocks: [
              { type: 'read', text: `The arrival of the British had a huge impact on the **Eora** peoples and, over time, on First Nations peoples across the continent.\n\n- **Loss of land and resources:** the British took land, cleared it, and used water and fish the Eora depended on\n- **Disease:** in **1789** an outbreak of **smallpox** killed a very large number of Eora people, who had no immunity\n- **Conflict and resistance:** First Nations people defended their land. **Pemulwuy**, a Bidjigal warrior, led resistance for over 10 years\n- **Contact and relationships:** some Eora people, like **Bennelong** and **Barangaroo**, interacted with the colonists. Bennelong learned English and even travelled to England\n\nThese events caused great loss and sadness that is still felt today. Learning the truth about history is part of **reconciliation**.` },
            ],
            practice: [
              mc('What disease killed many Eora people in 1789?', ['smallpox', 'the common cold', 'chickenpox', 'measles'], 0, 'Smallpox spread rapidly among people with no immunity.'),
              mc('Who was Pemulwuy?', ['a Bidjigal warrior who led resistance', 'a British governor', 'a convict', 'a ship'], 0, 'Pemulwuy resisted the colonists for over a decade.'),
              mc('Who was Bennelong?', ['an Eora man who interacted with the colonists and travelled to England', 'a marine', 'a convict', 'the captain of a ship'], 0, 'Bennelong Point (where the Opera House is) is named after him.'),
              mc('How did colonisation affect First Nations peoples?', ['They lost land, food sources and many lives', 'Nothing changed', 'They got more land', 'Only good things happened'], 0, 'Colonisation caused loss of land, culture and life.'),
              write('Imagine you are an Eora child in 1788 watching the ships arrive. Write a diary entry about what you see and how you feel.', ['Written as a diary (I, today)', 'Describes what is seen', 'Describes feelings', 'Shows understanding of the Eora perspective'], 50),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'continents', term: 3, strand: 'Geography',
        title: 'Continents, oceans and environments',
        summary: 'The world’s continents and oceans, and the types of natural vegetation and environments.',
        lessons: [
          {
            id: 'world', title: 'Continents and oceans', minutes: 12,
            blocks: [
              { type: 'read', text: `A **continent** is a very large area of land. There are **7 continents**:\n**Asia** (the largest), **Africa**, **North America**, **South America**, **Antarctica**, **Europe** and **Australia** (part of the region called Oceania — the smallest continent).\n\nThere are **5 oceans**: **Pacific** (the largest), **Atlantic**, **Indian**, **Southern** and **Arctic**.\n\nThe **equator** is an imaginary line around the middle of the Earth. Australia is in the **Southern Hemisphere**, so our seasons are opposite to Europe's — Christmas is in summer!` },
            ],
            practice: [
              num('How many continents are there?', 7, 'Asia, Africa, North America, South America, Antarctica, Europe, Australia.'),
              mc('Which is the largest continent?', ['Asia', 'Australia', 'Europe', 'Antarctica'], 0, 'Asia is the largest in both area and population.'),
              mc('Which is the largest ocean?', ['Pacific', 'Atlantic', 'Indian', 'Arctic'], 0, 'The Pacific Ocean is the largest.'),
              mc('Which ocean is to the west of Australia?', ['Indian Ocean', 'Pacific Ocean', 'Arctic Ocean', 'Atlantic Ocean'], 0, 'The Indian Ocean lies west of Australia.'),
              mc('Why is Christmas in summer in Australia?', ['Australia is in the Southern Hemisphere', 'Australia is near the North Pole', 'It is always summer here', 'The calendar is different'], 0, 'Southern Hemisphere seasons are opposite to the Northern Hemisphere’s.'),
            ],
          },
          {
            id: 'vegetation', title: 'Natural vegetation and environments', minutes: 12,
            blocks: [
              { type: 'read', text: `**Natural vegetation** is the plant life that grows naturally in a place. It depends on **climate**, **soil** and **water**.\n- **Rainforest** — tall, dense trees, lots of rain (Daintree in Queensland, Amazon in South America)\n- **Desert** — little rain, spinifex grass and saltbush (Simpson Desert, Sahara)\n- **Grassland** — grasses, few trees (Mitchell grass plains, African savanna)\n- **Eucalypt forest and woodland** — gum trees, common across Australia\n- **Tundra** — very cold, small plants (near the Arctic)\n\nEnvironments give people and animals **food, water, shelter, medicine** and **materials**. Water sources like rivers, wetlands and springs are vital in a dry continent.` },
            ],
            practice: [
              mc('Which environment has tall, dense trees and lots of rain?', ['rainforest', 'desert', 'tundra', 'grassland'], 0, 'Rainforests are wet and lush.'),
              mc('Spinifex grass grows in Australia’s…', ['deserts', 'rainforests', 'snowfields', 'oceans'], 0, 'Spinifex is adapted to dry, hot places.'),
              mc('Natural vegetation depends mostly on…', ['climate, soil and water', 'roads', 'shops', 'cars'], 0, 'These natural conditions decide what grows.'),
              mc('Why are wetlands important?', ['They provide water, food and homes for many animals and birds', 'They are good for car parks', 'They are not important', 'They make deserts'], 0, 'Wetlands are rich habitats and filter water.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'sustainability', term: 3, strand: 'Geography',
        title: 'Using and protecting resources',
        summary: 'How people use and manage environments and resources, including waste, sustainably.',
        lessons: [
          {
            id: 'resources', title: 'Natural resources', minutes: 12,
            blocks: [
              { type: 'read', text: `**Natural resources** are things from nature that people use: water, soil, trees, minerals, fish, sunlight and wind.\n- **Renewable** resources can be replaced naturally (sunlight, wind, water, trees if replanted)\n- **Non-renewable** resources will run out (coal, oil, gas, minerals)\n\n**Sustainability** means using resources in a way that leaves enough for the future and keeps the environment healthy.` },
            ],
            practice: [
              mc('Which is a renewable resource?', ['sunlight', 'coal', 'oil', 'natural gas'], 0, 'The Sun will keep shining.'),
              mc('Which is non-renewable?', ['coal', 'wind', 'sunlight', 'water'], 0, 'Coal takes millions of years to form.'),
              mc('What does sustainability mean?', ['using resources so there is enough for the future', 'using everything up quickly', 'never using any resources', 'buying more things'], 0, 'Sustainability looks after the future.'),
            ],
          },
          {
            id: 'waste', title: 'Waste and the 4 Rs', minutes: 12,
            blocks: [
              { type: 'read', text: `Australians create a lot of waste. Managing waste helps protect land, waterways and oceans.\n\n**The 4 Rs:**\n- **Reduce** — use less (say no to plastic bags)\n- **Reuse** — use things again (water bottles, containers)\n- **Recycle** — turn old materials into new products (paper, glass, cans, some plastics)\n- **Recover** — get value from waste (compost food scraps, worm farms)\n\nMany states have **container deposit schemes** where you get 10 cents for returning eligible drink containers.\n\nCouncils run rubbish and recycling collections — the yellow lid bin is usually for recycling.` },
              { type: 'activity', text: 'Do a waste audit: for one day, record everything your family throws away. Sort it into landfill, recycling and compost. What could you reduce?' },
            ],
            practice: [
              mc('Which of the 4 Rs is best to do first?', ['Reduce', 'Recycle', 'Recover', 'Throw away'], 0, 'Reducing means less waste is made in the first place.'),
              mc('Putting food scraps in a compost bin is an example of…', ['recovering (composting)', 'littering', 'reusing a bottle', 'buying more'], 0, 'Composting recovers value from food waste.'),
              mc('Using a refillable water bottle every day is…', ['reusing', 'recycling', 'reducing waste to landfill by burning', 'littering'], 0, 'You use the same bottle again and again.'),
              write('Write a persuasive message for your school newsletter encouraging students to reduce waste. Give two ideas.', ['A clear message', 'At least two ideas', 'Persuasive words'], 30),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'local-government', term: 4, strand: 'Civics and citizenship', code: 'AC9HS4K08',
        title: 'Local government and community services',
        summary: 'The roles of local government and how community members use and contribute to local services.',
        lessons: [
          {
            id: 'levels', title: 'Three levels of government', minutes: 12,
            blocks: [
              { type: 'read', text: `Australia has **three levels of government**:\n1. **Federal (Australian) Government** — in Canberra; looks after the whole country: defence, passports, money, Medicare\n2. **State and Territory Governments** — schools, hospitals, police, main roads, public transport\n3. **Local Government (councils)** — looks after the local area\n\nAdults **vote** to choose representatives at each level. A local council has **councillors** and is led by a **mayor** (or shire president).` },
            ],
            practice: [
              mc('Which level of government collects household rubbish?', ['local government (council)', 'federal government', 'the United Nations', 'state police'], 0, 'Councils provide rubbish and recycling collection.'),
              mc('Who leads a local council?', ['a mayor', 'the Prime Minister', 'the Governor-General', 'a principal'], 0, 'Mayors lead local councils.'),
              num('How many levels of government does Australia have?', 3, 'Federal, state/territory and local.'),
              mc('Which level of government is in charge of defence and passports?', ['federal', 'local', 'school', 'state'], 0, 'National matters are federal.'),
            ],
          },
          {
            id: 'services', title: 'Council services and getting involved', minutes: 12,
            blocks: [
              { type: 'read', text: `**Councils provide services** such as:\n- rubbish and recycling collection\n- local roads, footpaths and street lighting\n- parks, playgrounds, sports grounds and swimming pools\n- libraries and community centres\n- pet registration and building approvals\n\nCouncils are paid for mostly by **rates** (charged to property owners), plus grants and fees.\n\n**Community members contribute** by voting in council elections, giving feedback on plans, volunteering (e.g. Landcare, library programs), attending community events and caring for shared spaces.` },
            ],
            practice: [
              mc('Which is a council service?', ['public library', 'the army', 'printing money', 'running hospitals'], 0, 'Local libraries are run by councils.'),
              mc('How are councils mostly funded?', ['rates paid by property owners', 'selling lollies', 'donations from schools', 'parking only'], 0, 'Rates are the main source of council income.'),
              mc('How can a Year 4 student contribute to their community?', ['volunteering at a tree-planting day', 'dropping litter in the park', 'ignoring community events', 'damaging playgrounds'], 0, 'Volunteering helps the community.'),
              write('Write a letter to your local mayor suggesting one improvement for your area (e.g. a new playground, more bike paths). Explain why it would help.', ['Addressed to the mayor', 'A clear suggestion', 'Reasons why it would help', 'Polite sign-off'], 40),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'belonging', term: 4, strand: 'Civics and citizenship', code: 'AC9HS4K09',
        title: 'Belonging and identity',
        summary: 'The cultural, religious and social groups people belong to, and why they matter for identity.',
        lessons: [
          {
            id: 'groups', title: 'The groups we belong to', minutes: 12,
            blocks: [
              { type: 'read', text: `We all belong to **groups** that help shape our **identity** — who we are.\n- **Family** and **cultural** groups (shared language, food, celebrations)\n- **Religious** groups (churches, mosques, temples, synagogues)\n- **Social** groups (sports teams, Scouts, Girl Guides, dance classes, school)\n\nAustralia is a **multicultural** country — about half of Australians were born overseas or have a parent who was. People speak hundreds of languages at home.\n\nBelonging helps people feel **safe, supported and connected**. Respecting other people's groups helps our community live together in **harmony**.` },
            ],
            practice: [
              mc('What does "identity" mean?', ['who you are and what makes you, you', 'your address', 'your password', 'your height'], 0, 'Identity includes culture, family, beliefs and interests.'),
              mc('A soccer club is an example of a…', ['social group', 'religious group', 'level of government', 'continent'], 0, 'Clubs and teams are social groups.'),
              mc('What does multicultural mean?', ['many cultures living together', 'one culture only', 'a type of food', 'a sport'], 0, 'Australia has people from many cultures.'),
              mc('Why is belonging to groups important?', ['It helps people feel safe, supported and connected', 'It isn’t important', 'It makes people lonely', 'Only for adults'], 0, 'Belonging supports wellbeing.'),
              write('Describe three groups you belong to and what each one means to you.', ['Three groups', 'What you do in each group', 'Why each one is important to you'], 30),
            ],
          },
        ],
        quiz: { n: 4 },
      },
    ],
  });
})();
