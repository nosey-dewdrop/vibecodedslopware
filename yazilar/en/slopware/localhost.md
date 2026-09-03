# Why does your link only open for you?

This chapter is about famous localhost:3000. Jokes about it have been going around the internet for a long time. Many people believe CS is dead because they built a website hosting on local. You click your own link and it opens. Your friend clicks it and it does not. Why does it happen, what is localhost:3000, and how to fix this issue?

## What does localhost mean?

It begins with localhost:3000 or 127.0.0.1:3000, which are the same address written two ways. localhost is a name and 127.0.0.1 is the number the name stands for. RFC 6761 reserves both for one purpose, and that purpose is to mean the computer that is asking. When you type it, your machine sends the request to a program on itself. The request never leaves the machine, which is why this is called the loopback address. When your friend types it, their machine sends the request to a program on itself and finds none. Each computer's localhost is a different server.

The number after the colon is the port. If the address is the building, the port is the apartment inside it. One machine runs many programs and each waits at its own number. 3000 is a convention development tools picked, nothing more. The port is fine. The building is the problem, because you gave your friend the name every building uses for itself.

## Can your own phone open it?

Open the terminal and cd into any folder that has a file or two in it. Run this.

```
python3 -m http.server 8000 --bind 127.0.0.1
```

This starts a small web server. The flag tells it to answer only the machine it is running on. Open localhost:8000 in the browser and you see the folder's files listed. Now type the same address into your phone's browser. Nothing comes back, even though the phone is on the same wifi. The phone went looking for a program at port 8000 on itself.

Now stop the server with Ctrl+C and start it again without the flag.

```
python3 -m http.server 8000
```

The flag was doing all the work. 127.0.0.1 told the server to listen on the loopback address alone, so requests arriving over wifi were never answered. Without the flag this tool listens on 0.0.0.0, which is not an address you connect to. It means every network interface the machine has, including the wifi card. A request from the phone is now accepted the same as one from the machine itself. You will see 0.0.0.0 again in Docker logs and in cloud deploy output and it always means the same thing.

Now find the laptop's address on the local network. On a Mac that is ipconfig getifaddr en0 and on Linux hostname -I. It looks like 192.168.1.24. If the Mac command comes back empty your wifi is on another interface, so try en1. Type http://192.168.1.24:8000 into the phone and the file list appears. Nothing in the files changed, only which doors the program answers and which machine the phone was told to look at.

## How far does the local network reach?

'So I drop the flag and I am live,' you may be thinking. What you have is a server reachable from the same wifi. 192.168.1.24 is an address inside your home network and means nothing outside it, so a friend in a cafe or a customer on mobile data cannot reach it. And when the laptop lid closes, nothing is running anywhere.

A product has to answer while you are asleep, so the program has to run on a machine that stays on and has an address the internet can route to. Putting it there is called deploying, and that is chapter 16. ir-globe answers at three in the morning because it is not on my laptop.

::kontrol
Look at the address bar of the project you are proudest of. If it begins with localhost or 127.0.0.1, the number of people who can open it is 1. Then close the laptop. Turn off wifi on your phone so you are on mobile data and try to open the project. Whatever comes back is the answer to whether it exists yet.
::

After that come the two commands you run without reading them. Only one of npm run dev and npm run build makes a thing you can deploy.
