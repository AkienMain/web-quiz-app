
/**
 * Question data
 * [[Count of correct answer, Count of total answer, Question, Answer list, Correct answer index]]
 * @type {list<list<string>>}
 */
let qData = [['','','','','']];

/**
 * Sheet names
 * @type {list<string>}
 */
let sheetNames = [''];

/**
 * Whether system is loading
 * @type {boolean}
 */
let isLoading = false;

/**
 * Answer list
 * @type {list<string>}
 */
let answerList = [''];

/** @type {string} */
const COLOR_1 = '#EEEEEE';
/** @type {string} */
const COLOR_2 = '#CCCCCC';
/** @type {string} */
const BACKGROUND = '#FFFFFF';

const sheet_name_select = document.getElementById('sheet_name_select');
const get_question_button = document.getElementById('get_question_button');

get_question_button.textContent = 'GET QUESTION';
get_question_button.addEventListener('click', () => {
  removeChildren(answer_div);
  removeChildren(next_div);
  accuracy_div.textContent = '';
  question_div.textContent = '';
  correct_div.textContent = '';
  selected_div.textContent = '';
  getQuestionData();
})

const accuracy_div = document.getElementById('accuracy_div');
const question_div = document.getElementById('question_div');
const correct_div = document.getElementById('correct_div');
const selected_div = document.getElementById('selected_div');

const answer_div = document.getElementById('answer_div');
const next_div = document.getElementById('next_div');



// ---------------------------------------------------
// p5js Functions

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



// ---------------------------------------------------
// Functions

/**
 * get url
 * @param {string} deployId Deploy id of Apps Script
 * @param {dict} query Query parameters
 * @returns {string} Url string
 */
function getUrl(deployId, query) {
  let k = Object.keys(query);
  let v = Object.values(query);
  let url = 'https://script.google.com/macros/s/' + deployId + '/exec';
  if (k != null) url += '?';
  for (let i=0; i<k.length; i++) {
    url += k[i] + '=' + v[i];
    if (i<k.length-1) url += '&';
  }
  return url;
}

/**
 * Get deploy id
 * @returns {string} Deploy id of Apps Script
 */
function getDeployId() {
  const urlParams = new URLSearchParams(window.location.search);
  // return urlParams.get('deployId');

  // Sample deploy id for debug
  return 'AKfycbzCbTEjcU4s547Ajm3KS2_wcRFjyxXJ0GAI1TEklebh4pJbEuc-vV14-joD-VfSAHmR';
}

/**
 * Get question data
 */
function getQuestionData() {

  let url = getUrl(getDeployId(), {
    'func': 'getData',
    'sheetName': sheet_name_select.options[sheet_name_select.selectedIndex].value
  });

  isLoading = true;
  httpGet(url, function(response) {
    isLoading = false;

    // Set question data
    qData = strToArray(response);

    // Refresh question
    refreshQuestion();
  });
}

/**
 * Send result after answer
 * @param {int} index Index of question
 * @param {string} correct Count of correct answer
 * @param {string} total Count of total answer
 */
function sendResult(index, correct, total) {

  let url = getUrl(getDeployId(), {
    'func': 'sendResult',
    'sheetName': sheet_name_select.options[sheet_name_select.selectedIndex].value,
    'index': index,
    'correct': correct,
    'total': total
  });

  httpGet(url, function() {});
}

/**
 * Get aheet names
 */
function getSheetNames() {

  let url = getUrl(getDeployId(), {
    'func': 'getSheetNames'
  });

  isLoading = true;
  httpGet(url, function(response) {
    isLoading = false;

    // Set sheet names
    sheetNames = split(response, ',');

    // Set sheet name option
    for (let i=0; i<sheetNames.length; i++) {
      var option = document.createElement('option');
      option.text = sheetNames[i];
      option.value = sheetNames[i];
      sheet_name_select.add(option);
    }
  });
}

/**
 * String to array
 * @param {string} s String
 * @returns {list<string>} Array
 */
function strToArray(s) {
  let array = [];
  let rows = split(s, '\n');
  for (let i=0; i<rows.length; i++) {
    let row = split(rows[i], '\t');
    array.push(row);
  }
  return array;
}

/**
 * Array to string
 * @param {list<string>} a Array
 * @returns {string} String
 */
function arrayToStr(a) {
  let s = '';
  for (let i=0; i<a.length; i++) {
    for (let j=0; j<a[i].length; j++) {
      s += a[i][j];
      if (j<a[i].length-1) s += '\t';
    }
    if (i<a.length-1) s += '\n';
  }
  return s;
}

/**
 * Refresh question
 */
function refreshQuestion() {

  // Update question's index
  index = getRandomIndex();

  removeChildren(answer_div);
  removeChildren(next_div);
  accuracy_div.textContent = getAccuracyString(index);
  question_div.textContent = qData[index][2];
  correct_div.textContent = '';
  selected_div.textContent = '';

  // Update answer div
  updateAnswerDiv(index);
}

/**
 * Update answer div
 * @param {int} index Index of question
 */
function updateAnswerDiv(index) {

  // Set answer list
  answerList = split(qData[index][3], ';');

  // Repeat for each answer
  for (let i=0; i<answerList.length; i++) {

    // Create answer button
    const answerButton = document.createElement('button');
    answerButton.textContent = answerList[i];
    answerButton.addEventListener('click', function() {

      // Remove answer div's children
      removeChildren(answer_div);

      // Update value
      qData[index][1] = addNumberString(qData[index][1], 1);
      let answerCount = i;
      let correctCount = qData[index][4];
      if (answerCount == correctCount) {
        qData[index][0] = addNumberString(qData[index][0], 1);
      }

      // Send result
      sendResult(index, qData[index][0], qData[index][1]);

      // Show string
      accuracy_div.textContent = getAccuracyString(index);
      correct_div.textContent = 'Correct: '+answerList[correctCount];
      selected_div.textContent = 'Selected: '+answerList[answerCount];

      // Update next div
      updateNextDiv();
    });

    // Append answer button
    answer_div.appendChild(answerButton);
  }
}

/**
 * Update next div
 */
function updateNextDiv() {

  // Create next button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'NEXT';
  nextButton.addEventListener('click', function() {

    // Remove next div's children
    removeChildren(next_div);
    correct_div.textContent = '';
    selected_div.textContent = '';

    // Refresh question
    refreshQuestion();

  });

  // Append next button
  next_div.appendChild(nextButton);

}

/**
 * Get accuracy string
 * @param {int} index Index of question
 * @returns {string} Accuracy string
 */
function getAccuracyString(index) {
  ratio = qData[index][0] + '/' + qData[index][1];
  pct = qData[index][0] / qData[index][1];
  return 'Accuracy: '+nf(pct*100,0,2)+'% ('+ratio+')';
}

/**
 * Add number string
 * @param {string} inputStr Input number
 * @param {int} additionalInt Additional number
 * @returns {string} Added number
 */
function addNumberString(inputStr, additionalInt) {
  return str(int(inputStr) + additionalInt);
}

/**
 * Get random index
 * @returns {int} Index of question
 */
function getRandomIndex() {
  return int(random(0, qData.length));
}

/**
 * Remove children of element
 * @param {HTMLElement} element Parent element
 */
function removeChildren(element) {
  while (element.firstChild) {
    element.firstChild.remove()
  }
}

/**
 * Draw loading sign
 */
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