# Oct Delivery System - Group Food Ordering Platform

Hey! 👋 Welcome to our group food ordering system. We built this because we were tired of the chaos that happens every time our office/dorm tries to order food together. You know the drill - someone creates a WhatsApp group, people start throwing around restaurant names, someone volunteers to collect money, and somehow it always turns into a mess where nobody knows who ordered what or who owes how much.

So we thought, "There's gotta be a better way to do this!" And that's how this project was born.

## What's This All About?

Picture this: It's lunch time, you're hungry, and someone suggests ordering food. Instead of the usual WhatsApp chaos, someone opens our app, picks a restaurant, and creates a group order. Everyone else can just hop in, add their items, and the app keeps track of everything - who ordered what, how much everyone owes, and who's already paid. Simple, right?

That's exactly what we built. A platform where groups can coordinate food orders without the headache.

## About Us (The Humans Behind This) 👥

We're just a group of students who got tired of the food ordering chaos and decided to do something about it. This project started as a course requirement but quickly became something we actually cared about (probably because we're always hungry).

**Our team philosophy:** Keep it simple, make it work, and don't overthink it. We're not trying to revolutionize the food industry - we just want to make it easier for groups to order lunch without someone having to play accountant.

**What makes us tick:** Good food, clean code (when we remember), and the satisfaction of solving real problems that actually annoy people in daily life.

## 📋 What We're Submitting

Alright, so for our course submission, we've got everything covered:

### 🎨 Design Stuff
- **Figma Project**: [Check out our complete design system](https://www.figma.com/design/ha96dwhVWdDJ6afpUBn5l3/Untitled?node-id=0-1&p=f&t=dE3wKqLEE9TVgXrr-0) - we spent way too much time making this look good!
- **User Research & Personas**: All the boring but important stuff is in our presentation
- **Wireframes & Prototypes**: Everything's in the Figma workspace (trust us, there's a lot)
- **User Journey Maps**: We mapped out every click and tap users might make

