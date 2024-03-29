---
title: "유튜브 클론코딩 : Templates"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: 'Pug의 기능을 배우며, 마크업 구성을 위한 준비를 합니다.'
toc: true
toc_sticky: true
---

>해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

## 5. TEMPLATES
### 5.0 Returning HTML

- HTML을 불러오는 두가지 방법

  - inline으로 그냥 직접입력
    1. 급하게 무언가를 구현할때나 유용.
    2. 여러가지를 동시에 수정하기 불편하니, 장기적으로 봤을때 별로임.

  ```jsx
  export const trending = (req, res) =>
    res.send(
      "<DOCTYPE html><html lang='ko'><head><title>Wetube</title></head><body><h1>Home</h1><footer>&copy; 2021 Wetube</footer></body>"
    );
  ```

### 5.1 Configuring Pug

```jsx
//server.js
import express from "express";
import morgan from "morgan";

import globalRouter from "./routers/globalRouter";
import videoRouter from "./routers/videoRouter";
import userRouter from "./routers/userRouter";

const PORT = 4000;

const app = express();
const logger = morgan("dev");
// express app의 view engine으로써 pug 지정
// npm i pug로 먼저 설치해야함
app.set("view engine", "pug");
app.use(logger);
app.use("/", globalRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

const handleListening = () =>
  console.log(`Server listening on port http://localhost:${PORT}`);

app.listen(PORT, handleListening);
```

- pug
  - template engine
- 순서
  1. `npm i pug`
  2. pug를 view engine으로 지정
  3. 실제 pug 파일 생성

```jsx
//videoController.js
export const trending = (req, res) => {
  /*render로 home.pug를 렌더링함.
server.js에서 view engine으로써 pug를 지정해줬으므로, 따로 import할 필요는 없음.
미리만들어둔 views폴더 내에서 view를 찾게 됨.*/
  res.render("home");
};
```

```html
// home.pug doctype html html(lang="ko") head title Wetube body h1 Welcome to
Wetube footer &copy; 2021 Wetube
```

- 기본적으로 express는 cwd (currentWorkingDirectory) + /views에서 pug 파일을 찾는다.
  - cwd는 node.js를 시작하는 디렉토리.
  - 이 경우는, package.json의 위치.

### 5.2 Partials.
- views default

  - express에게 views 폴더가 어디있는지 알려줘야함.
  - `process.cwd() + '/views'`
  - 현재 우리 폴더는, src내부에 views 폴더가 있으므로 경로 수정.

  ```jsx
  app.set("views", process.cwd() + "/src/views");
  ```

- pug 주의점
  1. 파일명에 뛰어 쓰기 하지 말것.
  2. 파일명은 전부 소문자로 할 것.
- pug 장점
  1. 쉽고 sexy한 html 작성
  2. 내용에 자바스크립트를 포함시킬수 있음.
  3. 반복하지 않고 한 파일로 모든 템플릿을 업데이트 할 수 있음.
- Partials

  ![img1](/assets/images/wetube/20210630-01.png)
```html
  doctype html html(lang="ko") 
    head 
      title Wetube 
    body 
      h1 Welcome to Wetube 
      include partials/footer.pug
```

- footer 같은 부분을 매페이지 마다 수정하기는 번거로움.
- include 기능을 사용하여 다른페이지를 가져올 수 있음.

### 5.3 Extending Templates

1. inheritance (상속)
   - 레이아웃, html의 베이스를 만들어줌.
   - pug에서는 extends를 사용함으로써 가능.
2. block
   - pug에서, 다른 페이지에서 내용을 채워넣을 수 있도록 공간을 만들어 낼 수 있음.
   - block을 채우지 않고 공란으로 냅둬도 작동함.
```jsx
// base.pug
  doctype html html(lang="ko") 
    head 
      block head 
    body 
      block content
      include partials/footer.pug
  // home.pug
  // 만들어둔 base.pug를 불러옴 extends
    base.pug
  // 만들어둔 block을 불러 내용을 채워옴. 
    block head 
      title Home | Wetube
    block content 
      h1 home!
```

### 5.4 Variables to Templates

- `render()`는 두가지 인자를 받는다.
  1. view의 이름
  2. template에 보낼 변수

```jsx
// base.pug 
// #{}을 사용해 변수를 받도록함.
doctype html html(lang="ko") 
  head title #{pageTitle} | Wetube 
  body block content 
    include partials/footer.pug
