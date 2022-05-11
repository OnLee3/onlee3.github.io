---
title: "[CSS] BEM 적용"
layout: single
categories: 프로젝트
tags: [ProPro, CSS]
excerpt: "현재 프로젝트에서 스타일링을 할때, 클래스명을 가져와 CSS를 적용하고 있습니다. 그런데 각자 작성한 클래스명이 카멜케이스, 하이픈케이스 등 다양하고 통일이 되있지 않아 유지보수에 어려움을 겪고 있었는데요. 이번기회에 BEM(Block Element Modifier) 방식으로 통일하고자 했습니다."
header:
  overlay_image: /assets/images/project/pro-pro.jpeg
  overlay_filter: 0.5 
thumbnail: /assets/images/project/pro-pro.jpeg
toc: true
toc_sticky: true
---
> [pro-pro](https://propro.kr/)

## 서론

현재 프로젝트에서 스타일링을 할때, 클래스명을 가져와 CSS를 적용하고 있습니다. 그런데 각자 작성한 클래스명이 카멜케이스, 하이픈케이스 등 다양하고 통일이 되있지 않아 유지보수에 어려움을 겪고 있었는데요. 이번기회에 **BEM(Block Element Modifier)** 방식으로 통일하고자 했습니다.

## Block Element Modifier

**BEM**은 Block Element, Modifier 세가지 요소로 네이밍하는 **CSS 방법론**을 이야기합니다. 예시를 들며 설명드리겠습니다.

### Block, Element

```jsx
<div class="comment">
  <div class="comment__meta">
    <span class="comment__user-name"></span>
    <span class="comment__time"></span>
  </div>
  <h6 class="comment__content">{content}</h6>
</div>
```

`.comment__content`에서 `comment`가 **block** 이고, `content`가 **element**입니다. 직관적으로 보면 **block**은 하나의 큰 단위이고, **element**는 **block**의 구성요소임을 느낄 수 있는데요. 그럼 **block**과 **element**는 무엇이 다를까요? **바로 독립적으로 재사용 가능하다는 점입니다.** 위의 예시에서 `comment` 컴포넌트를 떼어다 다른곳에서 재사용할 수 있지만, `comment__content` 는 `comment` 내에서만 의미를 가지기 때문에 **element** 입니다. 

또한 캐스케이딩을 여러번 하지 않습니다. `user-name`이 `comment__meta__user-name`이 되는게 아니라 `comment__user-name`이 됩니다.

### Modifier

```jsx
<div class="comment comment--nested"></div>
```

**Modifier**는 상태나 속성을 나타냅니다. 생긴 게 조금 다를때, 혹은 상태에 따라 다르게 보여야할때 (hidden으로 숨기는등) 유용하게 사용할 수 있는데요. 위의 예시는 답글 컴포넌트입니다. 이전예시인 댓글 컴포넌트와 CSS 속성이 거의 같기 때문에 속성을 그대로 가져와 사용하고 답글에 필요한 부분만 수정해주는 방식입니다.