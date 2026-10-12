/* Year 3 Health and Physical Education — Australian Curriculum v9.0: Personal, social and community health; Movement and physical activity */
(function () {
  const { mc, tf, write } = LA.Q;

  LA.addSubject(3, {
    id: 'hpe',
    intro: 'Feelings and strengths, friendships, staying safe, healthy eating, being active and movement skills.',
    chapters: [
      {
        id: 'identity', term: 1, strand: 'Personal, social and community health',
        title: 'Me, my strengths and my feelings',
        summary: 'Recognise personal strengths, name emotions and use strategies to manage them.',
        lessons: [
          {
            id: 'strengths', title: 'My strengths', minutes: 10,
            blocks: [
              { type: 'read', text: `Everyone has **strengths** — things they are good at or qualities that make them special.\n- **Skills:** drawing, swimming, maths, building, singing\n- **Qualities:** kind, brave, funny, patient, honest, a good friend\n\nKnowing your strengths helps you feel confident. Trying new things helps you grow new strengths. It's okay to find some things hard — that's how we learn!` },
              { type: 'activity', text: 'Draw yourself in the middle of a page. Around you, write 5 strengths — 3 things you are good at and 2 qualities. Ask someone in your family to add one more!' },
            ],
            practice: [
              mc('Which of these is a personal quality?', ['being kind', 'a red bike', 'a big house', 'new shoes'], 0, 'Kindness is a quality — part of who you are.'),
              tf('Making mistakes is a normal part of learning.', true, 'Everyone makes mistakes. They help us learn and improve.'),
              mc('What can you say to yourself when something is hard?', ['"I can’t do it YET, but I’ll keep trying."', '"I give up."', '"I’m hopeless."', '"It’s too hard forever."'], 0, 'A growth mindset helps you keep going.'),
            ],
          },
          {
            id: 'emotions', title: 'Feelings and emotions', minutes: 12,
            blocks: [
              { type: 'read', text: `We all have lots of **emotions**: happy, excited, proud, sad, angry, worried, scared, frustrated, embarrassed.\n\nOur bodies give us clues: a fast heartbeat, butterflies in the tummy, hot face, clenched fists.\n\nAll feelings are okay. What matters is how we **manage** them:\n- take **deep breaths** (smell the flower, blow out the candle)\n- count to 10\n- **talk** to someone you trust\n- move your body — go for a walk or jump around\n- draw or write about it\n- have a quiet break` },
            ],
            practice: [
              mc('Your friend’s face is red and their fists are clenched. They might be feeling…', ['angry', 'sleepy', 'bored', 'hungry'], 0, 'A red face and clenched fists are common signs of anger.'),
              mc('Which is a helpful way to calm down when you feel angry?', ['Take slow, deep breaths', 'Throw something', 'Yell at someone', 'Hit a wall'], 0, 'Deep breathing slows your heart rate and helps you think.'),
              tf('It is okay to feel sad sometimes.', true, 'All feelings are normal. Talking about them helps.'),
              mc('You feel worried about a test. What could help?', ['Talk to a parent or teacher about it', 'Keep it a secret forever', 'Stay awake all night', 'Pretend to be sick'], 0, 'Sharing worries with a trusted adult helps.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'relationships', term: 1, strand: 'Personal, social and community health',
        title: 'Friendships and respectful relationships',
        summary: 'Being a good friend, including others, solving conflicts and standing up to bullying.',
        lessons: [
          {
            id: 'friends', title: 'Being a good friend', minutes: 10,
            blocks: [
              { type: 'read', text: `Good friends:\n- **listen** to each other\n- **share** and take turns\n- are **kind** and **honest**\n- **include** others in games\n- **respect** differences — people have different cultures, families, abilities and ideas\n\nShowing **empathy** means trying to understand how someone else feels ("walking in their shoes").` },
            ],
            practice: [
              mc('A new student is standing alone at lunch. What could you do?', ['Invite them to join your game', 'Ignore them', 'Laugh at them', 'Walk away'], 0, 'Including others is kind and helps them feel welcome.'),
              mc('What is empathy?', ['understanding how someone else feels', 'being the best at sport', 'winning an argument', 'keeping secrets'], 0, 'Empathy is imagining how others feel.'),
              mc('Which shows respect?', ['Listening when someone else is talking', 'Interrupting', 'Making fun of someone’s accent', 'Leaving people out'], 0, 'Listening shows you value what someone says.'),
            ],
          },
          {
            id: 'conflict-bullying', title: 'Solving problems and bullying', minutes: 12,
            blocks: [
              { type: 'read', text: `Friends sometimes disagree. To solve a problem:\n1. **Stop** and calm down\n2. **Talk** — use "I" statements: "I feel upset when you take the ball without asking."\n3. **Listen** to the other person\n4. **Find a fair solution** together (take turns, share, compromise)\n\n**Bullying** is when someone **repeatedly** hurts, scares or leaves out another person on purpose. It can be physical, verbal, social or online. It is **never okay**.\n\nIf you see or experience bullying: tell the person to stop if it's safe, walk away, and **tell a trusted adult**. Being an **upstander** (not a bystander) means helping.` },
            ],
            practice: [
              mc('Which is an "I" statement?', ['"I feel sad when I’m left out."', '"You’re mean!"', '"Go away!"', '"You always ruin everything."'], 0, '"I" statements explain your feelings without blaming.'),
              mc('What makes something bullying?', ['It happens again and again on purpose', 'It happens once by accident', 'Friends disagree about a game', 'Someone says no to sharing once'], 0, 'Bullying is repeated and deliberate.'),
              mc('What should you do if you are being bullied?', ['Tell a trusted adult', 'Keep it secret', 'Bully them back', 'Stop going to school'], 0, 'Trusted adults can help stop bullying.'),
              mc('An upstander is someone who…', ['helps when they see someone being treated badly', 'watches and laughs', 'joins in the bullying', 'ignores everything'], 0, 'Upstanders take safe action to help.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'safety', term: 2, strand: 'Personal, social and community health',
        title: 'Staying safe',
        summary: 'Safe and unsafe situations, trusted adults and getting help, and safety in the sun, water, on roads and online.',
        lessons: [
          {
            id: 'help', title: 'Unsafe feelings and getting help', minutes: 12,
            blocks: [
              { type: 'read', text: `Our bodies give **early warning signs** when we feel unsafe: sweaty hands, fast heartbeat, butterflies, wanting to run away.\n\nIf you feel unsafe:\n- **Say NO** firmly\n- **Get away** to a safe place\n- **Tell** a trusted adult — and keep telling until someone helps\n\nA **trusted adult** is a grown-up who listens and helps, like a parent, carer, teacher, school counsellor or police officer. Make a list of 5 trusted adults — your "helping hand".\n\nIn an emergency, call **000** (triple zero). Kids can also call **Kids Helpline on 1800 55 1800** any time.` },
            ],
            practice: [
              mc('What number do you call in an emergency in Australia?', ['000', '911', '111', '123'], 0, 'Triple zero (000) is Australia’s emergency number.'),
              mc('Which is an early warning sign that you feel unsafe?', ['a fast heartbeat and sweaty hands', 'feeling sleepy after lunch', 'laughing at a joke', 'feeling hungry'], 0, 'These are body signals that something is not right.'),
              mc('If you tell an adult and they don’t help, you should…', ['tell another trusted adult', 'give up', 'keep it secret', 'feel it was your fault'], 0, 'Keep telling until someone helps.'),
              tf('A trusted adult is someone who listens and helps keep you safe.', true, 'Trusted adults help when you need it.'),
            ],
          },
          {
            id: 'sun-water-road', title: 'Sun, water and road safety', minutes: 12,
            blocks: [
              { type: 'read', text: `**Sun safety** — Australia has very strong UV rays. Remember:\n- **Slip** on a shirt · **Slop** on sunscreen (SPF 30+) · **Slap** on a hat · **Seek** shade · **Slide** on sunglasses\n\n**Water safety:**\n- Always swim **between the red and yellow flags** at the beach\n- Swim with an adult watching\n- If you get into trouble, stay calm, float, and raise one arm to signal for help\n\n**Road safety:**\n- **Stop, Look, Listen, Think** before crossing\n- Hold an adult's hand and use pedestrian crossings\n- Wear a helmet when riding a bike or scooter\n- Wear a seatbelt in the car` },
            ],
            practice: [
              mc('At the beach, where should you swim?', ['between the red and yellow flags', 'anywhere', 'near the rocks', 'outside the flags'], 0, 'Lifesavers watch the area between the flags.'),
              mc('What does "Slap" mean in sun safety?', ['Slap on a hat', 'Slap your friend', 'Slap the water', 'Slap on shoes'], 0, 'Slip, Slop, Slap, Seek, Slide — Slap on a hat.'),
              mc('What should you do if you get into trouble in the water?', ['Stay calm, float and raise one arm', 'Swim hard against the current', 'Hide under the water', 'Scream and splash'], 0, 'Floating and raising an arm signals for help.'),
              mc('Before crossing the road you should…', ['Stop, Look, Listen, Think', 'Run quickly', 'Look at your phone', 'Close your eyes'], 0, 'Stop, Look, Listen, Think helps you cross safely.'),
              mc('What SPF sunscreen is recommended?', ['30 or higher', '5', '1', 'none'], 0, 'SPF 30+ is recommended in Australia.'),
            ],
          },
          {
            id: 'online', title: 'Staying safe online', minutes: 10,
            blocks: [
              { type: 'read', text: `The internet is fun, but we need to be careful:\n- Keep **personal information private**: your full name, address, school, phone number and passwords\n- Only talk to people you **know in real life**\n- Ask an adult before downloading or buying anything\n- If something online makes you feel **uncomfortable, scared or confused**, close it and **tell an adult**\n- Be kind online — think before you post\n\nThe **eSafety Commissioner** (esafety.gov.au) helps Australians stay safe online.` },
            ],
            practice: [
              mc('Someone you don’t know asks for your address in a game chat. What should you do?', ['Don’t answer and tell an adult', 'Tell them your address', 'Tell them your school', 'Send a photo'], 0, 'Never share personal information with strangers online.'),
              mc('Which information should you keep private online?', ['your password', 'your favourite colour', 'your favourite animal', 'what you had for lunch'], 0, 'Passwords should never be shared (except with a parent).'),
              tf('If something online upsets you, it is best to keep it secret.', false, 'Always tell a trusted adult.'),
            ],
          },
        ],
        quiz: { n: 9 },
      },
      {
        id: 'healthy-eating', term: 3, strand: 'Personal, social and community health',
        title: 'Healthy eating',
        summary: 'The five food groups from the Australian Guide to Healthy Eating, drinking water and "sometimes" foods.',
        lessons: [
          {
            id: 'food-groups', title: 'The five food groups', minutes: 12,
            blocks: [
              { type: 'read', text: `The **Australian Guide to Healthy Eating** shows **five food groups** we should eat every day:\n1. **Vegetables** and legumes/beans — eat lots of these! (carrots, broccoli, lentils)\n2. **Fruit** (apples, bananas, mangoes)\n3. **Grain (cereal) foods**, mostly wholegrain (bread, rice, pasta, oats)\n4. **Lean meats and poultry, fish, eggs, tofu, nuts and seeds, legumes/beans**\n5. **Milk, yoghurt, cheese** and/or alternatives\n\nAnd **drink plenty of water**!\n\nFoods like lollies, chips, cake and soft drink are **"sometimes foods"** — they aren't in the five groups and should only be eaten sometimes and in small amounts.` },
            ],
            practice: [
              mc('Which food group should make up the biggest part of what we eat?', ['vegetables and legumes', 'lollies', 'soft drinks', 'chips'], 0, 'Vegetables should be a big part of every day’s food.'),
              mc('Cheese belongs to which food group?', ['milk, yoghurt, cheese and alternatives', 'fruit', 'grain foods', 'vegetables'], 0, 'Cheese is made from milk.'),
              mc('What is the best drink when you are thirsty?', ['water', 'soft drink', 'energy drink', 'cordial'], 0, 'Water keeps your body hydrated without added sugar.'),
              mc('Which is a "sometimes food"?', ['potato chips', 'an apple', 'brown rice', 'yoghurt'], 0, 'Chips are high in salt and fat — a sometimes food.'),
              mc('Eggs and tofu belong in the same group as…', ['meat, fish, nuts and legumes', 'fruit', 'milk', 'bread'], 0, 'They are protein foods.'),
            ],
          },
          {
            id: 'healthy-lunchbox', title: 'Planning a healthy lunchbox', minutes: 12,
            blocks: [
              { type: 'read', text: `A healthy lunchbox has food from **several** of the five food groups:\n- a **sandwich or wrap** on wholegrain bread with chicken, egg, cheese or hummus and salad\n- **vegetable sticks** (carrot, cucumber, capsicum)\n- a piece of **fruit**\n- **yoghurt** or cheese\n- a bottle of **water**\n\nEating well gives you **energy** to learn and play, helps you **grow**, and keeps your body **healthy**.` },
            ],
            practice: [
              mc('Which lunchbox is the healthiest?', ['wholegrain sandwich, carrot sticks, an apple and water', 'chips, chocolate and soft drink', 'lollies and a cake', 'only a muesli bar'], 0, 'It has foods from several food groups and water.'),
              write('Plan a healthy lunchbox for a school day. List what you would pack and which food group each item is from.', ['At least 4 foods', 'Foods from at least 3 food groups', 'A healthy drink'], 25),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'active', term: 3, strand: 'Movement and physical activity',
        title: 'Being active and fit',
        summary: 'Why physical activity matters, how much children need, and how our bodies respond to exercise.',
        lessons: [
          {
            id: 'why-active', title: 'Why be active?', minutes: 12,
            blocks: [
              { type: 'read', text: `Australia's guidelines say children aged 5–17 should do at least **60 minutes** of moderate to vigorous **physical activity every day**, and limit fun screen time to no more than **2 hours** a day. Children your age also need **9 to 11 hours of sleep** each night.\n\nBeing active:\n- makes your **heart and lungs** stronger\n- builds strong **muscles and bones**\n- helps you **sleep** and **concentrate**\n- improves your **mood** and helps with stress\n\nWhen you exercise, your **heart beats faster**, you **breathe harder** and you may **sweat** — that's your body working!` },
              { type: 'activity', text: 'Feel your pulse on your wrist or neck. Count beats for 15 seconds. Now do 30 star jumps and count again. What changed?' },
            ],
            practice: [
              mc('How many minutes of physical activity should children do each day?', ['at least 60', '5', '10', '600'], 0, 'At least 60 minutes of moderate to vigorous activity every day.'),
              mc('What happens to your heart when you exercise?', ['It beats faster', 'It stops', 'It beats slower', 'Nothing'], 0, 'Your heart pumps faster to send oxygen to your muscles.'),
              mc('How much sleep do 8-year-olds need?', ['9 to 11 hours', '3 hours', '5 hours', '15 hours'], 0, 'Children 5–13 need 9–11 hours of sleep.'),
              mc('Which is vigorous activity?', ['running in a game of tag', 'watching TV', 'reading in bed', 'sitting in the car'], 0, 'Running makes you puff — that is vigorous.'),
            ],
          },
          {
            id: 'warm-up', title: 'Warming up and cooling down', minutes: 10,
            blocks: [
              { type: 'read', text: `Before exercise, **warm up** with gentle movement like jogging on the spot and arm circles. This gets muscles ready and helps prevent injury.\n\nAfter exercise, **cool down** with walking and gentle **stretches** to help your body recover.\n\nDrink water before, during and after activity — especially on hot days!` },
              { type: 'activity', text: 'Do a 3-minute warm up: 30 seconds each of marching, arm circles, side steps, gentle jogging, knee lifts and shoulder rolls.' },
            ],
            practice: [
              mc('Why do we warm up before exercise?', ['To get muscles ready and help prevent injury', 'To get tired quickly', 'To waste time', 'To get cold'], 0, 'Warming up prepares your body.'),
              mc('When should you drink water during exercise?', ['before, during and after', 'never', 'only the next day', 'only before'], 0, 'Staying hydrated is important.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'movement', term: 4, strand: 'Movement and physical activity',
        title: 'Movement skills, games and fair play',
        summary: 'Throwing, catching, kicking and balancing skills, plus teamwork and fair play.',
        lessons: [
          {
            id: 'skills', title: 'Throw, catch, kick and balance', minutes: 15,
            blocks: [
              { type: 'read', text: `**Overarm throw:** stand side-on, step forward with the opposite foot to your throwing arm, swing your arm back then over, follow through towards the target.\n\n**Catching:** watch the ball, hands out with fingers spread, "give" with the ball (pull it in to your body).\n\n**Kicking:** look at the ball, step beside it with your non-kicking foot, swing the kicking leg and follow through.\n\n**Balance:** keep your eyes on a fixed spot, arms out, tighten your tummy muscles.` },
              { type: 'activity', text: 'Practise with a ball and a partner: 10 overarm throws, 10 catches, and 10 kicks at a target. Then try standing on one foot for 20 seconds — each foot!' },
            ],
            practice: [
              mc('When throwing overarm with your right hand, which foot steps forward?', ['left', 'right', 'both', 'neither'], 0, 'Step with the opposite foot to your throwing arm.'),
              mc('What should you do with your eyes when catching?', ['watch the ball', 'close them', 'look at the crowd', 'look at your feet'], 0, 'Keep your eyes on the ball all the way into your hands.'),
              mc('What helps with balance?', ['looking at a fixed spot and arms out', 'spinning around', 'closing your eyes', 'looking up at the sky'], 0, 'Focusing on one spot helps your body stay steady.'),
            ],
          },
          {
            id: 'fair-play', title: 'Teamwork and fair play', minutes: 10,
            blocks: [
              { type: 'read', text: `**Fair play** means:\n- following the rules\n- playing safely\n- including everyone\n- encouraging teammates\n- being a good winner (no showing off) and a good loser (shake hands, say "good game")\n\n**Teamwork** means working together: passing the ball, talking to each other, and helping teammates.` },
            ],
            practice: [
              mc('Your team lost the game. What is the best thing to do?', ['Shake hands and say "good game"', 'Argue with the referee', 'Storm off', 'Blame a teammate'], 0, 'Being a good sport shows respect.'),
              mc('Which shows good teamwork?', ['passing to a teammate who is in a better position', 'never passing', 'yelling at teammates', 'playing alone'], 0, 'Teams work best when players share and help.'),
              tf('Including everyone in a game is part of fair play.', true, 'Fair play means everyone gets a go.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
    ],
  });
})();