```

```jsx
/* 1. view인 "home"을 렌더링하고, home.pug는 base.pug
를 extends해서 복사해옴.
2. base.pug에서 받는 변수값 pageTitle을 입력해줌.*/
export const trending = (req, res) => {
  res.render("home", { pageTitle: "Home" });
};
```

![](/assets/images/wetube/20210630-02.png)<br>
_위의 결과로 렌더링된 title_

### 5.5 Recap

### 5.6 MVP Styles

- CSS는 마지막에 적용할 예정
- 그러나 못생긴걸 만들고 있으면 의욕이 떨어지므로, 기본 template으로써 `MVP.css`를 적용시키고 진행

```jsx
base.pug
doctype html
html(lang="ko")
    head
        title #{pageTitle} | Wetube
			//MVP css import
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body
        main
            block content
            include partials/footer.pug
```

### 5.7 Conditionals

> pug에서 변수를 지정하는 방법 1,2
>

```jsx
//base.pug
doctype html
html(lang="ko")
    head
// 주석1
        title #{pageTitle} | Wetube
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body
        header
/* 주석1과는 다르게, 텍스트없이 변수만 존재하므로, =을 사용하여
바로 변수지정이 가능. 아니면 똑같이 #{}를 사용해도됨.*/
            h1=pageTitle
        main
            block content
    include partials/footer.pug
```

> pug에서 conditional (if, else)를 적용하는 모습
>

```jsx
//base.pug
doctype html
html(lang="ko")
    head
        title #{pageTitle} | Wetube
        link(rel="stylesheet" href="https://unpkg.com/mvp.css")
    body
        header
            if fakeUser.loggedIn
                small Hello #{fakeUser.username}
            nav
                ul
//fake.User.loggedIn이 true일 경우 아랫값을 반환
                    if fakeUser.loggedIn
                        li
                            a(href="/login") Log out
                    else
                        li
                            a(href="/login") Login
            h1=pageTitle
        main
            block content
    include partials/footer.pug
```

>가짜 user정보를 만들어서 object 형태의 변수를 pug에 넘겨주는 모습
>

```jsx
// videoControlloer.js
const fakeUser = {
  username: "Leon",
  loggedIn: false,
};

export const trending = (req, res) => {
  res.render("home", { pageTitle: "Home", fakeUser: fakeUser });
};
```


### 5.8 Iteration
- Elements의 list를 보여주는 것.
- 이를 위해선 template에 array인 variable이 있어야함.

> 어떻게 하면 array 형태의 변수를 template에 보낼 수 있을까?
>

```jsx
// videoController.js
export const trending = (req, res) => {
  const videos = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  return res.render("home", { pageTitle: "Home", videos });
};
```

> each in을 사용하여 해결
>

```jsx
//home.pug

extends base.pug

block content
    h2 Welcome here you will see trending videos
    ul
        each video in videos
            li=video
        else
            li Sorry nothing found.
// video = currenvalue of loop, 즉 videos array안의 각 item. (이름은 자유롭게 지어도됨)
// videos = videoController에서 받아온 array형태의 변수. (이름이 서로 일치해야함)
``` 

### 5.9 Mixins

> mixin인 video.pug의 경로
>

![img3](/assets/images/wetube/20210630-03.png)<br>

- Mixin
  1. partials(footer.pug같은 것) that we can receive data
  2. 똑똑한 partial
  3. 데이터를 받을 수 있는 일종의 미리 만들어진 HTML BLOCK

> object형태의 data를 home.pug에 보내서 렌더링하는 모습.
>

```jsx
// videoController.js
export const trending = (req, res) => {
  const videos = [
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
  return res.render("home", { pageTitle: "Home", videos });
};
```

> mixin인 video.pug를 불러오는 모습
>

```jsx
//home.pug
extends base.pug
// include 경로지정
include mixins/video

block content
    h2 Welcome here you will see trending videos
    each potato in videos
// video.pug 안의 video function에 potato 객체를 넣음.
// potato : videos array의 한 item
        +video(potato)
    else
        li Sorry nothing found.
```

> mixin인 video.pug. partial과는 다르게 변수정보를 받는다
>

```jsx
//video.pug
mixin video(info)
    div
        h4=info.title
        ul
            li #{info.rating}/5.
            li #{info.comments} comments.
            li Posted #{info.createdAt}.
            li #{info.views} views.
```

### 5.10 Recap
1. Iteration
   - list의 모든 element들을 HTML에 보여주는 것
2. Mixin
   - 다른 데이터를 포함하지만 같은 HTML을 보여주는것
