# web-quiz-app

![images/i004.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i004.png?raw=true)

## Open page with sample data

- https://akienmain.github.io/web-quiz-app/?deployId=AKfycbzawU6UrMJ09U8XodGZQzRl4j7LWMtMp7qM4N4pAIvdhq9Jp-lG5n4uyPuYnoU4c-oA&spreadsheetId=1x6S9YuGaWFpyFIwLl3EXBtH1P32GPfE4T4iKdAVGBTg

## Repository of sample data

- web-quiz-app-server-gas
  - https://github.com/AkienMain/web-quiz-app-server-gas

## How to set your data

- Create spreadsheet and set data
  - ![images/i001.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i001.png?raw=true)
  - columns
    1. Number of correct answers
    2. Number of answers
    3. Question
    4. Choices
    5. Index of correct answers
- Note your spreadsheet id
  - ![images/i002.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i002.png?raw=true)
- Open Apps Script from extension
- Create script
  - [source](https://github.com/AkienMain/web-quiz-app-server-gas/blob/main/sampleCode.gs)
  - Deploy it
  - Note deploy id
- Put url on blowser
  - Contain deploy id in query
    ```
    https://akienmain.github.io/web-quiz-app/?deployId=<<DEPLOY ID>>&spreadsheetId=<<SPREADSHEETdeployId=<<DEPLOY ID>> ID>>
    ```