# web-quiz-app

## Open page with sample data

- https://akienmain.github.io/web-quiz-app/?deployId=AKfycbzCbTEjcU4s547Ajm3KS2_wcRFjyxXJ0GAI1TEklebh4pJbEuc-vV14-joD-VfSAHmR

## Repository of sample data

- web-quiz-app-server-gas
  - https://github.com/AkienMain/web-quiz-app-server-gas

## How to set your data

- Create spread sheet and set data
  - ![images/i001.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i001.png?raw=true)
  - columns
    1. Number of correct answers
    2. Number of answers
    3. Question
    4. Choices
    5. Index of correct answers
- Note your spread sheet id
  - ![images/i002.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i002.png?raw=true)
- Open Apps Script from extension
- Copy script from [here](https://github.com/AkienMain/web-quiz-app-server-gas/blob/main/sampleCode.gs)
  - Remember to set your spread sheet id
    ```
    const SPREAD_SHEET_ID = '<<SPREAD SHEET ID>>';
    ```
- Deploy it
- Put url on blowser
  - Contain deploy id in query
    ```
    https://akienmain.github.io/web-quiz-app/?deployId=<<DEPLOY ID>>
    ```