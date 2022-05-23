---
title: "자바스크립트 마크다운 파싱 및 스타일링"
layout: single
categories: 프로젝트
tags: [ProPro, Markdown]
excerpt: "marked.js, github-markdown-css를 이용해서 마크다운 문법을 지원하는게 목적입니다."
header:
  overlay_image: /assets/images/project/pro-pro.jpeg
  overlay_filter: 0.5 
thumbnail: /assets/images/project/pro-pro.jpeg
toc: true
toc_sticky: true
---
> [pro-pro](https://propro.kr/)

## 서론

`marked.js`, `github-markdown-css`를 이용해서 마크다운 문법을 지원하는게 목적입니다. 과정을 간단하게 요약하자면 다음과 같습니다.

1. 텍스트를 정규표현식을 이용해 파싱해서, HTML 객체로 변환시킨다.
2. 각 HTML 태그에 맞게 스타일링 한다.

위 과정에서 정규표현식을 일일히 직접 작성하는 건 고통스럽기에, 많은 사람들이 이용해 검증받은 `marked.js` 를 이용합니다. 스타일링도 직접하는게 좋겠지만, 디자인 감각이 영 꽝이라 우선 `github`에서 사용하는 `markdown css`를 가져온뒤, 사이트에 맞게 커스텀할 예정입니다.

## 파싱

### marked.js 설치

[공식문서](https://marked.js.org/)

`npm i marked`

### 글 작성 및 미리보기

`keyUp` 이벤트에 반응해서 내용물을 파싱하는 간단한 구조입니다.

```jsx
import { marked } from 'marked';

...
<textarea 
	class="write__markdown--input" 
	onKeyUp={this.handleMarkdown}
>
	{content || ''}
</textarea>
<section
	class="markdown-body write__markdown--output"
></section>
...

handleMarkdown() {
    document.querySelector('.write__markdown--output').innerHTML = marked.parse(
      document.querySelector('.write__markdown--input').value,
    );
}
```

> 글 작성시 미리보기 (스타일적용)
> 

![스크린샷 2022-05-23 오후 2.54.55.png](/assets/images/project/propro_5.png)

## 스타일링

### github-markdown-css

[공식문서](https://github.com/sindresorhus/github-markdown-css)

`npm` 설치도 가능하지만, 원본 파일도 제공하고 있기 때문에 커스텀 측면에서도 더 편해 파일을 직접 가져다 사용했습니다.