---
title: "유튜브 클론코딩 : User Authentication"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: '회원가입 및 로그인 그리고 Oauth를 이용한 깃허브 로그인을 구현합니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.

# 7. USER AUTHENTICATION

## 7.0 Create Account part One

> Model인 User.js 생성

- unique : 같은 값이 단 하나만 존재할 수 있게함.
- model() 첫번째 인자의 이름은 임의로 정해도 된다.

```jsx
//User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  location: String,
});

const User = mongoose.model("User", userSchema);
export default User;
```

> join.pug 생성

- input을 만들때, name이 없으면 백엔드에서 쓸 수가 없음! 꼭필요

```jsx
//join.pug
extends base

block content
    form(method="POST")
        input(name="email", type="text", required)
        input(name="username", type="text", required)
        input(name="password", type="password", required)
        input(name="name", type="text", required)
        input(name="location", type="text", required)
        input(type="submit", value="Join ")
```

> userController.js에서 join 연결

```jsx
//userController.js
export const getJoin = (req, res) => res.render("Join", { pageTitle: "Join" });
export const postJoin = (req, res) => {
  console.log(req.body);
  res.end();
};
```

## 7.1 Create Account part Two

> 터미널 명령어

- mongo
- show dbs
- use wetube(db이름)
- show collections
- db.users(collection이름).find()

> User.create로 db에 정보저장하기

```jsx
//userController.js
import User from "../models/User";

export const getJoin = (req, res) => res.render("Join", { pageTitle: "Join" });
export const postJoin = async (req, res) => {
  console.log(req.body);
  const { email, username, password, name, location } = req.body;
  await User.create({
    name,
    email,
    username,
    password,
    location,
  });
  return res.redirect("/Login");
};
```

## 7.2 Create Account part Three

- passwrod가 DB에 그대로 저장되있어서 보안 상 좋지 않음.
- 해싱
  - 일방향 함수, 문자열이 필요
  - 되돌리 수 없어서 일방향 함수
  - 같은 인풋에서는, 항상 같은 결과가 나옴.
    - deterministic function (결정적 함수)
    - 해커가 해싱된 패스워드로 할 수 있는 공격 : rainbow table
  - bcrypt
    - npm i bcrypt
    - rainbowtable 공격을 막아줌.

```jsx
//User.js
//this : Create 되는 User를 가리킴

import bcrypt from "bcrypt";
//middleware의 기능.  Create User로 저장되기 전에, 해싱처리.
userSchema.pre("save", async function () {
  this.password = await bcrypt.hash(this.password, 5);
});
```

![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00001.png)

## 7.3 Form Validation

> username이 이미 존재하는지 확인하고, 있다면 에러메세지와 함께 렌더링

```jsx
//userController.js
const { email, username, password, name, location } = req.body;
const usernameExists = await User.exists({ username: username });
if (usernameExists) {
  return res.render("Join", {
    pageTitle: "Join",
    errorMessage: "This username is already taken.",
  });
}
```

> $or operator

- 각 조건이 true일 때 실행되게 만들 수 있음

```jsx
//userController.js
const { email, username, password, name, location } = req.body;
const pageTitle = "Join";
const exists = await User.exists({
  $or: [{ username: username }, { email: email }],
});
if (exists) {
  return res.render("Join", {
    pageTitle,
    errorMessage: "This username/email is already taken.",
  });
}
```

## 7.4 Status Codes

- 현재 문제
  - 계정생성에 실패하더라도 브라우저가 아이디 비밀번호를 저장할거냐고 물음
  - 브라우저는 정상적으로 200 코드를 받았으므로, 성공한 줄 알고 물어보는 것.
- 상태 코드 200 : OK

  - default는 render 성공시 출력

  ![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00006.png)

- 400 : Bad Request

> 실패시 status400 보내주기

```jsx
const exists = await User.exists({
  $or: [{ username: username }, { email: email }],
});
if (exists) {
  return res.status(400).render("Join", {
    pageTitle,
    errorMessage: "This username/email is already taken.",
  });
}
```

