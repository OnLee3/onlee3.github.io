const defaultTheme = [...document.styleSheets].find((style) =>
  /(main.css)$/.test(style.href)
);
const darkTheme = [...document.styleSheets].find((style) =>
  /(main_dark.css)$/.test(style.href)
);

if (darkTheme) {
  const themeState = (() => {
    let theme = localStorage.getItem("theme");
    if (!theme) {
      theme = "default";
      localStorage.setItem("theme", "default");
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
