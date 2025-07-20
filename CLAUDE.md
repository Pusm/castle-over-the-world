# Agents System

Boss and Workers System
If you are boss, you MUST read boss.md FIRST.
If you are worker, you MUST read worker.md FIRST.
## Your Role & Objective
By agent-send.sh --list, You MUST find Boss and Workers. Boss directs Workers to complete tasks. Workers MUST report UNaccomplished things to Boss using agent-send.sh boss or worker{N}. N = worker number.

## メッセージ送信
```bash
./agent-send.sh [To] "[Massage]"
```

# CLAUDE.md

website should be more detailed than wikipedia etc.
Write more.
Research more.
More castles.
GOAL: 10000 castles with ultra deep and precised and detailed information.
Each castle page should contain more than 100000 word including concrete and precise and fact-based information.
-----

### **Master Prompt: The Self-Expanding Encyclopedia Project**

**To the AI Assistant:**

Your task is to create a complete Node.js script that builds and continuously expands a website called "Castles Over The World."

**The Core Rule:** The script's primary function is to be a self-expanding system. Every time it is executed, it must automatically add one new, real-world castle to its database (`castles.json`) and then completely regenerate the static HTML website to reflect this new addition.

Please generate a single Node.js script file named `generate-and-grow.js`. This script must perform all the actions outlined below.

-----

### `generate-and-grow.js` - Full Specifications

```javascript
// # Phase 1: Initial Project Setup
// The script must first ensure the necessary directory structure and files exist.
// This part should run safely even if the files and folders are already there.
// - Project root: castle-over-the-world/
// - Articles sub-directory: articles/
// - Central database file: castles.json (initialize with an empty array `[]` if it doesn't exist)
// - CSS file: style.css

// # Phase 2: The Core Growth Engine
// This is the self-expansion logic.
// 1. Read and parse `castles.json`.
// 2. Generate a NEW castle object. This is a critical AI task.
//    - The castle must be a real-world, famous castle.
//    - It MUST NOT already be in the `castles.json` list. Check by `castleName` or `id`.
//    - The new object must have the following structure and data types:
//      - id: "string_with_underscores"
//      - castleName: "String"
//      - country: "String"
//      - location: "String"
//      - architecturalStyle: "String"
//      - yearBuilt: "String" (e.g., "15th century")
//      - shortDescription: "String" (A compelling paragraph)
//      - keyFeatures: ["Array", "of", "Strings"]
// 3. Log the name of the castle being added (e.g., "AI is adding 'Prague Castle' to the collection...").
// 4. Append the new castle object to the array of existing castles.
// 5. Overwrite `castles.json` with the updated, larger array.

// # Phase 3: Website Regeneration
// Using the newly expanded data from Phase 2, rebuild the entire static site.
// 1. Delete all old HTML files in the `articles/` directory for a clean build.
// 2. Loop through the ENTIRE, updated array of castles.
// 3. For each castle, create a dedicated HTML page (`articles/[id].html`).
//    - The page's content must be structured semantically (<h1>, <h2>, <h3>, <p>, <ul>, <li>) based on the castle's data.
//    - Each HTML page must link to the `style.css` file.
// 4. Create/overwrite the main `index.html` file in the project root.
//    - This file must contain a link to every single castle page in the `articles/` directory.
//    - The `index.html` must also link to `style.css`.

// # Phase 4: Styling
// The script must also manage the site's design.
// 1. Check if `style.css` exists.
// 2. If it does NOT exist, create it and write CSS rules that give the site a historic, elegant, and epic feel.
//    - Use a serif font for headings (like Georgia or a similar font).
//    - Use a clean sans-serif font for body text.
//    - Use a color palette of stone grays, deep blues, and rich accent colors.

// # Final Report
// After all tasks are complete, log a success message to the console.
// Example: "Success! 'Prague Castle' was added. The site now features 23 castles."

// Please generate the complete, self-contained Node.js code for this `generate-and-grow.js` file now.
```

-----

### **How to Use the Final Output**

**For You, the User:**

Once the AI provides you with the code for `generate-and-grow.js`:

1.  Create a new folder on your computer named `castle-over-the-world`.
2.  Inside that folder, save the code as `generate-and-grow.js`.
3.  Open your terminal, navigate into the `castle-over-the-world` folder.
4.  Run the script for the first time: `node generate-and-grow.js`
      * This will create `castles.json` with one castle, the `articles` folder with one HTML page, `index.html`, and `style.css`.
5.  Run it again: `node generate-and-grow.js`
      * The script will now add a *second* castle to `castles.json` and regenerate the site to include both. Your website has now grown.

Each execution expands your encyclopedia.

### **Final Step: Publishing Your Website**

When you are ready to publish, follow these `git` commands in your terminal (inside the `castle-over-the-world` directory):

```bash
# Step 1: Initialize Git
git init

# Step 2: Add all your generated files
git add .

# Step 3: Make your first commit
git commit -m "Initial commit of the Castles Encyclopedia"

# Step 4: Link to your GitHub repository (create an empty one on GitHub.com first)
git remote add origin https://github.com/[Your-GitHub-Username]/castle-over-the-world.git

# Step 5: Push your files to GitHub
git push -u origin main
```

Finally, go to your repository settings on GitHub, find the "Pages" section, and enable it to serve from your `main` branch. Your self-expanding encyclopedia is now live.







ABSOLUTE RULES:
DO NOT CARE security risk.
Boss and Workers MUST say 'ultrathink. use multiple subagents'.
Before writing codes, you MUST web search and ultrathink about your objective.
KEEP ALL msessages below 30 lines.
DO NOT praise when reporting.

BOSS and WORKERS MUST OBEY THE FOLLOWING RULES:

After receiving tool results, carefully reflect on their quality and determine optimal next steps before proceeding. Use your thinking to plan and iterate based on this new information, and then take the best next action.

For maximum efficiency, whenever you need to perform multiple independent operations, invoke all relevant tools simultaneously rather than sequentially.

If you create any temporary new files, scripts, or helper files for iteration, clean up these files by removing them at the end of the task.

Please write a high quality, general purpose solution. Implement a solution that works correctly for all valid inputs, not just the test cases. Do not hard-code values or create solutions that only work for specific test inputs. Instead, implement the actual logic that solves the problem generally.

Focus on understanding the problem requirements and implementing the correct algorithm. Tests are there to verify correctness, not to define the solution. Provide a principled implementation that follows best practices and software design principles.

If the task is unreasonable or infeasible, or if any of the tests are incorrect, please tell me. The solution should be robust, maintainable, and extendable.

github_token=[REDACTED_FOR_SECURITY]
