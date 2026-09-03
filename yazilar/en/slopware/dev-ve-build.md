# What is the difference between npm run dev and npm run build?

Localhost turned out to be a name your machine uses for itself. The other half of the address is still unexplained, because something is answering at that door, and in a framework project that something is npm run dev.

You have run that command a thousand times without wondering what it is. Sitting next to it in the same file there is npm run build. It takes much longer and produces a folder you have probably never opened. That folder is the part your users get.

## What is running when you run npm run dev?

What runs is a program sitting in your terminal and waiting to be asked for things, the same way python3 -m http.server did in chapter 1. This one is far cleverer about what it hands over.

Go to the terminal where it says ready and press Ctrl and C. Refresh the browser. The site is gone and the error is a refused connection, which means nothing is listening at that door any more.

Now start it again and open the project folder, looking for the HTML that arrived in the browser. There is no such file. Your project has a src folder full of components and not one of them is a page. Nothing on the disk matches what you saw in view source.

The dev server built that page in memory the moment your browser asked for it and then let it go. Its whole job is to read the source, work out what the browser needs right now and hand it over. Then it watches the files so it can do the same thing the instant you save. Nothing was written down, so a save appears in the browser in under a second.

## What does the build do?

```
npm run build
```

It takes a while, where the dev server started instantly. When it finishes there is a new folder called dist on Vite and .next on Next.js. Go in there with the commands from chapter 2.

```
cd dist
ls -F
```

The HTML that did not exist a minute ago is in there. So are the scripts, with names like index-4f3a9c.js. Those characters in the middle are there so a browser can safely keep an old copy without mistaking it for the new one after you deploy. The CSS from every component in the project has been gathered into one file.

Your source is written in whatever shape lets you work. This folder is written for browsers, in one shape and once. The dev server had been standing in for it on demand without ever writing a word of it to disk.

## Which one gets deployed?

The folder gets deployed, never your source and never the dev server. Deploying means building that folder and putting its contents somewhere that answers requests all day, so a visitor is handed a finished file instead of waiting for a program to work one out.

You can serve that folder yourself right now.

```
cd dist
python3 -m http.server 8000
```

Open localhost:8000. That is your site, coming out of a plain file server that has never heard of your framework. It is the same server that handed you one line of HTML in chapter 1.

## Why do the two behave differently?

'Same code, same project, so it will behave the same way,' you may be thinking. Open one of those scripts in dist and read it. Your function names are gone, replaced by single letters. The spaces are gone. The whole file is one line.

The dev server is optimised for you. It starts instantly and refreshes instantly, keeps your variable names so errors stay readable, and squashes nothing. The build is optimised for the visitor, so it makes the smallest files it can, squashes everything together, drops code that nothing uses and shortens every name it can reach.

Squashing changes behaviour. Code that quietly relied on a function still having its own name breaks, because the name is gone and you just read the file where it went missing. A value read while the build is running gets frozen into the file, so changing it on the server afterwards changes nothing until you build again, and chapter 13 is about the trouble that causes. A file the dev server found by walking your folder is missing from the output entirely if nothing imported it properly.

So a project can run beautifully for weeks and fall over on the first deploy without a line of source having changed. When somebody says it works on my machine they are usually telling the truth, because their machine was running the friendly version.

Before you deploy, run the build and serve the output locally the way you just did, then click around your own site. Anything broken in that folder is broken in production, and you get to find it while you are sitting in front of it.

::kontrol
Run npm run build on your own project and let it finish.

How long did it take? Whatever that number is, it happens again on every deploy.

What is inside the folder? Go in with cd dist or cd .next and run ls -F, then find the HTML your source never contained.

Then serve it with python3 -m http.server 8000 and use your own site coming out of a file server that knows nothing about your framework. If something works under npm run dev and not in there, you have found a real bug months before a stranger would have found it for you.
::

Chapter 5 goes to the shop front and the till. What a backend is, and why some things can never live in the files you just looked at however well you hide them.
