---
title: "유튜브 클론코딩 : Video Player"
layout: single
categories: 프로젝트
tags: [노마드코더, 유튜브]
header:
  overlay_image: '/assets/images/wetube/youtube.png'
  overlay_filter: 0.5
thumbnail: '/assets/images/wetube/youtube.png'
excerpt: '비디오 플레이어를 직접 구현해봅니다.'
toc: true
toc_sticky: true
---

> 해당 내용은 [노마드코더스](https://nomadcoders.co/) 유튜브 클론코딩 강의를 듣고 진행하며 정리한 내용입니다.
>

# 11. VIDEO PLAYER

## 11.0 Player Setup

### 목표

기본제공되는 비디오 플레이어가 있으나, 커스텀하기 위해 새로 만들 것.

현재는 모든 페이지에서 모든js를 불러오고 있으나, 그럴 필요가 없으니 이를 해결할 것.

### 역할별로 js나누기

```jsx
//webpack.config.js
module.exports = {
    entry : {
        main:"./src/client/js/main.js",
        videoPlayer:"./src/client/js/videoPlayer.js"
    },
		output : {
        filename: "js/[name].js"
```

- [name] : entry의 이름을 읽고 assets에 해당 이름으로 저장한다.

`block scripts`

- base.pug 하단에 추가해줌으로써, 페이지별로 js 설정 가능케함.

## 11.1 Play Pause

### HTML 생성

```jsx
//watch.pug
block content
    div
        button#play Play
        button#mute Mute
        span#time 00:00/00:00
        input(type="range", step="0.1" min="0", max="1")#volume
```

### JS 생성

```jsx
//videoPlayer.js
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volume = document.getElementById("volume");

// video와 audio는 HTMLMediaElement
// 정지시 재생, 그 외엔 정지
const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
};

// 비디오 상태에 따라 버튼 텍스트 변경
const handlePlay = () => {
  playBtn.innerText = "Pause";
};
const handlePause = () => {
  playBtn.innerText = "Play";
};

const handleMute = (e) => {};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
video.addEventListener("pause", handlePause);
video.addEventListener("play", handlePlay);
```

## 11.2 Mute and Unmute

```jsx
const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const muteBtn = document.getElementById("mute");
const time = document.getElementById("time");
const volumeRange = document.getElementById("volume");

const handlePlayClick = (e) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  // if video.paused === true : "Play"
  // else "Pause"
  playBtn.innerText = video.paused ? "Play" : "Pause";
};

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }

  // if video.muted === true : "Unmute"
  // else "Mute"
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  volumeRange.value = video.muted ? 0 : 0.5;
};

playBtn.addEventListener("click", handlePlayClick);
muteBtn.addEventListener("click", handleMute);
```

## 11.3 Volume

```jsx
// Global 변수 volumeValue 선언
let volumeValue = 0.5;
video.volume = volumeValue;

const handleMute = (e) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtn.innerText = video.muted ? "Unmute" : "Mute";
  // mute 해제시, 이전 볼륨으로 돌아감.
  volumeRange.value = video.muted ? 0 : volumeValue;
};

// volumeValue에 값을 저장함으로써, 나중에 mute 해제시, 볼륨 찾는데 이용
const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = "Mute";
  }
  volumeValue = value;
  video.volume = value;
};

muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
```

## 11.4 Duration and Current Time

```jsx
//watch.pug
div
            span#currentTime 00:00
            span  /
            span#totalTime 00:00
```

```jsx
const currentTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");

// 비디오의 총 길이 가져옴
const handleLoadedMetaData = () => {
  totalTime.innerText = Math.floor(video.duration);
};

// 비디오의 현재 구간 시간 가져옴
const handleTimeUpdate = () => {
  currentTime.innerText = Math.floor(video.currentTime);
};

// loadedmetadata : 브라우저가 video의 메타데이터를 로드했을때 발생
// timeupdate : 비디오의 시간이 변경됬을때, 함수를 실행
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
```

## 11.5 Time Formating

`new Date()`

- ()안에 ms 단위로 받아서, "1970-01-01T00:00:00.000Z" 형식으로 출력함
  - 컴퓨터는 1970년 1월1일부터 날짜를 셈
- 이를 이용해서 비디오 시간포멧을 얻어오고, `substr(from, length)`를 이용하여 `00:00:00` 만 추출해옴

```jsx
const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substr(11, 8);

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
};
```

## 11.6 Timeline

> watch.pug

```jsx
block content
// 기본 내장 controls 삭제함
    video(src="/" + video.fileUrl)
        div
// max는 비디오 총길이를 따라감
            input(type="range", step="1", value="0", min="0")#timeline
```

> videoPlayer.js

```jsx
// timeline 조절시, input의 value를 가져와서, 비디오 시간과 동일하게 만듬
const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value;
};

// timeline input의 max값을 비디오 길이로 지정
const handleLoadedMetaData = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

// timeline input이 비디오 재생상태를 따라가게함.
const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime);
};

timeline.addEventListener("input", handleTimelineChange);
video.addEventListener("timeupdate", handleTimeUpdate);
```

## 11.7 Fullscreen

```jsx
const fullScreenBtn = document.getElementById("fullScreen");
const videoContainer = document.getElementById("videoContainer");

const handleFullScreen = () => {
  //document.fullscreenElement : 현재 fullscreen상태인 element가 있는지 확인해줌.
  // 없으면 null을 출력하고, 있다면 해당 element를 출력
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenBtn.innerText = "Enter Full Screen";
  } else {
    videoContainer.requestFullscreen();
    fullScreenBtn.innerText = "Exit Full Screen";
  }
};

fullScreenBtn.addEventListener("click", handleFullScreen);
```

## 11.8 Controls Events part One

### 구현할 것

1. 마우스가 스크린에 진입시, 컨트롤바가 보이게 하는 기능.
2. 마우스가 진입하고 가만히 있으면, 컨트롤바를 숨기는 기능.
3. 마우스가 나가도, 몇초동안 컨트롤바를 보여주다 숨기는 기능.

```jsx
let controlsTimeout = null;

//controlsTimeout이 존재한다면, mouseleave 이벤트 실행을 취소시킨다.
const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  videoControls.classList.add("showing");
};

const handleMouseLeave = () => {
  //setTimeout의 id를 글로벌변수에 저장해두고, mousemove 감지시에 이를 사용한다.
  controlsTimeout = setTimeout(() => {
    videoControls.classList.remove("showing");
  }, 3000);
};

video.addEventListener("mousemove", handleMouseMove);
video.addEventListener("mouseleave", handleMouseLeave);
```

`setTimeout(callback, ms)`

- callback함수를 ms만큼 지연한후 실행하는 기능 이외에도, return으로 고유한 id를 부여받는다.

## 11.9 Controls Events part Two

마우스가 3초이상 머무를시, 컨트롤바를 숨기는 기능 구현

```jsx
let controlsMovementTimeout = null;

// 실행중인 hideControls가 있다면, 해당 함수와 변수를 초기화시켜주고 다시 실행한다.
// 즉 예전 Timeout을 지우고 새 Timeout을 시작한다.
const handleMouseMove = () => {
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }

  // 컨트롤바를 숨기는 기능이 3초뒤에 실행되고 해당 정보를 변수를 이용해 저장해둠.
  videoControls.classList.add("showing");
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};
```
