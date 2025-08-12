import { gsap } from "gsap";
import "@fontsource/inter";
import calculatorHtml from "./html/calculator.html?raw";
import homeHtml from "./html/home.html?raw";
import exercisesHtml from "./html/exercises.html?raw";
import informationHtml from "./html/information.html?raw";
import { drawChart } from "./javaScript/charts";
import {
  questionsEasy,
  questionsHard,
  questionsMixed,
  questionsEasySolutions,
  questionsHardSolutions,
  questionsMixedSolutions,
} from "./javaScript/questions";

//beim starten der App animationen mit sidebar und mainFrame
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector("#sideBar");
  const sidebarButton = document.querySelectorAll(".sidebarButton");
  const leafIcon = document.querySelector("#imageFrame");
  const welcomeText = document.querySelector("#textContainer");
  gsap.to(sidebar, {
    x: 128.5,
    duration: 1.75,
  });
  gsap.to(sidebarButton, {
    x: 50,
    duration: 2,
    stagger: 0.2,
  });
  gsap.fromTo(
    leafIcon,
    { opacity: 0, rotate: -10, scale: 0.85 },
    { opacity: 1, rotate: 0, scale: 1, duration: 2, ease: "power1.out" }
  );
  gsap.fromTo(
    welcomeText,
    { opacity: 0, scale: 0.85 },
    { opacity: 1, rotate: 0, scale: 1, duration: 2, ease: "power1.out" }
  );
});
const graphElement = document.getElementById("graphContainer");

//navigierung und Verwaltung der SPA

function handleButtonClick(buttonId) {
  let htmlContent = "";

  document.querySelectorAll(".sidebarButton").forEach((button) => {
    button.classList.remove("clicked");
  });

  const content = document.getElementById("mainFrameContent");

  gsap.to(content, {
    opacity: 0,
    y: 20,
    duration: 0.4,
    ease: "power1.out",
    onComplete: () => {
      let htmlContent = "";
      switch (buttonId) {
        case "calculatorButton":
          htmlContent = calculatorHtml;
          content.innerHTML = htmlContent;
          document.getElementById(buttonId).classList.add("clicked");
          setTimeout(() => {
            drawChart();
          }, 50);
          break;
        case "informationButton":
          htmlContent = informationHtml;
          content.innerHTML = htmlContent;
          document.getElementById(buttonId).classList.add("clicked");
          break;
        case "exerciseButton":
          htmlContent = exercisesHtml;
          content.innerHTML = htmlContent;
          document.getElementById(buttonId).classList.add("clicked");
          requestAnimationFrame(() => {
            const textarea = document.getElementById("generatedText");
            const savedText = localStorage.getItem("savedGeneratedText");
            if (textarea && savedText) {
              textarea.value = savedText;
            }
            const placeholder = document.getElementById("placeholder");
            if (
              placeholder &&
              localStorage.getItem("hidePlaceholder") === "true"
            ) {
              placeholder.remove();
            }
          });
          break;
        case "homeButtonContainer":
          htmlContent = homeHtml;
          content.innerHTML = htmlContent;
          break;
      }

      gsap.set(content, { opacity: 0, y: -20 });
      gsap.to(content, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: "power1.out",
      });
    },
  });
}
window.handleButtonClick = handleButtonClick;

//Ueberwachung vom Input und opacity
document.getElementById("mainFrame").addEventListener("input", (event) => {
  if (event.target.id === "percentInput") {
    const inputValue1 = event.target.value.trim();
    if (inputValue1 !== "") {
      document.getElementById("ageInput").style.opacity = 0.5;
      document.getElementById("ageInput").disabled = true;
    } else {
      console.log("isEmpty");
      document.getElementById("ageInput").style.opacity = 1;
      document.getElementById("ageInput").disabled = false;
    }
  }
  if (event.target.id === "ageInput") {
    const inputValue2 = event.target.value.trim();
    if (inputValue2 !== "") {
      document.getElementById("percentInput").style.opacity = 0.5;
      document.getElementById("percentInput").disabled = true;
    } else {
      document.getElementById("percentInput").style.opacity = 1;
      document.getElementById("percentInput").disabled = false;
    }
  }
});

//Sperrung für Sonderzeichen im Input
document.getElementById("mainFrame").addEventListener("keydown", (event) => {
  if (
    event.key === "-" ||
    event.key === "+" ||
    event.key === "e" ||
    event.key === "ArrowUp" ||
    event.key === "ArrowDown"
  ) {
    event.preventDefault();
  }
});

//auswahlmenu für Schwierigkeit der Aufgaben
let chosenDifficulty = questionsMixed;
let chosenSolutions = questionsMixedSolutions;
document.getElementById("mainFrame").addEventListener("change", function (e) {
  if (e.target && e.target.id === "dropDownSelectDifficulties") {
    switch (e.target.value) {
      case "easy":
        chosenDifficulty = questionsEasy;
        chosenSolutions = questionsEasySolutions;
        break;
      case "medium":
        console.log("medium clicked");
        break;
      case "hard":
        chosenDifficulty = questionsHard;
        chosenSolutions = questionsHardSolutions;
        break;
      case "mixed":
        chosenDifficulty = questionsMixed;
        chosenSolutions = questionsMixedSolutions;
        break;
    }
  }
});

