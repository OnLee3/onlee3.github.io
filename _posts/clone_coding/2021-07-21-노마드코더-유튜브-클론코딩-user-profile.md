---
title: "유튜브 클론코딩 : User Profile"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: '생성한 계정의 프로필을 관리할 수 있도록, 정보 변경, 이미지 업로드, 비디오 정보 받아오기 등을 구현합니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

# 8. USER PROFILE

## 8.0 Edit Profile GET

### 목표

- Profile에서 avatar를 포함한 정보 변경 할 수 있도록 할 예정
- 추후에 video를 포함한 많은 파일들을 업로드 할 수 있게 할 것

### 1. 같은 URL POST 설정

- action을 따로 적지 않으면, 같은 URL에 POST 하는 것으로 인식한다.

```jsx
//edit-profile.pug
extends base.pug

block  content
		form(method="POST")
```

### 2. 로그인유저 정보 끌어오기

- locals에 저장된 loggedInUser는, session의 user 정보를 받아 저장된 객체이다.
  - 즉 로그인 한 상태일 경우, 정보를 받아 올 수 있다.

```jsx
//edit-profile.pug
extends base.pug

block content
    form(method="POST")
        input(placeholder="Name" name="name", type="text", required, value=loggedInUser.name)
        input(placeholder="Email" name="email", type="text", required, value=loggedInUser.email)
        input(placeholder="Username" name="username", type="text", required, value=loggedInUser.username)
        input(placeholder="Location" name="location", type="text", required, value=loggedInUser.location)
        input(type="submit", value="Update Profile")
```

### issue : URL 입력을 통한 직접 접근

- 로그인 한 상태로 URL에 들어가면 정상적으로 작동하지만, 로그인 하지 않은 상태로 /users/edit 경로로 직접 들어가면 오류가 발생한다.

  - edit-profile.pug에서 user 정보를 받아 렌더링해야하는데, 정보가 없으므로 발생하는 오류
  - middlewares.js에서 로그인 하지 않았을 경우, 빈 객체를 줌으로써, URL 접속시 undefined 오류를 방지한다.

    ```jsx
    export const localsMiddleware = (req, res, next) =>
        res.locals.loggedInUser = req.session.user || {};
        next();
    }
    ```

  - 다음에는 로그인 하지 않은 유저가 URL에 접근조차 못하거나, 다른 곳으로 redirect 하게 만들어줄 것.

## 8.1 Protector and Public Middlewares

### 목표

- 특정 유저들의 접근을 막는 middleware 생성
  - 로그인 한 사람들 혹은 로그인 하지 않은 사람들에 따라 갈 수 있는 페이지가 다름.
  - 로그인 한 사람들은 로그인, 계정생성등에 접근 할 수 없고, 로그인 하지 않은 사람들은 동영상 업로드와 편집을 막을 것.

### 1. Protector Middleware 생성

- session.loggedIn이 true라면 그냥 넘겨주고, 없으면 홈페이지로 돌려보냄.

```jsx
//middlewares.js
export const protectorMiddleware = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.redirect("/");
  }
};
```

### 2. PublicOnlyMiddleware 생성

- 반대로 로그인 되있지 않은 사람만 받을 수 있도록 한 middleware

```jsx
//middlewares.js
export const publicOnlyMiddleware = (req, res, next) => {
  if (!req.session.loggedIn) {
    return next();
  } else {
    return res.redirect("/");
  }
};
```

### 3. 용도에 맞게 middleware 지정

- 로그인시 접근 막을 URL에 publicOnlyMiddleware
- 로그인 하지 않을시 접근 막을 URL에 protectorMiddleware

  - `.all`을 이용해 route내 모든 get,post에 middleware 적용가능

  ```jsx
  route(URL).all(middleware).get(function).post(function)
  ```

- 원치않는 URL 접근 막기

```jsx
//userRouter.js
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router();

userRouter.get("/logout", protectorMiddleware, logout);
userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);
```

## 8.2 Edit Profile POST part One

### 1. 프로필 편집 기능 생성

- 세션으로부터 id를 가져와서, DB에 같은 ID를 찾아 정보를 업데이트한다.

