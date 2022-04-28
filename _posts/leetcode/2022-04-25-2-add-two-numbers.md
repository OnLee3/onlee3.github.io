---
title: "[LeetCode] Add two numbers"
layout: single
categories: [알고리즘]
tags: [LeetCode, 자바스크립트]
thumbnail: https://leetcode.com/static/images/LeetCode_logo_rvs.png
excerpt: "언뜻 배열로 착각하고 reverse같은 메서드들을 시도해볼 수 있지만, List의 형태로 주어지기때문에 배열에서 사용하는 메서드들을 사용할 수 없습니다.문제 설명에서, 각 List가 어떻게 구성되는지 알수있는 함수가 주어집니다."
toc: true
toc_sticky: true
---

## **[2. Add Two Numbers](https://leetcode.com/problems/add-two-numbers/)**

### **Medium**

---

You are given two **non-empty** linked lists representing two non-negative integers. The digits are stored in **reverse order**, and each of their nodes contains a single digit. Add the two numbers and return the sum as a linked list.

You may assume the two numbers do not contain any leading zero, except the number 0 itself.

**Example 1:**

![img](https://assets.leetcode.com/uploads/2020/10/02/addtwonumber1.jpg){: .align-center}

```
Input: l1 = [2,4,3], l2 = [5,6,4]
Output: [7,0,8]
Explanation: 342 + 465 = 807.
```

**Example 2:**

```
Input: l1 = [0], l2 = [0]
Output: [0]
```

**Example 3:**

```
Input: l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]
Output: [8,9,9,9,0,0,0,1]
```

**Constraints:**

- The number of nodes in each linked list is in the range `[1, 100]`.
- `0 <= Node.val <= 9`
- It is guaranteed that the list represents a number that does not have leading zeros.

## Solve

언뜻 배열로 착각하고 reverse같은 메서드들을 시도해볼 수 있지만, List의 형태로 주어지기때문에 배열에서 사용하는 메서드들을 사용할 수 없습니다.문제 설명에서, 각 List가 어떻게 구성되는지 알수있는 함수가 주어집니다.

```jsx
function ListNode(val, next) {
	this.val = (val===undefined ? 0 : val)
	this.next = (next===undefined ? null : next)
}
```

이를 이용해, l1과 l2를 앞에서부터 더해나가서, 정답 List의 Next에 하나씩 붙여줍니다.

```jsx
var addTwoNumbers = function(l1, l2) {
    const List = new ListNode(0);
    let head = List;
    let sum = 0;
    let carry = 0;
    
    while(l1 || l2 || sum > 0){
        if (l1) {
            sum += l1.val;
            l1 = l1.next;
        }
        
        if (l2) {
            sum += l2.val;
            l2 = l2.next;
        }
        
        if (sum >= 10){
            carry = 1;
            sum = sum - 10;
        }
        
        head.next = new ListNode(sum);
        head = head.next;
        
        sum = carry;
        carry = 0;
    }
    return List.next;
};
```