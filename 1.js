// ==UserScript==
// @name         1/2
// @namespace    http://tampermonkey.net/
// @version      1.9
// @description  2/2
// @author       Rec
// @match        https://jklm.fun/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let wordList = [];

    function loadWordList() {
        GM_xmlhttpRequest({
            method: "GET",
            url: "https://files.catbox.moe/gzaxa4.json",
            onload: function(response) {
                wordList = JSON.parse(response.responseText);
                console.log('Word list loaded!');
            },
            onerror: function(error) {
                console.error('Error loading word list:', error);
            }
        });
    }

    function findChatTextarea() {
        return document.querySelector('textarea[placeholder="Type here to chat"]');
    }

    function findWordsWithAllSyllables(syllables) {
        const lowercaseSyllables = syllables.map(s => s.toLowerCase());
        return wordList.filter(word => {
            const lowerWord = word.toLowerCase();
            return lowercaseSyllables.every(s => lowerWord.includes(s));
        });
    }

    function checkWordExists(wordToCheck) {
        const lowerWord = wordToCheck.toLowerCase();
        return wordList.some(word => word.toLowerCase() === lowerWord);
    }

    function handleCommand(textarea, event) {
        const value = textarea.value.trim();

        if (/^,[sS]\s/.test(value) && event.key === ' ') {
            const syllables = value.slice(3).trim().split(/\s*,\s*/);
            const matchingWords = findWordsWithAllSyllables(syllables);

            if (matchingWords.length > 0) {
                textarea.value = matchingWords.reduce((shortest, current) =>
                    current.length < shortest.length ? current : shortest
                );
            } else {
                textarea.value = `No word found with syllables: ${syllables.join(', ')}`;
            }
        }
        else if (/^,[cC]\s/.test(value) && event.key === ' ') {
            const syllables = value.slice(3).trim().split(/\s*,\s*/);
            const matchingWords = findWordsWithAllSyllables(syllables);

            if (matchingWords.length > 0) {
                textarea.value = matchingWords[Math.floor(Math.random() * matchingWords.length)];
            } else {
                textarea.value = `No word found with syllables: ${syllables.join(', ')}`;
            }
        }
        else if (/^,[eE]\s/.test(value) && event.key === ' ') {
            const wordToCheck = value.slice(3).trim();
            textarea.value = checkWordExists(wordToCheck) ? 'yes' : 'no';
        }
    }

    function monitorTextarea() {
        const textarea = findChatTextarea();
        if (textarea) {
            textarea.addEventListener('keydown', function(event) {
                handleCommand(textarea, event);
            });
        } else {
            setTimeout(monitorTextarea, 1000);
        }
    }

    loadWordList();
    monitorTextarea();
})();