### 📱 Mobile App
- **Flutter App**: We built a proper mobile app with Flutter (more on why we didn't use Bravo Studio below)
- **Demo Video**: `docs/videos/flutter_app_demo.mp4` ✅ **Ready to watch!**
- **Why Flutter?**: Bravo Studio looked cool at first, but it has some serious limitations - only 15 pages max, can't handle our dynamic content, and honestly, connecting it to our backend would've been a nightmare. Flutter just made more sense.
- **Web Mobile**: The website also works great on phones if you prefer that

### 💻 Web Application
- **Demo Video**: `docs/videos/desktop_website_demo.mp4` ✅ **All set!**
- **Live Website**: The actual working app (pretty proud of this one)
- **Source Code**: Every line of code we wrote is here

### 🗄️ Database
- **MongoDB Atlas**: We went with the cloud because nobody wants to deal with setting up a local database
- **Schema**: Everything's documented so you can see how we organized the data
- **Test Data**: We've got scripts to populate everything with fake restaurants and users

## Table of Contents
- [Key Features](#key-features)
- [Live Demo & Screenshots](#live-demo--screenshots)
- [Demo Videos](#demo-videos)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
- [Database Configuration](#database-configuration)
- [API Documentation](#api-documentation)
- [Testing Accounts](#testing-accounts)
- [Deployment Guide](#deployment-guide)

## What Makes Our App Cool

Here's the stuff we're actually excited about:

### 👥 If You're Just Ordering Food
- **Super Simple Login**: Just username and password - none of that "verify your email, confirm your phone" nonsense
- **Browse Restaurants**: Check out what's available and their menus (we've got some good fake restaurants set up)
- **Start Group Orders**: Be the hero who organizes lunch for everyone
- **Join Others**: Someone else doing the organizing? Just jump in and add your order
- **Track Everything**: See exactly what you ordered and what you owe - no more math anxiety
- **Mark Payments**: Hit a button when you've paid, so everyone knows
- **Order History**: Because sometimes you want to remember that amazing burger from last week

### 👨‍💼 If You're The Admin (The Food Boss)
- **Manage Users**: Add people, remove people, basically be in charge of who gets to eat
- **Control Restaurants**: Add new places, update menus when they change their prices (again)
- **Monitor Everything**: See all the orders happening and feel like you're running a food empire
- **Check Stats**: Who orders the most? What's the most popular restaurant? All the data you never knew you wanted
- **Payment Tracking**: See who's been paying and who you need to chase down

### 📱 Works Everywhere
- **Phone, Tablet, Desktop**: We made sure it looks good and works well no matter what device you're using
- **Touch-Friendly**: Big buttons that are easy to tap when you're hungry and impatient
- **Fast**: Nobody wants to wait 30 seconds for a page to load when they're deciding between pizza and tacos

## Screenshots (The Good Stuff)

### 🔐 Getting Started
First things first - you gotta log in. We kept it simple because nobody likes complicated login screens when they're hungry.

![Login - Desktop](docs/screenshots/login_large_screens.png)
*Clean and simple - just how we like it*

<details>
<summary>📱 How it looks on your phone and tablet</summary>

![Login - Mobile](docs/screenshots/login_mobile_screen.png)
*Mobile version - designed for thumbs, not tiny mouse cursors*

![Login - Tablet](docs/screenshots/login_tablet_screen.png)
*Tablet view - perfect for when you're lounging on the couch*
</details>

### 🏠 Your Dashboard (The Magic Happens Here)

Once you're in, this is your home base. See what orders are happening, jump into existing ones, or be the brave soul who starts a new one.

![Dashboard - Desktop](docs/screenshots/dashboard_large_screen.png)
*Everything you need in one place - we're pretty proud of this layout*

<details>
<summary>📱 Mobile and tablet versions</summary>

![Dashboard - Mobile](docs/screenshots/dashboard_mobile_screen.png)
*Mobile dashboard - all the important stuff without the clutter*

![Dashboard - Tablet](docs/screenshots/dashboard_tablet_screen.png)
*Tablet view - great for group decision making*
</details>

### 👨‍💼 Admin Stuff (For The Control Freaks)

If you're lucky enough to be an admin, you get access to the behind-the-scenes controls. It's like being the manager of a restaurant, but for ordering food.

![Admin Dashboard - Desktop](docs/screenshots/admin_dashboard_large_screen.png)
*The admin view - see everything that's happening and feel important*

<details>
<summary>📱 Admin on mobile</summary>

![Admin Dashboard - Mobile](docs/screenshots/admin_dashboard_mobile_screen.png)
*Even admins need to manage things while on the toilet (we don't judge)*
</details>

#### Keeping Track of Orders
![Admin Orders - Desktop](docs/screenshots/admin_dashboard_orders_summary_large_screen.png)
*Who's ordering what and when - basically your food surveillance center*

#### Adding New Restaurants
![Restaurant Management - Desktop](docs/screenshots/admin_dashboard_new_resturant_large_screen.png)
*Simple form to add new places when you discover that amazing new taco truck*

### ⚠️ When Things Go Wrong (They Sometimes Do)

Nobody's perfect, and sometimes things break. When they do, we try to make the error pages at least friendly and helpful.

![Error Page - Desktop](docs/screenshots/error_large_screen.png)
*Even our error pages try to be helpful instead of just saying "ERROR 404" like jerks*

<details>
<summary>📱 Error pages on smaller screens</summary>

![Error Page - Mobile](docs/screenshots/error_mobile_screen.png)
*Mobile errors that don't make you want to throw your phone*

![Error Page - Tablet](docs/screenshots/error_tablet_screen.png)
*Tablet errors - consistent and not scary*
</details>

## The Videos (Because Screenshots Are So Last Year)

### 📱 Flutter Mobile App in Action ✅
**File**: `docs/videos/flutter_app_demo.mp4`
This is where we show off our mobile app. You'll see:
- How smooth the login process is
- The mobile interface that actually makes sense
- Browsing restaurants without wanting to pull your hair out
- Creating and joining orders like a pro
- Real-time updates that actually work
- Payment tracking that doesn't require a calculator
- The app working on both iOS and Android (because we're not monsters)

### 💻 Desktop Website Walkthrough ✅
**File**: `docs/videos/desktop_website_demo.mp4`
A complete tour of the web app where we show:
- The whole login-to-logout experience
- Dashboard that doesn't overwhelm you
- Creating orders without losing your mind
- Admin features for the control freaks
- Everything updating in real-time like magic

## How We Built This Thing

We kept the tech stack pretty standard - no need to reinvent the wheel when you're hungry.

### 🏗️ What We Used
- **Backend**: Node.js with Express.js (reliable, well-documented, gets the job done)
- **Database**: MongoDB Atlas (cloud-based so we don't have to babysit a server)
- **Frontend**: EJS templates with Bootstrap 5 (responsive without the headache)
- **Mobile App**: Flutter (because it's actually good at mobile stuff)
- **Authentication**: Sessions (simple and secure enough for food ordering)
- **Deployment**: Vercel (deploys itself, what more could you want?)

### 📱 The Great Bravo Studio vs Flutter Debate

So initially, we were gonna use Bravo Studio because it looked easy. Then we actually tried to use it and hit some walls:

- **15 Page Limit**: Seriously? Our app needed way more than 15 screens
- **No Dynamic Content**: How are we supposed to show real-time order updates?
- **Backend Integration**: Connecting it to our Express.js API was like trying to fit a square peg in a round hole
- **Customization**: Wanted to match our design? Good luck with that

Flutter was like a breath of fresh air:
- **Unlimited Everything**: Make as many screens as you want
- **Real Dynamic Content**: Order updates, user-generated content, all that good stuff
- **API Integration**: Talks to our backend like they were made for each other
- **Design Freedom**: Our Figma designs translated perfectly
- **Cross-Platform**: Write once, run on iOS and Android (efficiency for the win)

### 📁 How We Organized Everything
```
octdeliverysystem/
├── docs/                        # Documentation and demos
│   ├── videos/                 # Video demonstrations
│   │   ├── flutter_app_demo.mp4  # Flutter mobile app recording
│   │   └── desktop_website_demo.mp4 # Web app walkthrough
│   └── screenshots/            # UI screenshots for docs
├── flutter_app/               # Flutter mobile application
│   ├── lib/                   # Flutter source code
│   ├── android/               # Android-specific files
│   ├── ios/                   # iOS-specific files
│   └── pubspec.yaml           # Flutter dependencies
├── scripts/                    # Utility scripts
│   └── take-screenshots.js     # Automated screenshot tool
├── src/                        # Main web application code
│   ├── server.js              # App entry point
│   ├── middleware/            # Authentication & security
│   ├── models/                # Database schemas
│   │   ├── User.js           # User account data
│   │   ├── Restaurant.js     # Restaurant info & menus
│   │   └── Item.js           # Order items & tracking
│   ├── routes/               # API endpoints
│   │   ├── auth.js          # Login/logout handling
│   │   ├── items.js         # Order management
│   │   ├── restaurants.js   # Restaurant browsing
│   │   └── admin.js         # Admin panel features
│   ├── scripts/             # Database utilities
│   │   ├── initDb.js        # Set up fresh database
│   │   ├── createAdmin.js   # Create admin accounts
│   │   └── createRestaurants.js # Add sample restaurants
│   └── views/               # Web page templates
│       ├── login.ejs        # Login page
│       ├── items/           # Order-related pages
│       ├── restaurants/     # Restaurant browsing
│       └── admin/           # Admin panel pages
├── package.json             # Dependencies and scripts
├── vercel.json             # Deployment configuration
└── README.md               # This file!
```

## Want to Run This Yourself?

Cool! Here's how to get everything running on your computer:

### What You'll Need First
- Node.js (version 14 or newer - if you're still on an older version, what are you doing?)
- A MongoDB Atlas account (it's free, don't worry)
- Git (to clone this masterpiece)

### Let's Get This Party Started

1. **Grab the code**
   ```bash
   git clone <repository-url>
   cd octdeliverysystem
   ```

2. **Install all the dependencies** (this might take a minute)
   ```bash
   npm install
   ```

3. **Set up your secrets**
   Create a `.env` file and put this stuff in it:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   SESSION_SECRET=make_this_something_random_and_secure
   NODE_ENV=development
   PORT=3000
   ```

4. **Get the database ready**
   ```bash
   npm run init-db
   ```

5. **Add some fake data** (trust me, you want this)
   ```bash
   node src/scripts/createAdmin.js
   node src/scripts/createRestaurants.js
   node src/scripts/createTestUser.js
   ```

6. **Fire it up!**
   ```bash
   npm run dev
   ```

Now open your browser to `http://localhost:3000` and boom - you should see the login page!

## Setting Up MongoDB Atlas (The Easy Way)

Don't worry, it's not as scary as it sounds:

1. **Sign up** at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - it's free
   
2. **Create a cluster** - pick the free M0 Sandbox option (unless you're feeling generous)
   - Choose a region near you for better speed
   - Default settings are fine

3. **Create a database user**
   - Pick a strong password (not "password123")
   - Write it down somewhere you won't lose it

4. **Set up network access**
   - Add `0.0.0.0/0` to your IP whitelist
   - This lets your app connect from anywhere

5. **Get your connection string**
   - Click "Connect" then "Connect your application"
   - Copy that long string
   - Replace `<password>` with your actual password
   - Paste it in your `.env` file as `MONGODB_URI`

## How Our API Works (For The Nerds)

Our API is pretty straightforward - we didn't overthink it:

### 🔐 Login/Logout Stuff
- `GET /auth/login` - Shows the login page
- `POST /auth/login` - Actually logs you in
- `GET /auth/logout` - Logs you out (shocking, right?)

### 🍕 Restaurant Browsing
- `GET /restaurants` - See all the restaurants we've got
- `GET /restaurants/:id/menu` - Check out a specific restaurant's menu

### 📋 Order Management (The Important Stuff)
- `GET /items` - Your dashboard with all the orders
- `GET /items/new` - Start creating a new group order
- `POST /items` - Actually create that order
- `GET /items/:id` - See the details of a specific order
- `POST /items/:id/join` - Join someone else's order
- `PUT /items/:id/payment` - Mark that you've paid
- `DELETE /items/:id/leave` - Remove yourself from an order

### 👨‍💼 Admin Powers (Use Responsibly)
- `GET /admin` - The admin dashboard with all the stats
- `GET /admin/users` - Manage user accounts
- `POST /admin/users` - Create new users
- `PUT /admin/users/:id` - Edit user details
- `DELETE /admin/users/:id` - Remove users (be careful with this one!)
- `GET /admin/restaurants` - Manage restaurant listings
- `POST /admin/restaurants` - Add new restaurants
- `PUT /admin/restaurants/:id` - Update restaurant info
- `GET /admin/orders` - See all orders in the system

## Test Accounts (So You Can Actually Try This)

We set up some accounts you can use to test everything:

### Regular Users
**Account 1:**
- **Username**: `1023003`
- **Password**: `bubbles(BBB)`
- **What you can do**: Order food, join groups, track payments

**Account 2:**
- **Username**: `1023040`
- **Password**: `elsherbinycalc`
- **What you can do**: Same as above

> **Fair Warning**: These are just for testing! If you actually deploy this somewhere public, please change these passwords. We're not responsible if someone orders $200 worth of sushi on your dime.

### Making Your Own Accounts
Want to create more test accounts? We've got scripts for that:

```bash
# Create a regular user (it'll ask you for details)
node src/scripts/createUser.js

# Create an admin (for when you want the power)
node src/scripts/createAdmin.js

# Quick test user creation
node src/scripts/createTestUser.js
```

## Handy Commands (Cheat Sheet)

Here's all the commands you might need:

| What it does | Command | When to use it |
|-------------|---------|----------------|
| Start for development | `npm run dev` | When you're coding and want auto-restart |
| Start normally | `npm start` | For production or just testing |
| Set up database | `npm run init-db` | First time setup |
| Take screenshots | `npm run screenshots` | Update documentation |
| Create admin user | `node src/scripts/createAdmin.js` | Need admin powers |
| Add sample restaurants | `node src/scripts/createRestaurants.js` | Want fake data to play with |
| Reset everything | `node src/scripts/resetDatabase.js` | When you mess up and want to start over |

## Putting It Online (Deployment)

We used Vercel because it's stupid simple:

### The Vercel Way

1. **Connect your GitHub repo** to Vercel (easiest method)

2. **Add your secrets** in the Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `MONGODB_URI` with your Atlas connection string
   - Add `SESSION_SECRET` with something secure
   - Set `NODE_ENV` to `production`

3. **Hit deploy** and Vercel does the rest

### Testing Production Mode Locally
Want to see how it runs in production mode?
```bash
NODE_ENV=production npm start
```

## When Things Break (And They Will) 🔧

Look, we're gonna be honest with you - stuff breaks. It's not personal, it's just software. Here are the most common "WHY ISN'T THIS WORKING?!" moments and how to fix them without throwing your laptop out the window:

### "Can't connect to database" 😭
This one's a classic. First time it happens, you'll panic. Fifth time, you'll fix it in 30 seconds.

**The usual suspects:**
- Check your `MONGODB_URI` in the `.env` file (did you actually replace `<password>` with your real password? We've all been there)
- Make sure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` (yeah, it's not the most secure, but it's development)
- Double-check your database username and password (caps lock might be on)
- Try copying and pasting the connection string again (sometimes there are invisible characters that mess things up)

### "Session errors" or "Can't stay logged in" 🍪
When sessions act up, it's usually cookies being weird.

**Quick fixes:**
- Make sure `SESSION_SECRET` is actually set in your `.env` file (not just commented out)
- Clear your browser cookies (Ctrl+Shift+Del is your friend)
- Try incognito/private mode (sometimes your browser just holds grudges)
- Restart the server with `npm run dev` (the old reliable)
- If you're on Chrome, check if you have multiple tabs open - sometimes they fight each other

### "Port already in use" 🚪
Someone's camping on port 3000. Happens more than you'd think.

**Solutions:**
- Change the port in your `.env`: `PORT=3001` (or 3002, 3003... the sky's the limit)
- Kill whatever's using it: `npx kill-port 3000` (nuclear option)
- Check if you accidentally left another instance running (we've all done this)
- Restart your computer if you're feeling dramatic (sometimes it helps)

### Screenshots not working 📸
Our automated screenshot tool is pretty neat, but sometimes it gets moody.

**Troubleshooting steps:**
- Install puppeteer if you haven't: `npm install --save-dev puppeteer`
- Make sure your app is actually running on `http://localhost:3000` (check the URL bar)
- Run the database setup scripts first - can't screenshot empty pages
- Check if port 3000 is really free (see above)
- Try running it manually: `node scripts/take-screenshots.js`

### "Nothing's working and I want to cry" 😢
We've all been there. Take a deep breath, grab some coffee (or tea, we don't judge), and try these:

**The nuclear options:**
1. Delete `node_modules` and run `npm install` again (classic move)
2. Clear everything: cookies, cache, local storage (scorched earth policy)
3. Restart your computer (yes, really)
4. Clone the repo fresh in a new folder (sometimes your local copy just gets cursed)
5. Run `node src/scripts/resetDatabase.js` and start over with the data

**When to ask for help:**
- After you've tried the above and it's still broken
- When error messages stop making any sense (or start making too much sense)
- When you find yourself Googling "how to delete everything and start over"
- When you've been stuck for more than 2 hours (seriously, don't suffer in silence)

## What We Actually Learned (The Real Talk)

Building this was... an experience. Here's the stuff they don't teach you in class:

**Technical Lessons:**
- Use `npm run dev` while coding - the auto-restart is a lifesaver (seriously, don't code without it)
- Browser console and terminal errors are your friends, even when they speak in cryptic riddles
- MongoDB Compass is a godsend for actually seeing what's in your database
- Clear browser cookies when login stops working (this will save you hours of debugging)
- The admin panel is perfect for testing - you can see everything happening like you're Neo in The Matrix

**Life Lessons:**
- Coffee consumption increased by approximately 400% during development
- "It works on my machine" is both a meme and a source of genuine frustration
- Naming things is hard (we changed our variable names way too many times)
- Git conflicts are the worst, but merge conflicts while hungry are even worse
- Sometimes the solution is just turning it off and on again (we're not proud of this)
- Never push to main at 3 AM (learned this the hard way)

**Project Management Reality:**
- Initial estimate: "This should take like 2 weeks"
- Actual time: "Why is it still not working after a month?"
- 80% of development time goes to fixing bugs you created while fixing other bugs
- The last 10% of features take 90% of the time (classic software development math)

## Links and Stuff

- **Design**: [Our Figma workspace](https://www.figma.com/design/ha96dwhVWdDJ6afpUBn5l3/Untitled?node-id=0-1&p=f&t=dE3wKqLEE9TVgXrr-0) (we spent way too much time on this)
- **Flutter App**: The mobile app source code is right here in the project
- **Database**: Connection details are in the setup guide above
- **Live Website**: *[We'll add the URL when we deploy it]*

---

## The End (Finally!) 🎉

And that's a wrap! Building this project was like a roller coaster - lots of ups, some downs, a few moments where we questioned our life choices, but ultimately pretty rewarding.

**What we're proud of:**
- It actually works (most of the time)
- The UI doesn't look like it was designed in 1995
- We figured out Flutter without losing our minds
- The admin panel makes us feel powerful
- Real people can actually use this to order food

**What we'd do differently next time:**
- Start with the database design instead of winging it
- Write tests (we know, we know, we should have done this)
- Not leave everything until the last week (classic student move)
- Actually read the documentation instead of just copying Stack Overflow answers
- Use better variable names (sorry future us)

**Fun stats from development:**
- Lines of code written: Too many to count
- Coffee cups consumed: Not enough
- Times we almost gave up: 17
- Stack Overflow visits: Countless
- "It works!" celebrations: 42
- Bugs fixed: 127 (at least)
- Bugs created while fixing bugs: 85 (oops)

This was our first real full-stack project, and honestly, we learned more building this than in most of our classes. There's something about wrestling with real problems that makes everything click.

If you're a student reading this, here's our advice: start early, commit often, don't be afraid to ask for help, and remember that every developer has been exactly where you are right now - confused, slightly panicked, but determined to make it work.

Thanks for checking out our project! We hope it inspires you to build something cool, or at the very least, helps you understand why software engineers drink so much coffee.

**P.S.** If you find any bugs (which you probably will), please be gentle. We're still learning, and our feelings bruise easily. 😅

**P.P.S.** If you actually use this to order food and it works, please let us know! We'd love to hear about it. If it crashes and you lose your lunch money, please pretend you never saw this project. Thanks! 🙏