let timeInSeconds = 0;
document.getElementById("mainFrame").addEventListener("change", function (e) {
  if (e.target && e.target.id === "dropDownSelectTimer") {
    switch (e.target.value) {
      case "10min":
        timeInSeconds = 600;
        break;
      case "25min":
        timeInSeconds = 1500;
        break;
      case "45min":
        timeInSeconds = 2700;
        break;
      case "freeLearnMode":
        timeInSeconds = 0;
        break;
    }
  }
});
let timerInterval = null;

function startTimer(seconds) {
  clearInterval(timerInterval);

  const bar = document.getElementById("progressFill");
  let remaining = seconds;
  const total = seconds;

  bar.style.width = "100%";

  timerInterval = setInterval(() => {
    remaining--;

    const percent = (remaining / total) * 100;
    bar.style.width = percent + "%";

    if (remaining <= 0) {
      clearInterval(timerInterval);
      bar.style.width = "0%";
      document.getElementById("solutionButton").style.display = "block";
    }
  }, 1000);
}

//aufgaben generator
function generateExercises() {
  document.getElementById("generatedSolutions").style.display = "none";

  const placeholder = document.getElementById("placeholder");
  const hidePlaceholder = localStorage.getItem("hidePlaceholder");

  if (placeholder && hidePlaceholder !== "true") {
    placeholder.remove();
    localStorage.setItem("hidePlaceholder", "true");
  }

  document.getElementById("progressBar").style.display =
    timeInSeconds > 0 ? "block" : "none";
  if (timeInSeconds > 0) {
    startTimer(timeInSeconds);
  } else if (timeInSeconds === 0) {
    document.getElementById("solutionButton").style.display = "block";
  }

  let count = 0;
  const outPutTextAmount = document.getElementById("outPutTextAmount");
  const generatedTextContainer = document.getElementById("generatedText");
  let questionsToString = "";
  let solutionsToString = "";
  const amount = document.getElementById("exerciseAmountInput").value;

  for (let i = 0; i < amount; i++) {
    const randomIndex = Math.floor(Math.random() * chosenDifficulty.length);
    count++;
    questionsToString +=
      count.toString() + ". " + chosenDifficulty[randomIndex];
    solutionsToString += count.toString() + ". " + chosenSolutions[randomIndex];
  }

  if (amount === "0" || amount === "00" || amount === ".0") {
    generatedTextContainer.value = "";
    outPutTextAmount.innerText = "*Anz. aufgaben nur von 1-99";
    setTimeout(() => {
      outPutTextAmount.innerText = "";
    }, 3000);
    document.getElementById("x-Mark").style.display = "block";
    document.getElementById("check").style.display = "none";
  } else if (amount === "") {
    outPutTextAmount.innerText = "*Feld ist leer";
    setTimeout(() => {
      outPutTextAmount.innerText = "";
    }, 3000);
    document.getElementById("x-Mark").style.display = "block";
    document.getElementById("check").style.display = "none";
  } else {
    generatedTextContainer.value = questionsToString;
    document.getElementById("generatedSolutions").innerText = solutionsToString;
    document.getElementById("x-Mark").style.display = "none";
    document.getElementById("check").style.display = "block";

    localStorage.setItem("savedGeneratedText", questionsToString);
  }
}
window.generateExercises = generateExercises;

function handleCardSelect(cardId) {
  const chevronFrames = [
    document.getElementById("chevronFrame1"),
    document.getElementById("chevronFrame2"),
    document.getElementById("chevronFrame3"),
  ];
  const textOrigin = document.getElementById("textOriginContainer");
  const textUsage = document.getElementById("textUsageContainer");
  const textExplanation = document.getElementById("textC14ExplainedContainer");
  const card = document.getElementById(cardId);

  document.querySelectorAll(".cardStyle").forEach((card) => {
    card.classList.remove("cardStyleClicked");
  });

  card.classList.add("cardStyleClicked");

  chevronFrames.forEach((frame) => {
    frame.style.display = "";
  });

  switch (cardId) {
    case "cardOrigin":
      textExplanation.scrollTop = 0;
      textUsage.scrollTop = 0;
      textOrigin.style.overflowY = "auto";
      chevronFrames[0].style.display = "none";
      textUsage.style.overflowY = "hidden";
      textExplanation.style.overflowY = "hidden";
      break;
    case "cardUsage":
      textOrigin.scrollTop = 0;
      textExplanation.scrollTop = 0;
      textOrigin.style.overflowY = "hidden";
      textUsage.style.overflowY = "auto";
      chevronFrames[1].style.display = "none";
      textExplanation.style.overflowY = "hidden";
      break;
    case "cardExplanation":
      textOrigin.scrollTop = 0;
      textUsage.scrollTop = 0;
      textOrigin.style.overflowY = "hidden";
      chevronFrames[2].style.display = "none";
      textUsage.style.overflowY = "hidden";
      textExplanation.style.overflowY = "auto";
      break;
  }
}
window.handleCardSelect = handleCardSelect;

function handleSolutionButtonClick() {
  document.getElementById("solutionButton").style.display = "none";
  document.getElementById("progressBar").style.display = "none";
  document.getElementById("generatedSolutions").style.display = "block";
}

window.handleSolutionButtonClick = handleSolutionButtonClick;

window.addEventListener('contextmenu', (e) => e.preventDefault());

window.addEventListener('keydown', (e) => {
  if (
    e.key === 'F5' ||
    (e.ctrlKey && e.key.toLowerCase() === 'r') ||
    (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i')
  ) {
    e.preventDefault();
  }
});