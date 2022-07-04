let puzzle = document.querySelector("#table");              // Table of letters     
let answers = document.querySelector("#answers");           // Box for answers
let hkec = document.querySelector("#hkec");                 // Heading 
let htp = document.querySelector("#cw_but");                // How to play button
let hint = document.querySelector("#hint");                 // Hint button
let hintdiv = document.querySelector("#hintdiv");           // Div that displays hints
let sidenav = document.querySelector(".sidenav");           // Side nav table
let solution = document.querySelector("#solution");         // All the words
let bg = document.querySelector("#bg");                     // How to play close button
let video = document.querySelector("#video");               // How to play video
let print = document.querySelector("#hint_printable");      // Show hints on a printable div
let hdva = document.querySelector("#hdva");                 // Show name of the level on a printable div

let point = 0;    
let level = 1;
let timer = 0;
        
let random = [];          // An array of numbers from 0 to 9 in random order
let randomWords = [];     // An array of numbers from 0 to 69 in random order
let randomOrder = [];     // An array built of letters using the order of the previous array

let next = true;          // Prevents bug caused by spamming the next button
let flash = false;        // Flashing button
let watch = false;        // Remembers if you pressed How to play button
let start = false;

var characters = 'abcdeiklmnoprstu';  // Random letters to fill the rest of the table

let index = 0;           // Index used for fetching .JSON arrays
let lettersGuessed = 0;  // Counter for found words
let limit;               // The length of randomOrder array

const width = 560;

// Starts the game
function pressStart(){
  if(!start){
    start = true;
    hkec.style.cursor = "text";

    randomWordsGenerator();
    storageData();
    fetchJson();
    updateSidebar();

    localStorage.setItem("random", random);
  }
}

// Gets storage data
function storageData(){
  if(localStorage.getItem("index"))
    index = Math.floor(localStorage.getItem("index"));
  if(localStorage.getItem("points"))
    point = Math.floor(localStorage.getItem("points"));
  if(localStorage.getItem("level"))
    level = Math.floor(localStorage.getItem("level"));

  if(localStorage.getItem("random"))
    random = localStorage.getItem("random").split(',').map(Number);
  else
    randomGenerator();
}

updateSidebar();

function updateSidebar(){
  document.getElementById("points").innerHTML = "Points: " + point;
  document.getElementById("level").innerHTML = "Level: " + level + "/10";
  document.getElementById("timer").textContent = "Timer: " + timer + " s";
}

// Get storage data


// Starts the timer
var downloadTimer = setInterval(function(){
  if(start)
    timer++;
  document.getElementById("timer").textContent = "Timer: " + timer + " s";
  document.getElementById("timerhint").textContent = "Timer: " + timer + " s";
}, 1000);

if(localStorage.getItem("watch"))
  watch = localStorage.getItem("watch");

// Flashes the button
var flashButton = setInterval(function(){
  if(!watch){
    if(flash){
      document.getElementById("cw_but").style.backgroundColor = "#60371E";
      flash = false;
    }
    else {
      document.getElementById("cw_but").style.backgroundColor = "#D90B1C";
      flash = true;
    }
  }
  else{
    clearInterval(flashButton);
    localStorage.setItem("watch", true);
  }
}, 500);

// How to play button
function htpButton(){

  document.getElementById("cw_but").style.backgroundColor = "#D90B1C";
  clearInterval(flashButton);
  watch = true;

  document.getElementById("above").classList.toggle("active");
  document.getElementById("above").style.display = "block";

  bg.addEventListener("click", function() {
    document.getElementById("above").classList.toggle("active");
    document.getElementById("above").style.display = "none";

    video.pause();
    video.currentTime = 0;
  });

  // Remembers the user already watching the video
  localStorage.setItem("watch", true);
}

// Read .JSON file
function fetchJson(){

  fetch('./crossword.json')
    .then(response => response.json())
    .then(data => {
      word = data;

      // Heading changes based on which theme was selected
      hkec.textContent = word[random[index]].title;
      hdva.textContent = word[random[index]].title;

      // Clears the table
      randomOrder = [];

      // Creates a list from all words you need to find
      for(let i in word[random[index]].words){
        const li = document.createElement("li");
        li.textContent = word[random[index]].words[i];

        solution.appendChild(li);

        // Push all the letters from each word into the array
        for(let j = 0; j < word[random[index]].words[i].length; j++){
          randomOrder.push(word[random[index]].words[i][j]);
        }
      }

      limit = randomOrder.length;

      for(let i = 0; i < 70; i++){
        let dragged = false;  // Singalizes that the div is being dragged
        let onTable = true;   // Singalizes that the div is on the table

        // Create a new div made by a letter
        const div = document.createElement("div");
        div.width = width / 10;
        div.height = width / 10;
        div.style.border = "white 2px solid";
        div.style.paddingTop = "20%";
        div.style.cursor = "move";
        div.setAttribute("draggable", "true");

        // Starts dragging
        div.addEventListener('dragstart', () => {

          // Prevents dragging during the level transition
          if(next == false)
            div.remove();
          else
            dragged = true;
        })

        // Ends dragging
        div.addEventListener('dragend', () => {
          dragged = false;
        })

        // Div dropped in the answer box
        answers.addEventListener('drop', () => {
          if(dragged){
            if(onTable && answers.childElementCount <= 9){
              answers.append(div);
              onTable = false;
            }
            
            // Check if the letters make a correct word
            if(checkAnswer(buildWord(), word))
              correctAnswer();
          }
        });

        // Div returned to the table
        table.addEventListener('drop', () => {
          if(dragged)
            if(!onTable){
              table.append(div);
              onTable = true;

              // Check if the letters make a correct word
              if(checkAnswer(buildWord(), word))
              correctAnswer();
            }
        });

        div.addEventListener('touchmove', () => {
          dragged = true;
        });

        
        div.addEventListener('touchend', () => {
          if(dragged){
            if(onTable && answers.childElementCount <= 9){
              answers.append(div);
              onTable = false;
            }
            
            else if(!onTable){
              table.append(div);
              onTable = true;
            }
            
            // Check if the letters make a correct word
            if(checkAnswer(buildWord(), word))
              correctAnswer();
          }

          dragged = false;
        })
        

        // Puts all the div on the table in random order. 
        // If the current number is higher than our limit, we will generate a random character
        if(randomWords[i] < limit)
          div.textContent = randomOrder[randomWords[i]];
        else
          div.textContent = makeLetters();
        
        puzzle.appendChild(div);
      }

      // Fill the hint div with hints from the .JSON file
      for(let i in word[random[index]].hints){
        const li = document.createElement("li");
        li.textContent = word[random[index]].hints[i];

        hint.appendChild(li);

        const lip = document.createElement("li");
        lip.textContent = word[random[index]].hints[i];

        print.appendChild(lip);
      }
        
    })
}