```jsx
//userController.js
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email, username, location },
  } = req;
  await User.findByIdAndUpdate(_id, {
    name: name,
    email: email,
    username: username,
    location: location,
  });
  return res.render("edit-profile");
};
```

### issue : input 기본 value 업데이트 안됨

- DB에는 저장됨.
- input value는 locals에 저장된 loggedInUser.property를 가져오는데, locals에 정보가 저장되는 시점은 로그인 직후라서 현상황을 반영못함.
  - 정보를 업데이트 함으로써 해결할 예정

## 8.3 Edit Profile POST part Two

### 목표

- 프론트엔드(input value)에는 반영이 안됬으므로 session 업데이트가 필요함.
  - session은 mongo store안에 들어 있다.

### 1. 직접 업데이트하는 방법

- ...req.session.user : session 정보들을 가져옴

```jsx
export const postEdit = async(req, res) => {
                const {session: {user : {_id} },
                body : {name, email, username, location}
                } = req;
                await User.findByIdAndUpdate(_id, {
                    name:name,
                    email:email,
                    username:username,
                    location:location,
                })
                req.session.user = {
                    ...req.session.user,
                    name,
                    email,
                    username,
                    location,
                };
return res.redirect("/users/edit");
```

### 2. findByIdAndUpdate를 이용한 업데이트

- new : Boolean
  - true 체크시, 업데이트 된 정보를 return 함
  - default로는 업데이트 되기전의 정보를 return 함

```jsx
findByIdAndUpdate(_id, update, new)
```

```jsx
export const postEdit = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    body: { name, email, username, location },
  } = req;
  const updatedUser = await User.findByIdAndUpdate(
    _id,
    {
      name: name,
      email: email,
      username: username,
      location: location,
    },
    { new: true }
  );
  req.session.user = updatedUser;
  return res.redirect("/users/edit");
};
```

### issue : username, email validation

- 기존 DB에 같은 username이나 Email이 있으면 변경 못하도록 막아야함.
  1. session정보와 input 정보가 같으면 업데이트안하고 홈으로 보냄.
  2. DB에 같은 username이나 email 있다면 errorMessage 출력하고 돌려보냄.

```jsx
//usercontoller.js
export const postEdit = async (req, res) => {
  const {
    session: {
      user: {
        _id,
        name: sessionName,
        email: sessionEmail,
        username: sessionUserName,
      },
    },

    body: { name, email, username, location },
  } = req;
  //1.
  if (
    name !== sessionName ||
    email !== sessionEmail ||
    username !== sessionUserName
  ) {
    //2.
    const exists = await User.exists({ $or: [{ username }, { email }] });
    if (exists) {
      return res.status(400).render("edit-profile", {
        pageTitle: "Edit Profile",
        errorMessage: "This username/email is already taken.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      _id,
      {
        name: name,
        email: email,
        username: username,
        location: location,
      },
      { new: true }
    );
    req.session.user = updatedUser;
    return res.redirect("/users/edit");
  } else {
    return res.redirect("/");
  }
};
```

## 8.4 Change Password part One

### 1. change-password 구현

1. edit-profile.pug에서 갈 수 있는 링크 생성
2. userController, userRouter에서 get, Post시 행동 설정
3. change-password.pug 생성

```jsx
//change-password.pug
extends ../base

block content
    form(method="POST")
        input(placeholder="Old Password")
        input(placeholder="New Password")
        input(placeholder="New Password Confirmation")
        input(value="Change Password", type="submit")
```

### issue : Github 계정 사용자는 비밀번호변경이 불가능해야함.

> 방법 1 socialOnly를 체크하여 돌려보낸다.

```jsx
//userController.js
export const getChangePassword = (req, res) => {
  if (req.session.user.socialOnly === true) {
    return res.redirect("/");
  }
  return res.render("users/change-password", { pageTitle: "Change Password" });
};
```

> 방법 2 패스워드가 없으면 돌려보낸다.

> 방법 3 change password 링크 자체를 가린다.

```jsx
//edit-profile.pug
if !loggedInUser.socialOnly
            hr
            a(href="change-password") Change Password &rarr;
```

## 8.5 Change Password part Two

### 목표

