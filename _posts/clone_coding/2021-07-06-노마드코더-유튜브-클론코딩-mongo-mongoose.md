---
title: "유튜브 클론코딩 : MongoDB and Mongoose"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: 'MongoDB를 연결하고, CRUD 기능을 연습합니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

# 6. MONGODB AND MONGOOSE

## 6.0 Array Database part One

- Data를 어떻게 Back end에 post하는가?

### video ID에 따라 URL 부여하기.

```jsx
//video.pug
mixin video(video)
    div
        h4
            a(href="/videos/" + video.id)=video.title
        ul
            li #{video.rating}/5.
            li #{video.comments} comments.
            li Posted #{video.createdAt}.
            li #{video.views} views.
```

```jsx
//id의 경우에는 #{}가 안됨. 백틱이용
mixin video(video)
    div
        h4
            a(href=`/videos/${video.id}`)=video.title
        ul
            li #{video.rating}/5.
            li #{video.comments} comments.
            li Posted #{video.createdAt}.
            li #{video.views} views.
```

### /videos/:id URL접속시 watch.pug 렌더링

```jsx
//videoController.js
let videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const see = (req, res) => {
  //const id = req.params.id;
  const { id } = req.params;
  // array에서 0부터 세무로, 얻은 id에서 1을 빼준다.
  const video = videos[id - 1];
  return res.render("watch", { pageTitle: `Watching ${video.title}` });
};

export const edit = (req, res) => res.render("edit");
export const search = (req, res) => res.send("Search");
export const upload = (req, res) => res.send("Upload");
export const deleteVideo = (req, res) => res.send("Delete Video");
```

## 6.1 Array Database part Two

### 목표 (watch.pug)

1. view 숫자 표시
2. edit URL로 가는 href 생성

### Ternary Operator

```jsx
//watch.pug
extends base.pug

block content
    h3 #{video.views} #{video.views === 1 ? "view" : "views"}
// view가 1이면 "view" 출력
// 그렇지 않다면 "views" 출력
```

### Absolute URL 과 Relative URL

```jsx
//watch.pug
//Absolute URL
extends base.pug

block content
    h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    a(href="/edit") Edit Video &rarr;
// - href 앞머리 부분에  '/' 를 붙이면, root 경로 + '/edit' 로 감
// 즉 localhost:4000/edit
```

```jsx
//watch.pug
//Relative URL
extends base.pug

block content
    h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    a(href="edit") Edit Video &rarr;
// 브라우저가 끝부분만 edit으로 바꾸어줄거임.
// 즉 localhost:4000/videos/3 ->
//    localhost:4000/videos/edit
```

### 결과

```jsx
//watch.pug
extends base.pug

block content
    h3 #{video.views} #{video.views === 1 ? "view" : "views"}
    a(href=`${video.id}/edit`) Edit Video &rarr;
// Relative URL을 이용해서 해결.
```

![1](/assets/images/wetube/20210706-00001.png)

![2](/assets/images/wetube/20210706-00002.png)


## 6.2 Edit Video part One

### Edit Video (Submit 버튼을 클릭할때, form의 행동)

1. videoController.js에서 edit 편집
2. GET Request and POST Request의 차이
3. videoController, videoRouter.js에서 "getEdit", "postEdit" 생성

> 비디오 정보를 받아 렌더링 할 수 있도록, edit 편집.

```jsx
// videoController.js
let videos = [
    {
        title: "First Video",
        rating: 5,
        comments: 2,
        createdAt: "2 minutes ago",
        views: 1,
        id: 1,
    },
    {
        title: "Second Video",
        rating: 5,
        comments: 2,
        createdAt: "2 minutes ago",
        views: 59,
        id: 2,
    },
export const edit = (req, res) => {
    const { id } = req.params;
    const video = videos[id - 1];
    return res.render("edit", { pageTitle : `Editing: ${video.title}`, video:video });
};
```

### GET 과 POST의 차이

1. GET
   - 기본 method(form과 back end 사이의 정보 전송에 관한 방식)는 GET이다.
   - 비디오를 검색하거나 할때 사용할 것.
