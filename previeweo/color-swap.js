(() => {
  // check for preact then load/reload app
  if (this.preact === undefined) {
    loadPreact(App);
  } else {
    App();
  }

  function loadPreact(cb) {
    let s = document.createElement('script');
    s.src = "https://www.weo2.com/tpn/c/C777/docs/htm-preact-standalone.js";
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
    const html = preact.html,
      render = preact.render,
      useState = preact.useState;



    // get document stylesheets, map only the weo stylesheets and get rid of the rest. then get the css text and the selector text for those style sheets and join them together into one array.
    const originalStyles = [...document.styleSheets].map(stysh => {
      try {
        return stysh.cssRules.length > 0
          ? [...stysh.cssRules].map(rule => (
            {
              cssText: rule.cssText,
              selectorText: rule.selectorText,
              style: rule.style
            }
          ))
          : null
      } catch (e) {
        console.error('skipping css because of error:', e);
        return null
      }
    }).filter(res => res !== null).reduce((acc, cur) =>
      acc && typeof acc[Symbol.iterator] === 'function'
        ? [...acc, cur]
        : acc && [acc, cur]
    );

    // get rgb and rgba colors used more than once
    let processedStyles = {};

    originalStyles.filter(style =>
      style.cssText && style.cssText.match(/color:/)
    ).map(sty =>
      sty.cssText.match(/color:(\s?)+(((<?rgba?)\([^\)]+\)))/)
        ? sty.cssText.match(/color:(\s?)+(((<?rgba?)\([^\)]+\)))/)[2]
        : ''
    ).reduce((acc, cur) => {
      if (typeof acc !== "object") { return acc = [cur] };
      return acc.some(sty => sty === cur)
        ? processedStyles[cur]++
        : processedStyles[cur] = 1
    });

    // get the styles mentioned more than once
    const repeatedRgbStyles = Object.keys(processedStyles).map(color =>
      processedStyles[color] <= 0
        ? null
        : color
    ).filter(res =>
      res !== null
    );

    // get all styles
    const rgbStyles = Object.keys(processedStyles).filter(style => style !== '');

    // make a color box
    const Box = (props) => {

      const textColor = () => {
        const { r, g, b } = rgb(props.color);
        if (Number(r) + Number(g) + Number(b) < 400) {
          return '#ffffff'
        } else {
          return '#000000'
        }
      };
      const initialHexcode = () => {
        const { r, g, b } = rgb(props.color);
        return rgb2Hex(r, g, b);
      };

      const handleColorChange = e => {
        const hexValue = e.target.value;
        const rgbValue = "rgb(" + hex2rgb(hexValue).red + ", " + hex2rgb(hexValue).green + ", " + hex2rgb(hexValue).blue + ")";

        props.setState({ ...props.state, ...{ [e.target.id]: hexValue } });
      }

      return (
        html`
          <div>
            <label
              style=${{
            minWidth: '50px',
            minHeight: '50px',
            padding: '.5em',
            margin: '.5em',
            display: "block",
            background: props.state[props.id] ? props.state[props.id] : initialHexcode(),
            color: textColor()
          }}
            >
              <input
                type="color" 
                id="${props.id}" 
                value=${props.state[props.id] ? props.state[props.id] : initialHexcode()}
                onInput=${handleColorChange}
                />
                ${props.children}
            </label>
          </div>
        `
      )
    }


    const ColorSwapWidget = (props) => {
      const colors = () => {
        const { r, g, b } = rgb(color);
        return repeatedRgbStyles.map(color => ({
          ["color" + (idx + 1)]: rgb2Hex(r, g, b)
        }));
      }
      const [state, setState] = useState({ ...colors });

      const closeModal = () => {
        document.querySelector('.color-swap-widget').style.display = 'none';
        document.querySelector('.color-swap-pop-button').style.display = 'inline-block';
      }
      const popModal = () => {
        document.querySelector('.color-swap-widget').style.display = 'block';
        document.querySelector('.color-swap-pop-button').style.display = 'none';
      }

      const boxes = repeatedRgbStyles.map((color, idx) => {
        return html`
        <${Box} 
          state=${state} 
          setState=${setState} 
          key="color${idx + 1}" 
          id="color${idx + 1}" 
          color=${state["color" + (idx + 1)]
            ? state.id
            : color}
        >
          Color ${idx + 1}
          ${console.log(state)}
        </${Box}>
        `
      });

      // color swap pop up widget
      return (
        html`
          <div>
            <button 
              onClick=${popModal}
              class="color-swap-pop-button"
              style=${{
            display: 'inline-block',
            padding: '1em',
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            zIndex: '1000'
          }}
            >
              Color Themes
            </button>
            <div
              class="color-swap-widget"
              style=${{
            display: 'none',
            minWidth: '200px',
            maxHeight: '400px',
            background: '#fff',
            border: 'solid 3px #ddd',
            padding: '0',
            position: 'fixed',
            bottom: '0',
            right: '0',
            overflowY: 'scroll',
            zIndex: '1000'
          }}
            >
              <div class="widget-top-bar" style=${{
            minHeight: '18px',
            background: '#ddd',
            position: 'relative'
          }}>
                <a 
                  class="close-modal" 
                  onClick=${closeModal} 
                  style=${{
            position: 'absolute',
            top: '7px',
            right: '18px',
            zIndex: '1'
          }}>
                <div style=${{
            transform: 'rotate(45deg)',
            position: 'absolute',
            border: 'solid 1px #000',
            width: '12px'
          }}></div>
                <div style=${{
            transform: 'rotate(-45deg)',
            position: 'absolute',
            border: 'solid 1px #333',
            width: '12px'
          }}></div>
              </a>
                </div>
              ${boxes}
            </div>
          </div>
    `)
    }

    const rgb = (rgbColor) => {
      const r = rgbColor && rgbColor.match(/rgb\((\d{1,3}),\s\d{1,3},\s\d{1,3}\)/)
        ? rgbColor.match(/rgb\((\d{1,3}),\s\d{1,3},\s\d{1,3}\)/)[1]
        : 0;
      const g = rgbColor && rgbColor.match(/rgb\(\d{1,3},\s(\d{1,3}),\s\d{1,3}\)/)
        ? rgbColor.match(/rgb\(\d{1,3},\s(\d{1,3}),\s\d{1,3}\)/)[1]
        : 0;
      const b = rgbColor && rgbColor.match(/rgb\(\d{1,3},\s\d{1,3},\s(\d{1,3})\)/)
        ? rgbColor.match(/rgb\(\d{1,3},\s\d{1,3},\s(\d{1,3})\)/)[1]
        : 0;
      return { r: r, g: g, b: b }
    };

    function rgb2Hex(r, g, b) {
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

      function componentToHex(c) {
        typeof c === "string" ? c = Number(c) : c;
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }
    }

    // Renders html
    render(html`
    <${ColorSwapWidget} />
    `, document.body);
  }
})();