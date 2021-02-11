(() => {
  // check for preact then load/reload app
  if (this.preact === undefined) {
    loadPreact(App);
  } else {
    App();
  }

  function loadPreact(cb) {
    let s = document.createElement('script');
    s.src = "http://www.online-dds.com/tpn/c/C777/docs/htm-preact-standalone.js";
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
      useRef = preact.useRef;

    // get document stylesheets, map only the weo webpage stylesheet and get rid of the rest. then get the css text and the selector text for those style sheets and join them together into one array.
    const originalStyles = [...document.styleSheets].map((stysh, idx) => {
      try {
        return stysh.cssRules.length > 0
          && stysh.href.match(/webpage\.css\?vers/)
          ? [...stysh.cssRules].map(rule =>
            rule.cssText.match(/rgb/)
            && (
              // get back all the color styles used in css
              {
                cssText: rule.cssText,
                selectorText: rule.selectorText
              }
            )
            || null).filter(res =>
              // filter out null responses
              res !== null
            )
          : null
      } catch (e) {
        console.error('skipping css');
        return null
      }
    }).filter(res => res !== null).reduce((acc, cur) =>
      // flatten map into one array of cssStyleRules
      acc
        ? [...acc, ...cur]
        : console.log({ acc })
    );

    // create an object to store original theme color and associated styles where that color shows up, as well as an id and hex/rgba versions. 
    // Gets put into state later.
    const themeColors = [...[...document.styleSheets].filter(stysh =>
      stysh.href
      && stysh.href.match(/webpage\.css\?vers/) !== null
    )[0].cssRules].filter(rule =>
      rule.cssText.match(/TPweoc\d{1,}-?\d{0,}.*((<?rgba?)\([^\)]+\))/) !== null
    ).map((cssStyRule, idx) => {
      const themeColor = cssStyRule.cssText.match(/TPweoc\d{1,}-?\d{0,}.*((<?rgba?)\([^\)]+\))/)[1];
      const { r, g, b, a } = rgba(themeColor);
      const colorRegExp = new RegExp(themeColor.replace('(', '\\(').replace(')', '\\)'));
      const cssStyles = originalStyles.filter(style => style.cssText.match(colorRegExp) !== null).map(style => style.cssText);
      const colorRules = cssStyles.map(cSty => {
        const selector = cSty.split('{')[0];
        const rules = cSty.split('{')[1].split(';');
        const colorRule = rules.filter(rule =>
          rule.match(colorRegExp)
        ).map(rule =>
          selector + '{' + rule + '}'
        ).join(' ');
        return colorRule;
      });
      // get back just the theme colors and put in css syntax
      return {
        cssText: cssStyles,
        colorRules: colorRules,
        originalColor: themeColor,
        id: `Color ${idx + 1}-${themeColor}`,
        hexColor: rgbToHex(r, g, b),
        alpha: a * 100,
        hexAndAlpha: colorAndAlpha2rgbaHex(rgbToHex(r, g, b), a * 100)
      }
    });

    // put theme colors into an object so you can call it with the rgb original color
    let processedStyles = {};
    themeColors.forEach(color => { processedStyles[color.originalColor] = color });

    // start the components
    // make a color box
    const ColorSelectorBox = (props) => {
      const textColor = () => {
        const { red: r, green: g, blue: b } = hexToRgba(props.state.styles[props.id.toString().split('-')[1]].hexColor);
        if (Number(r) + Number(g) + Number(b) < 400) {
          return '#ffffff'
        } else {
          return '#000000'
        }
      };
      const textShadowColor = () => {
        const { red: r, green: g, blue: b } = hexToRgba(props.state.styles[props.id.toString().split('-')[1]].hexColor);
        if (Number(r) + Number(g) + Number(b) < 400) {
          return '#000000 0px 0px 6px'
        } else {
          return '#ffffff 0px 0px 6px'
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
              hexColor: hexValue,
              hexAndAlpha: colorAndAlpha2rgbaHex(hexValue, prevState.styles[colorId].alpha)
            }
          }
        }));
      }
      const handleAlphaChange = e => {
        const colorId = e.target.id.toString().split('-')[1];
        const alphaValue = e.target.value;
        props.setState(prevState => ({
          styles: {
            ...prevState.styles,
            [colorId]: {
              ...prevState.styles[colorId],
              alpha: alphaValue,
              hexAndAlpha: colorAndAlpha2rgbaHex(props.state.styles[props.id.toString().split('-')[1]].hexColor, alphaValue)
            }
          }
        }));
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
            background: (props.state.styles[props.id.toString().split('-')[1]].hexAndAlpha),
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
            <label
              style=${{
            minWidth: '50px',
            minHeight: '50px',
            padding: '.5em',
            margin: '.5em',
            display: "block",
            background: props.state.styles[props.id.toString().split('-')[1]].hexAndAlpha,
            color: textColor(),
            textShadow: textShadowColor(),
          }}
            >
              <input
                type="range"
                id="${props.id}-alpha"
                name="${props.id}-alpha"
                min="0"
                max="100"
                value=${props.state.styles[props.id.toString().split('-')[1]].alpha}
                onInput=${handleAlphaChange}
              />
              Alpha Transparency
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
        const colorReg = new RegExp(color.originalColor.replace('(', '\\(').replace(')', '\\)'));
        const lines = color.colorRules.join(' ').split(color.originalColor);
        return lines.map((line, idx) =>
          html`<${ColorStyle}
            key="${color.id}-ref${idx}"
            color=${(idx + 1) === lines.length
              ? ''
              : props.state.styles[color.originalColor].hexAndAlpha}
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
      const boxes = Object.keys(state.styles).map((color, idx) => {
        return html`
        <${ColorSelectorBox} 
          state=${state} 
          setState=${setState} 
          key=${state.styles[color].id}
          id=${state.styles[color].id}
          color=${state.styles[color].hexColor}
        >
          ${state.styles[color].id.toString().replace(/-rgb.*$/, '')}
        </${ColorSelectorBox}>
        `
      });
      // color swap pop up widget
      return (
        html`
          <div>
            <button 
              onClick=${popColorSwap}
              class="color-swap-pop-button btn TPbtn TPmargin-5"
            >
              Customize Color
            </button>
            <div
              class="color-swap-widget"
              style=${{
            display: 'none',
            minWidth: '200px',
            maxHeight: '80vh',
            background: '#fff',
            border: 'solid 3px #ddd',
            padding: '0',
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            overflowY: 'auto',
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

    const LogoUpload = (props) => {
      const fileElem = useRef(null);
      const handleClick = () => {
        fileElem.current.click();
      }
      const handleUpload = () => {
        const fileSrc = URL.createObjectURL(fileElem.current.files[0]);
        const img = document.createElement("img");
        img.src = fileSrc;
        img.style = { width: '0', height: '0', overflow: 'hidden' };
        img.onload = function () {
          URL.revokeObjectURL(fileSrc);
        }
        document.body.appendChild(img);
        document.querySelector('.TPnavbar-brand img').src = fileSrc;
      }
      return (html`
        <div class="LogoUpload">
          <input 
            ref=${fileElem}
            onChange=${handleUpload}
            type="file" 
            id="fileElem" 
            accept="image/*" 
            style=${{
          display: 'none',
          position: 'absolute',
          height: '1px',
          width: '1px',
          overflow: 'hidden',
          clip: 'rect(1px, 1px, 1px, 1px)'
        }}
          />
           <button
            class="btn TPbtn TPmargin-5"
            onClick=${handleClick}
           >Upload Logo</button>
        </div>
      `)
    }

    const InsertBandComponent = (props) => {
      return (html`
        <div class="InsertBandComponent">
          <button
            class="btn TPbtn TPmargin-5"
          >Insert Band Component</button>
        </div>
      `)
    }

    const CustomizeWidget = (props) => {
      return (html`
        <div 
          class="CustomizeWidget"
          style=${{
          display: 'flex',
          flexFlow: 'column nowrap',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          position: 'fixed',
          bottom: '15px',
          right: '15px',
          zIndex: '1000',
          background: 'rgba(255,255,255,.8)',
          boxShadow: '4px 4px 14px rgba(0,0,0,.5)'
        }}
        >
          <${ColorSwapWidget} />
          <${LogoUpload} />
          <${InsertBandComponent} />
        </div>
      `)
    }

    // color functions
    function rgba(rgbColor) {
      const r = rgbColor && rgbColor.match(/rgba?\((\d{1,3}),\s\d{1,3},\s\d{1,3}\)/)
        ? rgbColor.match(/rgba?\((\d{1,3}),\s\d{1,3},\s\d{1,3}\)/)[1]
        : 0;
      const g = rgbColor && rgbColor.match(/rgba?\(\d{1,3},\s(\d{1,3}),\s\d{1,3}\)/)
        ? rgbColor.match(/rgba?\(\d{1,3},\s(\d{1,3}),\s\d{1,3}\)/)[1]
        : 0;
      const b = rgbColor && rgbColor.match(/rgba?\(\d{1,3},\s\d{1,3},\s(\d{1,3})\)/)
        ? rgbColor.match(/rgba?\(\d{1,3},\s\d{1,3},\s(\d{1,3})\)/)[1]
        : 0;
      const a = rgbColor && rgbColor.match(/rgba\(\d{1,3},\s\d{1,3},\s\d{1,3},\s([\d\.]{1,})\)/)
        ? rgbColor.match(/rgba?\(\d{1,3},\s\d{1,3},\s\d{1,3},\s([\d\.]{1,})\)/)[1]
        : 1;
      return { r: r, g: g, b: b, a: a }
    };
    function rgbToHex(r, g, b, a) {
      if (a) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b) + componentToHex(Math.floor((+a / 100) * 255));
      }
      return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
      function componentToHex(c) {
        if (c === undefined || c === null) {
          c = 0;
        }
        typeof c === "string" ? c = Number(c) : c;
        var hex = c.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      }
    }
    function colorAndAlpha2rgba(hex, alpha) {
      const { red: r, green: g, blue: b } = hexToRgba(hex);
      const alphaPercent = Number(alpha) / 100;
      return `rgba(${r}, ${g} ${b}, ${alphaPercent})`;
    }
    function colorAndAlpha2rgbaHex(hex, alpha) {
      const { red: r, green: g, blue: b } = hexToRgba(hex);
      return rgbToHex(r, g, b, alpha);
    }
    function hexToRgba(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{0,2})$/.exec(hex);
      return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16),
        alpha: parseInt(result[4], 16)
      } : null;
    }

    // Renders html
    render(html`
    <${CustomizeWidget} />
    `, document.querySelector('#color-swap'));
  }
})();