2. POST

   - post 방식은 파일을 보내거나, database에 있는 값을 바꾸는 뭔가를 보낼 때 사용함.
   - 웹사이트에 로그인 할때도 사용

   > GET

   ```jsx
   //edit.pug
   extends base.pug

   block  content
       h4 Change Title of Video
   // action : 이 데이터들이 어디로 갈 것인가? URL
   // 해당방식으로 들어가면, URL안에 title 내용이 들어감.
       form(action="/save-changes", method="GET")
           input(name="title", placeholder="Video Title" required)
           input(value="Save", type="submit")
   ```

   ![3](/assets/images/wetube/20210706-00003.png)

   > POST

   ```jsx
   //edit.pug
   extends base.pug

   block  content
       h4 Change Title of Video
   // action : 이 데이터들이 어디로 갈 것인가? URL
   // 이방식으로 들어가면, URL안에 title이 안들어감.
       form(action="/save-changes", method="POST")
           input(name="title", placeholder="Video Title" required)
           input(value="Save", type="submit")
   ```

> videoController, videoRouter.js에서 "getEdit", "postEdit" 생성

- 기존에는 edit하나였으나, GET과 POST역할이 따로 생기면서 두개로 나누어줌.

```jsx
//videoController.js
let videos = [
  {
    title: "First Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 1,
    id: 1,
  },
  {
    title: "Second Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 2,
  },
  {
    title: "Third Video",
    rating: 5,
    comments: 2,
    createdAt: "2 minutes ago",
    views: 59,
    id: 3,
  },
];

export const trending = (req, res) => {
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  //const id = req.params.id;
  return res.render("watch", {
    pageTitle: `Watching ${video.title}`,
    video: video,
  });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  const video = videos[id - 1];
  return res.render("edit", {
    pageTitle: `Editing: ${video.title}`,
    video: video,
  });
};
export const postEdit = (req, res) => {};
```

```jsx
//videoRouter.js
import express from "express";
import { getEdit, postEdit, watch } from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id(\\d+)", watch);
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit);

export default videoRouter;
```

### 결과화면

- Save클릭시, 같은 URL로 POST하게 된다.
- 아직 postEdit의 return을 구현하지 않았으므로 무한로딩이뜸.

![4](/assets/images/wetube/20210706-00004.png)

## 6.3 Edit Video part Two

### Recap

- Submit 버튼을 클릭할때, form의 행동을 다뤘었음.
- Method
  - form과 back end 사이의 정보 전송에 관한 방식
  - 이 데이터는 backend로 가서 무엇을 할까?
    - 이 데이터가 나의 database 상태를 수정할 건가?
    - 뭔가를 수정하거나 추가하거나 삭제하고 싶나? → POST
    - 데이타를 받는게 목적 → GET

### `route()`를 이용한 shortcut

- 하나의 URL에 get,post 방식을 쓰도록 할때 유용함.

```jsx
//videoRouter.js
import express from "express";
import { getEdit, postEdit, watch } from "../controllers/videoController";

const videoRouter = express.Router();

videoRouter.get("/:id(\\d+)", watch);

videoRouter.route("/:id(\\d+)/edit").get(getEdit).post(postEdit);
/*
videoRouter.get("/:id(\\d+)/edit", getEdit);
videoRouter.post("/:id(\\d+)/edit", postEdit); 와 같음
*/
export default videoRouter;
```

### `res.redirect()`

- 브라우저가 해당 URL redirect (자동으로 이동)하도록 하는 것.

```jsx
//videoController.js
export const postEdit = (req, res) => {
  const { id } = req.params;
  //{} 사용시 우측 .title생략가능
  const { title } = req.body;
  videos[id - 1].title = title;
  return res.redirect(`/videos/${id}`);
};
```

### `express.urlencoded()`

- express application이 form의 value들을 이해할 수 있도록 하고, 우리가 쓸 수 있는 자바스크립트 형식으로 바꾸어 줄 것 이다.

```jsx
//server.js
app.use(express.urlencoded({ extended: true }));
```

### 결과

- input 내용에 따라 video title 변경

  - input입력 내용 즉, req.body.title 값.
  - 여기서 title은, input의 name으로 다른 값으로 변경 할 수 있다.

  ```jsx
  //edit.
  extends base.pug

  block  content
      h4 Change Title of Video
      form(method="POST")
          input(name="title", placeholder="Video Title", value=video.title, required)
          input(value="Save", type="submit")
  ```

> Save 누르기 전의 제목

![5](/assets/images/wetube/20210706-00005.png)

> Save 누른 후 변경된 제목

![6](/assets/images/wetube/20210706-00006.png)

## 6.4 Recap

### req.body

1. form 안에 있는 value의 javascript representation
2. app.use(express.urlencoded)를 이용해야만 사용가능.
   - 해당 middleware의 순서도 중요! videoRouter보다 먼저 앞에 와야만 req.body가 준비되있음.
