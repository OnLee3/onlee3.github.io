---
title: "유튜브 클론코딩 : Video Recorder"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: '유저가 브라우저에서 영상 녹화를 할 수 있도록 구현합니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

# 13. VIDEOS RECORDER

## 13.0 Recorder Setup

`MediaDevices.getUserMedia()`

- navigator의 API인 mediaDevices 사용.
- 사용자에게 권한을 요청하고 수락하면 stream을 받아옴.

> recorder.js

```jsx
const startBtn = document.getElementById("startBtn");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  console.log(stream);
};

startBtn.addEventListener("click", handleStart);
```

`regenerator-runtime`

프론트엔드에서 async await를 쓰려면, regenerator runtime을 받아서 import 해야함.

아니면 promise문을 쓰면됨

- npm i regenerator-runtime

## 13.1 Video Preview

녹화 전 미리보기 기능 구현

> recorder.js

```jsx
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

const handleStart = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: true,
  });

  // video 소스를 stream에서 받아옴.
  video.srcObject = stream;
  video.play();
};

startBtn.addEventListener("click", handleStart);
```

> upload.pug

```jsx
block content
    div

// video의 src는 stream에서 받아올 것이기에 지정안함.
        video#preview
        button#startBtn Start Recording
```

## 13.2 Recording Video

녹화 기능 구현

- `new MediaRecorder(stream[, options])`

```jsx
const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;

// 버튼 클릭마다 eventlistener를 지우고 다시 만듬으로써, start, stop 기능 구현
const handleStop = () => {
  startBtn.innerText = "Start Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleStart);

  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recoring";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  // recorder.stop()이 실행되면, dataavailable data를 함께 가져오게 된다.
  // 여기에는 녹화된 비디오가 포함되어 있다.
  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (e) => {
    console.log("recording done");
    console.log(e.data);
  };
  recorder.start();
};

// 기본으로 미리보기 제공되도록 변경
const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 250, height: 500 },
  });
  video.srcObject = stream;
  video.play();
};

init();
startBtn.addEventListener("click", handleStart);
```

## 13.3 Recording Video part Two

```jsx
let recorder;

const handleStart = () => {
  startBtn.innerText = "Stop Recoring";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    // 브라우저 메모리에서만 사용가능한 URL을 만들어줌
    // 실제 URL이 있는 것이 아닌, 브라우저 메모리에 파일이 저장됨.
    const videoFile = URL.createObjectURL(event.data);

    // 미리보기 소스를 지우고, 녹화한 파일 주소로 대체
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};
```

## 13.4 Downloading the File

> recorder.js

```jsx
const handleDownload = () => {
  const a = document.createElement("a");
  a.href = videoFile;
  // URL로 가는 대신, 다운로드하게 만들어줌
  a.download = "MyRecording.webm";

  // body에 집어넣어줘야만, html상에 존재하게 됨.
  document.body.appendChild(a);

  // 유저대신 자동으로 클릭하게 만들어줌
  a.click();
};
```
