let qData = [["","","","",""]];
let index = 0;
let state = 2;
let areSheetNamesGot = false;
let isLoading = false;
let isLoaded = false;
let sheetNamesSelect;
let answerList = [""];
let answerNum = 0;

const COLOR_1 = 255;
const COLOR_2 = 200;
const COLOR_3 = 20;
const COLOR_4 = 240;

const SHEET_NAMES_SELECT = [40, 80];
const B_NEXT = [100, 350, 200, 40];
const B_GET_QUESTION = [260, 10, 100, 100];
const B_CHOICES = [
  [40, 260, 140, 40],
  [220, 260, 140, 40],
  [40, 310, 140, 40],
  [220, 310, 140, 40]
];

function preload() {
  getSheetNames();
  getData();
}

function setup() {
  createCanvas(400, 400);
}

function draw() {

  background(COLOR_1);
  stroke(COLOR_3);

  drawTextBox("Sheet Name", 40, 60, 200, 80);
  drawButton(B_GET_QUESTION, "GET QUESTION");

  if (isLoaded) {

    if (state == 2) {
      index = int(random(0, qData.length));
      state = 0;
    }

    ratio = qData[index][0] + "/" + qData[index][1];
    pct = qData[index][0] / qData[index][1];
    drawTextBox("Accuracy: "+nf(pct*100,0,2)+"% ("+ratio+")", 40, 120, 200, 140);
    drawTextBox("Q: "+qData[index][2], 40, 160, 360, 240);
    
    answerList = split(qData[index][3], ';');
    for (let i=0; i<answerList.length; i++) {
      if (state == 0) {
        drawButton(B_CHOICES[i], answerList[i]);
      }
    }

    if (state == 1) {
      let correctNum = qData[index][4];
      drawTextBox("Correct: "+answerList[correctNum], 40, 250, 320, 270);
      drawTextBox("Selected: "+answerList[answerNum], 40, 280, 320, 300);
      drawTextBox(answerNum==correctNum?"Correct":"Failed", width/2-40, 310, width/2+40, 330);
      drawButton(B_NEXT, "NEXT");
    }
  }
  if (isLoading) {
    drawLoadingSign();
  }
}

function mouseClicked() {

  for (let i=0; i<answerList.length; i++) {
    if (state == 0 && isInside(B_CHOICES[i])) {
      answerNum = i;
      qData[index][1] = str(int(qData[index][1]) + 1);
      let correctNum = qData[index][4];
      if (answerNum == correctNum) qData[index][0] = str(int(qData[index][0]) + 1);
      sendResult(index, qData[index][0], qData[index][1]);
      state = (state+1) % 3;
      return;
    }
  }

  if (isInside(B_GET_QUESTION)) {
    getData();
    return;
  }

  if (state == 1 && isInside(B_NEXT)) {
    state = (state+1) % 3;
    return;
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
  //return **DEPLOY_ID_TEST**;
}

function getData() {
  let url = getUrl(getDeployId(), {
    'func': 'getData',
    'sheetName': sheetNamesSelect.value()
  });
  isLoading = true;
  isLoaded = false;
  httpGet(url, function(response) {
    print(response);
    qData = strToArray(response);
    index = 0;
    isLoading = false;
    isLoaded = true;
  });
}

function sendResult(index, correct, total) {
  let url = getUrl(getDeployId(), {
    'func': 'sendResult',
    'sheetName': sheetNamesSelect.value(),
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
  areSheetNamesGot = false;
  httpGet(url, function(response) {
    print(response);
    let sheetNames = split(response, ',');
    sheetNamesSelect = createSelect().position(SHEET_NAMES_SELECT[0], SHEET_NAMES_SELECT[1]);
    for (let i=0; i<sheetNames.length; i++) {
      sheetNamesSelect.option(sheetNames[i]);
    }
    isLoading = false;
    areSheetNamesGot = true;
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

function drawButton(buttonPos, buttonStr="") {
  strokeWeight(0);
  fill(COLOR_2);
  rect(buttonPos[0], buttonPos[1], buttonPos[2], buttonPos[3], 20);
  fill(COLOR_3);
  textAlign(CENTER, CENTER);
  text(buttonStr, buttonPos[0], buttonPos[1], buttonPos[2], buttonPos[3]);
  textAlign(LEFT, TOP);
}

function drawTextBox(tex, x, y, x2, y2) {
  pad = 4;
  corner = 4;
  fill(COLOR_4);
  rect(x, y, x2-x, y2-y, corner);
  fill(COLOR_3);
  text(tex, x+pad, y+pad, x2-pad, y2-pad);
  textAlign(LEFT, TOP);
}

function isInside(buttonPos) {
  return mouseX > buttonPos[0] &&
    mouseX < buttonPos[0] + buttonPos[2] &&
    mouseY > buttonPos[1] &&
    mouseY < buttonPos[1] + buttonPos[3];
}

function drawLoadingSign() {
  for (let i=0; i<8; i++) {
    push();
    fill(COLOR_2);
    translate(cos(frameCount/8+i*PI/4)*30,sin(frameCount/6+i*PI/4)*30);
    circle(width/2, height/2, 10);
    pop();
  }
}
