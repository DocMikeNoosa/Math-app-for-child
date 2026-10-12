/* Year 3 Technologies — Australian Curriculum v9.0: Digital Technologies, Design and Technologies */
(function () {
  const { mc, tf, inp, write } = LA.Q;

  LA.addSubject(3, {
    id: 'tech',
    intro: 'Digital systems, data, algorithms and coding ideas, staying safe online, and designing solutions.',
    chapters: [
      {
        id: 'digital-systems', term: 1, strand: 'Digital Technologies',
        title: 'Digital systems',
        summary: 'Hardware, software and how digital devices take input, process it and give output.',
        lessons: [
          {
            id: 'hardware-software', title: 'Hardware and software', minutes: 10,
            blocks: [
              { type: 'read', text: `A **digital system** is a device like a computer, tablet, smartphone or game console.\n- **Hardware** — the parts you can touch: screen, keyboard, mouse, speakers, camera\n- **Software** — the programs and apps that tell the hardware what to do: games, web browsers, drawing apps\n\nDigital systems work in steps:\n**Input** (you type, click, speak) → **Process** (the computer works it out) → **Output** (it shows a picture, plays a sound, prints)` },
            ],
            practice: [
              mc('Which is hardware?', ['keyboard', 'a game app', 'a web browser', 'a drawing program'], 0, 'You can touch a keyboard.'),
              mc('Which is software?', ['a drawing app', 'a mouse', 'a screen', 'a printer'], 0, 'Apps are software — instructions for the computer.'),
              mc('Typing on a keyboard is an example of…', ['input', 'output', 'storage', 'software'], 0, 'Typing puts information into the computer.'),
              mc('Which is an output device?', ['speakers', 'keyboard', 'microphone', 'mouse'], 0, 'Speakers send sound out of the computer.'),
              tf('A microphone is an input device.', true, 'It takes your voice into the computer.'),
            ],
          },
          {
            id: 'networks', title: 'Connecting devices', minutes: 10,
            blocks: [
              { type: 'read', text: `Devices can connect to share information. This is called a **network**.\n- **Wi-Fi** connects devices without wires\n- The **internet** is a giant network that connects computers all over the world\n- We use networks for email, video calls, streaming shows and online games\n\nInformation travels as **data** — tiny pieces of information.` },
            ],
            practice: [
              mc('What do we call devices connected together to share information?', ['a network', 'a keyboard', 'an app', 'a battery'], 0, 'A network links devices.'),
              mc('What connects devices without wires?', ['Wi-Fi', 'a pencil', 'a ruler', 'a USB stick'], 0, 'Wi-Fi uses radio waves.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'data', term: 2, strand: 'Digital Technologies',
        title: 'Data and patterns',
        summary: 'Collecting data and representing it with symbols, numbers and pictures — including how computers use 0s and 1s.',
        lessons: [
          {
            id: 'represent', title: 'Representing data', minutes: 12,
            blocks: [
              { type: 'read', text: `**Data** is information, like numbers, words, pictures and sounds.\n\nWe can represent the same data in different ways:\n- a **table**\n- a **picture graph** or **column graph**\n- **symbols** (☀️ for sunny, 🌧️ for rain)\n\nComputers store **all** data using just two digits: **0** and **1**. This is called **binary**. Think of a light switch — off (0) or on (1). Pictures on a screen are made of tiny dots called **pixels**.` },
              { type: 'activity', text: 'On grid paper, colour some squares black and leave others white to make a picture (like a smiley face). Then write each row as 1s (black) and 0s (white). That’s how computers store pictures!' },
            ],
            practice: [
              mc('Which two digits do computers use to store data?', ['0 and 1', '1 and 2', '5 and 10', '9 and 0'], 0, 'Computers use binary: 0 and 1.'),
              mc('What are the tiny dots that make up a picture on a screen?', ['pixels', 'pebbles', 'atoms', 'bytes'], 0, 'Pixels are tiny squares of colour.'),
              mc('Which is the clearest way to compare how many students like each sport?', ['a column graph', 'a long paragraph', 'a song', 'a guess'], 0, 'Graphs make comparisons easy to see.'),
              tf('Data can be words, numbers, pictures or sounds.', true, 'All of these are kinds of data.'),
            ],
          },
        ],
        quiz: { n: 4 },
      },
      {
        id: 'algorithms', term: 3, strand: 'Digital Technologies',
        title: 'Algorithms and coding',
        summary: 'Write step-by-step instructions using sequence, decisions (branching) and repeats.',
        lessons: [
          {
            id: 'sequence', title: 'Algorithms and sequence', minutes: 12,
            blocks: [
              { type: 'read', text: `An **algorithm** is a set of step-by-step instructions to solve a problem or do a task.\n\nA recipe is an algorithm! So are instructions for brushing your teeth.\n\nThe **sequence** (order) matters. If you put your shoes on **before** your socks, it doesn't work!\n\nComputers follow algorithms exactly — that's why instructions must be **clear and in the right order**. Instructions written for a computer are called **code**, and a mistake in code is called a **bug**.` },
            ],
            practice: [
              mc('What is an algorithm?', ['step-by-step instructions', 'a type of computer', 'a video game', 'a password'], 0, 'Algorithms are ordered steps.'),
              mc('Put the steps in order to make toast: A) put bread in toaster B) eat toast C) push lever down D) butter toast', ['A, C, D, B', 'B, A, C, D', 'C, A, B, D', 'D, C, B, A'], 0, 'Bread in → push lever → butter → eat.'),
              mc('A mistake in code is called a…', ['bug', 'pixel', 'byte', 'mouse'], 0, 'Finding and fixing bugs is called debugging.'),
            ],
          },
          {
            id: 'branching-loops', title: 'Decisions and repeats', minutes: 12,
            blocks: [
              { type: 'read', text: `**Branching (decisions)** — the algorithm does different things depending on a question:\n*IF it is raining THEN take an umbrella, ELSE wear a hat.*\n\n**Repeats (loops)** — doing the same steps again:\n*REPEAT 4 times: step forward, turn right.* → you walk in a square!\n\nUsing loops makes code shorter and easier to read.` },
              { type: 'activity', text: 'Be a robot! Ask a grown-up to give you instructions using only: forward 1 step, turn left, turn right, repeat. Can they guide you to the kitchen?' },
            ],
            practice: [
              mc('"IF it is cold THEN wear a jumper" is an example of…', ['branching (a decision)', 'a loop', 'hardware', 'output'], 0, 'IF…THEN is a decision.'),
              mc('"REPEAT 3 times: clap" — how many claps?', ['3', '1', '6', '0'], 0, 'The loop repeats the clap 3 times.'),
              mc('A robot follows: REPEAT 4 times (move forward 2, turn right). What shape does it draw?', ['a square', 'a circle', 'a triangle', 'a straight line'], 0, '4 equal sides with right-angle turns makes a square.'),
              mc('Why do programmers use loops?', ['to make code shorter instead of repeating steps', 'to make code longer', 'to break the computer', 'to add pictures'], 0, 'Loops save writing the same thing many times.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'design', term: 4, strand: 'Design and Technologies',
        title: 'Designing solutions',
        summary: 'Follow the design process to make something useful, choosing the right materials.',
        lessons: [
          {
            id: 'design-process', title: 'The design process', minutes: 12,
            blocks: [
              { type: 'read', text: `Designers solve problems using the **design process**:\n1. **Investigate** — What is the problem? Who is it for? What do they need?\n2. **Generate ideas** — brainstorm and sketch lots of ideas\n3. **Plan** — choose the best idea, list materials and steps\n4. **Make** — build it safely\n5. **Evaluate** — test it. Does it work? How could it be better?\n\nGood designs are **fit for purpose** (they do the job), safe and look good. Many designers also think about the environment — using recycled or reusable materials.` },
            ],
            practice: [
              mc('What is the first step of the design process?', ['Investigate the problem', 'Make it', 'Paint it', 'Sell it'], 0, 'First understand the problem and who it’s for.'),
              mc('Testing your design to see if it works is called…', ['evaluating', 'sketching', 'buying', 'guessing'], 0, 'Evaluating checks if the design meets the need.'),
              mc('"Fit for purpose" means…', ['it does the job it was made for', 'it is very expensive', 'it is the biggest', 'it is shiny'], 0, 'A design should work well for its purpose.'),
            ],
          },
          {
            id: 'materials-food', title: 'Materials, food and fibre', minutes: 12,
            blocks: [
              { type: 'read', text: `Designers choose **materials** by their **properties**: strong, waterproof, flexible, light, recyclable.\n- Raincoat → **waterproof** plastic or nylon\n- Bridge → **strong** steel or concrete\n\n**Food and fibre production:** Australian farmers grow food (wheat, fruit, vegetables, beef) and **fibres** for clothes — **wool** from sheep and **cotton** from plants. Technologies like irrigation and machinery help farmers produce food and fibre.` },
            ],
            practice: [
              mc('Which property is most important for a raincoat?', ['waterproof', 'see-through', 'heavy', 'crunchy'], 0, 'A raincoat must keep you dry.'),
              mc('Wool comes from…', ['sheep', 'cotton plants', 'trees', 'rocks'], 0, 'Wool is sheared from sheep.'),
              mc('Cotton comes from…', ['a plant', 'sheep', 'cows', 'oil'], 0, 'Cotton grows on cotton plants.'),
              write('Design a lunchbox that keeps food cool. Describe your design, the materials you would use and why.', ['Describes the design', 'Names materials', 'Explains why each material was chosen'], 30),
            ],
          },
        ],
        quiz: { n: 6 },
      },
    ],
  });
})();
