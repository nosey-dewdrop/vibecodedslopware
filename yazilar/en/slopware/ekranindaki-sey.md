# What is the thing on your screen?

The first thing you do with a coding agent is ask it for a website, and a minute later there is one. The terminal prints an address. You open it and the thing you described is sitting in the browser looking finished.

Ask where that thing lives and the answer comes back as in the browser or on my computer or on the internet. All three feel fine right up until something breaks, and then none of them tell you where to look.[^1]

[^1]: **A book note.** A model takes the easiest road. It gave you localhost with no backend, because that is the shortest way to something that runs.

## What arrives when a page opens?

Make a folder anywhere you like and put a single file in it called index.html with one line inside.

```html
<h1>hello</h1>
```

Open a terminal in that folder and run python3 -m http.server 8000. Go to localhost:8000 in your browser. The word hello is there in large letters, arriving from a server small enough that nothing can hide inside it.

Now right click on the page and choose view source. What comes up is the line you typed, character for character.

Change the h1 to a p and refresh. The same word comes back small. Nobody sent you a smaller word. You changed one instruction and the browser drew the letters differently, because what travelled to it was never a page. It was a set of instructions for a program that carries them out.

## How does the browser learn about the second file?

One file is not how anything real arrives. Next to index.html make a file called style.css containing h1 { color: crimson; } and mention it from the page.

```html
<link rel="stylesheet" href="style.css">
<h1>hello</h1>
```

Refresh and the word is red.

Your browser had no way of knowing that style.css existed. The only file it had been given was index.html. It read that file and came to a line mentioning a stylesheet. Only then did it go back to the server for a second file. The page tells the browser what else to fetch, one discovery at a time.

Open the developer tools with Cmd and Option and I on a Mac or F12 on Windows. Click the Network tab and refresh with the panel open. Two rows come up, index.html first and style.css second, and they can never come in the other order.

A slow page is rarely one slow file. The document arrives and mentions something. That something arrives and mentions two more. Nothing further down the chain starts until the thing before it has been read.

## Where does the page go when the server stops?

'The page is on my computer, so it will still be there,' you may be thinking. In the Network panel there is a checkbox marked Disable cache. Tick it so the browser stops keeping copies of its own. Now go to the terminal and stop the server with Ctrl and C, then refresh the page.

The page is gone and there is no error about your HTML, because your HTML never arrived. Nothing had been sitting in the browser waiting for you.

Start the server again and refresh. Hello comes back in red exactly as before, drawn from nothing. A page is a delivery that happens again every time somebody looks.

## What does this look like in a real project?

Open the project you have been working on and refresh it with the panel open. The same list appears, only far longer. The document sits at the top. Everything the document mentioned sits under it, and under those sits everything they mentioned in turn.

At the bottom of the panel there is a total size. Every visitor downloads that much before they see anything at all, out of their connection and their phone plan.

That leaves one question for the rest of the book. Some program on some machine sent those files. On the hello page you know which one, because you started it yourself and it is still sitting in your terminal. On your real project you have probably never thought about it.

::kontrol
Open the Network panel on the project you are proudest of and refresh it.

How many files arrived?

How many kilobytes did they come to?

Which file in that list can you not account for? There is nearly always one. Usually a font you stopped using months ago or a library that arrived attached to something else. Nothing announced it, because it was mentioned by a file that was itself mentioned by a file.

Nothing needs removing today. It has been going out to every visitor since the day it appeared.
::

You just started a server inside a folder without my having said what a folder is, and that gap has to close before we can ask whose machine your files come from. So the terminal and the folder come next.