- 일반계정 설정 시험해보기 (Github 로그인 말고)

### 1. 사전 준비

- 계정 삭제
  - `db.sessions`, `db.users`, `.remove({})`
- 깃허브로그인 or 일반로그인을 위한 middleware 생성
  - 반복되는 코드가 있다면, 미들웨어 생성을 고려해야함
- controller에서 사용하기전에, input에 name이랑 type 생성

  ```jsx
  //change-password.pug
  input(
    (placeholder = "Old Password"),
    (type = "password"),
    (name = "oldPassword")
  );
  input(
    (placeholder = "New Password"),
    (type = "password"),
    (name = "newPassword")
  );
  input(
    (placeholder = "New Password Confirmation"),
    (type = "password"),
    (name = "newPasswordConfirmation")
  );
  ```

### 2. userController에서 function 설정

> 새패스워드, 패스워드확인 두개가 일치한지 확인

```jsx
if (newPassword !== newPasswordConfirmation) {
  return res.status(400).render("users/change-password", {
    pageTitle: "Change Password",
    errorMessage: "The password does not match the confirmation.",
  });
}
```

> 기존 비밀번호가 정확한지 확인

- form 비밀번호와 DB에 있는 비밀번호를 비교

```jsx
const {
  session: {
    user: { _id },
  },
  body: { oldPassword, newPassword, newPasswordConfirmation },
} = req;
const user = await User.findById(_id);
const ok = await bcrypt.compare(oldPassword, user.password);
if (!ok) {
  return res.status(400).render("users/change-password", {
    pageTitle: "Change Password",
    errorMessage: "The current password is incorrect.",
  });
}
```

> 비밀번호 변경

- user.save()를 씀으로써, 해싱 middleware를 작동시켜 저장시킴.

```jsx
const {
  session: {
    user: { _id },
  },
  body: { oldPassword, newPassword, newPasswordConfirmation },
} = req;
const user = await User.findById(_id);
const ok = await bcrypt.compare(oldPassword, user.password);
user.password = newPassword;
await user.save();
return res.redirect("/users/logout");
```

## 8.6 File Uploads part One

### 목표

- 유저 프로필에서 파일(사진) 업로드 기능 구현

### 1. edit-profile.pug에서 input 만들기

```jsx
label(for="avatar") Avatar
input(type="file", id="avatar", name="avatar", accept="image/*")
```

### 2. multer middleware 생성 및 지정

- 파일을 업로드 할 수 있도록 도와줌
- 설치 : `npm i multer`

> form을 multipart/form-data 으로변경

- 파일을 백엔드로 보내기 위한 encoding type

```jsx
//edit-profile.pug
form(method="POST" enctype="multipart/form-data")
```

> multa middleware 생성

- dest : 파일 저장 경로

```jsx
//middlewares.js
import multer from "multer";
export const uploadFiles = multer({ dest: "uploads/" });
```

> router에 middleware 지정

```jsx
//userRouter.js
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(uploadFiles.single("avatar"), postEdit);
```

- URL → Middleware → Function 순서
- uploadFiles.single

  - single : 한 개의 파일만 업로드
  - 작동순서 : template의 input에서 오는 avatar 파일을 가지고, 업로드 후 Uploads 폴더에 저장할 것 이다. 그 후 다음 controller인 postEdit에 파일의 정보를 전달
  - 해당 작업 완료 후 req.file 이 추가 됨.

    `console.log(req.file)`

    ![1](/assets/images/wetube/wetubeC8-00001.png)

## 8.7 File Uploads part Two

- commit 하기전에, .gitignore에 uploads 폴더 추가하기
- DB에 파일 저장하면 안됨. 매우매우 잘못됨.
  - 파일은 폴더에 저장하고, 파일의 위치만 DB에 저장

### 1. 프로필 편집시, 올바른 사진 URL 지정

- file이 있을 경우, file.path를 가져오고, 없으면 session에 저장된 avatarUrl을 가져옴
  - 업로드 한 파일이 없을 경우 오류가 나기 때문에 선택한 방법.

```jsx
export const postEdit = async(req, res) => {
                const {
                    session: {
                        user : {
                            _id,
                            avatarUrl
                            }
                        file,
                    } = req
                    const updatedUser = await User.findByIdAndUpdate(_id, {
                        avatarUrl: file ? file.path : avatarUrl
                    }
```

