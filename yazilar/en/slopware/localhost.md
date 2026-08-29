# localhost:3000

In this post we are talking about localhost:3000. This joke has been going around the internet for a long time. So what is localhost:3000, why do people think it finishes a developer off, and why does none of that help? Today I am answering the four sentences the joke is aimed at.

"I built a site and sent the link to my friend and she cannot open it." You think the address on your screen is the address of your site. localhost is the name a machine gives to itself, and every machine has its own. RFC 6761 defines that name, it resolves to 127.0.0.1, and RFC 1122 reserves the whole 127.0.0.0/8 block for the same job, more than 16 million addresses that all mean "me". Whatever you send there turns around inside the machine before it reaches the network card, so her phone read its own localhost and found nothing. Try it yourself, open localhost:3000 on your laptop and type the same thing on your phone. Same address, different kitchen.

"I published it, so why does the site look different and incomplete?" You think the folder you worked in is the folder that went up. npm run dev keeps a copy of your project in memory and patches it while you type, which is why your changes show up before you save anything. npm run build is the one that writes the finished files into a dist or a .next folder, and that folder is the only thing a server ever hands to strangers. Run npm run build once and open what it made, because those files are your whole site.

"I did everything in the video and I still cannot get in." You think deploying is a long setup. Push the repo to GitHub, open Vercel or Cloudflare Pages and pick it, and the build command and the output folder come filled in. This is what those platforms are for, they run your build, serve the output and renew the certificate. Copy every value from your .env into the environment variables panel, because that file is gitignored and the machine has never seen it. A working URL comes in about a minute.

"My domain and my hosting are both ready, so why does the site still not run?" You think a domain plus hosting equals a site. The domain is only a name, DNS is the phone book that turns it into an address, and hosting is an empty plot until a program is running on it. Connection refused means nothing is answering there yet. If the page loads but comes up empty, search your code for localhost, because a line like fetch("http://localhost:3000/api/items") runs in the visitor's browser and sends them to their own machine. Call /api/items instead.

I run ir-globe on a machine like that. It reads 198 countries in 13 layers on 0 dollars of infrastructure and it kept reading them for months while I never opened the laptop it was written on.

Long story short, this is the first room of the house and everybody starts here. The only question is whose machine is awake when somebody opens your link. Post 2 is what a backend is, because once your site is on a machine other people can reach, the next question is which parts of it they are allowed to touch.

Take care on your building journey, you can subscribe to my blog from the box below.
