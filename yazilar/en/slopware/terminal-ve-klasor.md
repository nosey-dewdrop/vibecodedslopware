# Why can your deploy not find your files?

You ran a command inside a folder a moment ago and a server appeared, and I never said which folder it was reading or why that mattered. The same command run from one step higher up would have served nothing.

A whole family of failures comes out of that. The build that works on your machine and returns file not found on the deploy is one, the image that loads locally and 404s in production is another. In every one of them a program is standing somewhere you did not expect, reading a path that means something different from there.

## Where are you standing?

Open a terminal. On a Mac it is called Terminal. On Windows, use the one your development tools installed rather than the old black box.

A command never runs in general. It runs while you are standing somewhere and where you are standing changes what it does.

```
pwd
```

Print working directory. It answers with the absolute path of where you are standing right now.

```
ls -F
```

Plain ls lists files and folders together with no way to tell them apart, and -F puts a slash on the end of every folder name. Do not try to work it out from the name. README has no dot and is a file, while a folder called backup.old has one and is still a folder.

```
cd Desktop
```

Change directory, into the Desktop that sits inside wherever you already are. Run pwd again and the answer has grown by one step. Run ls -F and the contents have changed, because the same command means something different here.

```
cd ..
```

Two dots is a real entry that exists inside every folder on the disk and it points at that folder's parent.

That is the whole of navigation. Three commands and one convention, and they work the same way on every Mac and every Linux machine and inside the terminal your Windows tools installed.

## Is the terminal a different place?

If the terminal still feels like a second machine hiding underneath the one you use, open Finder or Explorer and go to your project folder. Put that window on one side of your screen and the terminal on the other. Now cd your way to the same folder and run ls -F.

They are the same thing. The icons on the left and the names on the right are one folder described in two ways, and the three commands you just learned will reach any folder on the disk.

## What is a path?

A folder holds files and other folders and those hold more. All of it hangs down from one starting point, so your whole disk is a single tree.

A path is directions through that tree and pwd printed one of them.

```
/Users/damla/Desktop/project
```

It means start at the top of the disk and go into Users, then into damla and Desktop and project. Each slash is a door you walk through. A postal address is written the same way and a path is that written on one line.

There are two kinds.

```
/Users/damla/project/style.css     absolute
style.css                          relative
```

The absolute one begins with a slash and is measured from the top of the disk, so it means the same file wherever you use it. The relative one is measured from where you are standing, so those same characters point at different files depending on where they are read.

## Why is this so hard to learn?

Go back to the folder with index.html and style.css in it and start the server again. The page loads and the word is red. Now stop the server, run cd .. to step up one level, and start it again from there.

```
cd ..
python3 -m http.server 8000
```

Open localhost:8000. There is no page, only a list of folder names. Nothing was moved and nothing was deleted. The href inside your HTML still says style.css and it still means the style.css next to me, and the server is now standing one level up where no such file sits. Your whole project is intact and unreachable.

That is the entire failure, and here is why it stays invisible until it costs you a day. A few years ago lecturers in physics and engineering started running into something they could not explain. They would ask a class to open a file from a particular directory. We as students usually struggle to do exactly that, myself included, even though we use a computer all day and use it well.

A file lives in the app or on the computer, and the way you reach it is to search for it.

That model works for daily life. Put everything in one pile and search when you need something. You will find your holiday photographs every time. It stops working at the deploy, because the machine you deploy to has no search box. It is handed a path and goes exactly there. If nothing is there it stops.

Directory structure is so ordinary to the people who know it that words for it are hard to find, so nobody explains it and nobody asks.

## Why does this decide whether things work?

Every build step, every deploy tool and every error message you will read for the rest of your life assumes you know where you are standing.

File does not exist almost always means a relative path was read from a folder you were not expecting. The file was there all along, and the program was standing somewhere else when it went looking for it. You saw exactly that a minute ago with a server one level too high.

Something works on your machine and dies on the deploy for the same reason. You typed the command while standing inside the project folder. The other machine runs it while standing wherever it happens to start, so the relative path points at a place that does not exist. Chapter 16 is where this bites hardest.

MIT teaches a free course for exactly this gap called The Missing Semester of Your CS Education. Julia Evans draws comics about the shell that are the friendliest thing on the subject.

## What is in your project folder?

Open a terminal and leave your editor closed.

Get to your project folder using only pwd, ls -F and cd. Read what comes back after each step instead of typing the whole path from memory.

When you arrive, which folder in that list can you not describe the contents of? There will be one, usually node_modules or dist or .next.

Go into it and look, changing nothing. The next time something breaks that folder is going to appear in the error message (which should not be the first time you see the name).

Next comes localhost, and the reason a link that opens instantly for you does not open for your friend.