### 2. 이미지 출력

- 해당 URL을 만들어서 express한테 알려준적이 없기때문에, 오류가 남.

```jsx
//edit-profile.pug
img((src = "/" + loggedInUser.avatarUrl), (width = "100"), (height = "100"));
```

![2](/assets/images/wetube/wetubeC8-00002.png)

## 8.8 Static File and Recap

### 1. 이미지 출력을 위해, 폴더를 브라우저에 노출 시키기

- 노출시킬 폴더 및 경로
- 의미 : 누군가 /uploads로 가려고 한다면, uploads 폴더의 내용을 보여줄 것

```jsx
//server.js
app.use("/uploads", express.static("uploads"));
```

## 8.9 Video Upload

### 1. upload.pug에 input 추가

```jsx
form(method="POST", enctype="multipart/form-data")
        label(for="video") Video File
        input(type="file", accept="video/*", required, id="video", name="video")
```

### 2. videoRouter에서 multer middleware 추가

- limits 로 파일에 제약사항을 추가 할 수 있음

```jsx
videoRouter
  .route("/upload")
  .all(protectorMiddleware)
  .get(getUpload)
  .post(videoUpload.single("video"), postUpload);
```

```jsx
export const avatarUpload = multer({
  dest: "uploads/avatars/",
  limits: {
    fileSize: 3000000,
  },
});
export const videoUpload = multer({
  dest: "uploads/videos/",
  limits: {
    fileSize: 50000000,
  },
});
```

### 3. videoURL 가져오기

> videoController.js 설정

- Video Schema에 video도 추가

```jsx
export const postUpload = async (req, res) => {
    const file = req.file;
        await Video.create({
            fileUrl:file.path,
        });
        return res.redirect("/");
```

```jsx
//Video.js
const videoSchema = new mongoose.Schema({
  fileUrl: { type: String, required: true },
});
```

> upload.pug에 encoding type 추가

```jsx
form((method = "POST"), (enctype = "multipart/form-data"));
```

### 4. watch.pug에서 video 출력

```jsx
video((src = "/" + video.fileUrl));
```

## 8.10 User Profile

### 목표

1. 유저 프로필
   1. 유저가 어떤 비디오를 업로드했는지 확인
2. 비디오를 보면, 어떤 유저가 업로드했는지 확인
3. 오직 비디오 업로더만, 비디오 편집 할 수 있도록 할 것
   1. 이를 위해, Video, User Model에 구분할 항목 추가해서 연결 시켜줄 거임

### 1. base.pug 에서 프로필 링크 생성

```jsx
li
    a(href=`/users/${loggedInUser._id}`) My Profile
```

### 2. userRouter.js 에서 URL 설정

```jsx
userRouter.get("/:id", see);
```

### 3. userController.js에서 기능 구현

```jsx
xport const see = async(req, res) => {
    const {id} = req.params;
    const user = await User.findById(id);
    if(!user){
        return res.status(404).render("404", {pageTitle:"User not found."});
    }
    return res.render("users/profile", {pageTitle: user.name, user:user })
};
```