3. input에 name을 설정해주지 않으면, req.body는 비어있음.

### mongodb and mongoose

1. mongodb
   - 초급자,상급자 모두 다루기 좋은 database.
2. mongoose
   - 이를 통해 자바스크립트에서 mongodb와 상호작용 할 것. /blue

## 6.5 More Practice part One

### 연습 (GET Request 와 POST Request)

> controller를 만든다.

```jsx
//videoController.js
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  // here we will add a video to the videos array.
  return res.redirect("/");
};
```

> router를 만든다.

```jsx
//videoRouter.js
videoRouter.route("/upload").get(getUpload).post(postUpload);
```

> /upload로 가는 링크를 만든다.

```jsx
//base.pug
doctype html
html(lang="ko")
    head
        title #{pageTitle} | Wetube
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body
        header
            h1=pageTitle
            nav
                ul
                    li
                        a(href="/videos/upload") Upload Video
        main
            block content
    include partials/footer
```

```jsx
//upload.pug
extends base.pug

block content
//현재주소인 action="/videos/upload"가 default로 들어있음.
    form(method="POST")
        input(placeholder="Title", required, type="text")
        input(type="submit", value="Upload Video")
```

### 6.6 More Practice part Two

> 버튼을 누르는 순간 현재 URL로 POST Request를 보냄.

- 모든 input에는 name이 필요함.
  - 없으면 req.body했을때 값이 비어있음.

```jsx
//upload.pug
extends base.pug

block content
    form(method="POST", action="/videos/upload")
        input(name="title", placeholder="Title", required, type="text")
        input(type="submit", value="Upload Video")
```

> POST시 새로운 비디오 업로드

```jsx
//videoController.js
export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  const newVideo = {
    title,
    rating: 0,
    comments: 0,
    createdAt: "just now",
    views: 0,
    id: videos.length + 1,
  };
  // 기존 array에 집어넣게됨
  videos.push(newVideo);
  // 홈페이지인 localhost:4000으로 돌아감.
  return res.redirect("/");
};
```

### 결과화면

![7](/assets/images/wetube/20210706-00007.png)

![8](/assets/images/wetube/20210706-00008.png)

## 6.7 Introduction to MongoDB

### MongoDB

1. general purpose
2. document-based
   - 큰 장점.
   - 보통은 sql-based (액셀처럼 행과열이있는 것)임.
3. as a programmer, you think in objects. Your database does too.
   - JSON-like documents.
   - document를 검색하고 만들거나 삭제할 기회를 줌.

### 설치

- [Install MongoDB Community Edition on macOS](https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/)

## 6.8 Connecting to Mongo

### mongoose

1. node.js와 mongoDB를 이어주는 다리
2. validation, query building, hook 등 많은 게 존재하고 대단한 친구임.

### 터미널로 mongoDB 확인

1. mongod 입력으로 설치 확인
2. mongo 입력으로 mongodb실행
   - help
     - 사용가능한 명령어 볼 수 있음
   - show dbs
     - 가지고 있는 데이타베이스를 보여줌.

### 터미널로 mongoose 설치

- npm i mongoose

### db.js 생성

![9](/assets/images/wetube/20210706-00009.png)

### mongoose 연결

```jsx
//db.js
import mongoose from "mongoose";
//terminal에서 mongo 실행뒤, 나오는 URL복사.
// 뒤에는 꼭 이름(wetube)을 추가해줘야함.
mongoose.connect("mongodb://127.0.0.1:27017/wetube");
```

```jsx
//server.js
import "./db";
// 파일 그 자체를 import함. 이 파일을 import 해줌으로써, 서버가 mongo에 연결됨.
```

### db.js 설정

```jsx
//db.js
import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("Connected to DB ✓");
const handleError = (error) => console.log("DB Error", error);
//on은 여러번 발생 시킬 수 있음 like 클릭이벤트
db.on("error", handleError);
//once는 한번만 발생
db.once("open", handleOpen);
```

## 6.9 CRUD Introduction

### 계획

- 진짜 Database를 이용해서 CRUD를 만들 것.

### video.js 생성

- mongoose에게 우리의 애플리케이션의 data가 어떻게 생겼는지 알려줘야함.

  - 비디오에 제목, 세부설명 등등 어떻게 생겼는지

    ![10](/assets/images/wetube/20210706-00010.png)

## 6.10 Video Model

### 데이터의 형식 정해주기

- 어떤 유형의 Data를 받는지 정해주기.
- 실제적인 내용을 넣는건 user의 몫

