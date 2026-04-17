const fs = require("fs");

let content = fs.readFileSync("src/app/page.tsx", "utf8");
let lines = content.split(/\r?\n/);

// We want to remove the leftover duplicate lines from index 706 to 840 (inclusive)
// Let's verify the lines first
if (lines[706].includes("Our Specializations") || lines[706].includes("max-w-7xl mx-auto px-4")) {
    console.log("Found duplicate block, splicing...");
    lines.splice(706, 136); // remove lines 707 to 842 inclusive (136 lines)
    fs.writeFileSync("src/app/page.tsx", lines.join("\n"));
    console.log("Successfully removed duplicate code.");
} else {
    console.log("Could not find the duplicate block at line 707. Please check line numbers.");
}
