const defaultTheme = [...document.styleSheets].find((style) =>
  /(main.css)$/.test(style.href)
);
const darkTheme = [...document.styleSheets].find((style) =>
  /(main_dark.css)$/.test(style.href)
);

const commentsLightTheme = document.querySelector(
  "#utterances-comments__light-mode"
);
const commentsDarkTheme = document.querySelector(
  "#utterances-comments__dark-mode"
);

if (darkTheme) {
  const themeState = (() => {
    let theme = localStorage.getItem("theme");
    if (!theme) {
      theme = matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "default";
      localStorage.setItem("theme", theme);
    }
    return {
      isDark() {
        return localStorage.getItem("theme") === "dark";
      },
      setTheme(newState) {
        theme = newState;
        localStorage.setItem("theme", newState);
      },
    };
  })();

  function themePainter() {
    darkTheme.disabled = !themeState.isDark();
    defaultTheme.disabled = themeState.isDark();
    if (themeState.isDark()) {
      commentsLightTheme.style.display = "none";
      commentsDarkTheme.style.display = "block";
    } else {
      commentsLightTheme.style.display = "block";
      commentsDarkTheme.style.display = "none";
    }
  }

  function themeHandler() {
    themeState.setTheme(themeState.isDark() ? "default" : "dark");
    themePainter();
  }

  const themeBtn = document.querySelector("#toggle_dark_theme");
  if (themeState.isDark()) {
    themeBtn.checked = true;
  }
  themePainter();
  themeBtn.addEventListener("click", themeHandler);
}