- 알맞은 상태 코드를 보내야 브라우저가 적절한 행동을 취함.
- 브라우저에게 이 URL을 기록하지 말라고 알려주는 방법 : 상태코드 404
- try catch는 직접 에러 잡고나서 추가해주기

  ```jsx
  await User.create({
          name,
          email,
          username,
          password,
          location
      })
      return res.redirect("/Login");
  } catch(error){
      return res.status(400).render("join", {
          pageTitle: pageTitle,
          errorMessage: error._message,
      });
  }
  ```

## 7.5 Login part One

> Login Page 생성

- join과 유사한 모습, login.pug 생성

> Post Login

- 구현할 검증요소
  - 계정이 존재하는가?
  - 패스워드가 일치하는가?

> username이 DB에 있는지 확인

```jsx
//userController.js
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const exists = await User.exists({ username: username });
  if (!exists) {
    return res.status(400).render("login", {
      pageTitle: "Login",
      errorMessage: "An account with this username does not exists. ",
    });
  }
  res.end();
};
```

## 7.6 Login part Two

- 패스워드가 일치하는 지 확인
  - 패스워드를 해싱하고 나온 해시값과 데이터베이스에 있는 해시값을 비교
  - 해시값은 항상 같기때문에 가능
- compare()
  - bycrypt 내장
  - 입력한 패스워드, DB에 저장된 패스워드를 비교해서 true or false 반환
- exists와 findOne
  - exists는 존재하는지 체크하고 true or false를 반환
  - findOne은 체크 후 정보자체를 가져옴

> 패스워드가 일치하는지 확인

```jsx
//userController.js
export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  //username이 일치하는 object 정보를 DB에서 가져옴.
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists. ",
    });
  }
  // input에 입력한 password와 DB에 저장된 password를 비교
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password!",
    });
  }
  console.log("LOG USER IN! COMING SOON!");
  return res.redirect("/");
};
```

## 7.7 Sessions and Cookies part One

- 유저를 기억하게 만들 것
  - 유저에게 쿠키를 보내주는 것
    - 세션 : 백엔드와 브라우저 간에 어떤 활동을 했는지 기억함
      - memory, history.
  - 로그인시 유저한테 텍스트 조각을 줌.
    - 그 후 유저가 우리한테 요청을 보낼때마다 텍스트를 요구하고, 보고 기억함.
- stateless
  - 홈페이지를 GET해서 렌더링 한 이후에, 그 페이지는 live가 아님.
  - 한 번 연결 되었다가 끝나는 것
- express-session

  - npm i express-session
  - express에서 세션을 처리하게 도와주는 middleware
  - 이 미들웨어가, 사이트로 들어오는 모두를 기억함
  - Router 앞에서 초기화해주면 됨.

  > session middleware 사용

  - 브라우저가 어떤 user인지 쿠키의 id로 구별해냄.

  ```jsx
  //server.js
  import session from "express-session";

  app.use(
    session({
      secret: "Hello!",
    })
  );

  app.use("/", rootRouter);
  app.use("/videos", videoRouter);
  app.use("/users", userRouter);
  ```

  ![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00002.png)

## 7.8 Sessions and Cookies part Two

- 서버를 저장하고 refresh하면 세션이 날라간다.
  - express가 세션을 메모리에 저장하고 있기 때문
  - 우리가 fakeDB를 만들었을때처럼, 세션에도 비슷한 일이 일어나고 있음
  - 나중에 백엔드가 잊지 않도록 세션을 mongoDB에 연결할 예정
- 백엔드가 쿠키를 가지고 브라우저를 구분하는 법
  - 세션과 세션id는 브라우저를 기억하는 방식 중 하나
  - 서버가 브라우저한테 세션 id를 줌.
  - 쿠키에 저장
  - 브라우저가 요청을 보낼 때마다, 쿠키에서 세션 Id를 가져와 보내줌
  - 서버가 세션 id를 읽고 누군지 알 수 있음.

