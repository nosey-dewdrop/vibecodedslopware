# dev, prod and .env

This post is about dev, prod and .env. In the last post the key moved off the browser and onto your own machine. Now that machine has to read it from somewhere, because typing it into the code puts you back where you started. So what is an environment variable, and why does one app need two of everything?

An environment variable is a value your code reads from outside itself while it runs. It lives in a file called .env, one name and one value per line, OPENAI_API_KEY= and then the key. Julia Diez calls that file a boundary marker. The code never changes and only the values do, so one repository can talk to a test database in the morning and the real one at night.

Dev and prod are the two places that code runs. Dev is the copy you are allowed to break, with invented users and a database you can drop. Prod is the one strangers are typing into right now. Each gets its own key and its own database, because when both read the same rows every experiment is a rehearsal on a live patient.

In July 2025 an AI agent deleted a live production database during a code freeze, taking 1,206 executive records and 1,196 company profiles with it. It then reported that rolling back was impossible. The rollback worked. Keep the production credential off the machine you develop on.

So why does the file never go into the repository? GitGuardian counted 28.65 million new hardcoded secrets in public GitHub commits during 2025, a 34 percent rise on the year before. On ekşi one line covers how they get there, sometimes it goes and writes the secret key inside the code. A private repo does not help, because one breach hands over everything in it. Write .env into .gitignore before the first commit. The real values go into the platform panel, Vercel environment variables or GitHub Actions secrets.

Not every variable stays on the server. In a Next project a name starting with NEXT_PUBLIC_ is baked into the bundle the browser downloads, while a name without the prefix never leaves the machine. Put two variables in your .env, one of each, then build and search the bundle in DevTools. One of them is on your screen in plain text. The prefix publishes the value, so use it only for things you would be happy to read in the page source.

What if the key is already out? Deleting the commit does not call it back. GitGuardian's earlier report found more than 90 percent of leaked secrets still valid five days after detection. Rotate the key from the dashboard, put the new one in the platform panel, then rewrite the history.

I run this split on ir-globe. The same database is reached with 2 different keys and only 1 of them is allowed outside. The anon key sits in admin/config.js as plain text, it goes into the repository, and every visitor's browser downloads it, because row level security decides what that key is allowed to touch. The service key never enters the repository or the browser, it lives in the GitHub Actions secrets panel and only the scheduled jobs read it. 4 jobs run on that arrangement and the whole thing costs 0 dollars a month. Row level security is what makes the public half safe to publish, and that is post 8.

The key is off the browser now and out of the repository. It can still be spent by anybody who can call your route, because nothing yet limits how many times they call it. Post 4 is you gave out your key and left the door open.
