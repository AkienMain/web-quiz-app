
const sheet_name_select = document.getElementById('sheet_name_select');
const sheet_name_select_div = document.getElementById('sheet_name_select_div');
const get_questions_button = document.getElementById('get_questions_button');

const accuracy_p = document.getElementById('accuracy_p');
const question_p = document.getElementById('question_p');
const correct_p = document.getElementById('correct_p');
const selected_p = document.getElementById('selected_p');

const answer_div = document.getElementById('answer_div');
const next_div = document.getElementById('next_div');
const question_textarea_div = document.getElementById('question_textarea_div');
const question_textarea = document.getElementById('question_textarea');
const spinner = document.getElementById('spinner');

/**
 * Enum of question source type
 * 0: get question data from server
 * 1: get question data from textarea
 * @type {Object}
 */
const QuestionSourceType = Object.freeze({
  SERVER: 0,
  TEXTAREA: 1,
});

/**
 * Question source type
 * 0: get question data from server
 * 1: get question data from textarea
 * @type {QuestionSourceType}
 */
let questionSourceType = QuestionSourceType.TEXTAREA;

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
 * Answer list
 * @type {list<string>}
 */
let answerList = [''];


// ---------------------------------------------------


/**
 * run once
 */
window.onload = function() {
    let input = localStorage.getItem('question_textarea_input');
  if (input !== null) {
    question_textarea.value = input;
  }
  if (questionSourceType == QuestionSourceType.SERVER) {
    getSheetNames();
  }
  switchVisiblity();
};


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
}

/**
 * Get spreadsheet id
 * @returns {string} Deploy id of Apps Script
 */
function getSpreadsheetId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('spreadsheetId');
}

/**
 * Get question data
 */
function getQuestionData() {

  switch(questionSourceType) {
    case QuestionSourceType.SERVER:

      let url = getUrl(getDeployId(), {
        'func': 'getData',
        'spreadsheetId': getSpreadsheetId(),
        'sheetName': sheet_name_select.options[sheet_name_select.selectedIndex].value
      });

      setElementVisible(spinner, true);
      httpGet(url, function(response) {
        setElementVisible(spinner, false);

        // Set question data
        qData = strToArray(response);
        // Refresh question
        refreshQuestion();
      });
      break;

    case QuestionSourceType.TEXTAREA:
      qData = strToArray(question_textarea.value);
      // Refresh question
      refreshQuestion();
      break;

  }
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

  setElementVisible(spinner, true);
  httpGet(url, function(response) {
    setElementVisible(spinner, false);

    // Set sheet names
    sheetNames = split(response, ',');

    // Set sheet name option
    sheet_name_select.innerHTML = null;
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

      switch(questionSourceType) {
        case QuestionSourceType.SERVER:
          // Send result
          sendResult(index, qData[index][0], qData[index][1]);
          break;
        case QuestionSourceType.TEXTAREA:
          // Set questions data to text area and local strage
          question_textarea.value = arrayToStr(qData);
          localStorage.setItem('question_textarea_input', question_textarea.value);
          break;
      }

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
 * Set element visible or invisible
 * @param {HTMLElement} element element
 * @param {Boolean} isDisplayed true: visible, false: invisible
 */
function setElementVisible(element, isDisplayed) {
  if (isDisplayed) {
    element.classList.add('visible');
    element.classList.remove('not-visible');
  } else {
    element.classList.remove('visible');
    element.classList.add('not-visible');
  }
}

/**
 * Switch element's visibility
 */
function switchVisiblity() {
  switch(questionSourceType) {

    case QuestionSourceType.SERVER:
      setElementVisible(sheet_name_select_div, true);
      setElementVisible(question_textarea_div, false);
      break;

    case QuestionSourceType.TEXTAREA:
      setElementVisible(sheet_name_select_div, false);
      setElementVisible(question_textarea_div, true);
      break;
  }
}

/**
 * Execute this when radio is clicked
 * @param {string} id Id of element
 */
function changedGetQuestionsRadio(id) {
  switch(id) {
    case 'get_questions_from_server':
      questionSourceType = QuestionSourceType.SERVER;
      getSheetNames();
      break;
    case 'get_questions_from_textarea':
      questionSourceType = QuestionSourceType.TEXTAREA;
      break;
  }
  switchVisiblity();
}

/**
 * Execute this when questions button is clicked
 */
function clickedGetQuestionsButton() {
  removeChildren(answer_div);
  removeChildren(next_div);
  accuracy_p.textContent = '';
  question_p.textContent = '';
  correct_p.textContent = '';
  selected_p.textContent = '';
  getQuestionData();
}