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

    const input = JSON.parse(document.querySelector('.TPfilter-sort-input').innerText);

    // get tags from input and remove duplicates by creating a Set then converting it to an array
    const tags = [...new Set(input.map((site) => [...site.tags].map(tag => tag.trim())).reduce((acc, cur) => [...acc, ...cur]))];
    console.log(tags);

    // filter button
    const FilterButton = (props) => {
      //       whenever a checkbox is toggled, the tag is either added or removed from state
      const toggle = (e) => {
        if (e.target.checked === true) {
          return !props.state.selectedTags.some(tag => tag === e.target.name) && props.setState({ selectedTags: [...props.state.selectedTags, e.target.name] });
        }
        if (e.target.checked === false) {
          return props.state.selectedTags.some(tag => tag === e.target.name) && props.setState({ selectedTags: [...props.state.selectedTags.filter(tag => tag !== e.target.name)] });
        }
      }
      return html`
            <label for="checkbox-${props.name}" onInput=${toggle} class="filter-button">
              <input id="checkbox-${props.name}" type="checkbox" name="${props.name}" />
              ${props.name.replace(/TPtag-/, '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
          <a href=${link} class="siteCard">
            <div class="TPcard-hover">
              <p><small>Explore</small><br> ${props.explore}</p>
            </div>
            <img loading="lazy" class="TPimg-responsive" src="/tpnis/c/C256/img/${props.img}" />
          </a>
          <div class="TPcard-details">
            <h4>${props.detailsHeader}</h4>
            <p>${props.details}</p>
          </div>
      `);
    }

    // filter sort component
    const FilterSort = (props) => {
      const [state, setState] = useState({ selectedTags: [] });

      // check state for array of selected tags for entries. if no tags, use "input" array to display all site cards else display only sites with matching tags
      const selected = input.map(site => state.selectedTags.every(tag => site.tags.includes(tag)) ? site : null).filter(site => site !== null);
      const Sites = state.selectedTags === []
        ? input.map((site) =>
        (html`
          <div class="TPcol-md-6">
            <${SiteCard} 
              img="${site.img}" 
              key="${site.explore}" 
              explore=${site.explore} 
              detailsHeader=${site.detailsHeader} 
              details=${site.details} 
              link=${site.link}><//>
          </div>`))
        : selected.map((site) =>
        (html`
          <div class="TPcol-md-6">
            <${SiteCard} 
              img="${site.img}" 
              key="${site.explore}" 
              explore=${site.explore} 
              detailsHeader=${site.detailsHeader} 
              details=${site.details} 
              link=${site.link}><//>
          </div>`));

      // make a filter checkbox for each tag mentioned from across all sites
      const filterButtons = tags.map((tag) => html`<${FilterButton} name="${tag}" state=${state} setState=${setState}></${FilterButton}>`);

      return (html`
    <div class="filterSort">
      <div class="filterButtons">${filterButtons}</div>
      <div class="filteredSites TProw">
        <${Sites} />
      </div>
    </div>
    `)
    };

    // Renders html
    render(html`<${FilterSort} />`, document.querySelector('.TPfilter-sort-output'));
  }
})();

