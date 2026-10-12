/* Year 4 Mathematics — Australian Curriculum v9.0 strands: Number, Algebra, Measurement, Space, Statistics, Probability */
(function () {
  const { mc, tf, inp, num, gen } = LA.Q;
  const SVG = LA.SVG;

  LA.addSubject(4, {
    id: 'maths',
    intro: 'Big numbers, rounding, all the times tables, multiplying and dividing, equivalent fractions, decimals, money, measurement, time, angles, symmetry, data and chance.',
    chapters: [
      {
        id: 'place-value', term: 1, strand: 'Number',
        title: 'Place value and rounding',
        summary: 'Work with numbers into the tens and hundreds of thousands, and round to the nearest 10, 100 and 1,000.',
        lessons: [
          {
            id: 'big-numbers', title: 'Numbers to 100 000 and beyond', minutes: 12,
            blocks: [
              { type: 'read', text: `Each place is **10 times** bigger than the place to its right: ones → tens → hundreds → thousands → ten thousands → hundred thousands.\n\nIn **358,204**:\n- 3 → 300,000 · 5 → 50,000 · 8 → 8,000 · 2 → 200 · 0 → no tens · 4 → 4\n\nWe read it as "three hundred and fifty-eight thousand, two hundred and four".` },
              { type: 'visual', svg: '<table class="gridmap" style="font-size:.85em"><tr><th>Hundred thousands</th><th>Ten thousands</th><th>Thousands</th><th>Hundreds</th><th>Tens</th><th>Ones</th></tr><tr><td>3</td><td>5</td><td>8</td><td>2</td><td>0</td><td>4</td></tr></table>' },
              { type: 'tip', text: 'Group the digits in threes from the right: 358 204 — the left group tells you how many thousands.' },
            ],
            practice: [gen('placeValue', { min: 10000, max: 999999 }, 4), gen('wordsToNum', { min: 10000, max: 99999 }, 2), gen('expanded', { min: 10000, max: 99999 }, 2)],
          },
          {
            id: 'order', title: 'Comparing and ordering', minutes: 10,
            blocks: [{ type: 'read', text: `Compare from the **left** (largest place). 45,210 vs 45,120: same ten thousands and thousands; hundreds 2 > 1, so **45,210 > 45,120**.\n\nNumbers with **more digits** are larger (if no leading zeros): 9,999 < 10,000.` }],
            practice: [gen('compare', { min: 10000, max: 99999 }, 3), gen('largest', { min: 10000, max: 99999 }, 3)],
          },
          {
            id: 'rounding', title: 'Rounding', minutes: 12,
            blocks: [
              { type: 'read', text: `**Rounding** makes a number simpler, so it is easier to estimate.\n\nTo round to the nearest **10**: look at the **ones** digit. 0–4 round **down**, 5–9 round **up**.\n- 347 → 350 · 342 → 340\n\nTo round to the nearest **100**: look at the **tens** digit.\n- 347 → 300 · 372 → 400\n\nTo round to the nearest **1,000**: look at the **hundreds** digit.\n- 4,612 → 5,000 · 4,389 → 4,000` },
              { type: 'visual', svg: SVG.numberLine(340, 350, 1, 347, 10) + '<p class="small">347 is closer to 350 than 340</p>' },
            ],
            practice: [gen('round', { to: 10, min: 11, max: 999 }, 2), gen('round', { to: 100, min: 101, max: 9999 }, 2), gen('round', { to: 1000, min: 1001, max: 99999 }, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('placeValue', { min: 10000, max: 999999 }, 3), gen('compare', { min: 10000, max: 99999 }, 2), gen('round', { to: 10 }, 1), gen('round', { to: 100, min: 101, max: 9999 }, 2), gen('round', { to: 1000, min: 1001, max: 99999 }, 2)] },
      },
      {
        id: 'add-sub', term: 1, strand: 'Number',
        title: 'Adding and subtracting larger numbers',
        summary: 'Efficient mental and written strategies for addition and subtraction, using estimation to check.',
        lessons: [
          {
            id: 'mental', title: 'Mental strategies for big numbers', minutes: 12,
            blocks: [
              { type: 'read', text: `- **Compensation:** 456 + 199 → 456 + 200 = 656, then − 1 = **655**\n- **Partitioning:** 3,400 + 2,300 → 3,000 + 2,000 = 5,000 and 400 + 300 = 700 → **5,700**\n- **Counting on (for subtraction):** 1,000 − 675 → 675 + 25 = 700, + 300 = 1,000 → **325**\n- **Use known facts:** 8 + 7 = 15, so 800 + 700 = 1,500` },
            ],
            practice: [num('456 + 199 = ?', 655, 'Add 200 to get 656, then take away 1: 655.'), num('1,000 − 675 = ?', 325, 'Count up: 675 + 25 = 700, then + 300 = 1,000. 25 + 300 = 325.'), gen('add', { digits: 3 }, 2), gen('sub', { digits: 3 }, 2)],
          },
          {
            id: 'written', title: 'Written methods with regrouping', minutes: 15,
            blocks: [
              { type: 'read', text: `Line up the places and work from the **ones**:\n\n  3,456\n+ 2,789\n——————\n Ones: 6 + 9 = 15 → 5, carry 1 · Tens: 5 + 8 + 1 = 14 → 4, carry 1 · Hundreds: 4 + 7 + 1 = 12 → 2, carry 1 · Thousands: 3 + 2 + 1 = 6\n**= 6,245**\n\nFor subtraction, trade from the next place when the top digit is too small. Always **estimate first** and **check** with the inverse operation.` },
            ],
            practice: [gen('add', { digits: 4 }, 3), gen('sub', { digits: 4 }, 3)],
          },
          {
            id: 'problems', title: 'Word problems and checking', minutes: 15,
            blocks: [{ type: 'read', text: `For word problems:\n1. **Read** and find what you need to work out\n2. **Choose** + or − (or both!)\n3. **Estimate**\n4. **Solve**\n5. **Check**: Is the answer close to the estimate? Does it make sense?` }],
            practice: [gen('addWord', { max: 2000 }, 4), gen('missing', { max: 1000 }, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('add', { digits: 4 }, 3), gen('sub', { digits: 4 }, 3), gen('addWord', { max: 2000 }, 2), gen('missing', { max: 1000 }, 2)] },
      },
      {
        id: 'times-tables', term: 1, strand: 'Algebra',
        title: 'All the times tables to 10 × 10',
        summary: 'Recall multiplication facts up to 10 × 10 and the related division facts.',
        lessons: [
          {
            id: 'tables-6-9', title: 'The 6, 7, 8 and 9 times tables', minutes: 15,
            blocks: [
              { type: 'read', text: `Tricks for tricky tables:\n- **×6** = ×5 plus one more group: 7 × 6 → 35 + 7 = **42**\n- **×8** = double, double, double: 6 × 8 → 12, 24, **48**\n- **×9** = ×10 minus one group: 7 × 9 → 70 − 7 = **63**. (The digits of a ×9 answer add to 9: 6 + 3 = 9!)\n- **×7** — the trickiest! Use turnarounds: 7 × 4 = 4 × 7 = 28\n\nYou already know most facts from ×2, ×3, ×4, ×5, ×10 — just turn them around.` },
            ],
            practice: [gen('mulFact', { tables: [6, 7, 8, 9] }, 8)],
          },
          {
            id: 'mixed', title: 'Mixed facts and division', minutes: 12,
            blocks: [{ type: 'read', text: `Every multiplication fact gives two division facts:\n7 × 8 = 56 → **56 ÷ 7 = 8** and **56 ÷ 8 = 7**\n\n> Practise a few minutes every day — speed comes with practice!` }],
            practice: [gen('mulFact10', {}, 5), gen('divFact10', {}, 5)],
          },
          {
            id: 'number-patterns', title: 'Patterns and properties', minutes: 10,
            blocks: [{ type: 'read', text: `- Multiplying by **1** leaves a number the same. Multiplying by **0** gives 0.\n- **Turnarounds**: 6 × 4 = 4 × 6\n- **Even × anything = even**\n- Multiples of 5 end in 0 or 5; multiples of 10 end in 0\n- Number patterns can grow by multiplying: 2, 4, 8, 16… (double each time)` }],
            practice: [gen('pattern', { maxStep: 12 }, 3), gen('oddEven', {}, 2), num('What comes next? 3, 6, 12, 24, ___', 48, 'Each number doubles: 24 × 2 = 48.')],
          },
        ],
        quiz: { n: 12, items: [gen('mulFact10', {}, 8), gen('divFact10', {}, 4)] },
      },
      {
        id: 'mul-div', term: 2, strand: 'Number',
        title: 'Multiplying and dividing',
        summary: 'Multiply 2-digit numbers by 1-digit numbers, multiply by 10 and 100, and divide with remainders.',
        lessons: [
          {
            id: 'by-10-100', title: 'Multiplying by 10 and 100', minutes: 10,
            blocks: [{ type: 'read', text: `When you multiply by **10**, every digit moves **one place left**: 34 × 10 = 340.\nBy **100**, digits move **two places left**: 34 × 100 = 3,400.\n\nUse this for facts like 6 × 30 → 6 × 3 = 18, × 10 = **180**.` }],
            practice: [gen('mulBy10', {}, 4), num('6 × 30 = ?', 180, '6 × 3 = 18, then × 10 = 180.'), num('40 × 7 = ?', 280, '4 × 7 = 28, then × 10 = 280.')],
          },
          {
            id: 'mul-2by1', title: 'Multiplying 2-digit by 1-digit numbers', minutes: 15,
            blocks: [{ type: 'read', text: `Use the **split strategy** (area model):\n\n**47 × 6** → 40 × 6 = 240 and 7 × 6 = 42 → 240 + 42 = **282**\n\nOr the **written method**: 7 × 6 = 42 → write 2, carry 4 tens. 4 × 6 = 24, + 4 = 28 → **282**.` }],
            practice: [gen('mul2by1', { maxA: 99, maxB: 9 }, 6)],
          },
          {
            id: 'remainders', title: 'Division with remainders', minutes: 15,
            blocks: [{ type: 'read', text: `Sometimes things don't share equally. The amount left over is the **remainder**.\n\n**29 ÷ 4** → 4 × 7 = 28, with 1 left over → **7 r 1**\n\nIn word problems, think about what the remainder means:\n- 29 children, 4 per car → 7 cars isn't enough — you need **8 cars**!\n- 29 lollies shared between 4 → 7 each, and **1 left over**.` }],
            practice: [gen('divRem', { maxDiv: 9, maxQ: 12 }, 4), mc('30 people need to travel. Each car takes 4. How many cars are needed?', ['8', '7', '7 r 2', '6'], 0, '30 ÷ 4 = 7 r 2. The 2 extra people still need a car, so 8 cars.')],
          },
          {
            id: 'problems', title: 'Multiplication and division problems', minutes: 12,
            blocks: [{ type: 'read', text: `Ask: are there **equal groups**? Do I know the **number of groups** and **how many in each** (multiply)? Or the **total** and need to share or group (divide)?` }],
            practice: [gen('mulWord', { tables: [3, 4, 6, 7, 8, 9] }, 3), gen('divWord', { tables: [3, 4, 6, 7, 8, 9] }, 3)],
          },
        ],
        quiz: { n: 10, items: [gen('mulBy10', {}, 2), gen('mul2by1', {}, 3), gen('divRem', {}, 2), gen('mulWord', { tables: [6, 7, 8, 9] }, 2), gen('divWord', { tables: [6, 7, 8, 9] }, 1)] },
      },
      {
        id: 'fractions', term: 2, strand: 'Number',
        title: 'Fractions: equivalence, mixed numerals and collections',
        summary: 'Equivalent fractions, counting past one whole, fractions on a number line and finding a fraction of a collection.',
        lessons: [
          {
            id: 'equivalent', title: 'Equivalent fractions', minutes: 15,
            blocks: [
              { type: 'read', text: `**Equivalent fractions** are the same amount, written differently.\n\n1/2 = 2/4 = 4/8 = 5/10\n\nTo make an equivalent fraction, **multiply (or divide) the top and bottom by the same number**: 1/3 × 2/2 = 2/6.` },
              { type: 'visual', svg: SVG.fractionBar(2, 1) + '<br>' + SVG.fractionBar(4, 2) + '<br>' + SVG.fractionBar(8, 4) + '<p class="small">1/2 = 2/4 = 4/8</p>' },
            ],
            practice: [gen('equivFraction', {}, 4), gen('fractionCompare', {}, 2)],
          },
          {
            id: 'mixed', title: 'Counting past one: mixed numerals', minutes: 12,
            blocks: [{ type: 'read', text: `Counting in quarters: 1/4, 2/4, 3/4, **1**, 1 1/4, 1 2/4, 1 3/4, **2**…\n\nA **mixed numeral** has a whole number and a fraction: **1 3/4** (one and three-quarters).\n\nAn **improper fraction** has a top number bigger than the bottom: 7/4. Since 4/4 = 1, **7/4 = 1 3/4**.` }],
            practice: [gen('mixedNumeral', {}, 3), gen('fractionLine', {}, 3)],
          },
          {
            id: 'of-collection', title: 'Fractions of a collection', minutes: 12,
            blocks: [{ type: 'read', text: `To find a fraction of a group, **divide by the bottom number** (denominator), then **multiply by the top number** (numerator).\n\n**1/4 of 20** → 20 ÷ 4 = **5**\n**3/4 of 20** → 20 ÷ 4 = 5, then 5 × 3 = **15**` }],
            practice: [gen('fractionOf', { dens: [2, 3, 4, 5, 10], maxEach: 10 }, 6)],
          },
        ],
        quiz: { n: 10, items: [gen('equivFraction', {}, 3), gen('mixedNumeral', {}, 2), gen('fractionOf', {}, 3), gen('fractionCompare', {}, 1), gen('fractionLine', {}, 1)] },
      },
      {
        id: 'decimals-money', term: 3, strand: 'Number',
        title: 'Decimals and money',
        summary: 'Tenths and hundredths as decimals, and solving money problems including budgets and change.',
        lessons: [
          {
            id: 'tenths', title: 'Tenths', minutes: 12,
            blocks: [
              { type: 'read', text: `When one whole is cut into 10 equal parts, each part is a **tenth** (1/10).\n\nWe can write tenths as **decimals**: 1/10 = **0.1**, 3/10 = **0.3**. The **decimal point** separates whole numbers from parts of a whole.\n\n2 and 7 tenths = **2.7**` },
              { type: 'visual', svg: SVG.numberLine(0, 1, 0.1, 0.3, 5) + '<p class="small">The arrow is at 0.3 (three tenths)</p>' },
            ],
            practice: [gen('decimalTenths', {}, 6)],
          },
          {
            id: 'hundredths', title: 'Hundredths', minutes: 12,
            blocks: [{ type: 'read', text: `When a whole is cut into **100** equal parts, each is a **hundredth** (1/100) = **0.01**.\n\n0.45 = 4 tenths and 5 hundredths = 45 hundredths.\n\nMoney uses hundredths! $3.45 = 3 dollars and 45 cents, because 1 cent is one hundredth of a dollar.` }],
            practice: [gen('decimalHundredths', {}, 3), gen('decimalCompare', {}, 3)],
          },
          {
            id: 'money', title: 'Money problems and budgets', minutes: 15,
            blocks: [{ type: 'read', text: `A **budget** is a plan for how to spend money.\n\nWhen shopping: add the prices, compare to how much money you have, and work out the change.\n\nIn Australia, cash totals are **rounded** to the nearest 5 cents because we have no 1c or 2c coins (card payments are exact).` }],
            practice: [gen('moneyTotal', {}, 2), gen('moneyChange', { note: [1000, 2000] }, 2), gen('budget', {}, 2)],
          },
        ],
        quiz: { n: 10, items: [gen('decimalTenths', {}, 3), gen('decimalHundredths', {}, 2), gen('decimalCompare', {}, 1), gen('moneyChange', { note: [1000, 2000] }, 2), gen('budget', {}, 2)] },
      },
      {
        id: 'measurement', term: 3, strand: 'Measurement',
        title: 'Measurement, area and perimeter',
        summary: 'Read scales, convert metric units, and find area and perimeter.',
        lessons: [
          {
            id: 'scales-units', title: 'Scales and converting units', minutes: 12,
            blocks: [{ type: 'read', text: `On a **scale** (ruler, jug, thermometer), work out what **each small mark** is worth first.\n\n**Metric conversions:**\n- 10 mm = 1 cm · 100 cm = 1 m · 1,000 m = 1 km\n- 1,000 g = 1 kg\n- 1,000 mL = 1 L\n\nBig unit → small unit: **multiply**. Small unit → big unit: **divide**.` }],
            practice: [gen('readScale', {}, 2), gen('convertLen', { kinds: ['m-cm', 'cm-m', 'cm-mm', 'km-m', 'kg-g', 'L-mL'] }, 4), gen('chooseUnit', {}, 1)],
          },
          {
            id: 'area', title: 'Area', minutes: 12,
            blocks: [
              { type: 'read', text: `**Area** is the amount of **surface** a shape covers. We measure it in **square units** — like square centimetres (cm²).\n\nCount the squares, or for a rectangle use **rows × columns**: a rectangle 4 squares long and 3 squares wide has area 4 × 3 = **12 square units**.` },
              { type: 'visual', svg: SVG.grid(new Set(['0,0', '1,0', '2,0', '3,0', '0,1', '1,1', '2,1', '3,1', '0,2', '1,2', '2,2', '3,2']), 6, 4) },
            ],
            practice: [gen('areaSquares', {}, 5)],
          },
          {
            id: 'perimeter', title: 'Perimeter', minutes: 10,
            blocks: [{ type: 'read', text: `**Perimeter** is the distance **all the way around** the outside of a shape. Add up all the side lengths.\n\nRectangle 5 cm × 3 cm → 5 + 3 + 5 + 3 = **16 cm**.\n\n> Area = inside (covering). Perimeter = outside (fencing).` }],
            practice: [gen('perimeter', {}, 4), mc('You want to put a fence around a garden. Do you need the area or the perimeter?', ['perimeter', 'area', 'volume', 'mass'], 0, 'A fence goes around the outside — the perimeter.')],
          },
        ],
        quiz: { n: 10, items: [gen('readScale', {}, 2), gen('convertLen', { kinds: ['m-cm', 'km-m', 'kg-g', 'L-mL'] }, 3), gen('areaSquares', {}, 3), gen('perimeter', {}, 2)] },
      },
      {
        id: 'time', term: 3, strand: 'Measurement',
        title: 'Time',
        summary: 'Convert between units of time, use am and pm, and solve duration problems.',
        lessons: [
          {
            id: 'units', title: 'Converting units of time', minutes: 12,
            blocks: [{ type: 'read', text: `60 seconds = 1 minute · 60 minutes = 1 hour · 24 hours = 1 day · 7 days = 1 week · 52 weeks ≈ 1 year · 12 months = 1 year · 365 days = 1 year (366 in a leap year)\n\nExamples: 3 hours = 3 × 60 = **180 minutes**. 2 weeks = **14 days**. 90 minutes = **1 hour 30 minutes**.` }],
            practice: [gen('timeUnits', {}, 5), num('How many minutes in 3 hours?', 180, '3 × 60 = 180 minutes.')],
          },
          {
            id: 'clocks', title: 'Reading time to the minute and am/pm', minutes: 12,
            blocks: [
              { type: 'read', text: `Read the hour hand first, then count the minutes: by 5s to the nearest number, then by 1s.\n\nWrite the time with **am** (midnight to midday) or **pm** (midday to midnight): school starts at **8:50 am**, dinner is at **6:15 pm**.` },
              { type: 'visual', svg: SVG.clock(8, 50) + '<p class="small">8:50</p>' },
            ],
            practice: [gen('readClock', { step: 5 }, 3), gen('am_pm', {}, 2)],
          },
          {
            id: 'duration', title: 'Duration and timetables', minutes: 12,
            blocks: [{ type: 'read', text: `To find how long something takes, count on from the start time in easy jumps.\n\n**9:45 am to 11:20 am** → 9:45 → 10:00 (15 min) → 11:00 (60 min) → 11:20 (20 min) = **95 minutes** = 1 hour 35 minutes.` }],
            practice: [gen('duration', {}, 3), gen('timeAfter', { maxMin: 55 }, 3)],
          },
        ],
        quiz: { n: 10, items: [gen('timeUnits', {}, 3), gen('readClock', {}, 2), gen('am_pm', {}, 1), gen('duration', {}, 2), gen('timeAfter', {}, 2)] },
      },
      {
        id: 'shapes-angles', term: 4, strand: 'Space',
        title: 'Angles, shapes and symmetry',
        summary: 'Compare angles to a right angle, identify lines of symmetry, and describe 2D shapes and 3D objects.',
        lessons: [
          {
            id: 'angles', title: 'Angles', minutes: 12,
            blocks: [
              { type: 'read', text: `An angle measures **turn**. A **right angle** is a quarter turn (90°).\n- Angles smaller than a right angle are called **acute**\n- Angles larger than a right angle (but less than a half turn) are called **obtuse**\n- A half turn makes a **straight angle** (2 right angles)\n\nUse the corner of a piece of paper as a right-angle checker!` },
              { type: 'visual', svg: SVG.angle(45) + SVG.angle(120) },
            ],
            practice: [gen('angleCompare', {}, 4), gen('turns', {}, 2), mc('An angle smaller than a right angle is called…', ['acute', 'obtuse', 'straight', 'reflex'], 0, 'Acute angles are less than 90°.')],
          },
          {
            id: 'symmetry', title: 'Symmetry', minutes: 12,
            blocks: [{ type: 'read', text: `A shape has **line symmetry** if you can fold it so both halves match exactly. The fold line is the **line of symmetry**.\n\n- A square has **4** lines of symmetry\n- A rectangle has **2**\n- A circle has **infinite** (endless) lines\n- Many leaves, butterflies and faces are nearly symmetrical\n\nA **symmetrical pattern** can be made by reflecting (flipping) a design.` }],
            practice: [gen('symmetry', {}, 5)],
          },
          {
            id: 'shapes-objects', title: 'Shapes and objects', minutes: 12,
            blocks: [{ type: 'read', text: `**Polygons** are closed 2D shapes with straight sides. **Regular** polygons have all sides and angles equal.\n\n**Prisms** have two matching ends (bases) joined by rectangles — like a triangular prism (Toblerone box).\n**Pyramids** have one base and triangle faces meeting at a point (apex).` }],
            practice: [gen('shape2d', {}, 3), gen('shape3d', {}, 3)],
          },
        ],
        quiz: { n: 10, items: [gen('angleCompare', {}, 3), gen('symmetry', {}, 3), gen('shape3d', {}, 2), gen('shape2d', {}, 2)] },
      },
      {
        id: 'location', term: 4, strand: 'Space',
        title: 'Maps, grids and directions',
        summary: 'Use grid references and directions to locate places and describe routes.',
        lessons: [
          {
            id: 'grids', title: 'Grid references and routes', minutes: 12,
            blocks: [{ type: 'read', text: `Grid references give the **column letter** first, then the **row number** (e.g. C2).\n\nTo describe a **route**, give directions in order: "Go north 2 squares, turn east and go 3 squares." Include landmarks to help.\n\nCompass points include **NE, NW, SE, SW** in between the main four.` }],
            practice: [gen('gridMap', {}, 4), gen('direction', {}, 3), mc('Which direction is halfway between north and east?', ['north-east', 'south-west', 'north-west', 'south-east'], 0, 'North-east is between north and east.')],
          },
        ],
        quiz: { n: 7, items: [gen('gridMap', {}, 4), gen('direction', {}, 3)] },
      },
      {
        id: 'data', term: 4, strand: 'Statistics',
        title: 'Data investigations',
        summary: 'Plan questions, collect data, create graphs and interpret what the data shows.',
        lessons: [
          {
            id: 'investigate', title: 'Planning a data investigation', minutes: 12,
            blocks: [{ type: 'read', text: `Statistical investigations:\n1. **Pose a question** — "What is the most popular way to get to school?"\n2. **Collect data** — survey, tally\n3. **Organise** — frequency table\n4. **Represent** — column graph, picture graph, dot plot\n5. **Interpret** — What does it show? What's most/least? How many more?\n\n**Categorical data** is in groups (colours, pets). **Numerical data** is numbers (number of siblings, height).` }],
            practice: [gen('tally', {}, 2), mc('Which is categorical data?', ['favourite colour', 'height in cm', 'number of pets', 'age in years'], 0, 'Colours are categories, not numbers.'), mc('Which is numerical data?', ['number of siblings', 'favourite fruit', 'eye colour', 'type of pet'], 0, 'Number of siblings is counted with numbers.')],
          },
          {
            id: 'graphs', title: 'Reading and interpreting graphs', minutes: 12,
            blocks: [{ type: 'read', text: `When you read a graph, check the **title**, **labels** and **scale**. The scale might go up by 1s, 2s, 5s or 10s!\n\nThen ask: What is the **most** and **least** popular? What is the **difference**? What is the **total**? What might explain the results?` }],
            practice: [gen('readGraph', {}, 6)],
          },
        ],
        quiz: { n: 8, items: [gen('readGraph', {}, 6), gen('tally', {}, 2)] },
      },
      {
        id: 'chance', term: 4, strand: 'Probability',
        title: 'Chance and experiments',
        summary: 'Describe possible outcomes, compare likelihood and conduct chance experiments.',
        lessons: [
          {
            id: 'outcomes', title: 'Outcomes and likelihood', minutes: 12,
            blocks: [{ type: 'read', text: `List all the possible **outcomes** of an event, then think about which are **more likely**.\n\nA bag has 6 red, 3 blue and 1 green marble. Red is **most likely**, green is **least likely**.\n\n**Independent events:** one result doesn't change the next — a coin landing heads doesn't make tails more likely next time!\n**Dependent events:** if you take a marble out and **don’t** put it back, the chances for the next pick change.` }],
            practice: [gen('outcomes', {}, 2), gen('chance', {}, 3), mc('A bag has 6 red, 3 blue and 1 green marble. Which colour is most likely to be picked?', ['red', 'blue', 'green', 'all equal'], 0, 'There are more red marbles than any other colour.'), tf('If a coin lands on heads 3 times in a row, tails is more likely next time.', false, 'Each toss is independent — it is still an even chance.')],
          },
          {
            id: 'experiments', title: 'Chance experiments', minutes: 12,
            blocks: [
              { type: 'read', text: `In an experiment, we **predict**, **test many times**, **record** results in a tally or table, and **compare** to our prediction.\n\nThe more times we repeat an experiment, the closer the results usually get to what we expect.` },
              { type: 'activity', text: 'Roll a dice 30 times and tally each number. Which came up most? Do you think they would even out if you rolled 300 times?' },
            ],
            practice: [gen('chance', {}, 3), mc('A spinner has 4 equal parts: 3 blue, 1 yellow. What is the chance of blue?', ['likely', 'unlikely', 'impossible', 'certain'], 0, '3 out of 4 parts are blue, so it is likely.')],
          },
        ],
        quiz: { n: 8, items: [gen('chance', {}, 4), gen('outcomes', {}, 2)] },
      },
    ],
  });
})();
