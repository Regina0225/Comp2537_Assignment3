function setup() {

    let selectedDifficulty = "easy";

    $(".difficulty").on("click", function () {
      selectedDifficulty = $(this).data("diff");

      $(".difficulty").removeClass("selected");
      $(this).addClass("selected");
    });

    $("#start").on("click", function () {
        $("#start").addClass("selected");
        $("#reset").removeClass("selected"); 

        let totalPairs = 3;
        let timeLimit = 100;
        let columns = 3;
        let rows = 2;
      
        if (selectedDifficulty === "medium") {
          totalPairs = 6;
          timeLimit = 200;
          columns = 4;
          rows = 3;
        } else if (selectedDifficulty === "hard") {
          totalPairs = 15;
          timeLimit = 300;
          columns = 6;
          rows = 5;
        }
        startGame(totalPairs, timeLimit, columns, rows);
      });
      
  
    $("#reset").on("click", function () {
        $("#reset").addClass("selected");
        $("#start").removeClass("selected");
      location.reload();
    });
  
    $("#dark").on("click", function () {
      $("#game_grid").addClass("dark-mode");

      $("#dark").removeClass("selected");
      $("#light").removeClass("selected");

      $(this).addClass("selected");
    });
  
    $("#light").on("click", function () {
      $("#game_grid").removeClass("dark-mode");
      
      $("#dark").removeClass("selected");
      $("#light").removeClass("selected");

      $(this).addClass("selected");
    });
  }
  
  function startGame(totalPairs, timeLimit, columns, rows) {
    const cardContainer = $("#game_grid");
    cardContainer.css({
      "display": "grid",
      "grid-template-columns": `repeat(${columns}, 100px)`,
      "grid-template-rows": `repeat(${rows}, 100px)`
    });
  
    const message = $("#message");
    const timeDisplay = $("#time");
    const clickDisplay = $("#clicks");
    const matchedDisplay = $("#matched");
    const remainingDisplay = $("#remaining");
    const totalDisplay = $("#total");
    const timerText = $("#timerText");
  
    let firstCard = null;
    let secondCard = null;
    let lock = false;
    let matchCount = 0;
    let clickCount = 0;
    let wrongMatchCount = 0;
    let powerUsed = false;
    let timer;
  
    message.text("");
  
    $.get("https://pokeapi.co/api/v2/pokemon?limit=1500", function (data) {
      const allPokemon = data.results;
  
      const randomIndexes = [];
      while (randomIndexes.length < totalPairs * 2 && randomIndexes.length < allPokemon.length) {
        const rand = Math.floor(Math.random() * allPokemon.length);
        if (!randomIndexes.includes(rand)) {
          randomIndexes.push(rand);
        }
      }
  
      const promises = randomIndexes.map(index => {
        const url = allPokemon[index].url;
        return $.get(url);
      });
  
      Promise.all(promises).then(responses => {
        const images = [];
  
        responses.slice(0, totalPairs).forEach(poke => {
          const img = poke.sprites.other['official-artwork'].front_default;
          if (img) {
            images.push(img, img);
          }
        });
  
        images.sort(() => Math.random() - 0.5);
        cardContainer.empty();
  
        matchCount = 0;
        clickCount = 0;
        timeDisplay.text(`${timeLimit}`);
        clickDisplay.text(`${clickCount}`);
        matchedDisplay.text(`${matchCount}`);
        remainingDisplay.text(`${totalPairs}`);
        totalDisplay.text(`${totalPairs}`);
        timerText.text(`You got ${timeLimit} seconds. 0 seconds passed!`);
  
        images.forEach((imgSrc, i) => {
          const card = $(`
            <div class="card">
              <img id="img${i}" class="front_face" src="${imgSrc}" alt="">
              <img class="back_face" src="back.webp" alt="">
            </div>
          `);
          cardContainer.append(card);
        });
  
        $(".card").on("click", function () {
          if (lock || $(this).hasClass("flip")) return;
  
          $(this).addClass("flip");
          clickCount++;
          clickDisplay.text(`Clicks: ${clickCount}`);
  
          if (!firstCard) {
            firstCard = $(this);
          } else {
            secondCard = $(this);
            const firstImg = firstCard.find(".front_face")[0].src;
            const secondImg = secondCard.find(".front_face")[0].src;
  
            if (firstImg === secondImg) {
              firstCard.off("click");
              secondCard.off("click");
              firstCard = null;
              secondCard = null;
  
              matchCount++;
              matchedDisplay.text(`Matches: ${matchCount}`);
              remainingDisplay.text(`Remaining: ${totalPairs - matchCount}`);
  
              if (matchCount === totalPairs) {
                clearInterval(timer);
                message.text("Congratulations! You Win!");
              }
            } else {
              wrongMatchCount++;
              if (wrongMatchCount >= 5 && !powerUsed) {
                powerUsed = true;

                if (confirm("You've made 5 mistakes. Would you like to use a Trigger Power-Up?")) {
                    $(".card").addClass("flip");
                    message.text("Power-Up Activated!");
                    firstCard = null;
                    secondCard = null;
                    lock = false;

                    setTimeout(() => {
                        $(".card").removeClass("flip");
                        message.text("");
                    }, 3000);
                    return; 
                  }
              }
              lock = true;
              setTimeout(() => {
                firstCard.removeClass("flip");
                secondCard.removeClass("flip");
                firstCard = null;
                secondCard = null;
                lock = false;
              }, 1000);
            }
          }
        });
  
        let currentTime = timeLimit;
        clearInterval(timer);
        timer = setInterval(() => {
          currentTime--;
          timeDisplay.text(`Time: ${currentTime}`);
          const secondsPassed = timeLimit - currentTime;
          timerText.text(`You got ${timeLimit} seconds. ${secondsPassed} seconds passed`);
          if (currentTime === 0) {
            clearInterval(timer);
            message.text("Game Over");
            $(".card").off("click");
          }
        }, 1000);
      });
    });
  }
  
  $(document).ready(setup);
  