1. URL에 있는 userID를 가져올 것
   1. [req.params.id](http://req.params.id) 로 URL의 id를 가져옴.
   2. 로그인 한 사람외에도 누구나 접근할 수 있어야 하기에, session 사용안함

## 8.11 Video Owner

### 목표

1. 'Video'와 'User' 모델을 연결하는 작업
   1. id를 이용할 예정
   2. User에는 해당 user가 업로드한 모든 영상의 id를 저장
   3. Video에는 해당 영상을 올린 user의 id를 저장

### 1. Video Model에 owner 추가

```jsx
const videoSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
});
```

- javascript 기본내장이 아닌, mongoose 고유의 타입
- ref로 'User' 모델과 연결

### 2. videoController.js에서, 비디오 업로드시 owner id 등록하도록 구현

```jsx
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  await Video.create({
    owner: _id,
  });
  return res.redirect("/");
};
```

![3](/assets/images/wetube/wetubeC8-00003.png)

### 3. 영상 주인에게만 편집 권한

- 영상 주인만 edit, delete 버튼을 볼수 있게
- 로그인 된 사람의 id와 owner object id가 동일할 경우 볼 수 있도록

```jsx
if String(video.owner) === String(loggedInUser._id)
        a(href=`${video.id}/edit`) Edit Video &rarr;
        br
        a(href=`${video.id}/delete`) Delete Video &rarr;
```

### 4. 업로더 (owner) 이름 출력

> videoController.js

```jsx
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  const owner = await User.findById(video.owner);
  return res.render("watch", { pageTitle: video.title, video, owner });
};
```

> watch.pug

```jsx
Uploaded by #{owner.name}
```

## 8.12 Video Owner part Two

- ref: "user"를 활용못하고 두번이나 DB를 찾는 건 좋은 방법이 아님

### 1. populate

> videoController.js

```jsx
const video = await Video.findById(id).populate("owner");
```

- populate 하기 전후의 video
  - mongoose가, obejectId가 User Model에서 온 것을 인지하고, User에서 정보를 가져옴.

![4](/assets/images/wetube/wetubeC8-00004.png)

![5](/assets/images/wetube/wetubeC8-00005.png)

### 2. 특정 사용자가 업로드한 모든 영상을 볼 수 있도록 하기

> upload.pug, 비디오 업로더 프로필링크 만들기

```jsx
 small Uploaded by
     a(href=`/users/${video.owner._id}`)=video.owner.name
```

> userController.js

```jsx
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);
  const videos = await Video.find({ owner: user._id });
  return res.render("users/profile", {
    pageTitle: user.name,
    user: user,
    videos,
  });
};
```

- URL id (video.owner.\_id)와 user의 id가 일치하는 비디오 정보들을 가져온다.

> profile.pug

```jsx
extends ../base
include ../mixins/video

block content
    each video in videos
        +video(video)
```

## 8.13 User's Videos

### 목표

- populate를 이용해서, 사용자가 업로드한 모든 영상 가져오기
- 이를 위해, User model에 videos array를 추가한 후, 영상 업로드시 각 video id(Video model과 연동)를 저장하고, 추후 프로필에 접속할때 user 정보에 들어가있는 videos id를 이용해서 영상들을 가져올 것.

### 1. User model에, videos 항목 추가

```jsx
//User.js
const userSchema = new mongoose.Schema({
  videos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Video" }],
});
```

- video는 하나의 user를 가지지만, user는 많은 video를 가질 수 있다
- 'videos' : Video model에 연결된 ObejectId로 구성된 array

### 2. postUpload시, 유저의 id를 User의 'videos' array에 저장

```jsx
//videoController.js
export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const newVideo = await Video.create({
    owner: _id,
  });
  const user = await User.findById(_id);
  user.videos.push(newVideo._id);
  user.save();
  return res.redirect("/");
};
```

- video에 owner(user) id를 추가해주는 것 처럼, user에도 업로드하는 영상의 id를 추가해줘야함.

### 3. 프로필 접속시, populate 적용

```jsx
export const see = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).populate("videos");
  return res.render("users/profile", { pageTitle: user.name, user: user });
};
```

> populate 하기 전 후의 videos 정보

![6](/assets/images/wetube/wetubeC8-00006.png)

![7](/assets/images/wetube/wetubeC8-00007.png)

## 8.14 Bugfix

### 문제

1. 현재 'save'할때마다, password가 해싱 되고 있음.
   - 계정만들때 한번 해싱되고, 업로드 할때 한번 더 해싱되서 추후에 로그인이 안됨.
2. 현재 edit, delete 기능이 모두에게 활성화되있음
   - 영상 주인에게만 권한을 주는게 바람직

### 해결1. Save Middleware에 조건 추가

```jsx
//User.js
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 5);
  }
});
```

- password 변경시에만 해싱
- 이 경우 this = user

### 해결2. 로그인유저와 비디오주인 id를 비교

```jsx
//videoController.js
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (String(video.owner) !== String(_id)) {
    return res.status(403).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit: ${video.title}`, video });
};
```

- 이 경우 video.owner는 obect이므로 String으로 변환해준다.
