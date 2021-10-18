(() => {
  // check for preact then load/reload app
  if (this.preact === undefined) {
    loadPreact(App);
  } else {
    App();
  }

  function loadPreact(cb) {
    let s = document.createElement('script');
    s.src = "https://www.online-dds.com/tpn/c/C777/docs/htm-preact-standalone.js";
    s.async = true;
    document.body.appendChild(s);
    if (s.readyState) {
      s.onreadystatechange = function () {
        if (s.readyState === "loaded" || s.readyState === "complete") {
          s.onreadystatechange = null;
          if (cb && typeof cb === "function") {
            cb();
          }
        }
      };
    } else {
      s.onload = function () {
        if (cb && typeof cb === "function") {
          cb();
        }
      };
    }
  };

  function App() {
    // get preact functions
    const html = preact.html, render = preact.render, useState = preact.useState, useRef = preact.useRef, useCallback = preact.useCallback, useEffect = preact.useEffect;

    // code goes here
    // ..............
    const MainComponent = (props) => {
      const [data, setData] = useState('World');
      return (
        html`
        <div>
          <p>Hello ${data}!</p>
        </div>
        `
      )
    }

    // Renders html
    render(html`
    <${MainComponent} />
    `, document.querySelector('#TestId'));
  }
})();
