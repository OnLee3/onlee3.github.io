---
title: "유튜브 클론코딩 : Flash Messages"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: 'express-flash를 통해 토스트 메시지를 구현합니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

# 15. FLASH MESSAGES

## 15.0 Installation

### 현재 문제

publicOnlyMiddleware를 통해, 로그인한 유저는 login 페이지에 못가게 막고 있음.

그런데 그냥 막는게아니라, 유저에게도 메시지를 줘서 알리고 싶음.

### express-flash

- `npm i express-flash`
- 템플릿에서 사용자에게 메세지를 남길 수 있도록 도와줌
- session에 근거하기 때문에, 한 사용자만이 볼 수 있음
- `req.flash` 함수 사용가능
  - `req.flash("type", "message")`
  - 어디에서나 쓸 수 있지만, 보통 redirect할 때 메시지를 보냄.

> server.js

```jsx
import flash from "express-flash";

app.use(flash());
```

> middlewares.js

```jsx
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    req.flash("error", "Not authorized");
    return res.redirect("/");
  }
};
```

## 15.1 Sending Messages

`req.flash()`를 사용하는 건, locals 속성을 만드는 것

- "messages" locals를 사용하게 해줌
- locals는 템플릿에서 사용가능
- 메시지가 한 번 보여지고 나면 express가 메시지를 cache에서 지워버림

> base.pug

```jsx
body
        if messages.error
            span=messages.error
```

- `req.flash()`에서 설정("error")한 타입으로 속성 가져올수 있음

### mixin과 scss를 이용해 꾸미기

> base.pug

```jsx
include mixins/message
body
        if messages.error
           +message("error", messages.error)
        if messages.info
           +message("info", messages.info)
        if messages.success
           +message("success", messages.success)
```

> message.pug

```jsx
mixin message(kind, text)
    div.message(class=kind)
        span=text
```

> styles.scss

```scss
@keyframes goAway {
  from {
    transform: none;
    opacity: 1;
  }
  to {
    transform: translateY(-50px);
    opacity: 0;
  }
}

.message {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  margin: 0 auto;
  max-width: 200px;
  padding: 10px 20px;
  border-radius: 10000px;
  text-align: center;
  animation: goAway 0.5s ease-in-out forwards;
  animation-delay: 3s;
  &.error {
    background-color: tomato;
    color: white;
  }
}
```