```jsx
//Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: Date,
  hashtags: [{ type: String }],
  // meta는 user가 입력할 필요없음.
  meta: {
    views: Number,
    rating: Number,
  },
});
```

### Video model 만들기

```jsx
//Video.js
// model(model의이름, Schema)
// 사용할수 있도록 export
const Video = mongoose.model("Video", videoSchema);
export default Video;
```

### Video model import

```jsx
//server.js
//server.js에 database를 import해서 연결 시킨후,
//해당 연결이 성공적일 때, video를 import해줌.
//db를 mongoose와 연결시켜서 video model을 인식시킴.
import "./db";
import "./models/Video";
```

## 6.11 Our First Query

### Server.js와 init.js

- 관련된 것들끼리 역할을 분리시켜줌.
  - sever
    - server 관련된 것들
  - init
    - 필요한 모든 것들을 import 시키는 역할
    - import에 문제가 없다면 app을 실행
- package.json에서 시작 파일을 init.js로 지정.

```jsx
//server.js
import express from "express";
import morgan from "morgan";
import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

console.log(process.cwd());

const app = express();
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use(logger);
app.use(express.urlencoded({ extended: true }));
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;
```

```jsx
//init.js
import "./db";
import "./models/Video";
import app from "./server";

const PORT = 4000;

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT} ✓`);

app.listen(PORT, handleListening);
```

### 가짜 Database 삭제

```jsx
//videoController.js
export const home = (req, res) => {
  return res.render("home", { pageTitle: "Home" });
};

export const watch = (req, res) => {
  const { id } = req.params;
  return res.render("watch", { pageTitle: `Watching` });
};

