/* Year 4 Technologies — Australian Curriculum v9.0: Digital Technologies, Design and Technologies */
(function () {
  const { mc, tf, num, write } = LA.Q;

  LA.addSubject(4, {
    id: 'tech',
    intro: 'Digital systems and networks, binary and data, algorithms with branching and loops, privacy and cybersecurity, and designing for people and the planet.',
    chapters: [
      {
        id: 'systems', term: 1, strand: 'Digital Technologies',
        title: 'Digital systems and networks',
        summary: 'Components of digital systems, how they connect in networks, and how data is transmitted.',
        lessons: [
          {
            id: 'components', title: 'Inside a digital system', minutes: 12,
            blocks: [
              { type: 'read', text: `Digital systems have **hardware** and **software** working together:\n- **Input devices**: keyboard, mouse, touchscreen, microphone, camera, sensors\n- **Processor (CPU)**: the "brain" that follows instructions\n- **Memory and storage**: keep data and programs (hard drive, SSD, USB, cloud)\n- **Output devices**: screen, speakers, printer, motors\n\n**Sensors** are input devices that measure the world — temperature, light, movement. A smart light turns on when its motion sensor detects you!\n\n**Operating systems** (like Windows, macOS, iOS, Android) are software that run the device.` },
            ],
            practice: [
              mc('Which part of a computer is like its "brain"?', ['processor (CPU)', 'mouse', 'speaker', 'screen'], 0, 'The CPU processes instructions.'),
              mc('A motion sensor in an automatic door is an…', ['input device', 'output device', 'operating system', 'app'], 0, 'Sensors collect information — that is input.'),
              mc('Which is an operating system?', ['Android', 'a mouse', 'a USB cable', 'a printer'], 0, 'Android is software that runs a device.'),
              mc('Where can data be stored?', ['hard drive, USB or the cloud', 'in the keyboard', 'in the speakers', 'in the mouse'], 0, 'Storage devices keep data.'),
            ],
          },
          {
            id: 'networks', title: 'Networks and the internet', minutes: 12,
            blocks: [
              { type: 'read', text: `A **network** connects devices so they can share data. Connections can be **wired** (cables) or **wireless** (Wi-Fi, Bluetooth, mobile data).\n\nData travels in small pieces called **packets**. A **router** directs packets to the right place, like a post office.\n\nThe **internet** is a worldwide network of networks. The **World Wide Web** is websites you visit using a **browser**.` },
            ],
            practice: [
              mc('Data is sent across networks in small pieces called…', ['packets', 'pixels', 'bricks', 'loops'], 0, 'Packets are reassembled when they arrive.'),
              mc('What does a router do?', ['directs data to the right place', 'prints documents', 'stores photos', 'charges batteries'], 0, 'Routers guide data around networks.'),
              mc('Which is a wireless connection?', ['Bluetooth', 'an ethernet cable', 'a USB cable', 'an HDMI cable'], 0, 'Bluetooth works without wires.'),
            ],
          },
        ],
        quiz: { n: 6 },
      },
      {
        id: 'binary', term: 2, strand: 'Digital Technologies',
        title: 'Data, binary and patterns',
        summary: 'How computers represent numbers, text and images with binary, and how data is collected and used.',
        lessons: [
          {
            id: 'binary', title: 'Counting in binary', minutes: 15,
            blocks: [
              { type: 'read', text: `Computers use **binary** — only **0** and **1**. Each 0 or 1 is called a **bit**. 8 bits make a **byte**.\n\nIn binary, each place is worth **double** the place to its right:\n**8 · 4 · 2 · 1**\n\n- 0001 = 1\n- 0010 = 2\n- 0011 = 2 + 1 = **3**\n- 0101 = 4 + 1 = **5**\n- 1010 = 8 + 2 = **10**\n\nLetters can be stored as numbers too — that's how text is saved. Images are grids of **pixels**, and each pixel's colour is stored as numbers.` },
              { type: 'activity', text: 'Make 4 cards with 8, 4, 2 and 1 dots. Flip cards face up (1) or down (0) to make every number from 0 to 15!' },
            ],
            practice: [
              num('What number is binary 0011? (places: 8 4 2 1)', 3, '2 + 1 = 3.'),
              num('What number is binary 0101? (places: 8 4 2 1)', 5, '4 + 1 = 5.'),
              num('What number is binary 1001? (places: 8 4 2 1)', 9, '8 + 1 = 9.'),
              num('What number is binary 1111? (places: 8 4 2 1)', 15, '8 + 4 + 2 + 1 = 15.'),
              mc('How many bits make a byte?', ['8', '2', '10', '100'], 0, '8 bits = 1 byte.'),
              mc('Each 0 or 1 is called a…', ['bit', 'byte', 'pixel', 'packet'], 0, 'A bit is a binary digit.'),
            ],
          },
          {
            id: 'data-use', title: 'Collecting and using data', minutes: 12,
            blocks: [
              { type: 'read', text: `Digital systems collect **data** all the time — weather stations, fitness watches, shop checkouts. Data can be organised in **tables** and **spreadsheets**, and shown in **graphs** to find patterns.\n\nSome data is **personal** (your name, address, photos, location). Apps and websites must protect it, and you should think carefully before sharing it.` },
            ],
            practice: [
              mc('Which tool is best for organising lots of numbers in rows and columns?', ['a spreadsheet', 'a drawing app', 'a music app', 'a camera'], 0, 'Spreadsheets organise data in a table.'),
              mc('Which is personal information?', ['your home address', 'the colour of the sky', 'the capital of Australia', 'how many legs a spider has'], 0, 'Your address identifies you and should be kept private.'),
            ],
          },
        ],
        quiz: { n: 7 },
      },
      {
        id: 'algorithms', term: 3, strand: 'Digital Technologies',
        title: 'Algorithms and visual programming',
        summary: 'Design algorithms with sequence, branching and iteration, and trace and debug them.',
        lessons: [
          {
            id: 'trace', title: 'Sequence, branching and iteration', minutes: 15,
            blocks: [
              { type: 'read', text: `Algorithms are built from three main structures:\n- **Sequence** — steps in order\n- **Branching (selection)** — **IF** a condition is true **THEN** do this, **ELSE** do that\n- **Iteration (loops)** — **REPEAT** steps a number of times or **UNTIL** something happens\n\nIn visual programming tools like **Scratch**, you snap blocks together: *when green flag clicked → repeat 10 → move 10 steps → if touching edge then bounce*.\n\n**Tracing** means following an algorithm step by step to see what it does.` },
              { type: 'example', title: 'Trace this algorithm', text: 'Set score to 0.\nREPEAT 3 times: add 5 to score.\nIF score > 10 THEN say "Winner!" ELSE say "Try again".\n\nScore: 0 → 5 → 10 → 15. 15 > 10, so it says **"Winner!"**' },
            ],
            practice: [
              num('Set x to 2. REPEAT 3 times: add 4 to x. What is x at the end?', 14, '2 → 6 → 10 → 14.'),
              mc('Set temp to 30. IF temp > 25 THEN say "Hot" ELSE say "Cool". What is said?', ['Hot', 'Cool', 'Nothing', 'Both'], 0, '30 is greater than 25, so "Hot".'),
              mc('"REPEAT UNTIL the bucket is full: add a cup of water" is an example of…', ['iteration (a loop)', 'sequence only', 'an output device', 'a bug'], 0, 'It repeats until a condition is met.'),
              num('Set n to 20. REPEAT 4 times: subtract 3 from n. What is n?', 8, '20 → 17 → 14 → 11 → 8.'),
              mc('Which structure lets a program make a decision?', ['branching (IF…THEN…ELSE)', 'sequence', 'a loop only', 'a variable name'], 0, 'Branching chooses between paths.'),
            ],
          },
          {
            id: 'debug', title: 'Debugging', minutes: 12,
            blocks: [
              { type: 'read', text: `A **bug** is an error in an algorithm or program. **Debugging** means finding and fixing bugs.\n\nDebugging tips:\n1. Test the program and compare what happens with what **should** happen\n2. Trace the steps one at a time\n3. Change **one thing** and test again\n\nCommon bugs: steps in the wrong order, a loop repeating the wrong number of times, or the wrong condition in an IF.` },
            ],
            practice: [
              mc('A robot should draw a square: REPEAT 3 times (forward 10, turn right 90°). What is the bug?', ['It should repeat 4 times, not 3', 'It should turn left', 'Forward should be 100', 'There is no bug'], 0, 'A square has 4 sides, so the loop needs to repeat 4 times.'),
              mc('An alarm should ring IF it is 7:00. It rings at 8:00 instead. The bug is probably in the…', ['condition of the IF', 'speakers', 'screen colour', 'power cable'], 0, 'The condition checks the wrong time.'),
              mc('What is debugging?', ['finding and fixing errors', 'adding bugs to code', 'deleting all code', 'buying a new computer'], 0, 'Debugging fixes problems.'),
            ],
          },
        ],
        quiz: { n: 8 },
      },
      {
        id: 'privacy', term: 3, strand: 'Digital Technologies',
        title: 'Privacy and cybersecurity',
        summary: 'Protecting personal information, strong passwords, and recognising scams.',
        lessons: [
          {
            id: 'security', title: 'Keeping data safe', minutes: 12,
            blocks: [
              { type: 'read', text: `**Cybersecurity** means protecting devices and data.\n- Use **strong passwords** — long, with a mix of words, numbers and symbols (a **passphrase** like *PurpleWombat!Jumps22*)\n- Don't reuse the same password everywhere\n- Never share passwords except with a parent or carer\n- **Log out** on shared devices\n- Watch out for **scams** and **phishing** — messages pretending to be from someone trusted asking for passwords or personal details, or saying you've won a prize\n- Only download apps with an adult's permission from trusted stores\n\nYour **digital footprint** is the trail of information you leave online. Think before you post!` },
            ],
            practice: [
              mc('A message says "You won a free iPad! Click here and enter your password." This is probably…', ['a scam (phishing)', 'a real prize', 'a message from school', 'safe to click'], 0, 'Requests for passwords with a prize are classic scams.'),
              mc('Which is the strongest password?', ['PurpleWombat!Jumps22', 'abc123', 'password', 'qwerty'], 0, 'Long passphrases with mixed characters are strongest.'),
              mc('What is a digital footprint?', ['the trail of information you leave online', 'a footprint in the sand', 'a type of shoe', 'a computer mouse'], 0, 'Everything you post or search leaves a trail.'),
              tf('You should log out of accounts on shared computers.', true, 'This stops others accessing your account.'),
            ],
          },
        ],
        quiz: { n: 4 },
      },
      {
        id: 'design', term: 4, strand: 'Design and Technologies',
        title: 'Designing for people and the planet',
        summary: 'Use the design process, consider users and sustainability, and explore food, fibre and engineering.',
        lessons: [
          {
            id: 'process', title: 'Design thinking and criteria', minutes: 12,
            blocks: [
              { type: 'read', text: `Designers write **design criteria** — a checklist of what a successful solution must do. For example, a bird feeder must:\n1. hold seed without spilling\n2. be safe for birds\n3. survive rain\n4. use recycled materials\n\nThen they **sketch** ideas with **labels**, build a **prototype** (test model), **test** it against the criteria and **improve** it.\n\n**Sustainable design** thinks about the whole life of a product: materials, energy used, how long it lasts and whether it can be reused or recycled.` },
            ],
            practice: [
              mc('What are design criteria?', ['a checklist of what a design must do', 'the price tag', 'the designer’s name', 'a type of glue'], 0, 'Criteria are used to judge success.'),
              mc('A test model of a design is called a…', ['prototype', 'criteria', 'sketch', 'label'], 0, 'Prototypes are built to test ideas.'),
              mc('Which is the most sustainable choice for a school project?', ['using recycled cardboard', 'buying new plastic every time', 'using materials once and throwing them out', 'using lots of glitter'], 0, 'Recycled materials reduce waste.'),
            ],
          },
          {
            id: 'engineering-food', title: 'Engineering, food and fibre', minutes: 12,
            blocks: [
              { type: 'read', text: `**Engineering:** structures must be strong and stable. **Triangles** are the strongest shape for frames — you'll see them in bridges, cranes and roof trusses. A wide base makes structures more **stable**.\n\n**Food and fibre:** Australia produces wheat, beef, lamb, dairy, fruit, seafood, **wool** and **cotton**. Technologies help farmers: drones to check crops, sensors to measure soil moisture, drip irrigation to save water.\n\n**Food preparation:** wash hands, use clean equipment, handle knives safely, and keep cold food cold.` },
              { type: 'activity', text: 'Using 20 straws (or rolled newspaper) and tape, build the tallest tower that can hold a tennis ball. Use triangles and a wide base!' },
            ],
            practice: [
              mc('Which shape makes frames strongest?', ['triangle', 'circle', 'square', 'oval'], 0, 'Triangles don’t change shape easily under force.'),
              mc('How can a tower be made more stable?', ['give it a wide base', 'make the base tiny', 'put the heaviest part on top', 'use wet paper'], 0, 'A wide base keeps structures steady.'),
              mc('How does drip irrigation help farmers?', ['it saves water by delivering it to plant roots', 'it makes rain', 'it removes soil', 'it feeds sheep'], 0, 'Drip irrigation reduces water waste.'),
              write('Design a reusable lunch wrap or bag. Write three design criteria, describe your design and materials, and explain how it is sustainable.', ['Three design criteria', 'Design and materials described', 'Explains sustainability'], 40),
            ],
          },
        ],
        quiz: { n: 6 },
      },
    ],
  });
})();
