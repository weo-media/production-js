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
    const colorSwap = document.querySelector('#color-swap') ? document.querySelector('#color-swap') : document.createElement('div');
    colorSwap.id = 'color-swap';
    document.querySelector('body').insertAdjacentElement("beforeend", colorSwap);

    // get preact functions
    const html = preact.html,
      render = preact.render,
      useState = preact.useState,
      useRef = preact.useRef,
      Fragment = preact.fragment;



    // get document stylesheets, map only the weo stylesheets and get rid of the rest. then get the css text and the selector text for those style sheets and join them together into one array.
    const originalStyles = [...document.styleSheets].map((stysh, idx) => {
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
        console.error('skipping css:', document.styleSheets[idx], e);
        return null
      }
    }).filter(res => res !== null).reduce((acc, cur) =>
      acc
        ? [...acc, ...cur]
        : console.log({ acc })
    );

    // get rgb and rgba colors used more than once
    let processedStyles = {};

    originalStyles.filter(style =>
      style.cssText && style.cssText.match(/((<?rgb)\([^\)]+\))/)
    ).map(sty => ({
      color: sty.cssText.match(/((<?rgb)\([^\)]+\))/)[1],
      count: 1,
      cssText: [sty.cssText]
    })
    ).forEach((style) => {

      // distill style matches and get css text to overwrite later
      if (typeof style === "object") {
        if (typeof processedStyles[style.color] === 'object' && processedStyles[style.color] !== undefined) {
          processedStyles[style.color].count++;
          if (processedStyles[style.color].cssText.length > 1) {
            processedStyles[style.color].cssText = [...processedStyles[style.color].cssText, style.cssText];
          } else if (processedStyles[style.color].cssText.length <= 1) {
            processedStyles[style.color].cssText = [processedStyles[style.color].cssText[0], style.cssText];
          }
        } else if (processedStyles[style.color] === undefined) {
          const { r, g, b } = rgb(style.color);
          processedStyles[style.color] = {
            originalColor: style.color,
            color: style.color,
            count: 1,
            cssText: [style.cssText],
            id: ["Color " + ((Object.keys(processedStyles).length) + 1) + '-' + style.color],
            hexColor: rgb2Hex(r, g, b)
          }
        }

      };
    });

    // make a color box
    const Box = (props) => {

      const textColor = () => {
        const { red: r, green: g, blue: b } = hex2rgb(props.state.styles[props.id.toString().split('-')[1]].hexColor);
        if (Number(r) + Number(g) + Number(b) < 400) {
          return '#ffffff'
        } else {
          return '#000000'
        }
      };

      const handleColorChange = e => {
        const colorId = e.target.id.toString().split('-')[1];
        const hexValue = e.target.value;

        props.setState(prevState => ({
          styles: {
            ...prevState.styles,
            [colorId]: {
              ...prevState.styles[colorId],
              hexColor: hexValue
            }
          }
        }));
      }

      return (
        html`
          <div>
            <label
              .style=${{
            minWidth: '50px',
            minHeight: '50px',
            padding: '.5em',
            margin: '.5em',
            display: "block",
            background: props.state.styles[props.id.toString().split('-')[1]].hexColor,
            color: textColor()
          }}
            >
              <input
                type="color" 
                id="${props.id}" 
                value=${props.state.styles[props.id.toString().split('-')[1]].hexColor}
                onInput=${handleColorChange}
                />
                ${props.children}
            </label>
          </div>
        `
      )
    }

    const ColorStyle = (props) => {
      return (
        html`
            ${props.children}
            ${props.color}
        ` )
    }

    const ReColorStyles = (props) => {

      const allStyles = Object.values(props.state.styles).map(color => {
        // console.log(color.cssText.join(' '));
        const lines = color.cssText.join(' ').split(color.originalColor);
        return lines.map((line, idx) =>
          html`<${ColorStyle}
            key="${color.id}-ref${idx}"
            color=${(idx + 1) === lines.length
              ? ''
              : props.state.styles[color.originalColor].hexColor}
            >
              ${line}
            </${ColorStyle}>`);
      });

      return (html`
        <style>
          ${allStyles}
        </style>
      `)
    }


    const ColorSwapWidget = (props) => {

      const [state, setState] = useState({ styles: processedStyles });


      const closeColorSwap = () => {
        document.querySelector('.color-swap-widget').style.display = 'none';
        document.querySelector('.color-swap-pop-button').style.display = 'inline-block';
      }
      const popColorSwap = () => {
        document.querySelector('.color-swap-widget').style.display = 'block';
        document.querySelector('.color-swap-pop-button').style.display = 'none';
      }

      console.log(state);
      const boxes = Object.keys(state.styles).map((color, idx) => {
        return html`
        <${Box} 
          state=${state} 
          setState=${setState} 
          key=${state.styles[color].id}
          id=${state.styles[color].id}
          color=${state.styles[color].hexColor}
        >
          ${state.styles[color].id.toString().replace(/-rgb.*$/, '')}
        </${Box}>
        `
      });

      // color swap pop up widget
      return (
        html`
          <div>
            <button 
              onClick=${popColorSwap}
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
                  class="close-color-swap" 
                  onClick=${closeColorSwap} 
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
            <${ReColorStyles} state=${state}/>
          </div>
    `)
    }

    function rgb(rgbColor) {
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
    `, document.querySelector('#color-swap'));
  }
})();