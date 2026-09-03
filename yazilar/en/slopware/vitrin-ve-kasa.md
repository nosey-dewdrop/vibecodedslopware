# Why does the till stand in a different room?

Everything so far has happened in one room. Files arrive and the browser draws them. You have now read your own project the way a visitor reads it. A shop has a second room behind the counter where the till and the keys are, and nobody has to be told why. In a project both rooms look like folders sitting next to each other in the same editor, so the till ends up out on the shop floor.

## Which room is the browser?

The browser is the front one and everything in it belongs to whoever is standing there.

Every file that arrived is listed in the Network panel and you can click any of them and read it, including the scripts you wrote. That will not be patched one day, because it is what delivery means.

'My code is minified, so nobody can read it,' you may be thinking. Open one of your own scripts in that panel and find the button marked with braces at the bottom of the view. The one line becomes readable code again. Squashing a script makes the file smaller and it hides nothing.

## What is a backend?

A backend is a program on another machine that answers requests. It runs somewhere else and listens at a door. You talk to it by sending exactly the kind of request you watched arrive in chapter 1.

The customer orders and the kitchen cooks. The customer does not come into the kitchen, because the kitchen is a different room. A script running in the browser is a locked cupboard standing in the dining room, and the customer has all evening.

## What is an API?

An API is the menu. A menu tells you what you may order and in what form. An API tells you which requests the kitchen accepts, meaning this address with this method and these fields. Anything not on the menu is refused. Writing one is the act of deciding what strangers may ask you for.

The verbs on that menu are the methods. GET fetches something, POST sends something new, PUT replaces, DELETE removes. A GET is understood everywhere to only fetch and search crawlers act on that understanding. That is how a link which deletes a row gets triggered by a crawler that was only looking around.

## What do the numbers mean?

Every answer comes back with a status number and MDN carries the definitions if you want them properly.

200 means it worked. 404 means the kitchen understood you perfectly and has no such dish. 500 means the kitchen broke while cooking, so the fault is on their side.

The two that get confused constantly are 401 and 403. A 401 means the kitchen does not know who you are, while a 403 means it knows exactly who you are and refuses anyway. Identity and permission are separate systems with separate fixes, and telling them apart is the whole of chapter 26.

## Can you break your own rule?

Find something in your own project that the page refuses to let you do. A submit button that stays disabled until the form is valid, a field with a maximum length, a section that only appears when you are logged in. Anything the page decides.

Open the developer tools and go to the Console tab. Then type one of these, matching whichever rule you found.

```
document.querySelector("button[disabled]").disabled = false
document.querySelector("input[maxlength]").maxLength = 9999
```

The button is live. The field takes as much as you want. You did not find a hole in your code, you retyped a line of it, and every visitor has the same console you just used.

That is why a check written into your page is a suggestion. Your script runs on their machine. A check that holds has to run in a room they cannot reach, which is the room this chapter is about.

## Where does the key go?

Into the kitchen and never into a request the customer can read.

stitchu sends a photograph to a vision model and that model charges per call. The key that pays for it belongs in the till, so the browser never holds it. The photograph goes to a Cloudflare Worker, the Worker holds the key and calls the model, and the answer comes back. Anyone can open the Network panel on stitchu and read every request that leaves their machine and find nothing in them to take.

The wrong version is one line of difference. The browser calls the model directly with the key attached to the request. It works on the first try (which is the trouble) because from behind the counter both versions look the same to you. Every visitor now holds a working key billed to your account, and chapter 31 is about the size of that bill.

::kontrol
Open your own project with the Network panel open and use it until requests start appearing.

Where is each request going? Read the address of each one. If it goes straight to somebody else's service then your browser is talking to that service directly and everything in that request is public.

What in your code costs money or grants access? An API key, a database URL, an admin token. Where does it live right now?

If it reached the browser then it is public, and the next two chapters are about moving it.
::

Chapter 6 goes to where data lives, and why a file works perfectly until two people use your project at the same time.
