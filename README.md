# 🎯 GitLucky 

A fast-paced **dart-throwing wheel game** built using **Cocos Creator** and **TypeScript**. 
Designed both as a **mini casual game** and a **playable ad** experience.

---
## 🚀 About the Game
**GitLucky** is a tap-to-throw dart game where players aim at a spinning wheel to win cash rewards and collectible items. 
The goal is simple:
* Hit the wheel 3 times
* Collect **PayPal**, **Amazon**, and **PiggyBank** items
* Avoid the **Bomb**
* Earn as much cash as possible
* Unlock a special **Golden Piggy** ending sequence 

The game works smoothly on mobile and desktop environments and is optimized for playable-ad formats such as **AppLovin**, **Unity Ads**, and **Meta Ads**.

---
## 🛠️ Built With
* **Cocos Creator 3.x**
* **TypeScript**
* **UITransform & Tween Animation Systems**
* **Component-based Architecture**
* **Event-based Input Handling (Touch / Mouse)**

---
## 🎮 How It Works

### 1. **Dart Throwing**
Players tap/click anywhere to throw a dart. 
The dart automatically flies toward a **random prize node** on the wheel.
* Uses `tween()` for smooth movement
* Converts world → local UI coordinates
* Sticks to the wheel for a moment
* Returns to starting position 

### 2. **Prize System**
Prize types include:
* **💵 Cash Rewards**: `$1`, `$5`, `$10`
* **📦 Collection Items**: `PayPal`, `Amazon`, `PiggyBank`
* **💣 Bomb**: triggers game-over logic

Collected items animate into **collection slots**.

### 3. **Tutorial Hand**
If the player is inactive for 2 seconds, a pulsing hand appears to guide them.

---
## ▶️ Play More of My Games
Check out my other projects on itch.io!

👉 https://raven-death.itch.io
If you enjoyed GitLucky, feel free to try my other games and support the page!

---
## 📦 Playable Ad Compatibility
**GitLucky** is optimized for:
* Meta Ads
* Unity Playables
* AppLovin Playables
* Mintegral
* TikTok Playables
Works seamlessly inside **WebView** and Exported **HTML5** formats.

---
## 📜 License
This project is licensed under the **MIT License** — feel free to modify and build upon it.

---
## ❤️ Support
If you like this project, consider:
* ⭐ Starring the GitHub repo
* 🎮 Playing my games on itch.io
* 🔁 Sharing the playable ad demo

Happy coding, and good luck hitting that Golden Piggy! 🐷✨