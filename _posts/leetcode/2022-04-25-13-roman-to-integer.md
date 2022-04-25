---
title: "[LeetCode] Roman to integer"
layout: single
categories: [알고리즘]
tags: [LeetCode, 자바스크립트]
thumbnail: https://leetcode.com/static/images/LeetCode_logo_rvs.png
excerpt: 연속된 두개의 문자의종류에 따라 값이 변경될 수 있습니다. 따라서 그 둘이 예외 케이스인지 확인해보고 그에 따라 적절한 값을 더해줍니다.
toc: true
toc_sticky: true
---

## **[13. Roman to Integer](https://leetcode.com/problems/roman-to-integer/)**

### **Easy**

---

Roman numerals are represented by seven different symbols: `I`, `V`, `X`, `L`, `C`, `D` and `M`.

```
SymbolValue
I             1
V             5
X             10
L             50
C             100
D             500
M             1000
```

For example, `2` is written as `II` in Roman numeral, just two one's added together. `12` is written as `XII`, which is simply `X + II`. The number `27` is written as `XXVII`, which is `XX + V + II`.

Roman numerals are usually written largest to smallest from left to right. However, the numeral for four is not `IIII`. Instead, the number four is written as `IV`. Because the one is before the five we subtract it making four. The same principle applies to the number nine, which is written as `IX`. There are six instances where subtraction is used:

- `I` can be placed before `V` (5) and `X` (10) to make 4 and 9.
- `X` can be placed before `L` (50) and `C` (100) to make 40 and 90.
- `C` can be placed before `D` (500) and `M` (1000) to make 400 and 900.

Given a roman numeral, convert it to an integer.

**Example 1:**

```
Input: s = "III"
Output: 3
Explanation: III = 3.
```

**Example 2:**

```
Input: s = "LVIII"
Output: 58
Explanation: L = 50, V= 5, III = 3.
```

**Example 3:**

```
Input: s = "MCMXCIV"
Output: 1994
Explanation: M = 1000, CM = 900, XC = 90 and IV = 4.
```

**Constraints:**

- `1 <= s.length <= 15`
- `s` contains only the characters `('I', 'V', 'X', 'L', 'C', 'D', 'M')`.
- It is **guaranteed** that `s` is a valid roman numeral in the range `[1, 3999]`.

## Solve

연속된 두개의 문자의종류에 따라 값이 변경될 수 있습니다. 따라서 그 둘이 예외 케이스인지 확인해보고 그에 따라 적절한 값을 더해줍니다.

```jsx
/**
 * @param {string} s
 * @return {number}
 */

const roman = {
    "I": 1,
    "V": 5,
    "X": 10,
    "L": 50,
    "C": 100,
    "D": 500,
    "M": 1000
}

const except = {
    "IV": 4, 
    "IX": 9, 
    "XL": 40, 
    "XC": 90, 
    "CD": 400, 
    "CM": 900
}

var romanToInt = function(s) {
    answer=0
    for (let i=1; i<=s.length; i++){
        if ((s[i-1]+s[i]) in except) {
            answer += except[s[i-1]+s[i]];
            i += 1;
        } else {
            answer += roman[s[i-1]]
        }
    }
    return answer
};
```