---
title: "자바스크립트 JSX 적용"
layout: single
categories: 프로젝트
tags: [ProPro]
excerpt: "순수 자바스크립트로 프로젝트를 진행했었기에, html을 생성할때 innerHTML 메서드를 이용해 string 형태로 넘겨주곤 했습니다."
thumbnail: /assets/images/project/pro-pro.jpeg
toc: true
toc_sticky: true
---

## 서론
![propro배너](/assets/images/project/pro-pro.jpeg)
> [pro-pro](https://propro.kr/)

>[[JS] JS에 JSX 적용해보기](https://velog.io/@jiseong/JS-JS%EC%97%90-JSX-%EC%A0%81%EC%9A%A9%ED%95%B4%EB%B3%B4%EA%B8%B0)
>

순수 자바스크립트로 프로젝트를 진행했었기에, `html`을 생성할때 `innerHTML` 메서드를 이용해 `string` 형태로 넘겨주곤 했습니다.

> string을 통한 마크업
> 

```jsx
export default class CommentForm extends CustomComponent {
	...
	markup() {
		return `
		<textarea placeholder="댓글을 남겨주세요." class="writeComment" type="text" ></textarea>
		  <input class="submitComment" type="submit" value="등록" />
		`;
	}
	
	render() {
		this.container.innerHTML = markup();
	}
}
```

그러나 오타를 검출할 수 도 없고, 태그를 빼먹었는지도 확인이 안되 디버깅에 어려움을 겪었습니다. 그래서 JSX 문법을 사용할 수 있도록 세팅해보기로 했습니다.

## 설정

먼저 노드를 생성하고 붙이는 과정을 하는 함수를 만듭니다.

### jsx-runtime.js

```jsx
function addChild(parent, childNode) {
  // 아무것도 없을 때
  if (typeof childNode === 'undefined' || childNode === null) return;

  // false 일경우 아무것도 안보이게
  if (typeof childNode === 'boolean') return;

  // 배열 형식일 때
  if (Array.isArray(childNode))
    return childNode.forEach(c => addChild(parent, c));

  // object 형식일 때 이미 하위에서 node로 만들어진 것
  if (typeof childNode === 'object') {
    return parent.appendChild(childNode);
  }

  // string, number
  parent.appendChild(document.createTextNode(childNode));
}

function jsx(name, attributes, ...children) {
  const node =
    name === 'fragment'
      ? document.createDocumentFragment()
      : document.createElement(name);

  if (!(node instanceof DocumentFragment)) {
    Object.entries(attributes || {}).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }

  // 자식 노드들 처리
  (children || []).forEach(childNode => addChild(node, childNode));

  return node;
}

export default jsx;
```

### 웹팩

위의 함수로 트랜스파일 해주기 위해 플러그인을 설치해줍니다.

- `npm i @babel/plugin-transform-react-jsx -D`

이후 웹팩 플러그인에 설정을 추가해줍니다.

### webpack.common.js

```jsx
	...
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: [
            '@babel/plugin-transform-runtime',
            [
              '@babel/plugin-transform-react-jsx',
              {
                runtime: 'classic',
                pragma: 'jsx', // 타입스크립트에서는 preserve로 설정
              },
            ],
          ],
	...
  plugins: [
    new webpack.ProvidePlugin({
      jsx: [
        path.resolve(path.join(__dirname, 'src/utils/jsx-runtime.js')),
        'default',
      ],
    }),
	...
```