export const getEdit = (req, res) => {
  const { id } = req.params;
  return res.render("edit", { pageTitle: `Editing` });
};
export const postEdit = (req, res) => {
  const { id } = req.params;
  const { title } = req.body;
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = (req, res) => {
  const { title } = req.body;
  return res.redirect("/");
};
```

### Videomoel 사용

- callback
  - 무언가가 발생하고 난 다음 호출되는 function
  - database는 자바스크립트의 밖에 존재하기 때문에, 약간의 기다림이 필요하다.
  - 기다림을 표현하는 방식
    - app.listen(PORT, handleListening)
      - 연결이 확인되면, handleListening 발동

```jsx
//videoController.js
import Video from "../models/Video";

export const home = (req, res) => {
  // find (serch terms, callback(err, documents))
  // {} : search terms가 비어있으면 모든형식을 찾는다는 의미
  Video.find({}, (error, videos) => {});
  return res.render("home", { pageTitle: "Home" });
};
```

## 6.12 Our First Query part Two

### callback

```jsx
Video.find({}, (error, videos) => {});
```

1. mongoose는 {}부분을 database에서 불러온다.
2. database가 반응하면 mongoose는 (error, videos) function을 실행시킨다.

### 출력순서

- 코드에 따라 실행되는 시간이 다를 수 있다.
- 바깥 console.log과 GET request가 끝난 후, video 내부 console.log가 실행되는 모습.

```jsx
export const home = (req, res) => {
  Video.find({}, (error, videos) => {
    console.log("errors", error);
    console.log("videos", videos);
  });
  console.log("hello");
  return res.render("home", { pageTitle: "Home", videos: [] });
};
```

![11](/assets/images/wetube/20210706-00011.png)

## 6.13 Async Await

### callback

- 장점
  - 에러들을 여기에서 바로 볼 수 있음.

```jsx
//videoController.js

// callback 방식
Video.find({}, (error, videos) => {
  if (error) {
    return res.render("server-error");
  }
  return res.render("home", { pageTitle: "Home", videos });
});
```

### promise

- callback의 최신 버전
- async안의 function일때만, await 사용가능

```jsx
//videoController.js

export const home = async (req, res) => {
  /* await가 있으면, find는 callback을 필요로 하지 않는다는 것을 알게됨.
 찾아낸 Video를 바로 출력해줌. 
await는 database를 기다려줌.즉 위의 예시처럼 뒤죽박죽 콘솔로그 되지 않고, 
직관적으로 top to bottom으로 실행됨*/
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};
```

## 6.14 Returns and Renders

- return을 사용하면 function이 종료된다.
  - 무언가 값을 반환 하지 않더라도, function을 종료하는 역할로도 쓰임.
- render는 여러 번 사용 불가능.
  - redirect, sendStatus, end 등 포함

## 6.15 Creating a Video part One

### Video 생성

> 정보를 받을 input 생성

```jsx
// upload.pug
extends base.pug

block content
    form(method="POST")
// name이 있어야만, req.body 정보를 받아올 수 있음.
        input(name="title", placeholder="Title", required, type="text")
        input(name="description", placeholder="Description", required, type="text")
        input(name="hashtags", placeholder="Hashtags, separated by comma.", required, type="text")
        input(type="submit", value="Upload Video")
```

> Schema 형태 정해주기

```jsx
//Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  createdAt: Date,
  hashtags: [{ type: String }],
  meta: {
    views: Number,
    rating: Number,
  },
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
```

> POST 작업시, 작동하는 function 만들기

```jsx
//videoController.js
import Video from "../models/Video";

export const postUpload = (req, res) => {
  const { title, description, hashtags } = req.body;
  const video = new Video({
    title,
    description,
    createdAt: Date.now(),
    //split : , 단위로 스트링을 array로 나누어줌.
    //map : 앞에 #를 붙여줌
    hashtags: hashtags.split(",").map((word) => `#${word}`),
    meta: {
      views: 0,
      rating: 0,
    },
  });
  console.log(video);
  return res.redirect("/");
};
```

## 6.16 Creating a Video part Two

- mongoose가 어느정도 data validation을 하고 있다.
  - 정해준 data type과 다른 정보를 넣으면 출력하지 않음.

> Database에 정보 저장하기

```jsx
//videoController.js

import Video from "../models/Video";

export const home = async (req, res) => {
  const videos = await Video.find({});
  return res.render("home", { pageTitle: "Home", videos });
};
// 방법1. await.video.save()
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  const video = new Video({
    title,
    description,
    createdAt: Date.now(),
    hashtags: hashtags.split(",").map((word) => `#${word}`),
    meta: {
      views: 0,
      rating: 0,
    },
  });
  //database에 저장. await를 함으로써 해당코드가 완료될때까지 기다림.
  await video.save();
  return res.redirect("/");

  //방법2. await Video.create()
  export const postUpload = async (req, res) => {
    const { title, description, hashtags } = req.body;
    await Video.create({
      title,
      description,
      createdAt: Date.now(),
      hashtags: hashtags.split(",").map((word) => `#${word}`),
      meta: {
        views: 0,
        rating: 0,
      },
    });
    return res.redirect("/");
  };
};
```

![12](/assets/images/wetube/20210706-00012.png)

- 터미널에서 확인이 가능해짐.

## 6.17 Exceptions and Validation

### Error가 발생하는 경우

  - 잘못된 data type 입력
    - number를 요구하는데 string을 입력한 경우
  - required를 요구한 datatype을 입력하지 않은 경우.

    ![13](/assets/images/wetube/20210706-00013.png)

> try, catch를 이용해 error시 기능 구현

```jsx
//videoController.js
export const postUpload = async (req, res) => {
  const { title, description, hashtags } = req.body;
  try {
    await Video.create({
      title,
      description,
      hashtags: hashtags.split(",").map((word) => `#${word}`),
    });
    return res.redirect("/");
  } catch (error) {
    return res.render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};
```

> Schema에서 Default값을 주기

```jsx
//Video.js
import mongoose from "mongoose";

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  // Date.now()가 아닌 Date.now 를 한 이유: 함수가 바로 실행되는 걸 원하지 않아서.
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
```

## 6.18 More Schema

[Mongoose v5.13.2: SchemaTypes](https://mongoosejs.com/docs/schematypes.html)

- 데이터에 대한 구체적인 설정은 매우 중요함
- minlength, maxlength
  - input과 schema 둘다 설정해두는게 보안에 뛰어남.
- SchemaTypes 예시
  - trim
    - string 양 옆의 빈공간을 없애줌
    - ex) " h . """" ⇒ "h ."

> trim, minLength 설정

```jsx
//Video.js
const videoSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxLength: 80 },
  description: { type: String, required: true, trim: true, minLength: 20 },
  createdAt: { type: Date, required: true, default: Date.now },
  hashtags: [{ type: String, trim: true }],
  meta: {
    views: { type: Number, default: 0, required: true },
    rating: { type: Number, default: 0, required: true },
  },
});
```

> minLength 설정

```jsx
//upload.pug
extends base.pug

block content
    if errorMessage
        span=errorMessage
    form(method="POST")
        input(name="title", placeholder="Title", required, type="text", maxlength=80)
        input(name="description", placeholder="Description", required, type="text", minlength=20)
        input(name="hashtags", placeholder="Hashtags, separated by comma.", required, type="text")
        input(type="submit", value="Upload Video")