## 7.9 Logged in User

- 유저를 기억하게 만들어 볼 것
  - 각 유저마다 다른 session object를 가지고 있음

> req.session object에 정보 저장하기

```jsx
//userController.js

export const postLogin = async (req, res) => {
  const { username, password } = req.body;
  const pageTitle = "Login";
  const user = await User.findOne({ username: username });
  if (!user) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "An account with this username does not exists. ",
    });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return res.status(400).render("login", {
      pageTitle,
      errorMessage: "Wrong password!",
    });
  }
  //session에 loggedIn, user 를 만들고 정보를 저장
  req.session.loggedIn = true;
  req.session.user = user;
  return res.redirect("/");
};
```

![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00003.png)

_console.log(sessions);_

## 7.10 Logged In User part Two

> pug template에서 respond에서 제공하는 locals에 접근 할 수 있다.

```jsx
//server.js
app.use((req, res, next) => {
  res.locals.sexy = "you";
  req.sessionStore.all((error, sessions) => {
    console.log(sessions);
    next();
  });
});
```

```jsx
//base.pug
body
        header
            h1 Who is sexy? #{sexy}
```

![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00004.png)

> middlewares.js 생성

- server.js에 app.use형태로 import
- session middleware 다음에 놔야만 작동함

```jsx
//middlewares.js
export const localsMiddleware = (req, res, next) => {
  console.log(req.session);
  res.locals.siteName = "Wetube";
  //next를 호출해야만 사이트 작동함
  next();
};
```

> locals에 session 정보 저장 및 pug에서 불러오기

```jsx
//middlewares.js
export const localsMiddleware = (req, res, next) => {
  res.locals.loggedIn = Boolean(req.session.loggedIn);
  res.locals.loggedInUser = req.session.user;
  res.locals.siteName = "Wetube";
  console.log(res.locals);
  next();
};
```

![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00005.png)

_로그인하기전 과 로그인 한 후의 로그_

## 7.11 Recap

> Session Middleware

```jsx
//server.js
app.use(
  session({
    secret: "Hello!",
    resave: true,
    saveUninitialized: true,
  })
);
```

- session middleware가 브라우저와 백엔드가 상호작용할때마다, 브라우저에 cookie를 줌.
- 브라우저는 URL로 request를 보낼때마다 cookie를 같이 보내줌.
  - 우리는 cookie에 session id 정보를 넣어둠.
  - 왜냐하면 Http는 stateless라서, 한번 render가 끝나면 연결이 끝난 상태임.
- cookies랑 session은 별개
  - cookie는 정보를 주고 받는 방법
  - session ID는 cookie에 저장됨. 왜냐하면 cookie는 session ID를 전송하는데 사용되기 때문.
    - backend에도 저장됨 (관리자 창, Application 확인 가능)
- 각 브라우저 (user) 마다 session이 다르다.

## 7.12 MongoStore

> express-session

- session data는 cookie에 저장되지 않고, session id만 저장됨
- session data는 서버에 저장됨
  - default는 memorystore이며 실사용을 위한건 아님
  - 고로 우리는 database에 저장해야함

> mongoDB 연결

1. npm install connect-mongo
2. server.js에 import

   ```jsx
   import MongoStore from "connect-mongo";
   ```

3. MongoStore.create() 로 URL 지정

   ```jsx
   //server.js
   app.use(
     session({
       store: MongoStore.create({
         mongoUrl: "mongodb://127.0.0.1:27017/wetube",
       }),
     })
   );
   ```

   1. Session을 만드는 방법?
   2. backend와 상호작용 하면 만들어짐.
   3. refresh getURL 등등

## 7.13 Uninitialized Sessions

```jsx
//server.js
app.use(
    session({
    secret : "Hello!",
    resave:true,
    saveUninitialized:true,
    })
}))
```

