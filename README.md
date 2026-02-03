# web-quiz-app

![images/i007.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i007.png?raw=true)

[Open on browser](https://akienmain.github.io/web-quiz-app/)

# How to use it

- Set questions on **text area** or **server (googleDrive)**

## 1. Set data on text area

- Set questions on text area satisfied with tsv style (tab is used to separate columns).
  - Columns:
    - 1 Number of correct answers
    - 2 Number of answers
    - 3 Question
    - 4 Choices (separated by ;)
    - 5 Index of correct answers
  - Example:
    ```
    1	1	1+1=	1;2;3;4	1
    0	1	3*3=	3;9;27	1
    0	0	2^2=	2;4;8	1
    ```

## 2. Set data on server (googleDrive)

- Put url on blowser
  - Contain deploy id and spreadsheet id in query
    ```
    https://akienmain.github.io/web-quiz-app/?deployId=<<DEPLOY ID>>&spreadsheetId=<<SPREADSHEET>>
    ```

### 2-1. How to set your data

- Create spreadsheet and script on your googleDrive

![images/i006.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i006.png?raw=true)

### 2-2. Spreadsheet

- ![images/i001.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i001.png?raw=true)

- Columns
  - 1 Number of correct answers
  - 2 Number of answers
  - 3 Question
  - 4 Choices (separated by ;)
  - 5 Index of correct answers

- Note spreadsheet id
  - ![images/i002.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i002.png?raw=true)

### 2-3. Script

- ![images/i005.png](https://github.com/AkienMain/web-quiz-app/blob/main/images/i005.png?raw=true)

- [source](https://github.com/AkienMain/web-quiz-app-server-gas/blob/main/Code.gs)
- Deploy it
- Note deploy id

### 2-4. Repository of sample data

- web-quiz-app-server-gas
  - https://github.com/AkienMain/web-quiz-app-server-gas

## 3. Set data on server (API by Cloudflare Worker + D1 Database)

https://github.com/AkienMain/web-quiz-app-server-cloudflare-public