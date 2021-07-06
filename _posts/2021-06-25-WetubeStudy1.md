---
title: "유튜브 클론코딩 1.INTRODUCTION TO EXPRESS [노마드코더스]"
layout: single
categories: CloneCoding
toc: true
toc_label: "Study Note"
toc_icon: "pen-nib"
toc_sticky: true
---

## INTRODUCTION TO EXPRESS

### 3.0 Your First Server

```jsx
// "express" 라는 패키지를 express 라는 이름으로 import 해온 것.
// node_modules 폴더에서 express를 찾은 후 js파일을 가져옴.
import express from "express";

const PORT = 4000;
// express() : express application을 생성해줌.
const app = express();
const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);

//port : 컴퓨터의 문과 창문 같은 것 callback : 서버가 시작될때 실행되는 함수
app.listen(PORT, handleListening);
```

1. Server
   - 항상 켜져있는 컴퓨터와 같은 것.
   - request를 기다리고 있음.
     - ex) 구글에 검색, 버튼을 클릭 등등
2. 접속방법
   - [localhost:4000](http://localhost:4000) 입력시 접속 가능

### 3.1 GET Requests

![png](/assets/images/wetube/20210625_01.png)

- 서버가 request에 respond하는 법을 배워볼 것.
  1. /
     - root, page
     - ex) [google.com](http://google.com) === google.com/
  2. GET
     - HTTP method
       - HTTP : 우리가 서버와 소통하는 방법 혹은 서버가 서로 소통하는 방법.
       - 가장 오래되고 안정적인 방법.
       - http request : 웹사이트에 접속하고 정보를 보내는 방법.
  3. Cannot GET
     - 웹사이트를 가져올수 없다는 의미
  4. localhost에 접속할때 생기는 일
     - 브라우저에게 웹사이트를 가져와달라고 요청함.
     - 내가 직접 가져오는게 아니라, 브라우저가 대신해서 웹사이트에 request함.

### 3.2 GET Requests part Two

```jsx
import express from "express";

const PORT = 4000;
const app = express();

const handleHome = () => console.log("somebody is trying to go home.");

// 누군가 rootpage로 get Request를 보낸다면, 함수를 실행한다.
// 반드시 꼭 함수로 보내야함. 그냥 console.log하면 동작 안함
app.get("/", handleHome);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);
app.listen(PORT, handleListening);
```

1. 챕터목표
   - 서버에게 get request에 어떻게 응답해야하는지 알려줄 것.
2. request
   - 유저가 뭔가를 요청하거나, 보내거나, 행동을 한다
3. 위의 결과로 더 이상 'cannot GET /' 가 나타나지 않고 무한 로딩이 나옴.
   - handlehome function에 console.log만 있을뿐, 아무런 response를 해주지 않았기 때문에 그럼.

### 3.3 Responses

```jsx
// object 형식으로 받음 (request, response)
// express가 받아서 넣어 줌
const handleHome = (req, res) => {
  return res.send("I still love you.");
};
```

- response를 return함으로써, 브라우저의 request를 끝낼 수 있게 됨.

### 3.4 Recap

- request를 받고 respond 한다.
  - status code, html, 텍스트 아니면 end()등으로 respond

### 3.5 Middlewares part One

```jsx
// middleware
const gossipMiddleware = (req, res, next) => {
  console.log(`Someone is goint to: ${req.url}`);
  next();
};
// finalware
const handleHome = (req, res) => {
  return res.send("I love middlewares");
};

app.get("/", gossipMiddleware, handleHome);
```

1. middleware
   - 중간에 있는 소프트웨어 (middle software)
   - request와 response 사이에 존재
   - 모든 middleware는 handler (controller)임.
     - argument는 3개 : req, res, next
     - next는 다음 함수를 호출해줌.
2. Error : console.log가 안됨
   - 새로고침 할때마다 출력
   - zsh를 기본 터미널로 지정하니 해결.

### 3.6 Middlewares part Two

```jsx
const logger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
};

const privateMiddleWare = (req, res, next) => {
  const url = req.url;
  if (url === "/protected") {
    return res.send("<h1>Not Allowed</h1>");
  }
  console.log("Allowed, you may continue.");
  next();
};

const handleHome = (req, res) => {
  return res.send("I love middlewares");
};

const handleProtected = (req, res) => {
  return res.send("Welcome to the private lounge.");
};

app.use(logger);
app.use(privateMiddleWare);
app.get("/", handleHome);
app.get("/protected", handleProtected);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);

app.listen(PORT, handleListening);

// 위결과로, handleprotected는 실행되지 않고, privateMiddleWare에서 끝나게 됨.
```

1. app.use()
   - global middleware를 만들게 해줌.
   - 어느 URL에도 작동하는 middleware.
2. app.use()의 next함수는 뭘까?
   - top to bottom으로 훑으면서 조건이 맞는대로 차례대로 실행?
   - Nico에게 질문 넣은 상태

### 3.7 Setup Recap

- Package.json 생성
  1. 정보를 담는 text
  2. 몇몇 항목은 작성하면, npm을 통해 이용할 수 있는게 있다.
     - script
       - 작성하면, npm run xxx의 형식으로 실행가능.
     - dependencies
       - 프로젝트를 실행하는데 필요한 packages.
       - npm i를 입력하면, dependencies와 Devdependencies를 보고 필요한 것들을 자동으로 node_moudels에 저장해준다.
     - devDependencies
       - 개발자가 개발하는데 필요한 packages
  3. babel
     - sexy한 ES6로 코드를 작성하고 싶지만, 최신 NodeJS도 인식하지 못할때가 있다.
     - 그래서 babel로 평범한 node로 변환해서 돌린다.
     - 사용하기 위해서는 bebel.config.json 파일을 만들어야 한다.

### 3.8 Servers Recap

- Server
  - 서버는 항상 켜져 있고, 인터넷에 연결 되 있으면서 request를 listening하고 있는 컴퓨터.
    1. request
       - 댓글을 쓰거나, 주소로 들어가거나 할때 브라우저가 request를 보내는 거임.
       - 브라우저를 통한 모든 상호작용.
    2. port
       - 컴퓨터와 소통하기 위한 창문같은 것.
       - 백엔드의 경우 4000을 쓰는게 일반적으로 통용됨.

### 3.9 Controllers Recap

- request를 받았으면, response (end(),send())를 함으로써 응답을 해야한다.
- 아무 response가 없다면 브라우저는 무한로딩하며 우리의 대답을 기다릴 것.

### 3.10 Middleware Recap

- 누군가가 response하기전에는 request에 관련된 모든 controller들은 전부 middleware다.
  - 대부분 마지막 controller가 대답해줄 거다.

```jsx
app.use(methodLogger, routerLogger);
app.get("/", home);
app.get("/login", login);
// 페이지 전체 공통된 경우에는 app.use()를 사용하면됨.
// 위에서 부터 아래로 적용되므로, 순서에 유의할 것.
```

### 3.11 External Middlewares

- Morgan
  - HTTP request logger middleware for node.js

```jsx
import express from "express";
// 설치후 import 해줌
import morgan from "morgan";

const PORT = 4000;

const app = express();
//dev, short, tiny, combined, common중에 출력유형을 선택.
//직접 작성하지 않는 것 외에 middleware로써 사용법은 동일함.
const logger = morgan("dev");

const home = (req, res) => {
  console.log("I will respond.");
  return res.send("I love middlewares");
};

const login = (req, res) => {
  return res.send("login");
};

app.use(logger);
app.get("/", home);
app.get("/login", login);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);

app.listen(PORT, handleListening);
```

---

_해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 정리한 내용입니다.
개인적으로 오래 기억하고 돌아보기 위해 작성했으며, 혹여 문제가 될 부분이 있다면 수정하거나 삭제하겠습니다._
