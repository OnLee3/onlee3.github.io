---
title: "코어 컴포넌트, 상세페이지 리팩토링"
layout: single
categories: 프로젝트
tags: [ProPro]
excerpt: "기존 팀프로젝트로 만들었던 propro를 유지보수하고 있습니다. 이번에는 각 컴포넌트의 생성자인 코어 컴포넌트의 생명주기, 메서드를 변경하였고, 그에 따라 영향받는 컴포넌트들을 리팩토링하게 되었습니다."
thumbnail: /assets/images/project/pro-pro.jpeg
toc: true
toc_sticky: true
---

## 서론
![propro배너](/assets/images/project/pro-pro.jpeg)
> [pro-pro](https://propro.kr/)

기존 팀프로젝트로 만들었던 propro를 유지보수하고 있습니다. 이번에는 각 컴포넌트의 생성자인 코어 컴포넌트의 생명주기, 메서드를 변경하였고, 그에 따라 영향받는 컴포넌트들을 리팩토링하게 되었습니다. 

## 코어 컴포넌트

기존에는 2주라는 매우 짧은 프로젝트 기간임을 고려해, 최소한의 템플릿을 짜놓고, 컴포넌트를 상속받아 각자의 방식으로 구현했습니다. 짧은 기간에 만족할만한 퀄리티를 냈기에 당시에는 만족했습니다만, 이제와서 개선하려 코드를 살펴보니 참여했던 5명 각각 작성한 코드들이 달라서 해석에 어려움을 겪었습니다. 혹은 똑같은 기능을 하는 메서드인데 각자 다른 이름으로 불필요하게 여러번 만든 경우도 많았습니다.

그래서 다른 개선을 하기전에, 먼저 컴포넌트 구조를 다시 잡아놓고 가는게 좋겠다는 의견이 지배적이어서 기존 컴포넌트를 변경했습니다.

### 기존 Core Component

```jsx
class Component {
  $dom;

  props;

  state;

  constructor(props) {
    this.props = props;
  }

  setState = nextState => {
    this.state = nextState;
    this.render();
  };

  createDom = (tagName, attrs) => {
    const $dom = document.createElement(tagName);
    for (const [key, value] of Object.entries(attrs)) {
      $dom[key] = value;
    }
    return $dom;
  };

  replaceElement = ($old, $new) => {
    $old.parentElement.replaceChild($new, $old);
  };

  appendRoot = ($root, $new, isNav = false) => {
    if (isNav) {
      if ($root.childNodes[0]) $root.replaceChild($new, $root.childNodes[0]);
      else $root.appendChild($new);
      return;
    }

    if ($root.childNodes[1]) $root.replaceChild($new, $root.childNodes[1]);
    else $root.appendChild($new);
  };

  addEvent = () => {};

  render = () => {};
}

export default Component;
```

### 변경된 Core Component

```jsx
class CustomComponent {
  constructor({ container, props }) {
    this.container = container;
    this.props = props;

    this.init();
    this.render();
    this.mounted();
    this.setEvent();
  }

  init() {}

  mounted() {}

  setState(nextState) {
    this.state = nextState;
    this.render();
  }

  render() {
    this.container.innerHTML = this.markup();
    this.renderCallback();
  }

  markup() {}

  renderCallback() {}

  setEvent() {}
}

export default CustomComponent;
```

변경한 컴포넌트는 `constructor`에 메서드 호출의 순서를 강제했습니다. 네이밍은 리액트에서 영감을 받아 `init`, `render`, `renderCallback` `mounted`, `setEvent` 로 했습니다. `render` 전후로 필요한 호출은 `init`과 `mounted`에 집어넣어서 사용하고, `setState`는 호출되면 업데이트 이후 다시 `render`를 호출합니다.

`render`는 `markup`을 리턴 받습니다. `markup`은 오버라이딩해서 사용하는 메서드로, 각 컴포넌트의 내용에 맞게 채워넣어서 사용합니다. 오버라이딩이나 그대로 상속받는걸 추상 클래스로 강제화 하고 싶었지만, `throw Error`를 코드에 집어넣는 직관적이지 못한 방법밖에 생각 나지 않아 시도하진 않았습니다. 이럴 때 타입스크립트의 필요성이 느껴지는 것 같습니다.

또한 컴포넌트에 있는게 부적절해 보이는 메서드들 (`createDom`, `replaceElement`)은 유틸 함수로 따로 빼둠으로써 역할을 좀 더 확실히 했습니다.

## 상세페이지 리팩토링

본격적인 적용에 앞서 제가 만들었던 상세페이지의 기존 코드를 살펴봤는데 몇 가지 큰 문제가 있었습니다. 사실 컴포넌트의 개선에 의해 생기는 문제는 아니고, 기존에 잘못 만든게 원인입니다. 긍정적으로 생각하면 예전보다 시야가 좋아진 것이겠죠. 리팩토링하며 다음 문제들을 함께 해결하고자 했습니다.

### 상태관리가 엉망진창이다.

상세페이지내에는 북마크, 댓글, 댓글입력창, 게시글수정, 기술스택 컴포넌트 가 있습니다. 그런데 각 컴포넌트가 각자의 `state`를 가지고 있고 공유가 되지 않고 있습니다. 그래서 북마크 버튼을 누르면 서버에 요청을 보낸뒤, `setState`를 거치지 않고 임의적으로 이미지를 변경하고 있습니다. 

> 보기에도 끔찍하고, 성능적으로도 좋지 않은 코드
> 

```jsx
export default class Bookmark extends Component {
  constructor(props) {
	  ...
  }

  render = () => {
		...
  };

  addEvent = () => {
		...
  };

  postBookmarkHandler = async event => {
    this.$dom.removeEventListener('click', this.postBookmarkHandler);
    const currentCount = this.$dom.querySelector('.bookmarkCount').innerHTML;
    this.$dom.querySelector('.bookmarkCount').innerHTML =
      Number(currentCount) + 1;
    const bookmarkIcon = this.$dom.querySelector('.bookmark');
    bookmarkIcon.setAttribute('src', filledMarkIcon);
    await axiosInstance
      .post(`users/mark/${this.props.postId}`, {}, { withCredentials: true })
      .then(res => {
        this.$dom.addEventListener('click', this.deleteBookmarkHandler);
        new Toast({ content: '북마크 되었습니다.', type: 'success' });
      });
  };

  deleteBookmarkHandler = async event => {
    this.$dom.removeEventListener('click', this.deleteBookmarkHandler);
    const currentCount = this.$dom.querySelector('.bookmarkCount').innerHTML;
    this.$dom.querySelector('.bookmarkCount').innerHTML =
      Number(currentCount) - 1;
    const bookmarkIcon = this.$dom.querySelector('.bookmark');
    bookmarkIcon.setAttribute('src', markIcon);
    await axiosInstance
      .delete(`users/mark/${this.props.postId}`, {
        withCredentials: true,
      })
      .then(res => {
        this.$dom.addEventListener('click', this.postBookmarkHandler);
        new Toast({ content: '북마크 해제 되었습니다.', type: 'success' });
      });
  };
}
```

추측하건데, 당시에는 상위컴포넌트로 상태를 넘겨주는 방법을 몰랐던 것 같습니다. 그래서 숫자와 이미지소스를 DOM으로 직접 접근해 변경하는 안타까운 일을 벌였습니다. 

**이번에는 모든 경우에 따라 일일히 직접 변경하지 않고, 상세페이지 하나에서 상태관리함으로써, 변경사항이 있으면 자동으로 리렌더링 하게 만들 것 입니다.** 이를 위해 상세페이지로 상태를 보내줄 방법을 선택해야했는데요. 상세페이지에서 북마크로 콜백함수를 넘겨주고, 이벤트 감지를 북마크에서 하는 방식도 있었지만, 하단에서 설명 드릴 이벤트 중복현상때문에 다른 방법을 선택했습니다.

사실 거창한건 없고, 모든 이벤트리스너와 콜백함수를 상세페이지로 옮겨줬습니다. 그리고 직접 DOM을 조작하는 부분을 `setState`로 변경해줌으로써, 북마크가 변경됨에 따라 자동으로 리렌더링되게 만들었습니다.

> 상세페이지에서 상태관리 하는 코드
> 

```jsx
export default class Bookmark extends CustomComponent {
  markup() {
    const { isMyBookmark, marks } = this.props;
    return `                
    <img class="bookmark" src='${isMyBookmark ? filledMarkIcon : markIcon}' />
    <span class="bookmarkCount">${marks}</span>`;
  }
}
```

```jsx
export default class DetailPage extends CustomComponent {
...
	deleteBookmark = async () => {
	    const { marks, postId } = this.state;
	    this.setState({
	      ...this.state,
	      marks: marks - 1,
	      isMyBookmark: false,
	    });
	    await axiosInstance
	      .delete(`users/mark/${postId}`, {
	        withCredentials: true,
	      })
	      .then(() => {
	        new Toast({ content: '북마크 해제 되었습니다.', type: 'success' });
	      });
	  };
	
	addBookmark = async () => {
	    const { marks, postId } = this.state;
	    this.setState({
	      ...this.state,
	      marks: marks + 1,
	      isMyBookmark: true,
	    });
	    await axiosInstance
	      .post(`users/mark/${postId}`, {}, { withCredentials: true })
	      .then(() => {
	        new Toast({ content: '북마크 되었습니다.', type: 'success' });
	      });
	  };
}
```

그 외에 상태관리가 필요한 것으로 댓글이 있습니다. 북마크와는 다르게 더 복잡한 구조로 만들어져있어서, 다음 기회에 어떻게 개선했는지 소개해드릴 수 있을 것 같습니다.

### 이벤트리스너가 중복되서 할당된다.

위의 변경으로 상세페이지의 상태가 변할때마다 리렌더링하는 구조가 되었습니다. 그런데 렌더링마다 다시 이벤트리스너를 붙여주기 때문에, 한번 클릭시 이벤트가 여러번 발생하는 끔찍한 사태가 일어나게 됬습니다. 다행히도 직접 `removeEventListener` 를 통해 일일히 모든 이벤트를 삭제하는 슬픈 일을 하지 않아도, 이벤트 버블링 현상을 이용해 해결할 수 있었습니다.

> 기존의 슬픈 코드
> 

```jsx
export default class DetailPage extends CustomComponent {
	...
	setEvent() {
	    if (this.state.isLoading) return;
	
	    const { userType, isMyBookmark } = this.state;
	    if (userType === 'loggedUser' || userType === 'author') {
	      this.container
	        .querySelector('.bookmarkWrapper')
	        .addEventListener(
	          'click',
	          isMyBookmark ? this.deleteBookmarkHandler : this.postBookmarkHandler,
	        );
	
	      addEvent(this.container, 'submit', '.commentForm', this.postComment);
	
	      const replyBtns = this.container.querySelectorAll('.commentReply');
	      const deleteBtns = this.container.querySelectorAll('.commentDelete');
	      replyBtns.forEach(replyBtn => {
	        replyBtn.addEventListener('click', this.createCommentForm);
	      });
	      deleteBtns.forEach(deleteBtn => {
	        deleteBtn.addEventListener('click', this.deleteComment);
	      });
	    } else {
	      addEvent(
	        this.container,
	        'click',
	        '.bookmarkWrapper',
	        this.notLoggedUserHandler,
	      );
	    }
	  }
}
```

> 이벤트 버블링을 이용해 이벤트를 관리하는 코드.
> 

```jsx
export default class DetailPage extends CustomComponent {
	...
	setEvent() {
	    this.container.addEventListener('click', ({ target }) => {
	      if (target.classList.contains('bookmark')) {
					...
	      }
	      if (target.classList.contains('commentDelete'))
	        this.deleteComment(target);
	
	      if (target.classList.contains('commentReply'))
	        this.createCommentForm(target);
	    });
	
	    this.container.addEventListener('submit', event => {
	      event.preventDefault();
	      if (event.target.classList.contains('commentForm')) this.addComment();
	    });
	  }
}
```

이벤트리스너는 상세페이지 전체 하나에만 부여하고, 클릭한 타겟의 클래스를 읽어들여 함수를 호출하는 방식입니다. 이를 통해 매 렌더링 마다 이벤트를 지우고 다시 붙이는 일은 피할 수 있습니다.

## 후기

추후로 개선하고 추가할 것이 산더미 같이 남아있습니다만, 그전에 기존 코드를 알아보기 쉽고 안정적으로 동작하게 만드는게 가장 중요한 것 같습니다. 만약 기존 코드처럼 상태관리가 안되고 있는데 이런저런 기능이 추가되면 생각대로 동작하기 어렵겠죠. 앞으로도 많은 타협을 하겠지만, 최대한 줄여나가면서 의도가 확실한 코드를 작성하도록 해야겠습니다.