```

> video mixin내용 database 내용 표기하도록 변경

```jsx
//video.pug
mixin video(video)
    div
        h4
            a(href=`/videos/${video.id}`)=video.title
        p=video.description
        small=video.createdAt
        hr
```

## 6.19 Video Detail

> 오류1 : upload href 접속시 오류

```jsx
videoRouter.get("/:id(\\d+)", watch);
```

- 현재 mongodb의 id는 문자가 들어간 불규칙한 스트링으로 위의 정규표현식과는 모순되서 오류가 발생한다.
- mongodb의 id는 24글자의 16진수

  [ObjectIds in Mongoose](https://masteringjs.io/tutorials/mongoose/objectid)

> 오류2 : 변수 video가 undefined 상태라 불러올수 없음

```jsx
//watch.pug
extends base.pug

block content
    div
        p=video.description
        small=video.createdAt
    a(href=`${video.id}/edit`) Edit Video &rarr;
```

> 해결1 : URL에 정규표현식, regexpal.com

- [0-9a-f] : 0-9의 숫자 혹은 a-f까지의 문자를 사용하는지 확인(16진수)
- {24} : 24글자로 이루어져있는가?

![14](/assets/images/wetube/20210706-00014.png)

```jsx
//videoRouter.js
videoRouter.get("/:id([0-9a-f]{24})", watch);
videoRouter.route("/:id([0-9a-f]{24})/edit").get(getEdit).post(postEdit);
```

> 해결2 : findById로 데이타베이스에서 video object 불러오기

- id는 받을 수 있으므로, id를 이용해서 찾기
  - findById
  - 위의 URL 변환 과정을 거쳤으므로, req.params로 URL에서 id를 가져올 수 있는 것.

```jsx
//videoController.js
export const watch = async (req, res) => {
  //해당 URL의 ID를 가져온다.
  const { id } = req.params;
  //ID와 일치하는 video object를 database에서 가져온다.
  const video = await Video.findById(id);
  //video object를 watch.pug로 보낸다.
  return res.render("watch", { pageTitle: video.title, video });
};
```

## 6.20 Edit Video part One

> `exec()`

- execute를 호출하면 promise가 return 될 것 이다.
- 현재 지워도 상관없는 이유는, async랑 await를 쓰고 있기 때문.

```jsx
//videoController.js
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).exec();
  return res.render("watch", { pageTitle: video.title, video });
};
```

> error 1. (URL에 임의로 id 작성후 접속시)

![15](/assets/images/wetube/20210706-00015.png)

- 만약 URL에 다른 id를 적어서 접속한다면?
  - ex)localhose4000:/videos/sadasdsa231321asf
- null로부터 title이라는 property를 찾을 수 없음.
  - video 검색에 실패했으므로 null
- 프로그래머는, 계획 외에 실패한 경우도 고려해서 설계해야함

> 해결 1. if를 통해 video가 있는지 확인하고 렌더링

```jsx
//videoController.js
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  //new
  if (video) {
    return res.render("watch", { pageTitle: video.title, video });
  }
  return res.render("404", { pageTitle: "Video not found." });
};
```

```jsx
//404.pug
extends base.pug
```

> Edit video

```jsx
//videoController.js
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  // vide===null 인 경우
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
```

```jsx
//edit.pug
extends base.pug

block  content
    h4 Change Title of Video
    form(method="POST")
        input(name="title", placeholder="Video Title", value=video.title, required)
        input(name="description", placeholder="Description", required, type="text", minlength=20, value=video.description)
        input(name="hashtags", placeholder="Hashtags, separated by comma.", required, type="text", value=video.hashtags)
        input(value="Save", type="submit")
