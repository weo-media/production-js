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
    const html = preact.html,
      render = preact.render,
      useState = preact.useState;

    const input = JSON.parse(document.querySelector('.TPfilter-sort-input').innerText);

    // get tags from input and remove duplicates by creating a Set then converting it to an array
    const tags = [...new Set(input.map((site) => [...site.tags].map(tag => tag.trim())).reduce((acc, cur) => [...acc, ...cur]))];

    // filter button
    const FilterButton = (props) => {
      //       whenever a checkbox is toggled, the tag is either added or removed from state
      const toggle = (e) => {
        [...document.querySelectorAll('.siteCard')].forEach(sc => sc.style = 'opacity: .5;');
        setTimeout(() => {
          [...document.querySelectorAll('.siteCard')].forEach(sc => sc.style = 'opacity: 1;');
        }, 250);
        if (e.target.checked === true) {
          return !props.state.selectedTags.some(tag => tag === e.target.name) && props.setState({ selectedTags: [...props.state.selectedTags, e.target.name] });
        }
        if (e.target.checked === false) {
          return props.state.selectedTags.some(tag => tag === e.target.name) && props.setState({ selectedTags: [...props.state.selectedTags.filter(tag => tag !== e.target.name)] });
        }
      }
      return html`
            <label for="checkbox-${props.name}" onInput=${toggle} class="filter-label">
              <input id="checkbox-${props.name}" type="checkbox" name="${props.name}" />
              <span class="btn TPbtn filter-button">${props.name.replace(/TPtag-/, '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
            </label>
        `;
    }

    // site card
    const SiteCard = (props) => {
      const link = props.link
        && props.link.match(/^http/)
        && props.link
        || `https://${props.link}`;

      return (html`
        <div class="TPcol-md-6 siteCardContainer ${props.show ? 'show' : 'noShow'}">
          <a href=${link} class="siteCard">
            <div class="TPcard-hover">
              <p><small>Explore</small><br /> ${props.explore}</p>
            </div>
            <img loading="lazy" class="TPimg-responsive" src="/tpnis/c/C256/img/${props.img}" />
          </a>
          <div class="TPcard-details">
            <h4>${props.detailsHeader}</h4>
            <p>${props.details}</p>
          </div>
        </div>
      `);
    }

    // filter sort component
    const FilterSort = (props) => {
      const [state, setState] = useState({ selectedTags: [] });

      // if no tags selected, selected is all sites with show returning false
      // once tags are selected, show is set to true if site card matches all tags
      const selected = input.map(site => {
        if (state.selectedTags.length === 0) {
          return site
        }
        return state.selectedTags.every(tag => site.tags.includes(tag)) ? { ...site, show: true } : { ...site, show: false }
      });
      const sites = selected.map((site) => (
        html`
          <${SiteCard} 
            img="${site.img}" 
            key="${site.explore}" 
            explore=${site.explore} 
            detailsHeader=${site.detailsHeader} 
            details=${site.details} 
            link=${site.link}
            show=${state.selectedTags.length === 0 ? true : site.show}
          />
        `)
      );

      // make a filter checkbox for each tag mentioned from across all sites
      const filterButtons = tags.map((tag) => html`<${FilterButton} name="${tag}" state=${state} setState=${setState}></${FilterButton}>`);

      return (html`
    <div class="filterSort">
      <div class="filterButtons">${filterButtons}</div>
      <div class="filteredSites TProw">
        ${state.selectedTags.length > 0 && selected.filter(site => site.show === true).length === 0 && (html`
          <div className="TPcol-xs-12">
            <div class="oops">
              <h4>Ooops. Try again.</h4>
              <p>Couldn't find a match for that tag combination.</p>
            </div>
          </div>`)
        }
        ${sites}
      </div>
    </div>
    `)
    };

    // Renders the html
    render(html`<${FilterSort} />`, document.querySelector('.TPfilter-sort-output'));
  }
})();

