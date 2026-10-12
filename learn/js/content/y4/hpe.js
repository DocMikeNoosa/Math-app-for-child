/* Year 4 Health and Physical Education — Australian Curriculum v9.0 */
(function () {
  const { mc, tf, write } = LA.Q;

  LA.addSubject(4, {
    id: 'hpe',
    intro: 'Growing and changing, resilience, respectful relationships, safety and help-seeking, nutrition, fitness and movement strategies.',
    chapters: [
      {
        id: 'growing', term: 1, strand: 'Personal, social and community health',
        title: 'Growing, changing and resilience',
        summary: 'How we change as we grow, coping with challenges, and building resilience.',
        lessons: [
          {
            id: 'change', title: 'Growing and changing', minutes: 10,
            blocks: [
              { type: 'read', text: `As we grow, we change in many ways:\n- **Physically** — taller, stronger, new teeth, more skills\n- **Socially** — new friends, joining teams, more independence\n- **Emotionally** — understanding and managing feelings better\n\nWe also face **transitions** (changes) like a new school, a new sibling, moving house or family changes. It's normal to feel a mix of excitement and worry.` },
            ],
            practice: [
              mc('Starting at a new school is an example of a…', ['transition', 'food group', 'sport', 'rule'], 0, 'A transition is a change from one situation to another.'),
              tf('It is normal to feel both excited and nervous about a big change.', true, 'Mixed feelings are very common.'),
              mc('Which is a social change as you grow?', ['making new friends and joining teams', 'losing baby teeth', 'growing taller', 'getting stronger muscles'], 0, 'Social changes are about relationships.'),
            ],
          },
          {
            id: 'resilience', title: 'Resilience: bouncing back', minutes: 12,
            blocks: [
              { type: 'read', text: `**Resilience** is being able to **bounce back** when things are hard.\n\nResilience strategies:\n- **Positive self-talk**: "This is hard, but I can try another way."\n- **Problem-solve**: break the problem into small steps\n- **Ask for help** from someone you trust\n- **Look after yourself**: sleep, healthy food, exercise, fun\n- **Keep perspective**: "Is this a big problem or a small problem?"\n- **Focus on what you can control**\n\nMistakes and setbacks help us learn and grow.` },
            ],
            practice: [
              mc('What does resilience mean?', ['bouncing back from difficulties', 'never having problems', 'always winning', 'giving up quickly'], 0, 'Resilient people recover from setbacks.'),
              mc('Which is positive self-talk?', ['"I’ll practise and get better."', '"I’m useless."', '"I always fail."', '"Why bother?"'], 0, 'Positive self-talk encourages you.'),
              mc('You didn’t make the netball team. A resilient response is…', ['keep practising and try again next season', 'never play netball again', 'be mean to the players who made it', 'blame the coach forever'], 0, 'Resilience means trying again.'),
              mc('Losing a pencil is a…', ['small problem', 'huge disaster', 'emergency', 'reason to call 000'], 0, 'Keeping perspective helps you stay calm.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'relationships', term: 1, strand: 'Personal, social and community health',
        title: 'Respectful relationships',
        summary: 'Respect, inclusion, consent and personal boundaries, and recognising and responding to bullying.',
        lessons: [
          {
            id: 'respect', title: 'Respect, inclusion and diversity', minutes: 12,
            blocks: [
              { type: 'read', text: `Respectful relationships are based on **kindness, fairness, honesty, trust** and **listening**.\n\nPeople are **diverse** — different cultures, religions, abilities, family types, appearances and interests. Treating everyone with respect makes everyone feel they **belong**.\n\n**Stereotypes** are unfair ideas that all people in a group are the same (e.g. "girls can't play footy"). They aren't true and can hurt people.` },
            ],
            practice: [
              mc('Which is a stereotype?', ['"Boys can’t dance."', '"Everyone is different."', '"I like dancing."', '"Some people like football."'], 0, 'It unfairly says all boys are the same.'),
              mc('How can you show respect for someone from a different culture?', ['Be curious and ask kindly about their culture', 'Make fun of their food', 'Ignore them', 'Tell them to change'], 0, 'Curiosity and kindness show respect.'),
              tf('Including everyone helps people feel they belong.', true, 'Inclusion is part of respect.'),
            ],
          },
          {
            id: 'boundaries', title: 'Personal space, consent and bullying', minutes: 12,
            blocks: [
              { type: 'read', text: `Everyone has the right to **personal space** and to say **no** to touch they don't want — even from people they know. Asking first ("Can I hug you?") and accepting the answer is called **consent**.\n\n**Bullying** is repeated, deliberate behaviour that hurts or scares someone. It can be:\n- **Physical** (hitting, pushing) · **Verbal** (name-calling) · **Social** (leaving out, spreading rumours) · **Cyberbullying** (online)\n\nIf you see bullying, be an **upstander**: support the person, don't join in, and **tell a trusted adult**.\n\nKids Helpline: **1800 55 1800** · Emergency: **000**` },
            ],
            practice: [
              mc('Asking "Can I give you a hug?" and accepting the answer is…', ['consent', 'bullying', 'a stereotype', 'resilience'], 0, 'Consent means asking and respecting the answer.'),
              mc('Spreading rumours to leave someone out is which type of bullying?', ['social', 'physical', 'verbal only', 'not bullying'], 0, 'Social bullying damages friendships and reputation.'),
              mc('What is cyberbullying?', ['bullying that happens online or on phones', 'a video game', 'a computer virus', 'a type of robot'], 0, 'Cyberbullying uses technology to hurt someone.'),
              tf('You can say no to a hug even from someone you know.', true, 'Your body belongs to you.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'safety', term: 2, strand: 'Personal, social and community health',
        title: 'Safety and help-seeking',
        summary: 'Identify risks, make safe choices, and know where and how to get help — including online and around medicines.',
        lessons: [
          {
            id: 'risks', title: 'Risky situations and safe choices', minutes: 12,
            blocks: [
              { type: 'read', text: `A **risk** is a chance that something could cause harm. To make safe choices:\n1. **Stop** and think: Is this safe?\n2. Think about what could happen (**consequences**)\n3. Choose the **safest option**\n4. **Get help** if you need it\n\nSafety tips:\n- **Medicines** should only be given by a trusted adult. Never take anything that isn't yours\n- Household chemicals can be poisonous — **Poisons Information Centre: 13 11 26**\n- Wear protective gear: helmets, knee pads, life jackets\n- **Bushfire and heat safety**: know your family plan, drink water, stay inside on extreme heat days` },
            ],
            practice: [
              mc('You find some tablets on the floor. What should you do?', ['Leave them and tell an adult', 'Taste one', 'Give them to a friend', 'Put them in your pocket'], 0, 'Never take medicine that isn’t given by a trusted adult.'),
              mc('What is the phone number for the Poisons Information Centre?', ['13 11 26', '000 000', '1800 55 1800', '123'], 0, 'The Poisons Information Centre is 13 11 26.'),
              mc('Your friend dares you to ride your bike without a helmet down a steep hill. You should…', ['say no and wear a helmet', 'do it to look cool', 'ride even faster', 'close your eyes'], 0, 'Thinking about consequences helps you choose safely.'),
            ],
          },
          {
            id: 'online', title: 'Online safety and digital wellbeing', minutes: 12,
            blocks: [
              { type: 'read', text: `Online safety:\n- Use **strong passwords** and keep them private\n- Check **privacy settings** with an adult\n- Never meet someone in person who you only know online\n- Don't share photos or personal details\n- **Block and report** people who make you uncomfortable, and tell an adult\n- Remember: things posted online can stay there **forever**\n\n**Digital wellbeing:** balance screen time with sleep, activity and time with family and friends. Screens off an hour before bed helps you sleep.` },
            ],
            practice: [
              mc('Someone you met in a game wants to meet you in person. What should you do?', ['Say no and tell a trusted adult', 'Go and meet them', 'Give them your address', 'Keep it secret'], 0, 'Never meet online-only contacts without a parent’s knowledge and presence.'),
              mc('Which password is strongest?', ['Kangaroo!Jump47Blue', '1234', 'password', 'your name'], 0, 'Long passwords with a mix of words, numbers and symbols are strong.'),
              mc('Why should screens be off before bed?', ['It helps you get to sleep', 'Screens get tired', 'It saves the internet', 'There is no reason'], 0, 'Screen light can make it harder to fall asleep.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'nutrition', term: 3, strand: 'Personal, social and community health',
        title: 'Nutrition and healthy choices',
        summary: 'Balanced eating, reading food labels, sugar in drinks, and influences on food choices.',
        lessons: [
          {
            id: 'balance', title: 'A balanced diet', minutes: 12,
            blocks: [
              { type: 'read', text: `The **Australian Guide to Healthy Eating** recommends eating a **wide variety** from the **five food groups** every day:\n1. Vegetables and legumes/beans\n2. Fruit\n3. Grain (cereal) foods, mostly wholegrain\n4. Lean meats and poultry, fish, eggs, tofu, nuts and seeds, legumes/beans\n5. Milk, yoghurt, cheese and/or alternatives\n\nNutrients and what they do:\n- **Carbohydrates** — energy (bread, rice, pasta)\n- **Protein** — growth and repair (meat, eggs, beans)\n- **Calcium** — strong bones and teeth (milk, cheese)\n- **Fibre** — healthy digestion (wholegrains, fruit, vegies)\n- **Vitamins and minerals** — keep your body working well (fruit and vegetables)` },
            ],
            practice: [
              mc('Which nutrient builds strong bones and teeth?', ['calcium', 'sugar', 'salt', 'fat'], 0, 'Calcium is found in dairy foods and some alternatives.'),
              mc('Protein helps your body to…', ['grow and repair', 'only feel sleepy', 'make sugar', 'change colour'], 0, 'Protein builds muscles and repairs tissue.'),
              mc('Which food is a good source of fibre?', ['wholegrain bread', 'lollies', 'soft drink', 'butter'], 0, 'Wholegrains are high in fibre.'),
              mc('Carbohydrates mainly give us…', ['energy', 'strong bones', 'eyesight', 'hair colour'], 0, 'Carbohydrates are the body’s main energy source.'),
            ],
          },
          {
            id: 'labels', title: 'Food labels, sugar and advertising', minutes: 12,
            blocks: [
              { type: 'read', text: `**Food labels** tell us what is in food. The **ingredients list** goes from **most to least**. If sugar is near the top, the food has lots of sugar.\n\nThe **Health Star Rating** gives packaged foods ½ to 5 stars — more stars usually means a healthier choice compared with similar foods.\n\nSugary drinks like soft drink, energy drinks and many juices can contain lots of sugar, which is bad for teeth and health. **Water** is the best drink.\n\n**Advertising** uses bright colours, cartoon characters, free toys and catchy songs to make us want foods — often "sometimes foods". Think before you choose!` },
            ],
            practice: [
              mc('On an ingredients list, the first ingredient is…', ['the one there is most of', 'the one there is least of', 'always water', 'the healthiest'], 0, 'Ingredients are listed from most to least.'),
              mc('A cereal has 4.5 Health Stars and another has 1.5. Which is usually healthier?', ['the 4.5-star cereal', 'the 1.5-star cereal', 'they are the same', 'neither'], 0, 'More stars usually means healthier compared with similar foods.'),
              mc('Why do food ads use cartoon characters?', ['to attract children to buy the food', 'to teach maths', 'to make food healthier', 'no reason'], 0, 'Ads target children with fun characters.'),
              mc('What is the healthiest everyday drink?', ['water', 'cola', 'energy drink', 'sports drink'], 0, 'Water hydrates without sugar.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'fitness', term: 3, strand: 'Movement and physical activity',
        title: 'Fitness and the body',
        summary: 'Components of fitness, how the heart and lungs respond to exercise, and setting fitness goals.',
        lessons: [
          {
            id: 'components', title: 'Parts of fitness', minutes: 12,
            blocks: [
              { type: 'read', text: `**Fitness** has several parts:\n- **Cardiovascular (aerobic) endurance** — heart and lungs working for a long time (running, swimming, cycling)\n- **Muscular strength** — how strong muscles are (push-ups, climbing)\n- **Muscular endurance** — muscles working many times without tiring (sit-ups)\n- **Flexibility** — how far you can stretch and bend\n- **Speed** and **agility** (changing direction quickly)\n\nDuring exercise your **heart rate** rises to pump blood carrying **oxygen** to muscles, and you **breathe faster**. Regular exercise makes your heart stronger.\n\nRemember: at least **60 minutes** of moderate to vigorous activity every day, and include muscle- and bone-strengthening activities on at least 3 days a week.` },
              { type: 'activity', text: 'Fitness circuit: 30 seconds each of star jumps, wall sit, plank, skipping, and toe touches. Rest 30 seconds between. Check your heart rate at the end!' },
            ],
            practice: [
              mc('Running a long way tests your…', ['cardiovascular endurance', 'flexibility', 'balance only', 'reaction time'], 0, 'Long-distance running uses your heart and lungs.'),
              mc('Touching your toes tests your…', ['flexibility', 'speed', 'strength', 'endurance'], 0, 'Flexibility is how far you can stretch.'),
              mc('Why does your heart beat faster when you exercise?', ['to pump more oxygen to your muscles', 'because it is scared', 'to cool you down', 'to make you hungry'], 0, 'Muscles need more oxygen when working hard.'),
              mc('Changing direction quickly in a game of tag uses…', ['agility', 'flexibility', 'muscular strength only', 'patience'], 0, 'Agility is moving and turning quickly.'),
            ],
          },
          {
            id: 'goals', title: 'Setting a fitness goal', minutes: 10,
            blocks: [{ type: 'read', text: `A good goal is **SMART**: **S**pecific, **M**easurable, **A**chievable, **R**elevant, **T**ime-bound.\n\n❌ "I want to be fitter."\n✅ "I will skip rope for 2 minutes without stopping by the end of the month, by practising 4 times a week."` }],
            practice: [
              mc('Which goal is SMART?', ['I will run 1 km without stopping by the end of term by practising 3 times a week.', 'I want to be good at sport.', 'I will be the best.', 'Maybe I’ll exercise.'], 0, 'It is specific, measurable and has a time limit.'),
              write('Write your own SMART fitness goal and three things you will do to achieve it.', ['Specific', 'Measurable', 'Has a time limit', 'Three action steps'], 30),
            ],
          },
        ],
        quiz: { n: 5 },
      },
      {
        id: 'strategies', term: 4, strand: 'Movement and physical activity',
        title: 'Game strategies and teamwork',
        summary: 'Attacking and defending strategies, movement skills in games, and leadership and fair play.',
        lessons: [
          {
            id: 'tactics', title: 'Attacking and defending', minutes: 12,
            blocks: [
              { type: 'read', text: `In team games (like soccer, netball, basketball, AFL), players use **strategies**:\n\n**Attacking** (your team has the ball):\n- move into **space** to be free for a pass\n- pass to an **open** teammate\n- **communicate** — call for the ball\n\n**Defending** (the other team has the ball):\n- stay **close** to your player (**marking**)\n- position yourself between your player and the goal\n- try to **intercept** passes\n\nThe skills of **dodging**, **feinting** (pretending to go one way), and quick passing help create space.` },
            ],
            practice: [
              mc('When your team has the ball, you should…', ['move into space to get free for a pass', 'stand still behind an opponent', 'sit down', 'run off the field'], 0, 'Finding space helps your team keep the ball.'),
              mc('Staying close to an opponent to stop them getting the ball is called…', ['marking (defending)', 'attacking', 'dribbling', 'serving'], 0, 'Marking is a defending skill.'),
              mc('Pretending to go one way then going the other way is a…', ['feint (dummy)', 'pass', 'goal', 'foul'], 0, 'A feint tricks the defender.'),
            ],
          },
          {
            id: 'leadership', title: 'Leadership and fair play', minutes: 10,
            blocks: [{ type: 'read', text: `Good **team leaders** encourage others, include everyone, stay positive when losing and are gracious when winning.\n\n**Fair play** means following rules, respecting umpires' decisions, playing safely, and being a good sport. Officials (umpires and referees) keep games fair and safe.` }],
            practice: [
              mc('The umpire makes a decision you disagree with. What should you do?', ['Accept it and keep playing', 'Yell at the umpire', 'Leave the game', 'Throw the ball'], 0, 'Respecting officials is part of fair play.'),
              mc('Which is good leadership in a team?', ['encouraging teammates after a mistake', 'blaming others', 'only passing to best friends', 'giving up'], 0, 'Leaders support their team.'),
            ],
          },
        ],
        quiz: { n: 5 },
      },
    ],
  });
})();