```

> problem 1 : hashtag가 array형태 그대로 출력됨.

![16](/assets/images/wetube/20210706-00016.png)

> 해결 1 : join()을 이용해 format 변경

```jsx
input(
  (name = "hashtags"),
  (placeholder = "Hashtags, separated by comma."),
  required,
  (type = "text"),
  (value = video.hashtags.join())
);
```

![17](/assets/images/wetube/20210706-00017.png)

## 6.21 Edit Video part Two

> POST Request

- 방법 1
  - 직접 값을 변경하고 마지막에 await video.save()로 저장

```jsx
//videoController.js
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  video.title = title;
  video.description = description;
  video.hashtags = hashtags.split(",").map((word) => `#${word}`);
  await video.save();
  return res.redirect(`/videos/${id}`);
};
```

> 문제 1 : hashtag #이 무분별하게 붙음

- 단어앞에 무조건 #이 추가되기에, edit할때마다 계속 붙어버림

```jsx
video.hashtags = hashtags.split(",").map((word) => `#${word}`);
```

![18](/assets/images/wetube/20210706-00018.png)

> 해결 1 : word.startsWith()

- '#'이 붙으면 word 그대로 출력하고, 없다면 추가함.

```jsx
video.hashtags = hashtags
  .split(",")
  .map((word) => (word.startsWith("#") ? word : `#${word}`));
