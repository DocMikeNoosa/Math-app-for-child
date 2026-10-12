/* Year 3 Mathematics — Australian Curriculum v9.0 strands: Number, Algebra, Measurement, Space, Statistics, Probability */
(function () {
  const { mc, tf, inp, num, gen } = LA.Q;
  const SVG = LA.SVG;

  LA.addSubject(3, {
    id: 'maths',
    intro: 'Numbers past 10 000, adding and taking away, times tables, fractions, money, measuring, time, shapes, maps, graphs and chance.',
    chapters: [
      {
        id: 'place-value', term: 1, strand: 'Number', code: 'AC9M3N01',
        title: 'Numbers to 10 000 and beyond',
        summary: 'Read, write, order and break apart numbers into thousands, hundreds, tens and ones.',
        outcomes: ['Say the value of each digit in a 4- or 5-digit number', 'Read and write numbers in words and numerals', 'Compare and order big numbers', 'Partition numbers in different ways'],
        lessons: [
          {
            id: 'thousands', title: 'Thousands, hundreds, tens and ones', minutes: 12,
            blocks: [
              { type: 'read', text: `## Every digit has a place\nIn the number **3,482** each digit has a job:\n- **3** is in the **thousands** place → worth 3,000\n- **4** is in the **hundreds** place → worth 400\n- **8** is in the **tens** place → worth 80\n- **2** is in the **ones** place → worth 2\n\nSo 3,482 = 3,000 + 400 + 80 + 2.\n\nWhen we get **10 ones** we bundle them into **1 ten**. 10 tens make **1 hundred**. 10 hundreds make **1 thousand**. And 10 thousands make **10 000** (ten thousand)!` },
              { type: 'visual', svg: '<table class="gridmap" style="font-size:.9em"><tr><th>Ten thousands</th><th>Thousands</th><th>Hundreds</th><th>Tens</th><th>Ones</th></tr><tr><td>1</td><td>3</td><td>4</td><td>8</td><td>2</td></tr></table><p class="small muted">13,482 = thirteen thousand, four hundred and eighty-two</p>' },
              { type: 'example', title: 'What is the 6 worth?', text: 'In **6,215** the 6 is in the thousands place, so it is worth **6,000**.\nIn **2,615** the 6 is in the hundreds place, so it is worth **600**.\nSame digit — different place — different value!' },
              { type: 'tip', text: 'A zero is a place holder. In 4,051 the 0 tells us there are **no hundreds**.' },
            ],
            practice: [gen('placeValue', { min: 1000, max: 9999 }, 4), gen('placeValue', { min: 10000, max: 99999 }, 2), mc('How many tens make one hundred?', ['10', '100', '1', '1000'], 0, '10 tens = 100.')],
          },
          {
            id: 'read-write', title: 'Reading and writing big numbers', minutes: 12,
            blocks: [
              { type: 'read', text: `We write big numbers with a space or comma after the thousands: **4,612** or **4 612**.\n\nTo **read** a number, say the thousands, then the rest:\n- 4,612 → "four thousand, six hundred **and** twelve"\n- 7,050 → "seven thousand **and** fifty"\n- 12,300 → "twelve thousand, three hundred"\n\nIn Australia we say "and" before the tens and ones.` },
              { type: 'example', title: 'Words to numerals', text: '"Five thousand, two hundred and nine" → 5 thousands, 2 hundreds, **0 tens**, 9 ones → **5,209**. Don’t forget the zero for the empty tens place!' },
            ],
            practice: [gen('wordsToNum', { min: 1000, max: 9999 }, 3), gen('numToWords', { min: 1000, max: 9999 }, 2), gen('wordsToNum', { min: 10000, max: 20000 }, 1)],
          },
          {
            id: 'compare', title: 'Comparing and ordering numbers', minutes: 10,
            blocks: [
              { type: 'read', text: `To compare two numbers, start at the **biggest place**.\n- 4,381 and 4,519: both have 4 thousands. Look at hundreds: 3 < 5. So **4,381 < 4,519**.\n\n**>** means "is greater than". **<** means "is less than". **=** means "is equal to".\n\n> The open mouth always faces the bigger number — like a hungry crocodile!` },
              { type: 'example', title: 'Order from smallest to largest', text: '2,905 · 2,950 · 2,059 → compare hundreds: 9, 9, 0 → 2,059 is smallest. Then tens: 0 vs 5 → 2,905 then 2,950.\nOrder: **2,059, 2,905, 2,950**.' },
            ],
            practice: [gen('compare', { min: 1000, max: 9999 }, 3), gen('largest', { min: 1000, max: 9999 }, 3)],
          },
          {
            id: 'partition', title: 'Partitioning numbers', minutes: 12,
            blocks: [
              { type: 'read', text: `**Partitioning** means breaking a number into parts.\n\n**Standard way:** 5,734 = 5,000 + 700 + 30 + 4\n\n**Other ways (regrouping):**\n- 5,734 = 57 hundreds + 34 ones\n- 5,734 = 4,000 + 1,700 + 34\n\nRegrouping like this helps with adding and subtracting in your head.` },
              { type: 'example', title: 'How many hundreds?', text: '2,600 has **26 hundreds** (because 2 thousands = 20 hundreds, plus 6 more hundreds).' },
            ],
            practice: [gen('expanded', { min: 1000, max: 9999 }, 4), num('How many hundreds are in 3,400 altogether?', 34, '3 thousands = 30 hundreds, plus 4 hundreds = 34 hundreds.'), num('4,000 + 1,200 + 15 = ?', 5215, '4,000 + 1,200 = 5,200, then + 15 = 5,215.')],
          },
        ],
        quiz: { n: 10, items: [gen('placeValue', { min: 1000, max: 99999 }, 3), gen('wordsToNum', {}, 2), gen('compare', {}, 2), gen('largest', {}, 1), gen('expanded', {}, 2)] },
      },
      {
        id: 'patterns', term: 1, strand: 'Algebra',
        title: 'Odd, even and number patterns',
        summary: 'Spot odd and even numbers and find the rule in number patterns that go up or down.',
        lessons: [
          {
            id: 'odd-even', title: 'Odd and even numbers', minutes: 10,
            blocks: [
              { type: 'read', text: `**Even** numbers can be shared into 2 equal groups with nothing left over: 2, 4, 6, 8, 10…\n**Odd** numbers always have 1 left over: 1, 3, 5, 7, 9…\n\n> To check a big number, only look at the **ones digit**. 3,458 ends in 8, so it is even!` },
              { type: 'example', title: 'Odd + odd', text: 'Odd + odd = even (3 + 5 = 8). Even + even = even (4 + 6 = 10). Odd + even = odd (3 + 4 = 7).' },
            ],
            practice: [gen('oddEven', {}, 4), mc('What is odd + odd?', ['Always even', 'Always odd', 'Sometimes odd'], 0, 'Two leftover 1s join to make a pair, so odd + odd is always even.')],
          },
          {
            id: 'number-patterns', title: 'Finding the rule', minutes: 12,
            blocks: [
              { type: 'read', text: `A **number pattern** follows a rule.\n- 5, 10, 15, 20… the rule is **add 5** (increasing).\n- 50, 47, 44, 41… the rule is **subtract 3** (decreasing).\n\nTo find the rule, look at how much it changes from one number to the next. Then use the rule to keep going.` },
              { type: 'example', title: 'Find the missing number', text: '12, 16, ___, 24 → it goes up by 4 each time. 16 + 4 = **20**.' },
            ],
            practice: [gen('pattern', { maxStep: 10 }, 5), inp('What is the rule? 3, 6, 9, 12, 15 (write like: add 3)', ['add 3', '+3', '+ 3', 'plus 3', 'add three'], 'Each number is 3 more than the one before.')],
          },
        ],
        quiz: { n: 8, items: [gen('oddEven', {}, 3), gen('pattern', { maxStep: 10 }, 5)] },
      },
      {
        id: 'add-sub', term: 1, strand: 'Number', code: 'AC9M3N03',
        title: 'Adding and subtracting',
        summary: 'Mental strategies and written methods to add and subtract 2- and 3-digit numbers, including regrouping.',
        lessons: [
          {
            id: 'mental', title: 'Mental strategies', minutes: 12,
            blocks: [
              { type: 'read', text: `Use facts you know to work out bigger sums in your head.\n- **Bridge to 10:** 8 + 5 → 8 + 2 = 10, then + 3 = 13\n- **Use doubles:** 25 + 26 → double 25 is 50, plus 1 = 51\n- **Jump on a number line:** 47 + 30 → 57, 67, 77\n- **Split (partition):** 34 + 25 → 30 + 20 = 50, 4 + 5 = 9, total 59\n- **Facts to 20 help with big numbers:** 7 + 6 = 13, so 70 + 60 = 130` },
              { type: 'example', title: 'Subtract by counting up', text: '62 − 48 → count up from 48: +2 → 50, +12 → 62. 2 + 12 = **14**.' },
            ],
            practice: [gen('add', { digits: 2, regroup: false }, 3), gen('sub', { digits: 2, regroup: false }, 2), num('If 7 + 8 = 15, what is 70 + 80?', 150, '7 tens + 8 tens = 15 tens = 150.')],
          },
          {
            id: 'regroup-add', title: 'Adding with regrouping', minutes: 15,
            blocks: [
              { type: 'read', text: `For bigger numbers, line up the places and add **ones first**.\n\nExample: **258 + 167**\n1. Ones: 8 + 7 = 15 → write **5**, carry **1 ten**\n2. Tens: 5 + 6 + 1 = 12 → write **2**, carry **1 hundred**\n3. Hundreds: 2 + 1 + 1 = **4**\n\nAnswer: **425**` },
              { type: 'tip', text: 'Estimate first! 258 + 167 is about 260 + 170 = 430. Our answer 425 is close, so it makes sense.' },
            ],
            practice: [gen('add', { digits: 2, regroup: true }, 2), gen('add', { digits: 3, regroup: true }, 4)],
          },
          {
            id: 'regroup-sub', title: 'Subtracting with regrouping', minutes: 15,
            blocks: [
              { type: 'read', text: `Line up the places and start with the **ones**. If the top digit is too small, **trade** from the next place.\n\nExample: **432 − 175**\n1. Ones: 2 − 5? Too small. Trade 1 ten → 12 − 5 = **7**\n2. Tens: now 2 tens. 2 − 7? Trade 1 hundred → 12 − 7 = **5**\n3. Hundreds: now 3. 3 − 1 = **2**\n\nAnswer: **257**. Check: 257 + 175 = 432 ✔` },
            ],
            practice: [gen('sub', { digits: 2, regroup: true }, 2), gen('sub', { digits: 3, regroup: true }, 4)],
          },
          {
            id: 'inverse', title: 'Inverse operations and missing numbers', minutes: 12,
            blocks: [
              { type: 'read', text: `Addition and subtraction are **inverse** (opposite) operations — one undoes the other.\n\nIf **23 + 15 = 38**, then we also know:\n- 15 + 23 = 38\n- 38 − 15 = 23\n- 38 − 23 = 15\n\nThis is a **fact family**. Use it to find missing numbers: 27 + ☐ = 50 → ☐ = 50 − 27 = **23**.` },
            ],
            practice: [gen('missing', { max: 100 }, 4), gen('missing', { max: 500 }, 2)],
          },
          {
            id: 'word-problems', title: 'Adding and subtracting word problems', minutes: 15,
            blocks: [
              { type: 'read', text: `Read the problem carefully and ask: am I **joining** (add) or **taking away / finding the difference** (subtract)?\n\nClue words:\n- Add: altogether, total, in all, sum, more (when joining)\n- Subtract: left, remain, difference, how many more, fewer\n\nThen: estimate → solve → check your answer makes sense.` },
              { type: 'example', title: 'Example', text: 'A library had 345 books. 128 were borrowed. How many are left? → **subtract**: 345 − 128 = **217** books.' },
            ],
            practice: [gen('addWord', { max: 500 }, 5)],
          },
        ],
        quiz: { n: 10, items: [gen('add', { digits: 3 }, 3), gen('sub', { digits: 3 }, 3), gen('missing', {}, 2), gen('addWord', { max: 500 }, 2)] },
      },
      {
        id: 'times-tables', term: 2, strand: 'Algebra',
        title: 'Multiplication facts: 2, 3, 4, 5 and 10',
        summary: 'Know the 2, 3, 4, 5 and 10 times tables and use them to divide.',
        lessons: [
          {
            id: 'groups', title: 'Equal groups and arrays', minutes: 12,
            blocks: [
              { type: 'read', text: `**Multiplication** is a quick way to add equal groups.\n\n4 groups of 3 → 3 + 3 + 3 + 3 = 12 → **4 × 3 = 12**\n\nAn **array** shows equal rows. 3 rows of 5 dots = 3 × 5 = 15. Turn it around and it's 5 rows of 3 — still 15! Order doesn't matter in multiplication (**3 × 5 = 5 × 3**).` },
              { type: 'visual', svg: SVG.array(3, 5) },
            ],
            practice: [gen('arrayMul', { maxR: 5, maxC: 6 }, 3), mc('Which is the same as 5 + 5 + 5 + 5?', ['4 × 5', '5 × 5', '4 + 5', '20 × 4'], 0, 'Four groups of 5 = 4 × 5 = 20.')],
          },
          {
            id: 'facts-2-5-10', title: 'The 2, 5 and 10 times tables', minutes: 12,
            blocks: [
              { type: 'read', text: `**×2** is doubling: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20\n**×5** ends in 0 or 5: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50\n**×10** puts a zero on the end: 10, 20, 30… 100\n\n> ×5 is half of ×10! 6 × 10 = 60, so 6 × 5 = 30.` },
            ],
            practice: [gen('mulFact', { tables: [2, 5, 10] }, 6)],
          },
          {
            id: 'facts-3-4', title: 'The 3 and 4 times tables', minutes: 12,
            blocks: [
              { type: 'read', text: `**×3:** 3, 6, 9, 12, 15, 18, 21, 24, 27, 30\n**×4:** 4, 8, 12, 16, 20, 24, 28, 32, 36, 40\n\n> ×4 is **double double**. 7 × 4 → double 7 = 14, double 14 = **28**.\n> ×3 is double and one more group: 6 × 3 → 6 × 2 = 12, + 6 = **18**.` },
            ],
            practice: [gen('mulFact', { tables: [3, 4] }, 6)],
          },
          {
            id: 'division-facts', title: 'Division facts', minutes: 12,
            blocks: [
              { type: 'read', text: `**Division** is sharing equally or making equal groups. It is the **inverse** of multiplication.\n\nIf **4 × 5 = 20**, then **20 ÷ 4 = 5** and **20 ÷ 5 = 4**.\n\nTo solve 24 ÷ 3, ask: "3 times what is 24?" → 3 × 8 = 24, so **24 ÷ 3 = 8**.` },
            ],
            practice: [gen('divFact', { tables: [2, 3, 4, 5, 10] }, 6)],
          },
        ],
        quiz: { n: 12, items: [gen('mulFact', { tables: [2, 3, 4, 5, 10] }, 7), gen('divFact', { tables: [2, 3, 4, 5, 10] }, 4), gen('arrayMul', { maxR: 5, maxC: 5 }, 1)] },
      },
      {
        id: 'mul-div', term: 2, strand: 'Number',
        title: 'Multiplying and dividing to solve problems',
        summary: 'Multiply and divide one- and two-digit numbers using arrays, diagrams and number sentences.',
        lessons: [
          {
            id: 'mul-strategies', title: 'Multiplying bigger numbers', minutes: 15,
            blocks: [
              { type: 'read', text: `To multiply a 2-digit number, **split it** into tens and ones.\n\n**14 × 3** → 10 × 3 = 30 and 4 × 3 = 12 → 30 + 12 = **42**\n\n**23 × 4** → 20 × 4 = 80 and 3 × 4 = 12 → 80 + 12 = **92**\n\nThis is called the **split strategy** (or partitioning).` },
            ],
            practice: [gen('mul2by1', { maxA: 30, maxB: 5 }, 5)],
          },
          {
            id: 'sharing', title: 'Sharing and grouping', minutes: 12,
            blocks: [
              { type: 'read', text: `There are two kinds of division:\n- **Sharing:** 15 lollies shared between 3 friends → each gets **5**\n- **Grouping:** 15 lollies put in bags of 3 → **5** bags\n\nSometimes there are some **left over** — the **remainder**. 17 ÷ 3 = 5 remainder 2 (5 groups of 3 is 15, with 2 left).` },
            ],
            practice: [gen('divWord', { tables: [2, 3, 4, 5, 10] }, 3), gen('divRem', { maxDiv: 5, maxQ: 10 }, 2)],
          },
          {
            id: 'mul-problems', title: 'Multiplication word problems', minutes: 12,
            blocks: [
              { type: 'read', text: `Look for **equal groups**. Clue words: each, every, groups of, rows of, times, per.\n\nDraw it! An array or a quick sketch helps you see the groups.\n\nExample: 6 cars each have 4 wheels. How many wheels? → 6 × 4 = **24**.` },
            ],
            practice: [gen('mulWord', { tables: [2, 3, 4, 5, 10] }, 4), gen('divWord', {}, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('mul2by1', { maxA: 30, maxB: 5 }, 3), gen('mulWord', {}, 3), gen('divWord', {}, 3), gen('divRem', { maxDiv: 5, maxQ: 10 }, 1)] },
      },
      {
        id: 'money', term: 2, strand: 'Number',
        title: 'Money and estimating',
        summary: 'Count Australian money, find totals and change, and estimate to check answers.',
        lessons: [
          {
            id: 'coins-notes', title: 'Australian coins and notes', minutes: 10,
            blocks: [
              { type: 'read', text: `Australian **coins**: 5c, 10c, 20c, 50c, $1 and $2.\nAustralian **notes**: $5, $10, $20, $50 and $100.\n\n100 cents (c) = 1 dollar ($). We write $3.45 for 3 dollars and 45 cents.\n\n> The $2 coin is smaller than the $1 coin, even though it is worth more!` },
              { type: 'tip', text: 'When counting coins, start with the biggest value and count on.' },
            ],
            practice: [gen('coins', {}, 4), num('How many cents in $1?', 100, '100 cents = $1.'), num('How many 20c coins make $1?', 5, '5 × 20c = 100c = $1.')],
          },
          {
            id: 'totals-change', title: 'Totals and change', minutes: 15,
            blocks: [
              { type: 'read', text: `**Total:** add the prices. $2.50 + $1.20 = **$3.70**\n\n**Change:** what you get back. Change = money paid − price.\nPay $5 for something costing $3.70 → count up: $3.70 → $4.00 (30c) → $5.00 ($1). Change = **$1.30**.` },
            ],
            practice: [gen('moneyTotal', {}, 3), gen('moneyChange', { note: [500, 1000] }, 3)],
          },
          {
            id: 'estimate', title: 'Estimating', minutes: 10,
            blocks: [
              { type: 'read', text: `An **estimate** is a smart guess that is close to the real answer.\n\nRound numbers to make them easy: 38 + 41 → about 40 + 40 = 80.\n\nUse estimates to **check** your answers. If you worked out 38 + 41 = 179, your estimate tells you something went wrong!` },
            ],
            practice: [gen('estimate', {}, 4), gen('round', { to: 10, min: 11, max: 99 }, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('coins', {}, 2), gen('moneyTotal', {}, 3), gen('moneyChange', { note: [500, 1000] }, 3), gen('estimate', {}, 2)] },
      },
      {
        id: 'fractions', term: 3, strand: 'Number', code: 'AC9M3N02',
        title: 'Fractions',
        summary: 'Unit fractions (halves, thirds, quarters, fifths, tenths), their multiples, and making a whole.',
        lessons: [
          {
            id: 'unit-fractions', title: 'Unit fractions', minutes: 12,
            blocks: [
              { type: 'read', text: `A **fraction** is part of a whole that has been cut into **equal parts**.\n\nA **unit fraction** has 1 on top: 1/2, 1/3, 1/4, 1/5, 1/10.\n- The **bottom number (denominator)** tells how many equal parts the whole is cut into.\n- The **top number (numerator)** tells how many parts we are talking about.\n\n> The more parts you cut, the **smaller** each part. 1/10 of a pizza is smaller than 1/2!` },
              { type: 'visual', svg: SVG.fractionBar(4, 1) + '<p class="small">1/4 is shaded</p>' },
            ],
            practice: [gen('unitFraction', { dens: [2, 3, 4, 5, 10] }, 4), mc('Which is bigger: 1/3 or 1/5?', ['1/3', '1/5', 'They are the same'], 0, 'Fewer parts means bigger parts. Thirds are bigger than fifths.')],
          },
          {
            id: 'multiples', title: 'Counting in fractions', minutes: 12,
            blocks: [
              { type: 'read', text: `We can count in unit fractions: 1/4, 2/4, 3/4, 4/4.\n\n**4/4 is one whole!** In the same way, 3/3 = 1, 5/5 = 1 and 10/10 = 1.\n\nIf 2/5 of a cake is eaten, 3/5 is left, because 2/5 + 3/5 = 5/5 = 1 whole.` },
              { type: 'visual', svg: SVG.fractionCircle(5, 2) },
            ],
            practice: [gen('unitFraction', { dens: [3, 4, 5, 10] }, 2), gen('fractionWhole', { dens: [2, 3, 4, 5, 10] }, 4)],
          },
          {
            id: 'fraction-line', title: 'Fractions on a number line', minutes: 12,
            blocks: [
              { type: 'read', text: `Fractions live on the number line between 0 and 1.\n\nTo show quarters, cut the space from 0 to 1 into **4 equal jumps**. Each jump is 1/4. Two jumps is 2/4, and four jumps lands on 1.` },
              { type: 'visual', svg: SVG.numberLine(0, 1, 0.25, 0.75, 4) + '<p class="small">The arrow is at 3/4</p>' },
            ],
            practice: [gen('fractionLine', {}, 4), gen('fractionCompare', {}, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('unitFraction', {}, 3), gen('fractionWhole', {}, 3), gen('fractionLine', {}, 2), gen('fractionCompare', {}, 2)] },
      },
      {
        id: 'measurement', term: 3, strand: 'Measurement',
        title: 'Measuring length, mass and capacity',
        summary: 'Use metric units (cm, m, g, kg, mL, L) and read instruments with markings.',
        lessons: [
          {
            id: 'length', title: 'Length: mm, cm and m', minutes: 12,
            blocks: [
              { type: 'read', text: `**Length** is how long something is. We use metric units:\n- **millimetre (mm)** — tiny, like the thickness of a coin\n- **centimetre (cm)** — about the width of your little finger\n- **metre (m)** — about one big step\n- **kilometre (km)** — a long walk (1,000 m)\n\n**10 mm = 1 cm** · **100 cm = 1 m** · **1,000 m = 1 km**\n\nWhen using a ruler, start measuring from the **0**, not the edge of the ruler!` },
            ],
            practice: [gen('chooseUnit', {}, 2), gen('convertLen', { kinds: ['m-cm', 'cm-m', 'cm-mm'] }, 3), gen('readScale', {}, 1)],
          },
          {
            id: 'mass-capacity', title: 'Mass and capacity', minutes: 12,
            blocks: [
              { type: 'read', text: `**Mass** is how heavy something is.\n- **gram (g)** — a paperclip is about 1 g\n- **kilogram (kg)** — a bag of flour is about 1 kg · **1,000 g = 1 kg**\n\n**Capacity** is how much a container holds.\n- **millilitre (mL)** — a few drops\n- **litre (L)** — a big bottle of milk · **1,000 mL = 1 L**\n\nWe measure mass with **scales** and capacity with a **measuring jug**.` },
            ],
            practice: [gen('chooseUnit', {}, 3), gen('convertLen', { kinds: ['kg-g', 'L-mL'] }, 2), gen('readScale', {}, 1)],
          },
        ],
        quiz: { n: 8, items: [gen('chooseUnit', {}, 3), gen('convertLen', { kinds: ['m-cm', 'cm-mm', 'kg-g', 'L-mL'] }, 3), gen('readScale', {}, 2)] },
      },
      {
        id: 'time', term: 3, strand: 'Measurement',
        title: 'Time',
        summary: 'Tell time on analogue clocks, use am and pm, and work out how long things take.',
        lessons: [
          {
            id: 'clocks', title: 'Telling the time', minutes: 15,
            blocks: [
              { type: 'read', text: `An analogue clock has two hands:\n- The **short hand** shows the **hour**.\n- The **long hand** shows the **minutes**. Each number is 5 minutes, so count by 5s: 5, 10, 15, 20…\n\nWe write the time as **hours:minutes** — 3:25 means 25 minutes past 3.\n\nSpecial times: **quarter past** (:15), **half past** (:30), **quarter to** (:45).` },
              { type: 'visual', svg: SVG.clock(3, 25) + '<p class="small">3:25 — twenty-five past three</p>' },
            ],
            practice: [gen('readClock', { step: 5 }, 5)],
          },
          {
            id: 'am-pm-units', title: 'am, pm and units of time', minutes: 10,
            blocks: [
              { type: 'read', text: `**am** = midnight until midday (the morning). **pm** = midday until midnight (afternoon and night).\n\nTime facts:\n- 60 seconds = 1 minute\n- 60 minutes = 1 hour\n- 24 hours = 1 day\n- 7 days = 1 week\n- 12 months = 1 year` },
            ],
            practice: [gen('am_pm', {}, 2), gen('timeUnits', {}, 4)],
          },
          {
            id: 'durations', title: 'How long does it take?', minutes: 12,
            blocks: [
              { type: 'read', text: `**Duration** is how long something lasts.\n\nCount on from the start time to the end time. Jump to the next o'clock if it helps.\n\nExample: from **2:40 to 3:15** → 2:40 to 3:00 is 20 minutes, 3:00 to 3:15 is 15 minutes → **35 minutes**.` },
            ],
            practice: [gen('timeAfter', { maxMin: 45 }, 3), gen('duration', {}, 3)],
          },
        ],
        quiz: { n: 10, items: [gen('readClock', {}, 4), gen('timeUnits', {}, 2), gen('timeAfter', {}, 2), gen('duration', {}, 2)] },
      },
      {
        id: 'shapes-angles', term: 4, strand: 'Space',
        title: 'Shapes, objects and angles',
        summary: 'Describe 2D shapes and 3D objects, and compare angles to a right angle.',
        lessons: [
          {
            id: 'shapes-2d', title: '2D shapes', minutes: 10,
            blocks: [
              { type: 'read', text: `**2D shapes** are flat. We describe them by their **sides** and **corners (vertices)**.\n- triangle — 3 sides\n- square, rectangle, rhombus, trapezium — 4 sides (quadrilaterals)\n- pentagon — 5 · hexagon — 6 · octagon — 8 (a stop sign!)\n- circle — 1 curved side, no corners` },
            ],
            practice: [gen('shape2d', {}, 5)],
          },
          {
            id: 'objects-3d', title: '3D objects', minutes: 12,
            blocks: [
              { type: 'read', text: `**3D objects** are solid — they have length, width and height.\n- **Faces** are the flat surfaces\n- **Edges** are where two faces meet\n- **Vertices** are the corners\n\nA **cube** (like a dice) has 6 square faces, 12 edges and 8 vertices.\nA **cylinder** (like a can) has 2 flat circle faces and 1 curved surface.\nA **sphere** (like a ball) has no flat faces at all.` },
            ],
            practice: [gen('shape3d', {}, 5)],
          },
          {
            id: 'angles', title: 'Angles and turns', minutes: 12,
            blocks: [
              { type: 'read', text: `An **angle** is the amount of **turn** between two lines.\n\nA **right angle** is a quarter turn — like the corner of a book or a door frame. We mark it with a little square.\n- Smaller than a right angle → a sharp, pointy angle\n- Larger than a right angle → a wide, open angle\n\n4 right angles make a **full turn**. 2 right angles make a **half turn**.` },
              { type: 'visual', svg: SVG.angle(90) },
              { type: 'activity', text: 'Go on an angle hunt at home! Find 3 right angles, 1 angle smaller than a right angle, and 1 angle larger than a right angle. (Hint: try scissors, a laptop screen or a door.)' },
            ],
            practice: [gen('angleCompare', {}, 4), gen('turns', {}, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('shape2d', {}, 3), gen('shape3d', {}, 3), gen('angleCompare', {}, 3), gen('turns', {}, 1)] },
      },
      {
        id: 'location', term: 4, strand: 'Space',
        title: 'Maps and directions',
        summary: 'Use grid maps, compass directions and turns to describe where things are.',
        lessons: [
          {
            id: 'grid-maps', title: 'Grid maps', minutes: 12,
            blocks: [
              { type: 'read', text: `A **grid map** has letters along the bottom and numbers up the side. Each square has a **grid reference** like **B3**.\n\n> Go **along the corridor** (letters) then **up the stairs** (numbers).` },
            ],
            practice: [gen('gridMap', {}, 4)],
          },
          {
            id: 'directions', title: 'Compass directions and turns', minutes: 10,
            blocks: [
              { type: 'read', text: `The four main compass points are **North, East, South, West**. Remember: "**N**ever **E**at **S**oggy **W**eet-Bix" going clockwise.\n\nThe sun rises in the **east** and sets in the **west**.\n\n**Clockwise** turns the same way as clock hands; **anticlockwise** is the opposite.` },
            ],
            practice: [gen('direction', {}, 5)],
          },
        ],
        quiz: { n: 8, items: [gen('gridMap', {}, 4), gen('direction', {}, 4)] },
      },
      {
        id: 'data', term: 4, strand: 'Statistics',
        title: 'Collecting and showing data',
        summary: 'Collect data with tallies, show it in tables and column graphs, and talk about what it shows.',
        lessons: [
          {
            id: 'tally-tables', title: 'Tally marks and tables', minutes: 10,
            blocks: [
              { type: 'read', text: `To collect data, ask a **question** like "What is your favourite fruit?"\n\nRecord answers with **tally marks**: | for each one, and every 5th mark crosses the other four (卌).\n\nThen count the tallies and write the totals in a **table**.` },
            ],
            practice: [gen('tally', {}, 4)],
          },
          {
            id: 'column-graphs', title: 'Column graphs', minutes: 12,
            blocks: [
              { type: 'read', text: `A **column graph** shows data with bars. It needs:\n- a **title**\n- **labels** for each column\n- a **scale** up the side to read how many\n\nThe tallest column is the most popular. We can also compare: how many **more**? how many **fewer**?` },
              { type: 'visual', svg: SVG.bars(['Dog', 'Cat', 'Fish', 'Bird'], [7, 5, 2, 3], 'Pets in our class') },
            ],
            practice: [gen('readGraph', {}, 5)],
          },
        ],
        quiz: { n: 8, items: [gen('tally', {}, 2), gen('readGraph', {}, 6)] },
      },
      {
        id: 'chance', term: 4, strand: 'Probability',
        title: 'Chance',
        summary: 'Use words like impossible, unlikely, even chance, likely and certain, and list possible outcomes.',
        lessons: [
          {
            id: 'chance-words', title: 'How likely is it?', minutes: 10,
            blocks: [
              { type: 'read', text: `**Chance** is how likely something is to happen.\n\n**impossible** → **unlikely** → **even chance** → **likely** → **certain**\n\n- It is **certain** that Monday comes after Sunday.\n- A coin landing on heads is an **even chance** (50–50).\n- It is **impossible** to roll a 7 on a normal dice.` },
            ],
            practice: [gen('chance', {}, 5)],
          },
          {
            id: 'experiments', title: 'Chance experiments', minutes: 12,
            blocks: [
              { type: 'read', text: `An **outcome** is a possible result. Tossing a coin has **2** outcomes: heads or tails. Rolling a dice has **6**.\n\nIn a chance experiment, we try something many times and record what happens. Results can surprise us — with a coin you might get 3 heads in a row, even though heads and tails are equally likely!` },
              { type: 'activity', text: 'Toss a coin 20 times and record heads/tails with tally marks. Were they close to 10 each? Try again — did you get the same result?' },
            ],
            practice: [gen('outcomes', {}, 3), gen('chance', {}, 2)],
          },
        ],
        quiz: { n: 8, items: [gen('chance', {}, 5), gen('outcomes', {}, 3)] },
      },
    ],
  });
})();
