---
title: "[LeetCode] Longest common prefix"
layout: single
categories: [알고리즘]
tags: [LeetCode, 자바스크립트]
thumbnail: /assets/images/algorithm/leetcode_logo.png
header:
    overlay_image: /assets/images/algorithm/leetcode.jpg
    overlay_filter: 0.5
excerpt: 문자열로 이루어진 배열이 주어집니다. 이 때 각 문자의 공통 접두사를 출력하면 되는 문제입니다.
toc: true
toc_sticky: true
---

## **[14. Longest Common Prefix](https://leetcode.com/problems/longest-common-prefix/)**

### **Easy**

---

Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string `""`.

**Example 1:**

```
Input: strs = ["flower","flow","flight"]
Output: "fl"

```

**Example 2:**

```
Input: strs = ["dog","racecar","car"]
Output: ""
Explanation: There is no common prefix among the input strings.

```

**Constraints:**

- `1 <= strs.length <= 200`
- `0 <= strs[i].length <= 200`
- `strs[i]` consists of only lower-case English letters.

## Solve

문자열로 이루어진 배열이 주어집니다. 이 때 각 문자의 공통 접두사를 출력하면 되는 문제입니다.

저는 모든 문자열중, 가장 짧은 문자열의 길이만큼 각 문자열들을 순회해서, 문자가 모두 같다면 정답 문자열에 카운팅하고, 하나라도 다를 경우 현재 담겨있는 정답을 리턴했습니다. 빈문자열에 대한 예외처리가 조금 까다로웠는데 최소 문자열길이가 없다면 빈문자열을 리턴함으로써 해결했습니다.

```jsx
var longestCommonPrefix = function(strs) {
    let answer = "";
    let n = Number.MAX_SAFE_INTEGER;
    strs.forEach((str) => n = Math.min(str.length, n));
    if (n) {
        for (let i=0; i<n; i++){
            const firstLetter = strs[0][i];
            for (let j=1; j<strs.length; j++){
                if (strs[j][i] !== firstLetter) return answer;
            }
            answer += firstLetter;
        }
    }
    return answer;
};
```