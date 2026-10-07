const expressionEl = document.getElementById("expression");
const previewEl = document.getElementById("preview");
const resultEl = document.getElementById("result");
const themeBtn = document.getElementById("themeBtn");

let expression = "";
let justCalculated = false;

const operators = ["+", "-", "×", "÷"];

function formatNumber(value) {
  if (!Number.isFinite(value)) return "Error";
  const rounded = Math.round((value + Number.EPSILON) * 1e10) / 1e10;
  return String(rounded);
}

function isOperator(char) {
  return operators.includes(char);
}

function calculateExpression(text) {
  if (!text) return null;

  // Only calculator characters are accepted.
  if (!/^[0-9+\-×÷.\s]+$/.test(text)) return null;

  // Convert display operators into JavaScript operators.
  const safe = text.replaceAll("×", "*").replaceAll("÷", "/").trim();

  // Prevent an expression ending in an operator.
  if (/[+\-*/.]$/.test(safe)) return null;

  // Prevent consecutive operators.
  if (/[+\-*/]{2,}/.test(safe)) return null;

  try {
    // The input has already been strictly limited to numbers/operators/dots.
    const value = Function(`"use strict"; return (${safe})`)();
    return Number.isFinite(value) ? value : null;
  } catch {
    return null;
  }
}

function updateDisplay() {
  expressionEl.textContent = expression || "0";

  if (!expression) {
    previewEl.textContent = "";
    resultEl.textContent = "0";
    return;
  }

  const value = calculateExpression(expression);
  if (value !== null) {
    previewEl.textContent = "Live result";
    resultEl.textContent = formatNumber(value);
  } else {
    previewEl.textContent = "";
    resultEl.textContent = "0";
  }
}

function appendValue(value) {
  if (justCalculated && !isOperator(value)) {
    expression = "";
  }
  justCalculated = false;

  if (isOperator(value)) {
    if (!expression) {
      if (value === "-") expression = "-";
      updateDisplay();
      return;
    }

    if (isOperator(expression.at(-1))) {
      expression = expression.slice(0, -1) + value;
    } else {
      expression += value;
    }
  } else if (value === ".") {
    const currentNumber = expression.split(/[+\-×÷]/).at(-1);

    if (currentNumber.includes(".")) return;

    if (!currentNumber || currentNumber === "-") {
      expression += "0.";
    } else {
      expression += ".";
    }
  } else {
    expression += value;
  }

  updateDisplay();
}

function clearCalculator() {
  expression = "";
  justCalculated = false;
  updateDisplay();
}

function deleteLast() {
  expression = expression.slice(0, -1);
  justCalculated = false;
  updateDisplay();
}

function calculate() {
  const value = calculateExpression(expression);

  if (value === null) {
    resultEl.textContent = "Error";
    previewEl.textContent = "";
    return;
  }

  expression = formatNumber(value);
  justCalculated = true;
  expressionEl.textContent = expression;
  previewEl.textContent = "Result";
  resultEl.textContent = expression;
}

document.querySelector(".keys").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value !== undefined) appendValue(value);
  if (action === "clear") clearCalculator();
  if (action === "delete") deleteLast();
  if (action === "equals") calculate();
});

document.addEventListener("keydown", (event) => {
  const keyMap = {
    "*": "×",
    "/": "÷",
  };

  if (/^[0-9.]$/.test(event.key)) {
    appendValue(event.key);
  } else if (["+", "-"].includes(event.key)) {
    appendValue(event.key);
  } else if (["*", "/"].includes(event.key)) {
    appendValue(keyMap[event.key]);
  } else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculate();
  } else if (event.key === "Escape") {
    clearCalculator();
  } else if (event.key === "Backspace") {
    deleteLast();
  }
});

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  themeBtn.textContent = document.body.classList.contains("light") ? "☾" : "☀";
});

updateDisplay();
