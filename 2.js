// ==UserScript==
// @name         2/2
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  2/2
// @author       Rec
// @match        https://*.jklm.fun/*/bombparty/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // ==================================================
    // Config Section (Edit these values as needed)
    // ==================================================
    const config = {
        autotype: true, // Automatically type the word
        selfOnly: false, // Only show words on your turn
        lang: "en", // Deprecated, Ignore
        min: 1, // Minimum word length
        max: Infinity, // Maximum word length
        instant: false, // Instantly fill the word
        pause: 100, // Typing delay between letters
        difference: 110, // Randomness in typing delay
        initialPause: 500, // Delay before typing starts
        messup: false, // Add random characters to the word
        messupCharacters: "0192", // Characters to use for messing up (No a-zA-Z ' or -)
        priority: "2:2", // Priority mode https://pastebin.com/raw/z6Fqbp2U For Info
        api: "https://files.catbox.moe/gzaxa4.json", // Default wordlist URL
        customWordlistUrl: "https://files.catbox.moe/exp8s0.json", // Custom wordlist URL
    };

    // ==================================================
    // Constants and Initial Setup
    // ==================================================
    const supportedLanguages = ["en", "es", "it", "fr", "de"];
    const logFontSize = "font-size:16px;";
    const logStyles = {
        error: "color:crimson;" + logFontSize,
        success: "color:cyan;" + logFontSize,
        word: "color:green;" + logFontSize,
        myWord: "color:lime;" + logFontSize,
    };

    // ==================================================
    // Main Script Logic
    // ==================================================
    async function main() {
        const syllable = document.querySelector(".syllable");
        const selfTurn = document.querySelector(".selfTurn");
        const seating = document.querySelector(".bottom .seating");
        const input = document.querySelector(".selfTurn input");

        let library;
        let customLibrary;
        let word;
        let myTurn = false;
        let typingInProgress = false;
        let lastLetter = ""; // Track the last letter of the previous word for Shiritori

        // Create a UI overlay
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "10px";
        overlay.style.right = "10px";
        overlay.style.backgroundColor = "#000"; // Black background
        overlay.style.color = "#0F0"; // Bright green text
        overlay.style.padding = "8px";
        overlay.style.borderRadius = "0"; // No rounded corners
        overlay.style.zIndex = "10000";
        overlay.style.fontFamily = "monospace"; // Monospace font for 90s vibe
        overlay.style.border = "2px solid #0F0"; // Bright green border
        overlay.style.fontSize = "12px"; // Smaller font size
        overlay.style.boxShadow = "none"; // No gradient glow

        // Priority Section
        const priorityLabel = document.createElement("label");
        priorityLabel.innerText = "Priority: ";
        priorityLabel.style.marginRight = "5px";

        const priorityInput = document.createElement("input");
        priorityInput.type = "text";
        priorityInput.value = config.priority;
        priorityInput.style.width = "40px"; // Smaller input
        priorityInput.style.marginRight = "5px";
        priorityInput.style.backgroundColor = "#000"; // Black input background
        priorityInput.style.color = "#0F0"; // Bright green text
        priorityInput.style.border = "1px solid #0F0"; // Bright green border

        const updateButton = document.createElement("button");
        updateButton.innerText = "Update";
        updateButton.style.backgroundColor = "#000"; // Black button
        updateButton.style.color = "#0F0"; // Bright green text
        updateButton.style.border = "1px solid #0F0"; // Bright green border
        updateButton.style.padding = "3px 6px"; // Smaller padding
        updateButton.style.borderRadius = "0"; // No rounded corners
        updateButton.style.cursor = "pointer";
        updateButton.style.marginRight = "5px";

        // Copy Word Section
        const wordDisplay = document.createElement("div");
        wordDisplay.style.marginTop = "8px";
        wordDisplay.style.fontWeight = "bold";
        wordDisplay.style.color = "#0F0"; // Bright green text

        const copyButton = document.createElement("button");
        copyButton.innerText = "Copy Word";
        copyButton.style.backgroundColor = "#000"; // Black button
        copyButton.style.color = "#0F0"; // Bright green text
        copyButton.style.border = "1px solid #0F0"; // Bright green border
        copyButton.style.padding = "3px 6px"; // Smaller padding
        copyButton.style.borderRadius = "0"; // No rounded corners
        copyButton.style.cursor = "pointer";
        copyButton.style.marginTop = "8px";

        // Append elements to overlay
        overlay.appendChild(priorityLabel);
        overlay.appendChild(priorityInput);
        overlay.appendChild(updateButton);
        overlay.appendChild(wordDisplay);
        overlay.appendChild(copyButton);
        document.body.appendChild(overlay);

        // Update priority when the button is clicked
        updateButton.addEventListener("click", () => {
            const newPriority = priorityInput.value.trim();
            if (/^\d+:\d+$/.test(newPriority)) {
                config.priority = newPriority;
                console.log(`%cPriority updated to: ${config.priority}`, logStyles.success);
            } else {
                console.log("%cInvalid priority format. Use format like '1:2'.", logStyles.error);
            }
        });

        // Copy word when the button is clicked
        copyButton.addEventListener("click", () => {
            if (word) {
                copyToClipboard(word);
                console.log(`%cCopied: ${word}`, logStyles.success);
                wordDisplay.innerText = `Word: ${word}`;
            }
        });

        // Copy word when "=" is pressed
        window.addEventListener("keydown", (e) => {
            if (e.key === "=") {
                if (word) {
                    copyToClipboard(word);
                    console.log(`%cCopied: ${word}`, logStyles.success);
                    wordDisplay.innerText = `Word: ${word}`;
                }
            }
        });

        // Fallback for Clipboard API
        function copyToClipboard(text) {
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed"; // Prevent scrolling
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand("copy"); // Use deprecated execCommand as fallback
                console.log(`%cCopied: ${text}`, logStyles.success);
            } catch (err) {
                console.log("%cFailed to copy text!", logStyles.error);
            }
            document.body.removeChild(textarea);
        }

        function messUpWord(word) {
            while (word.length < 29) {
                const randomChar = config.messupCharacters[Math.floor(Math.random() * config.messupCharacters.length)];
                const randomIndex = Math.floor(Math.random() * (word.length + 1));
                word = word.slice(0, randomIndex) + randomChar + word.slice(randomIndex);
            }
            return word;
        }

        console.log("%cWelcome To GOYPARTY (Private)", logStyles.success);
        console.log("%cCredits To Mobakour", logStyles.success);
        console.log("%cEdited By Rec", logStyles.success);

        let error;

        if (!syllable || !selfTurn)
            error = "incorrect javascript context, please switch to 'bombparty/' javascript context. Read the usage guide.";

        if (!supportedLanguages.includes(config.lang))
            error = `supported languages are: ${supportedLanguages.join(", ")}`;

        if (isNaN(config.min) || isNaN(config.max) || config.min < 1 || config.max < 1)
            error = "min and max values must be numerical values greater than 0";

        if (config.max < config.min) error = "max cannot be less than min";

        if (isNaN(config.pause)) error = "pause must be a number";

        if (isNaN(config.initialPause)) error = "initialPause must be a number";

        if (error) {
            console.log(`%cError: ${error}`, logStyles.error);
            return;
        }

        try {
            library = await (await fetch(config.api)).json();
            library = library.filter((el) => el.length >= config.min && el.length <= config.max);
            library = shuffle(library);

            console.log("%cLibrary loaded 👍", logStyles.success);
            console.log(`%cNumber of words loaded: ${library.length}`, logStyles.success);

            // Load custom wordlist
            customLibrary = await (await fetch(config.customWordlistUrl)).json();
            customLibrary = customLibrary.filter((el) => el.length >= config.min && el.length <= config.max);
            console.log("%cCustom wordlist loaded 👍", logStyles.success);
            console.log(`%cNumber of custom words loaded: ${customLibrary.length}`, logStyles.success);
        } catch (err) {
            console.log("%cError: couldn't load words library! :(", logStyles.error);
            return;
        }

        const observer = new MutationObserver(() => {
            if (seating.getAttribute("hidden") === null) return;

            myTurn = selfTurn.getAttribute("hidden") === null;
            cheat();
        });

        observer.observe(selfTurn, { attributes: true });
        observer.observe(seating, { attributes: true });

        function sleep(time) {
            return new Promise((res) => setTimeout(res, time));
        }

        function shuffle(array) {
            const arr = [...array];
            let currentIndex = arr.length, randomIndex;
            while (currentIndex > 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
            }
            return arr;
        }

        async function typeLetters(word, triggered) {
            if (!triggered) await sleep(config.initialPause);

            if (config.messup) {
                word = messUpWord(word);
                console.log(`%cMessed-up word (29 characters): ${word}`, logStyles.myWord);
            }

            typingInProgress = true;

            for (const char of word) {
                input.value += char;
                input.dispatchEvent(new Event("input", { bubbles: true }));

                const margin = Math.random() * (2 * config.difference) - config.difference;
                await sleep(config.pause + margin);
            }

            typingInProgress = false;
        }

        async function cheat(controlPressed = false) {
            if (!library || (config.selfOnly && !myTurn)) return;

            const letters = syllable.innerText.toLowerCase();
            const [basePriority, controlPriority] = config.priority.split(":").map(Number);
            const activePriority = controlPressed ? controlPriority : basePriority;

            let candidateWords;

            // Custom Priority (Priority 6)
            if (activePriority === 6 && customLibrary) {
                candidateWords = customLibrary.filter((el) => el.toLowerCase().includes(letters));
                if (candidateWords.length === 0) {
                    console.log("%cNo matching word in custom wordlist, defaulting to shortest word.", logStyles.word);
                    candidateWords = library.filter((el) => el.toLowerCase().includes(letters));
                    candidateWords.sort((a, b) => a.length - b.length);
                }
            }
            // Shiritori Priority (Priority 7)
            else if (activePriority === 7) {
                if (lastLetter) {
                    // Find words that start with the last letter and contain the syllable
                    candidateWords = library.filter((el) => el.toLowerCase().startsWith(lastLetter) && el.toLowerCase().includes(letters));
                    if (candidateWords.length === 0) {
                        console.log("%cNo matching word for Shiritori, starting a new sequence.", logStyles.word);
                        lastLetter = ""; // Reset the sequence
                    }
                }
                if (!lastLetter || candidateWords.length === 0) {
                    // Default to a random word if no Shiritori match is found
                    candidateWords = library.filter((el) => el.toLowerCase().includes(letters));
                    candidateWords.sort((a, b) => a.length - b.length);
                }
            } else {
                candidateWords = library.filter((el) => el.toLowerCase().includes(letters));

                // Apply priority-based sorting
                if (activePriority === 0) {
                    // Normal: No sorting, use the first word found
                } else if (activePriority === 1) {
                    // Longest: Sort by length descending
                    candidateWords.sort((a, b) => b.length - a.length);
                } else if (activePriority === 2) {
                    // Shortest: Sort by length ascending
                    candidateWords.sort((a, b) => a.length - b.length);
                } else if (activePriority === 3) {
                    // Hyphens: Prefer words with hyphens
                    candidateWords.sort((a, b) => (b.includes("-") ? 1 : -1));
                } else if (activePriority === 4) {
                    // Symmetrical: Prefer words where the syllable is in the middle
                    candidateWords.sort((a, b) => {
                        const aMiddle = a.toLowerCase().indexOf(letters) === Math.floor((a.length - letters.length) / 2);
                        const bMiddle = b.toLowerCase().indexOf(letters) === Math.floor((b.length - letters.length) / 2);
                        return bMiddle ? 1 : -1;
                    });
                } else if (activePriority === 5) {
                    // Adverbs: Prefer words ending with "ly"
                    candidateWords.sort((a, b) => (b.endsWith("ly") ? 1 : -1));
                }
            }

            // If no words match the priority, default to the shortest word
            if (candidateWords.length === 0) {
                candidateWords = library.filter((el) => el.toLowerCase().includes(letters));
                candidateWords.sort((a, b) => a.length - b.length);
            }

            word = candidateWords[0];

            if (!word) {
                console.log("%cError: failed to find a word ;-;", logStyles.error);
                return;
            }

            // Update the last letter for Shiritori
            if (activePriority === 7) {
                lastLetter = word[word.length - 1].toLowerCase();
                console.log(`%cLast letter for next word: ${lastLetter}`, logStyles.word);
            }

            console.log(`%c${word}`, logStyles.myWord);
            wordDisplay.innerText = `Word: ${word}`;

            library = library.filter(w => w !== word);

            if (config.autotype && myTurn) {
                if (config.instant) {
                    if (config.messup) {
                        word = messUpWord(word);
                        console.log(`%cMessed-up word (29 characters): ${word}`, logStyles.myWord);
                    }
                    input.value = word;
                } else {
                    input.value = "";
                    await typeLetters(word, false);
                }
                input.select();
            }

            library = shuffle(library);
        }

        window.addEventListener("keydown", (e) => {
            if (e.key === "Control") {
                typingInProgress = false;
                myTurn = true;
                input.value = "";
                cheat(true);
            }
        });
    }

    // Start the script
    main();
})();
