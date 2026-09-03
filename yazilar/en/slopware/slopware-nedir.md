# Why does this book exist?

I have been using forums such as Reddit, Quora and Ekşi Sözlük for years, and once I was one of the people posting there. People make fun of localhost:3000 users, and they believe CS is dead because somebody developed a local website. Actually, I hate needless jokes made just to fit in. But also, lack of technical depth gave those localhost:3000 owners the courage of a superhero. So instead of joining in, I decided to create a blog about how to avoid slopware, based on my own experiences.

Learning it cost me 53 repos, 8 pull requests and 6 Claude Max x20 accounts. It also cost me exploding token bills, sleepless nights, and the 5 kilos I lost to hunger and lack of sleep. I do not want that to happen to anybody else, and I do not want a power this large to stay hidden inside one class of people. I am using Claude while I write this, and I am sure Dario Amodei would want the same. So I am writing it with my own hands, out of everything I pulled from my own pain.

I do not believe that CS has been replaced by AI.* Over time there was COBOL and C++ did not replace it, Java did not replace C++, and Python did not replace Java. Given the nature of high level languages, I treat an LLM as one more high level language. (And where has engineering gone? Engineering is the difference in the thinking itself, in knowing what to make and in connecting technologies and developing them.)

## I love vibecoding

Tony Stark is a vibecoder with unlimited tokens. As far as I see, internships and projects are presented as though they belong to certain people. What gets inherited is not only money. You can call it inherited vision, you can call it social climbing, and there is even a niche for it now, something like a class based networking hub founder. What will happen soon is that somebody starts a business with a Claude Pro account and has graduates of good schools working underneath them, when those same students could have started that company with their pocket money. Nevertheless, if it is not rocket science and it is not tank design, I do not think any work that needs no large capital is as big and as irreplaceable as it is claimed to be. Your application was rejected, so say that you could do this too and carry on your way.

Everyone should benefit from technology, and not only for business and money, but for making products for your own needs. As I believe from Plato, no one does wrong willingly, and nobody writes bad software on purpose either. Outside academic purposes, CS is no different from being able to sew a button on. Everyone should learn it in order to make the ideas they dream of real, and most importantly, everyone can, because I believe that for once in history anyone can build anything.

I have models write code for me, and I will have them write code while I am writing this book. Some things inside my own projects are plainly wrappers and I am not going to hide that from you while asking you to be honest about yours.

What matters is whether anything stands behind the code. Think about the last time your terminal told you every test passed. It told you that some tests ran and none of them complained, and nothing about whether they would have noticed a broken app.

## Who am I?

I am Damla, a CS student at Bilkent. I was on the board of IEEE, I worked as a Python assistant, I did an internship and a fellowship, and the rest is on my CV.

Actually I was a coder before CS took over, starting with HTML at 11 and a lot of Stack Overflow. Now I vibecode anyway. (Okay, what I really do is LLM systems engineering, which means I connect systems and engineer them.)

ir-globe draws what 198 countries do to each other and it has been going for months without me touching it, on infrastructure that costs 0 dollars a month. stitchu takes a photograph of a garment and gives back a sewing pattern, and it has a gate that decides whether that pattern can actually be sewn, which I wrote after printing patterns that passed every test I had and could not be sewn at all. lulumelon measures what language models say about a brand and prints a range rather than a single number, because on its first live run the honest interval ran from 0 to 33,3. rabadon is a gate system for agents, written in C++ with no dependencies, and it exists because an agent once told me it had finished a job it had not finished.

Each of those started as something I got wrong, then found, then fixed, and the fix is what this book hands over.

## How should you read this book?

The order is semantic, and I spent a full week reading and thinking before I settled it. I started from localhost, because that is the joke I kept seeing. Writing it made me realise the link only fails if you believe a page is a place, so that subject had to come first. Writing that one made me realise I was talking about files without ever saying what a folder is, so the terminal came next.

Localhost then required npm run dev, because once you know whose machine answers you want to know what is running on it. That one required npm run build, because the thing you would put on another machine is not the thing running on yours. After that came the backend, because a program on another machine is what the whole book has been walking towards. The backend required data, because a backend keeps something. Data required .env files and API keys, because the moment something is kept, whatever reaches it matters.

Those chapters are grouped into five parts. 101 is what you are actually holding. 201 gets your project off your own computer. 301 is where real users and real attackers arrive, 401 is the part people touch, and 501 is money. Afterwards I will write about LLM system design, orchestration, loops, workflows and gates.

Every chapter opens with a real incident and closes with the thing you can do tomorrow, on your own project. I don't want to stretch the schedule because 2 months in tech = 10 years of development in any topic.

By the way, new tabs keep opening in my head, and a chapter about one thing wakes up an idea about something else entirely. Those ideas do not belong inside the chapter, so they go in the appendix, and terms and small technical things that do not fit there go in the footnotes. Both sit at the bottom of the page, so anything marked with a star has a note waiting for it.

The appendix is also where the writing about product management and the startup world will go. Companies still run events to hand out the kind of knowledge you can only get through experience, and then they turn creative people away with reasons on the level of you are a Gemini, that is why you were eliminated. To tell you the truth, I do not think anybody is as well intentioned as I am, and people hold a strange principle about not sharing good things. You can steal my ideas. There is sand in the sea and there are ideas in me, so passing on what I know is nothing but a happiness for me.

## Thanks

Years ago the yazbel documentation made me interested in computer science, and I changed my department. Even though we have not been writing code by hand for the last year, it gave me a love of CS that no undergraduate degree could have given me. We used to shorten loops with algorithm analysis, and now we do the same thing inside workflows. The language changed and the tool changed, while the purpose and the logic did not, so I still think this motion in CS is a matter of perspective.

So when I am no longer a sweet student but a businesswoman, I hope this book will have enlightened somebody, entertained somebody, or made somebody think.

Two heads are better than one, so whatever work you are in, try your own idea too. My endless respect to everyone who is dreaming and working for something.

::ek
Is CS dead? The claim is usually made about a language, not about the field.
COBOL was going to be replaced by C++, C++ by Java, Java by Python, and every
one of them is still running somewhere right now. What changed each time was
the height of the language, not whether somebody had to decide what to build.
::
