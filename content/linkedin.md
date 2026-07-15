# linkedin — damla essays

Long-form build-in-public essays for LinkedIn. Audience: real engineers, senior devs, founders.

## Format (damla-essay)
The essay is a numbered walk through the build. Each number is one stage of the real journey, and under each one I show the decision that drove it and why. Not a thematic think-piece, a staged story of how the thing actually evolved.

The spine, always:
1. I was building X, its purpose was Y, but it started to feel like slopware. (where did the urge to fix it come from, where did the idea come from)
2. So I added this. (why, what decision was underneath)
3. But then I added or changed this. (the pivot, why I turned)
4. There was no clean path to a real product yet, so I did these. (the honest work and its constraints)

Rules:
- As long as it needs to be. Depth over word count, but LinkedIn reads best around 300 to 600 words.
- Hook in the first line. No warm-up.
- First person, Damla's voice. Candid. Show the decisions, including the wrong turns.
- No fabrication. Every step is something I actually built or decided.
- No em-dashes, no heading stacks, no listicle skeleton inside the prose. The numbers carry the structure, the writing stays human.
- End on a real thought, not a CTA.

---

## essay 1 — the tool i built to catch slop was itself slop

1. I built an app called vibecodedflopware. The purpose was simple and a little mean: it takes a codebase you vibe-coded, an app you shipped but could not really edit by hand, and it tests whether you actually understand it. Then I looked at what I had made and it was, honestly, slopware. A repo viewer. It parsed your code and drew you a pretty map and did nothing with it. A tool whose entire reason to exist is catching hollow AI-generated apps had become a hollow AI-generated app. It did not pass its own test. That is where the urge to fix it came from. Not a roadmap. Embarrassment.

2. So the first thing I added was the part that has to be real: a grounded structure engine. It fetches your repo in the browser, your code never touches my servers, and it parses it with tree-sitter into an actual resolved call graph with confidence tags on the edges it is unsure about. The decision underneath was that you cannot test someone's understanding of their code using a language model's guess about their code. If the map is hallucinated, every question built on it is fake. The map had to come from the real syntax, not from vibes about the syntax.

3. But then I killed the obvious next step, which was to generate quiz questions on top of the map, and I added a hands-on sandbox instead. The reason I turned is that a multiple choice question does not prove you own anything. You can guess. Ownership is a motor skill, not a recall skill. So instead the tool carves a real piece out of your own code, hands you a task in it, add the missing error handling, find the bug I injected, and you fix it in a sandbox that runs right there in the browser. I also spent an hour tempted by the grand version, an API sold to serious engineering teams. I turned that down too, because the accuracy bar for enterprise code is brutal and the free competitors are excellent, and starting there is how you build something impressive that nobody trusts.

4. There is still no clean path to the finished product, so I built toward it honestly and named the constraints out loud. The sandbox cannot run your whole Next.js app in a browser tab, forty dependencies and a build step do not fit there, so it runs carved out pieces, not the living app. And the entire product lives or dies on one thing, whether the generated tasks are actually good and actually about your code. If the tasks are dumb, it is slop again. So that is the real work now. Not features. The quality of a single generated exercise. Everything else was the easy part.

## essay 2 — the readme was written by a machine, so i rewrote it as myself

1. Months after I started this, the app finally had a real spine, a browser structure engine, a sandbox, a privacy architecture where your code never touches my servers. But when I opened the repo to send it to someone, I read the README and it stopped me. It was correct, it was tidy, and it was completely voiceless. It read like documentation a language model produces when you ask it to describe a project. There is a specific irony here that I could not ignore: my whole product exists to catch people who ship apps they did not really author, and the front door to my own project was written by exactly the kind of tool I am warning people about. So I rewrote it. Not for polish. For authorship.

2. The first decision was to write the README in my own voice, in first person, saying what the thing actually is and why I made it, including the mean part, that it started as slop and I was embarrassed. A README is not a spec sheet, it is the first thing a stranger reads, and if it does not sound like a person made choices, nobody believes a person made choices anywhere in the codebase. I wanted the front door to pass the same test the app gives its users: do you actually own this, or did you just accept what the machine handed you.

3. But then I hit a boring, real problem that had nothing to do with voice. My whole ecosystem was under one GitHub identity, and I was migrating the entire brand to noseydewdrop. That means every repo, every link, every reference had to move without breaking the live sites, the deploys, the domains. This is the unglamorous work nobody makes a reel about. I rebranded this repo, updated the references, and only then went back to the writing. The order mattered. There is no point pouring a personal voice into a README that points at a dead URL.

4. There was still no clean shortcut, so I did the slow thing. I rewrote the README more than once, in English, in my own tone, until it said what the project is without sounding like it was generated. That sounds small. It is not. The distance between a generated README and an authored one is the exact distance this entire product is about. If I cannot close that gap on my own front page, I have no business selling a tool that measures it in other people's code. The lesson I keep relearning is that owning your work is not a phase you finish. It is a standard you hold on every single file, including the one that just describes the others.