// Creates random order for our JSON arrays
function randomGenerator(){
  let r;

  for(let i = 0; i < 10; i++){
    r = Math.floor(Math.random() * 10);
    for(let j = 0; j < random.length; j++){
      if(r == random[j]){
        r = Math.floor(Math.random() * 10);
        j = -1;
      }
    }
    random[i] = r;
  }
}

// Creates random order for letters to be placed in the table
function randomWordsGenerator(){
  let r;

  for(let i = 0; i < 70; i++){
    r = Math.floor(Math.random() * 70);
    for(let j = 0; j < randomWords.length; j++){
      if(r == randomWords[j]){
        r = Math.floor(Math.random() * 70);
        j = -1;
      }
    }
    randomWords[i] = r;
  }
}

// Grabs a random letter from our string of characters
function makeLetters() {
  return characters.charAt(Math.floor(Math.random() * characters.length));
}

// Build a word from the letter put in the answer box
function buildWord(){
  let word = "";

  for(let i = 0; i < answers.childElementCount; i++)
    word += answers.children[i].textContent;
  
  return word;
}

// Checks if the answer word matches of the words from the .JSON file
function checkAnswer(newWord, word){
  for(let i in word[random[index]].words)
    if(newWord == word[random[index]].words[i]){
      lettersGuessed++;
      word[random[index]].words[i] = " ";
      return true;
    }

  return false;
}

// Executes if the answer matches a word from the .JSON file
function correctAnswer(){
  point += 100;

  // Clears the answer box
  while(answers.firstChild) 
    answers.removeChild(answers.lastChild);

  updateSidebar();

  // If all 9 letters are found
  if(lettersGuessed == 9){
    point += (timer > 239) ? 1000 : (1000 + 10 * (240 - timer));
    nextLevel();
  }
}

// Going up a level
function nextLevel(){
  
  if(start && next){
    next = false;
    timer = -9;
    hideHints();

    solution.style.display = "block";

    // This executes after 9 seconds (9000 miliseconds)
    setTimeout(() => {
      // If all levels passed
      if(level == 10)
        endGame();

      // Increments up a level
      else{
        next = true;
        lettersGuessed = 0;
        index++;
        level++;

        // Stores all the user progress
        localStorage.setItem("index", index);
        localStorage.setItem("points", point);
        localStorage.setItem("level", level);

        solution.style.display = "none";

        // Removes all divs made from the previous array
        while(solution.firstChild)
          solution.removeChild(solution.lastChild);

        while(table.firstChild)
          table.removeChild(table.lastChild);

        while(hint.firstChild){
          hint.removeChild(hint.lastChild);
          print.removeChild(print.lastChild)
        }

        while(answers.firstChild)
          answers.removeChild(answers.lastChild);

        fetchJson();

        updateSidebar();
      }
    }, 9000)
  }
}

// Ends the game
function endGame(){
  clearInterval(downloadTimer);

  hkec.textContent = "Thank you for playing!";
  hdva.textContent = "Thank you for playing!";

  // Removes all divs
  while(solution.firstChild)
    solution.removeChild(solution.lastChild);

  while(table.firstChild)
    table.removeChild(table.lastChild);

  while(hint.firstChild){
    hint.removeChild(hint.lastChild);
    print.removeChild(print.lastChild);
  }

  answers.remove();

  // Remove data from local storage
  localStorage.removeItem("index");
  localStorage.removeItem("points");
  localStorage.removeItem("level");
  localStorage.removeItem("random");
}

// Shows hints
function showHints(){
  hintdiv.style.display = "block";
  sidenav.style.display = "none";
}

// Hides hints
function hideHints(){
  hintdiv.style.display = "none";
  sidenav.style.display = "block";
}

// Loads service worker for pwa
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("sw.js").then(registration => {
    console.log(registration);
  }).catch(error => {
    console.log("Registration failed");
  })
}


// Makes all the divs on the table draggable and sortable
new Sortable(table, {
  animation: 150,
  ghostClass: 'blue-background-class'
})

// Makes all the divs on the answer box draggable and sortable
new Sortable(answers, {
  animation: 150,
  ghostClass: 'blue-background-class'
});