- 모든 방문자에 대해 세션과 쿠키를 줄 필요는 없음
  - 봇이나 잠깐 구경하고 가는 사람들에 대해 일일히 세션을 기록하면, 비효율적이고 접속자가 많으면 db가 터질거임.
  - 로그인 한 사람만 기록하도록 할 예정

> resave, saveUninitalized

- 세션을 수정할때만 세션을 DB에 저장하고 쿠키를 넘겨줌

  - 로그인 할때 session에 정보를 추가해줬으므로 로그인시 작동.

  ```jsx
  //userController.js
  export const postLogin = async (req, res) => {
    req.session.loggedIn = true;
    req.session.user = user;
  };
  ```

## 7.14 Expiration and Secrets

> cookie의 property

- secret : 쿠키에 sign 할 때 사용하는 string
  - backend가 쿠키를 줬다는걸 보여주기 위해
  - session hijack을 방지할 수 있음
- domain : 쿠키를 만든 backend가 누구인지 알려줌
  - [localhost](http://localhost) Domain 이라면, localhost에만 제출하고 다른 사이트에는 제출하지 않음
- expires : 지정하지 않으면 session cookie로 분류됨.
  - 사용자가 닫으면 session cookie는 끝남
- max-age : 언제 세션이 만료되는지 알려줌.

  - ms 단위

  ```jsx
  app.use(
    session({
      cookie: {
        //20초뒤 만료됨
        maxAge: 20000,
      },
    })
  );
  ```

> DB URL, secret 보호

1. .env 생성

   ![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00007.png)

2. gitigonre에 추가

   ```jsx
   /node_modules
   .env
   ```

3. 비밀로 해야하는 string을 .env에 추가

   ```jsx
   //.env
   COOKIE_SECRET=safnlaskfnaslkfnas23432n4j32n4jlldsf
   DB_URL=mongodb://127.0.0.1:27017/wetube
   ```

4. process.env.(변수명) 형태로 코드 불러와서 사용하기

## 7.15 Environment Variables

> dotenv

- env 파일을 읽고 각 변수들을 process.env에 넣음
- `npm i dotenv`
- `requrie('dotenv').config()`

  최대한 앞에 놔주는게 좋음

  > require

  - 사용하려는 모든 파일 최상단에 놔야만함

  ```jsx
  //init.js
  require("dotenv").config();
  ```

  > import

  ```jsx
  //init.js
  import "dotenv/config";
  ```

## 7.16 Github Login part One

> github login 구현

- OAuth apps 사용

> step 1 사용자를 깃헙으로 Redirect

```jsx
//login.pug
extends base

block content
    form(method="POST"
        a(href="https://github.com/login/oauth/authorize?client_id=c145756b1fc90de3748b&allow_signup=false") Continue with Github &rarr;
```

## 7.17 Github Login part Two

> scope

- 어떤 데이터를 가져올 것 인가?

  - URL뒤에 &scope=read:user read:email 붙여주면됨

  ```jsx
  allow_signup=false&scope=user:email delete_repo
  ```

  - 하다보면 URL이 지저분해지고, 추가사항있을때마다 변경해야해서 번거로움

  > URL정리

  - userRouter, userController에 해당 URL 추가

  ```jsx
  //login.pug
  extends base

  block content
  form(method="POST"
  a(href="/users/github/start") Continue with Github &rarr;
  ```

  ```jsx
  //userController.js
  export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
      client_id: "c145756b1fc90de3748b",
      allow_signup: false,
      scope: "read:user user:email",
    };
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
  };
  ```

  > URLSearchParams

  ![/assets/images/wetube/wetubeC7-00001.png](/assets/images/wetube/wetubeC7-00008.png)

## 7.18 Github Login part Three

> step 2 유저가 깃허브를 통해서 다시 우리 웹사이트로 redirect

- github에서 받은 코드를 access 토큰으로 바꿔줘야 한다.
- parameter와 함께 POST해야함

  - client id, client secret
    - .env에 코드 넣어주기
    - id는 중복사용되서 편하게 하기 위해 넣는거고, secret은 타인에게 공개되면 안되기에 env사용.
  - code : URL에 나타나는 코드 사용하면됨

  ```jsx
  //userController.js
  export const finishGithubLogin = (req, res) => {
    const config = {
      client_id: process.env.GH_CLIENT,
      client_secret: process.env.GH_SECRET,
      code: req.query.code,
    };
  };
  ```

> URL 정리 및 POST

```jsx
//userController.js
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}&${params}`;
  const data = await fetch(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  });
  const json = await data.json();
};
```

## 7.19 Github Login part Four

- fetch가 필요한데 서버엔 없음
  - node-fetch
  - `npm i node-fetch`
  - import

> Step 3 access_token을 가지고 API에 접근

```jsx
//userController.js
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token";
  const config = {
    client_id: process.env.GH_CLIENT,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  };
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (
    await fetch(finalUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  if ("access_token" in tokenRequest) {
    const { access_token } = tokenRequest;
    const userRequest = await (
      await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${access_token}`,
        },
      })
    ).json();
    console.log(userRequest);
  } else {
    return res.redirect("/login");
  }
};
```

## 7.20 Github Login part Five

- access_token은 scope에 명시한 내용만을 가져다 준다.

> email 정보 가져오기

```jsx
//userController.js
    const tokenRequest = await (
        await fetch(finalUrl, {
        method:"POST",
        headers:{
            Accept: "application/json",
        },
    })).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await (await fetch(`${apiUrl}/user`, {
            headers:{
                Authorization: `token ${access_token}`
            }
        })).json();
        console.log(userData);
        const emailData = await (
            await fetch(`${apiUrl}/user/emails`, {
                headers:{
                    Authorization: `token ${access_token}`
                }
            })
         ).json();
         console.log(emailData);
         const email = emailData.find(email => email.primary === true && email.verified ===  true
            );
            if(!email){
                return res.redirect("/login");
            }
    } else {
        return res.redirect("/login");
    }
}
```

## 7.21 Github Login part Six

> 로그인 규칙

- 깃헙 로그인 시도시, DB에 같은 이메일이 있으면 로그인 시켜줄 예정.
- 없다면, 깃허브 정보 바탕으로 계정 생성 후 자동 로그인.
  - 규칙을 어떻게 설정하느냐에 따라 로직이 달라짐.

```jsx
const emailObj = emailData.find(email => email.primary === true && email.verified ===  true
            );
            if(!emailObj){
                return res.redirect("/login");
            }
            const existingUser = await User.findOne({email: emailObj.email});
            if(existingUser){
                req.session.loggedIn = true;
                req.session.user = existingUser;
                return res.redirect("/");
// DB에 동일한 이메일이 없을 경우, github에서 가져온 data를 바탕으로 정보를 DB에 저장.
            } else {
                const user = await User.create({
                    name: userData.name,
                    username: userData.login,
                    email: emailObj.email,
                    password:"",
// github로 로그인한 계정인지 구분하기 위해
                    socialOnly:true,
                    location: userData.location,
                })
// 로그인
                req.session.loggedIn = true;
                req.session.user = user;
                return res.redirect("/");
            }
    } else {
        return res.redirect("/login");
    }
```

## 7.22 Log Out

> Logout : req.session.destroy()

```jsx
export const logout = (req, res) => {
  req.session.destroy();
  return res.redirect("/");
};
```

## 7.23 Recap

> 깃허브 로그인

- 링크 클릭시 /users/github/start로 감
- URL을 만들어서, user를 github로 보냄
  - URL에 어떤 종류의 user를 허용시킬 건지 등의 설정이 가능
  - scope를 적음으로써 어떤 종류의 정보를 요청할 건지 설정
- 이 데이터들을 공유하는데 동의를 하면 우리 웹사이트(/github/finish)로 코드와 함께 돌아옴
  - 필요한 parameter를 모아서 URL을 만듬
  - POST Request를 통해 access_token을 받음
  - access_token을 통해 Github API와 상호작용함
