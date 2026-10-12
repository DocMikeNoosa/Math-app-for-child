# Aussie Learning Workbook — Year 3 & Year 4

A homework workbook app for **Year 3 and Year 4** covering every learning area of the
**Australian Curriculum v9.0** that schools teach to all students, with read-aloud,
quizzes, daily homework, catch-up tools and an optional AI tutor (Koa the koala).

Open **`learn/index.html`** in any modern browser (Chrome, Edge, Safari, Firefox).
You don't need to install anything or run a server. Progress is saved in that browser.

## What's inside

| | Year 3 | Year 4 |
|---|---|---|
| Subjects | 7 | 7 |
| Chapters | 51 | 50 |
| Lessons | 125 | 109 |

Subjects: English, Mathematics, Science, HASS (History, Geography, Civics & Citizenship),
Health & PE, The Arts (Visual Arts, Music, Drama, Dance, Media Arts) and Technologies
(Digital, and Design & Technologies). Languages aren't included because each school
chooses its own language.

Each chapter is set against a school term and has:
- **lessons**: short reading notes, worked examples, tips, word banks, diagrams, hands-on activities and **listening** passages
- **practice** after each lesson, which must reach 60% before the lesson is ticked off
- a **chapter quiz** with an 80% pass mark (multiple choice and typed answers)

Maths questions are generated fresh every time, so practice never runs out. That
covers place value, operations, fractions, decimals, money, clocks, scales, area,
angles, grid maps, graphs and chance, with drawn clocks, graphs, fraction bars and
arrays. English spelling skills (plurals, tense, suffixes, prefixes, homophones and
contractions) are generated the same way.

## How the tutor adapts (works without AI)
- A wrong answer gets a second try, then an explanation.
- A low practice score means the child goes over the lesson again and gets a fresh question set.
- If they fail a second time, the lesson is ticked off but **extra practice** is added to their homework.
- Failing a quiz adds **extra practice** on exactly the skills that were missed. A retake unlocks only once that's done.
- A mastery score is kept for every skill. Spaced **quick reviews** come back for weak or forgotten skills.
- **Daily homework** is built automatically from: extra practice, then English + Maths, then other subjects in rotation (subjects furthest behind come first), then one review.

## Catching up / jumping in
- **📍 Choose where to start**: pick any chapter in a subject. Earlier chapters show as skipped.
- **⚡ Test out**: pass a chapter quiz to tick off the whole chapter.
- **Catch-up tracker**: compares progress with how far through the school year it is.
- **Daily minutes** (Parent area): 15 to 90 minutes. Higher settings add more lessons per day.
- You can open any lesson at any time, review finished chapters, or reset a chapter.

## Read-aloud
Every lesson block, question, explanation and AI answer has a 🔊 button. This uses the
device's built-in voices, prefers Australian English, and works offline with no key.
There's an **auto-read** option for early readers. Listening passages hide the text so
they test spoken comprehension.

## AI tutor (optional)
In **Parent area → Settings**, add an Anthropic API key (console.anthropic.com).
This switches on:
- **Koa chat**, which knows the current lesson and what the child finds tricky
- "Explain it another way" after a mistake, and hints before answering
- **re-teaching** a skill in a new way after a failed quiz or practice
- **new practice questions** written for the child's mistakes (checked before use; built-in questions are used if the AI's questions don't come through properly)
- feedback on writing tasks
- an AI progress summary for parents

The default model is Claude Opus 5.5. Sonnet 5.5 and Haiku 5.5 are cheaper options.
The key is stored only in this browser and sent only to `api.anthropic.com`.
Usage is billed to your Anthropic account.

## Parent area
Reports by subject, skills needing attention, quiz history, recent mistakes, a printable
view, an optional PIN, several learners, Year 3/Year 4 switching, backup and restore
(JSON), and display options (dark mode, larger text, extra spacing).

## Curriculum alignment note
Content follows the v9.0 strands and year-level topics. Content-description codes are
shown only where they were checked against published lists (e.g. AC9M3N01–N03,
AC9S3U01–U04, AC9S4U01–U04, several HASS codes). The rest are labelled by strand only
rather than with codes that couldn't be checked. States order topics differently, so
use "Choose where to start" to match your child's class. This is a home-learning aid,
not an official ACARA product.

## Files
- `index.html`: the app
- `css/app.css`: styles (light and dark)
- `js/core/`: answer checking, question generators, storage, speech, tutor + Claude API
- `js/content/y3/`, `js/content/y4/`: the workbooks, one file per subject
- `js/ui/`: screens

## Tests
- `node learn/tests/validate.js` generates every lesson's practice and every quiz 25 times and checks that each question has a valid answer that the marker accepts (about 45,000 questions).
- `node learn/tests/e2e.js` runs a full browser walkthrough with Playwright. It mocks the Claude API, so no key is needed. Set `PLAYWRIGHT=/path/to/playwright` if Playwright isn't installed in the project.
