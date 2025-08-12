import Chart from 'chart.js/auto';
import Decimal from "decimal.js";

//berechnung für roten Punkt
function redDotCalc() {
  const percentageValue = document.getElementById("percentInput").value;
  const ageValue = document.getElementById("ageInput").value;
  let x = null;
  let y = null;
  if (percentageValue !== "") {
    const percent = new Decimal(percentageValue);
    x = percent.div(100).ln().div(lambda.neg()).toDecimalPlaces(2).toNumber();
    y = percent.toNumber();
  } else {
    const age = new Decimal(ageValue);
    x = age.toNumber();
    const exp = Decimal.exp(lambda.neg().times(age));
    y = new Decimal(100).times(exp).toDecimalPlaces(2).toNumber();
  }
  //Validierung für eingegebene Werte
  if (
    (percentageValue !== "" && Number(percentageValue) < 0.1) ||
    Number(percentageValue) > 100.0
  ) {
    const percentOutPut = document.getElementById("outPutTextPercent");
    percentOutPut.innerText = "*Wert muss zwischen 0.1 und 100 liegen";
    setTimeout(() => {
      document.getElementById("outPutTextPercent").innerHTML = "";
    }, 3000);
    return;
  } else if (
    (ageValue !== "" && Number(ageValue) < 0.1) ||
    Number(ageValue) > 57300.0
  ) {
    const ageOutPut = document.getElementById("outPutTextAge");
    ageOutPut.innerText = "*Wert muss zwischen 0.1 und 57300 liegen";
    setTimeout(() => {
      document.getElementById("outPutTextAge").innerHTML = "";
    }, 3000);
    return;
  }
  window.Chart.data.datasets[1].data = [{ x, y }];
  window.Chart.update();
}

window.redDotCalc = redDotCalc;

//Enter taste für bestätigung
function checkKey(e) {
  if (e.key === "Enter" && e.target.id === "percentInput") {
    redDotCalc();
  } else if (e.key === "Enter" && e.target.id === "ageInput") {
    redDotCalc();
  } else if (e.key === "Enter" && e.target.id === "exerciseAmountInput") {
    generateExercises();
  }
}
window.checkKey = checkKey;

//Zerfallskurve für Diagramm
const data = [];

const halfTime = new Decimal(5730);
const ln2 = new Decimal(2).ln();
const lambda = ln2.div(halfTime);

for (let t = 0; t <= 57300; t += 573) {
  const tDecimal = new Decimal(t);
  const exp = Decimal.exp(lambda.neg().times(tDecimal));
  const q = new Decimal(100).times(exp);
  const rounded = q.toDecimalPlaces(2);
  data.push({ x: t, y: rounded.toNumber() });
}
//Diagramm erstellen
export function drawChart() {
  window.Chart = new Chart(document.getElementById("graph").getContext("2d"), {
    type: "line",
    data: {
      datasets: [
        {
          label: "remaining percent",
          data: data,
          borderColor: "rgba(144, 255, 141, 0.5)",
          pointRadius: 0,
          showLine: true,
          fill: false,
          order: 1,
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHitRadius: 0,
          hoverRadius: 0,
        },
        {
          label: "remaining percent",
          data: [],
          backgroundColor: "red",
          borderColor: "red",
          pointRadius: 5,
          showLine: false,
          order: 0,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: function (context) {
              return null;
            },
            label: function (context) {
              if (context.datasetIndex === 1) {
                const x = context.parsed.x;
                const y = context.parsed.y;
                return `Jahre: ${x} Rest: ${y}%`;
              }
              return null;
            },
          },
        },
      },
      interaction: {
        mode: "nearest",
        intersect: true,
      },
      responsive: false,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: "linear",
          title: {
            display: true,
            text: "Jahre",
          },
          grid: {
            color: "#FFFFFF62",
          },
        },
        y: {
          title: {
            display: true,
            text: "Restmenge [%]",
          },
          grid: {
            color: "#FFFFFF50",
          },
        },
      },
    },
  });
}
window.drawChart = drawChart;
