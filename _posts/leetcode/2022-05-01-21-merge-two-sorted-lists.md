---
title: "[LeetCode] Merge Two Sorted Lists"
layout: single
categories: [알고리즘]
tags: [LeetCode, 자바스크립트]
thumbnail: /assets/images/algorithm/leetcode_logo.png
header:
    overlay_image: /assets/images/algorithm/leetcode.jpg
    overlay_filter: 0.5
excerpt: "입출력을 리스트 자료구조로 강제 받는 문제입니다. 문제에서 제공하는 메서드를 활용해서, 두 정렬된 리스트를 하나의 정렬된 리스트로 병합하면 됩니다."
toc: true
toc_sticky: true
---

## Solve

입출력을 리스트 자료구조로 강제 받는 문제입니다. 문제에서 제공하는 메서드를 활용해서, 두 정렬된 리스트를 하나의 정렬된 리스트로 병합하면 됩니다.

정답을 담을 `ListNode` `answer`를 만들고, 이를 얕은 복사한 `head`를 만들어 줍니다.

```jsx
const answer= new ListNode();
let head = answer;
```


이렇게 한 이유는 두 리스트의 값을 비교하고 정답 List에 집어넣을때를 위함입니다. `head.next`를 사용하면, 같은 객체 주소를 참조하고 있으므로 `head`, `answer` 모두 next에 값이 추가 됩니다. 그러나 여기서 `head = head.next`를 사용하면 `head`만 초기화됩니다. **즉 head를 이용해 탐색하고 있는 값을 저장하고, 결과는 answer에 담을 수 있습니다.**

```jsx
	head.next = new ListNode(list2.val); 
	list2 = list2.next;
	head = head.next;
	...
return answer.next;
```

### 정답코드

```jsx
/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} list1
 * @param {ListNode} list2
 * @return {ListNode}
 */
var mergeTwoLists = function(list1, list2) {
    const answer= new ListNode();
    let head = answer;
    
    while (list1 || list2){
        if (!list1){
            head.next = new ListNode(list2.val); 
            list2 = list2.next;
        }
        else if (!list2){
            head.next = new ListNode(list1.val); 
            list1 = list1.next;
        }
        else if (list2.val <= list1.val){
            head.next = new ListNode(list2.val); 
            list2 = list2.next;
        }
        else if (list1.val < list2.val){
            head.next = new ListNode(list1.val); 
            list1 = list1.next;
        }
        head = head.next;
    }
    return answer.next;
};
```


## **[21. Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)**

**Easy**

You are given the heads of two sorted linked lists `list1` and `list2`.

Merge the two lists in a one **sorted** list. The list should be made by splicing together the nodes of the first two lists.

Return *the head of the merged linked list*.

**Example 1:**

![https://camo.githubusercontent.com/04964ab99b30c236e748d06907f2ecefa2ef7f4d0c4a7cb6837ceb122772a31e/68747470733a2f2f6173736574732e6c656574636f64652e636f6d2f75706c6f6164732f323032302f31302f30332f6d657267655f6578312e6a7067](https://camo.githubusercontent.com/04964ab99b30c236e748d06907f2ecefa2ef7f4d0c4a7cb6837ceb122772a31e/68747470733a2f2f6173736574732e6c656574636f64652e636f6d2f75706c6f6164732f323032302f31302f30332f6d657267655f6578312e6a7067){: .align-center}

```
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
```

**Example 2:**

```
Input: list1 = [], list2 = []
Output: []
```

**Example 3:**

```
Input: list1 = [], list2 = [0]
Output: [0]
```

**Constraints:**

- The number of nodes in both lists is in the range `[0, 50]`.
- `100 <= Node.val <= 100`
- Both `list1` and `list2` are sorted in **non-decreasing** order.