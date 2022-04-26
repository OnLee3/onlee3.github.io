---
title: "[LeetCode] Valid Parentheses"
layout: single
categories: [알고리즘]
tags: [LeetCode, 자바스크립트]
thumbnail: https://leetcode.com/static/images/LeetCode_logo_rvs.png
excerpt: 같은 타입의 괄호로 닫을 수 있는 것은 물론이고, 순서도 지켜야한다고 명시되있습니다. 가령 `({)}` 같은 형태로 주어진다면 `false`를 리턴해야할겁니다. 그래서 단순히 삽입할 원소와 배열 맨뒤의 원소만 비교하면 되기 때문에 스택 자료를 이용하여 풀이할 수 있는 문제입니다.
toc: true
toc_sticky: true
---

## [20. Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
### **Easy**

Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.
An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

**Example 1:**
```
Input: s = "()"
Output: true
```
**Example 2:**
```
Input: s = "()[]{}"
Output: true
```
**Example 3:**
```
Input: s = "(]"
Output: false
```
**Constraints:**
- `1 <= s.length <= 104`
- `s` consists of parentheses only `'()[]{}'`.

## Solve

같은 타입의 괄호로 닫을 수 있는 것은 물론이고, 순서도 지켜야한다고 명시되있습니다. 가령 `({)}` 같은 형태로 주어진다면 `false`를 리턴해야할겁니다. 그래서 단순히 삽입할 원소와 배열 맨뒤의 원소만 비교하면 되기 때문에 스택 자료를 이용하여 풀이할 수 있는 문제입니다.

### 사전자료형을 이용한 풀이

```jsx
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    const open = ["(", "[", "{"]
    const close = {
        "}": "{",
        "]": "[",
        ")": "("
    }
    
    for (let i=0; i<s.length; i++){
        if (open.includes(s[i])) stack.push(s[i])
        else if (close[s[i]] === stack[stack.length-1]) {
            stack.pop()
        }
        else return false;
    }
    if (stack.length > 0) return false;
    return true;
};
```

### 간단하게 조건문으로 해결한 풀이

```jsx
/**
 * @param {string} s
 * @return {boolean}
 */
var isValid = function(s) {
    const stack = [];
    
    for (let i=0; i<s.length; i++){
        const c = s.charAt(i);
        if (c === "(") stack.push(")");
        else if (c === "{") stack.push("}");
        else if (c === "[") stack.push("]");
        else if (c !== stack.pop()) return false;
    }
    
    return stack.length === 0;
};
```


