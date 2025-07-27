let qData = [["","","","",""]];
let sheetNames = [];
let index = 0;
let state = 2;
let isLoading = false;
let answerList = [""];
let answerNum = 0;

const COLOR_1 = '#EEEEEE';
const COLOR_2 = '#CCCCCC';
const BACKGROUND = '#FFFFFF';

const select = document.getElementById('select');
const btn_get_question = document.getElementById('btn_get_question');

const accuracy = document.getElementById('accuracy');
const question = document.getElementById('question');
const correct = document.getElementById('correct');
const selected = document.getElementById('selected');

const answerFrame = document.getElementById('answerFrame');
const nextFrame = document.getElementById('nextFrame');

function preload() {
  getSheetNames();
}


function setup() {
  let canvas = createCanvas(40, 40);
  canvas.parent('canvas');
}

function draw() {
  background(BACKGROUND);
  if (isLoading) {
    drawLoadingSign();
  }
}

function getUrl(deployId, dict=null) {
  let k = Object.keys(dict);
  let v = Object.values(dict);
  let s = "https://script.google.com/macros/s/" + deployId + "/exec";
  if (k != null) s += "?";
  for (let i=0; i<k.length; i++) {
    s += k[i] + "=" + v[i];
    if (i<k.length-1) s += "&";
  }
  return s;
}

function getDeployId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('deployId');
  //return "AKfycbzCbTEjcU4s547Ajm3KS2_wcRFjyxXJ0GAI1TEklebh4pJbEuc-vV14-joD-VfSAHmR";
}

function getData() {
  let url = getUrl(getDeployId(), {
    'func': 'getData',
    'sheetName': select.options[select.selectedIndex].value
  });
  isLoading = true;
  httpGet(url, function(response) {
    isLoading = false;

    print(response);
    qData = strToArray(response);
    index = 0;

    index = randomIndex(qData);
    question.textContent = qData[index][2];
    answerList = split(qData[index][3], ';');

    generateButton(answerList);
  });
}

function sendResult(index, correct, total) {
  let url = getUrl(getDeployId(), {
    'func': 'sendResult',
    'sheetName': select.options[select.selectedIndex].value,
    'index': index,
    'correct': correct,
    'total': total
  });
  httpGet(url, function() {});
}

function getSheetNames() {
  let url = getUrl(getDeployId(), {
    'func': 'getSheetNames'
  });
  isLoading = true;
  httpGet(url, function(response) {
    isLoading = false;

    print(response);
    sheetNames = split(response, ',');

    for (let i=0; i<sheetNames.length; i++) {
      var option = document.createElement("option");
      option.text = sheetNames[i];
      option.value = sheetNames[i];
      select.add(option);
    }
  });
}

function strToArray(s) {
  let array = [];
  let rows = split(s, '\n');
  for (let i=0; i<rows.length; i++) {
    let row = split(rows[i], '\t');
    array.push(row);
  }
  return array;
}

function arrayToStr(a) {
  let s = "";
  for (let i=0; i<a.length; i++) {
    for (let j=0; j<a[i].length; j++) {
      s += a[i][j];
      if (j<a[i].length-1) s += "\t";
    }
    if (i<a.length-1) s += "\n";
  }
  return s;
}

function drawLoadingSign() {
  for (let i=0; i<8; i++) {
    push();
    fill(COLOR_2);
    stroke(COLOR_2);
    translate(cos(frameCount/8+i*PI/4)*15,sin(frameCount/6+i*PI/4)*15);
    circle(width/2, height/2, 6);
    pop();
  }
}

function generateButton(answerList) {

  removeChildren(answerFrame);
  removeChildren(nextFrame);
  correct.textContent = "";
  selected.textContent = "";

  ratio = qData[index][0] + "/" + qData[index][1];
  pct = qData[index][0] / qData[index][1];
  accuracy.textContent = "Accuracy: "+nf(pct*100,0,2)+"% ("+ratio+")";

  for (let i=0; i<answerList.length; i++) {
    const button = document.createElement('button');
    button.id = `btn_${i}`;
    button.textContent = answerList[i];
    button.addEventListener('click', function() {

      removeChildren(answerFrame);

      answerNum = i;
      qData[index][1] = addNumberStr(qData[index][1], 1);
      let correctNum = qData[index][4];
      if (answerNum == correctNum) {
        qData[index][0] = addNumberStr(qData[index][0], 1);
      }
      sendResult(index, qData[index][0], qData[index][1]);
      state = (state+1) % 3;

      ratio = qData[index][0] + "/" + qData[index][1];
      pct = qData[index][0] / qData[index][1];
      accuracy.textContent = "Accuracy: "+nf(pct*100,0,2)+"% ("+ratio+")";

      correct.textContent = "Correct: "+answerList[correctNum];
      selected.textContent = "Selected: "+answerList[answerNum];

      // next button
      removeChildren(nextFrame);

      const bt = document.createElement('button');
      bt.id = 'next';
      bt.textContent = 'NEXT';
      bt.addEventListener('click', function() {

        nextFrame.removeChild(bt);

        index = randomIndex(qData);
        question.textContent = qData[index][2];
        answerList = split(qData[index][3], ';');
        generateButton(answerList);

        correct.textContent = "";
        selected.textContent = "";

      });
      nextFrame.appendChild(bt);
    });
    answerFrame.appendChild(button);
  }
}

function addNumberStr(inputStr, additionalInt) {
  return str(int(inputStr) + additionalInt);
}

function randomIndex(qData) {
  return int(random(0, qData.length));
}

function removeChildren(element) {
  while (element.firstChild) {
    element.firstChild.remove()
  }
}

btn_get_question.addEventListener('click', () => {
  getData();
})