```

## 6.22 Edit Video part Three

> 방법 2 : findByIdAndUpdate()

[https://mongoosejs.com/docs/api/model.html#model_Model.findById](https://mongoosejs.com/docs/api/model.html#model_Model.findById)

- findByIdAndUpdate()

```jsx
//videocontroller.js
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.findById(id);
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  // findByidAndUpdate는 2개의 인자(id, 변경할 내용)를 받음.
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: hashtags
      .split(",")
      .map((word) => (word.startsWith("#") ? word : `#${word}`)),
  });
  return res.redirect(`/videos/${id}`);
};
```

- 주의사항
  - Video는 우리가 만든 영상 Model
  - video는 데이터베이스에서 검색한 영상 object

> findById 대신 exists() 이용

- video object를 받는 대신에 true 혹은 false를 받는 것 (filter 역할).
- dateabase의 id(\_id)와 URL의 id가 같은지 비교
  - getEdit의 경우에는, object 전체정보가 필요해서 findById가 더 적절함.

```jsx
//postEdit
const video = await Video.exists({ _id: id });
```

## 6.23 Middlewares

> Database reset

1. on cmd(console), enter mongo
2. use dbName;
3. db.dropDatabase(); or db.videos.remove({})

> Express에서의 middleware

- request를 중간에 가로채서 뭔가를 하고 이어서 진행하는 것
- 뭔가를 하고, next를 콜 한 다음 request를 계속 처리

> mongoose에서의 middleware

- document에 무슨 일이 생기기 전이나 후에 middleware를 적용할 수 있음
- middleware는 무조건 model 이 생성되기 전에 만들어야 함
- this : 우리가 저장하고자 하는 문서

  ```jsx
  //Video.js
  videoSchema.pre('save', async function(){
      console.log("We are about to save:", this);
  }
  ```

  ![19](/assets/images/wetube/20210706-00019.png)

> 문제 1. mongoose는 schema에 따라 string을 자동으로 array 방식으로 변환시킨다

- 여러개 text를 입력해도, 하나의 스트링으로써 array안으로 들어가버림.

![20](/assets/images/wetube/20210706-00020.png)

![21](/assets/images/wetube/20210706-00021.png)

> 해결 1. pre(save")middleware로 split,map 이용해 분리시킴.

```jsx
videoSchema.pre("save", async function () {
  this.hashtags = this.hashtags[0]
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
```

## 6.24 Statics

- save hooks 같은 경우는 update할 문서에 접근이 가능함
- findOneAndUpdate의 경우에는 접근할 수 없음

> hashtags array 및 # 문제를 깔끔하게 해결하기

> 방법 1. 함수를 만들고 export해서 처리

```jsx
//Video.js
export const formatHashtags = (hashtags) =>
  hashtags.split(",").map((word) => (word.startsWith("#") ? word : `#${word}`));
```

```jsx
//videoController.js
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
```

> 방법 2. static

- Video.Create, Video.findById와 같이 우리가 직접 만들 수 있음.

```jsx
//Video.js
videoSchema.static("formatHashtags", function (hashtags) {
  return hashtags
    .split(",")
    .map((word) => (word.startsWith("#") ? word : `#${word}`));
});
```

```jsx
//videoController.js
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const { title, description, hashtags } = req.body;
  const video = await Video.exists({ _id: id });
  if (!video) {
    return res.render("404", { pageTitle: "Video not found." });
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  return res.redirect(`/videos/${id}`);
};
```

> 글에서 hashtags 보이게 수정

- array안의 element 하나하나 'hashtags'로 들어가고, li로 정렬되어 촤르륵 나온다.

```jsx
//video.pug
mixin video(video)
    div
        h4
            a(href=`/videos/${video.id}`)=video.title
        p=video.description
        ul
            each hashtags in video.hashtags
                li=hashtags
        small=video.createdAt
        hr
```

## 6.25 Delete Video

> Step 1. watch.pug에서 링크 만들어주기

- URL에 들어가면 지워지게 만들거임.

```jsx
//watch.pug
extends base.pug

block content
    div
        p=video.description
        small=video.createdAt
    a(href=`${video.id}/edit`) Edit Video &rarr;
    br
    a(href=`${video.id}/delete`) Delete Video &rarr;
```

> Step 2. Router 와 Controller 만들기

```jsx
//videoRouter.js
videoRouter.route("/:id([0-9a-f]{24})/delete").get(deleteVideo);
```

```jsx
//videoController.js
export const deleteVideo = async (req, res) => {
  // URL에 있는 id를 가져옴
  const { id } = req.params;
  // findOneAndDelete {_id : id} 와 같음
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};
```

- 특별한 이유가 있지 않은 이상 findByIdAndRemove 대신 findByIdAndDelete를 쓰는 게좋다

## 6.26 Search part One

### 정렬

- mongoose는 굉장히 훌륭한 쿼리엔진을 갖고 있음
  - 문서들을 보여주는 방식을 수정할 수 있다
  - 어떻게 검색하고 정렬할지 정할 수 있음.

```jsx
export const home = async (req, res) => {
  //.sort({}) : 무엇을 기준으로 할지 선택하고 "asc", "desc" 으로 오름차순, 내림차순 결정
  const videos = await Video.find({}).sort({ createdAt: "desc" });
  return res.render("home", { pageTitle: "Home", videos });
};
```

### 검색

> globalrouter, videoController 생성

```jsx
//globalRouter.js
globalRouter.get("/search", search);
```

```jsx
//videoController.js
export const search = (req, res) => {
  return res.render("search");
};
```

> search.pug 생성

```jsx
//search.pug
extends base.pug

block content
    form(method="GET")
        input(placeholder="Search by title",name="keyword" type="text")
        input(value="Search now", type="submit")
```

- input에 name을 지정해주지 않으면, submit 제출해도 URL에 변화가 없음!

  - _name이 없을때와 있을때 submit 제출결과_

  ![22](/assets/images/wetube/20210706-00022.png)

  ![23](/assets/images/wetube/20210706-00023.png)

> form 정보 가져오기

- req.query 안에 keyword 정보가 들어있음

```jsx
export const search = (req, res) => {
  const { keyword } = req.query;
  if (keyword) {
    // serach
  }
  return res.render("search", { pageTitle: "Search" });
};
```

> (req.query와 req.params의 차이?)

- req.query

  Get한 URL에서 q가 가리키는 값을 가져옴

```jsx
/ GET /search?q=tobi+ferret
console.dir(req.query.q)
// => 'tobi ferret'
```

- req.params

  GET한 URL에서 미리 지정해둔 name에 해당하는 URL값을 가져옴

```jsx
// GET /user/tj
console.dir(req.params.name);
// => 'tj'
```

## 6.27 Search part Two

> 검색 기능 만들기

- 밖에서 videos를 선언해주고, 안에서 업데이트 해준다. 그후 search.pug로 videos 정보를 보낸다

```jsx
//videoController.js
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    // title이 keyword가 일치하는 경우를 찾아서 array로 만듬.
    videos = await Video.find({
      title: keyword,
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
```

> search.pug 생성

```jsx
//search.pug
extends base.pug
include mixins/video

block content
    form(method="GET")
        input(placeholder="Search by title",name="keyword" type="text")
        input(value="Search now", type="submit")
    div
        each video in videos
            +video(video)
```

> Regular Expression

![24](/assets/images/wetube/20210706-00024.png)

![25](/assets/images/wetube/20210706-00025.png)

![26](/assets/images/wetube/20210706-00026.png)

- ^ : 앞에 오는 단어만 검색
- $ : 마지막 단어만 검색
- i : 대소문자 구분 없앰

> Regular Expression 적용

```jsx
//videoController.js
export const search = async (req, res) => {
  const { keyword } = req.query;
  let videos = [];
  if (keyword) {
    videos = await Video.find({
      title: {
        //keyword를 contain하고 대소문자 구분없이 찾게됨. (mongoDB의 기능)
        $regex: new RegExp({ keyword }, "i"),
      },
    });
  }
  return res.render("search", { pageTitle: "Search", videos });
};
```

## 6.28 Conclusions

- CRUD 완성
- 이 섹션은 Mongoose와 친해지기 위한 목적
