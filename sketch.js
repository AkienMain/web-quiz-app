
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
const COLOR_1 = '#CCCCCC';
/** @type {string} */
const BACKGROUND = '#FFFFFF';

const sheet_name_select = document.getElementById('sheet_name_select');
sheet_name_select.className = 'form-select';

const get_question_button = document.getElementById('get_question_button');
get_question_button.textContent = 'GET QUESTION';
get_question_button.addEventListener('click', () => {
  removeChildren(answer_div);
  removeChildren(next_div);
  accuracy_p.textContent = '';
  question_p.textContent = '';
  correct_p.textContent = '';
  selected_p.textContent = '';
  getQuestionData();
})

const accuracy_p = document.getElementById('accuracy_p');
const question_p = document.getElementById('question_p');
const correct_p = document.getElementById('correct_p');
const selected_p = document.getElementById('selected_p');

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
  return urlParams.get('deployId');

  // Sample deploy id for debug
  // return 'AKfycbzawU6UrMJ09U8XodGZQzRl4j7LWMtMp7qM4N4pAIvdhq9Jp-lG5n4uyPuYnoU4c-oA';
}

/**
 * Get spreadsheet id
 * @returns {string} Deploy id of Apps Script
 */
function getSpreadsheetId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('spreadsheetId');

  // Sample spreadsheet id for debug
  // return '1x6S9YuGaWFpyFIwLl3EXBtH1P32GPfE4T4iKdAVGBTg';
}

/**
 * Get question data
 */
function getQuestionData() {

  let url = getUrl(getDeployId(), {
    'func': 'getData',
    'spreadsheetId': getSpreadsheetId(),
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
    'spreadsheetId': getSpreadsheetId(),
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
    'func': 'getSheetNames',
    'spreadsheetId': getSpreadsheetId()
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
  accuracy_p.textContent = getAccuracyString(index);
  question_p.textContent = qData[index][2];
  correct_p.textContent = '';
  selected_p.textContent = '';

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

  // Get shuffle list
  shuffleList = getShuffleList(answerList.length);

  // Repeat for each answer
  for (let i=0; i<answerList.length; i++) {

    shuffledIndex = shuffleList[i];

    // Create answer button
    const answerButton = document.createElement('button');
    answerButton.textContent = answerList[shuffledIndex];
    answerButton.className = 'btn btn-primary';
    answerButton.addEventListener('click', function() {

      // Remove answer div's children
      removeChildren(answer_div);

      // Update value
      qData[index][1] = addNumberString(qData[index][1], 1);
      let selectedIndex = shuffleList[i];
      let correctIndex = qData[index][4];

      // Answer is correct
      if (selectedIndex == correctIndex) {
        qData[index][0] = addNumberString(qData[index][0], 1);
        selected_p.className = 'alert alert-success';
      } else {
        selected_p.className = 'alert alert-danger';
      }

      // Send result
      sendResult(index, qData[index][0], qData[index][1]);

      // Show string
      accuracy_p.textContent = getAccuracyString(index);
      correct_p.textContent = 'Correct: '+ answerList[correctIndex];
      selected_p.textContent = 'Selected: '+ answerList[selectedIndex];

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
  nextButton.className = 'btn btn-primary';
  nextButton.addEventListener('click', function() {

    // Remove next div's children
    removeChildren(next_div);
    correct_p.textContent = '';
    selected_p.textContent = '';
    selected_p.className = '';

    // Refresh question
    refreshQuestion();

  });

  // Append next button
  next_div.appendChild(nextButton);

}

/**
 * Get shuffle list
 * @param {int} l Length
 * @returns {list<int>} Shuffle list
 */
function getShuffleList(l) {

  // Create ordered list [0, 1, ..., l]
  s = [];
  for (let i=0; i<l; i++) {
    s.push(i)
  }

  // Fisher-Yates shuffle
  for (let i=l; i>0; i--) {
    index = int(random(0, l));
    let tmp = s[index];
    s[index] = s[l-1];
    s[l-1] = tmp;
  }
  return s;
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
    fill(COLOR_1);
    stroke(COLOR_1);
    translate(cos(frameCount/8+i*PI/4)*15,sin(frameCount/6+i*PI/4)*15);
    circle(width/2, height/2, 6);
    pop();
  }
}