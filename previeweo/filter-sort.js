(() => {
  // check for preact then load/reload app
  if (this.preact === undefined) {
    loadPreact(App);
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
    }
  } else {
    App();
  }

  function App() {
    // get preact functions
    const html = preact.html,
      render = preact.render,
      useState = preact.useState,
      useCallback = preact.useCallback;

    const input = JSON.parse(document.querySelector('.TPfilter-sort-input').innerText);
    let selected = [];

    // get tags from input and remove duplicates by creating a Set then converting it to an array
    const tags = [...new Set(input.map((site) => [...site.tags].map(tag => tag.trim())).reduce((acc, cur) => [...acc, ...cur]))];

    // filter button
    const FilterButton = (props) => {
      onClick = event => {
        selected = [];
        input.map((site) => {
          if (site.tags.includes(event.target.name)) {
            selected.push(site);
          }
        });
        // Renders html
        render(html`<${FilterSort} />`, document.querySelector('.TPfilter-sort-output'));
      }

      return tags.map((tag) => html`
        <button class="filter-button" name="${tag}" active="${tag.active}" onClick=${this.onClick}>${tag}</button>
        `);
    }

    // site card
    const SiteCard = (props) => {
      return html`
        <div class="siteCard">
          <img src="/tpnis/c/C256/img/${props.img}" />
        </div>
      `;
    }

    // filter sort component
    const FilterSort = (props) => {
      const sites = (!Array.isArray(selected) || !selected.length) ? input.map((site, idx) => html`<${SiteCard} img="${site.img}" key="${idx}" />`) : selected.map((site, idx) => html`<${SiteCard} img="${site.img}" key="${idx}" />`);

      return html`
    <div class="filterSort">
      <div class="filterButtons"><${FilterButton} /></div>
      <div class="filteredSites">
        ${sites}
      </div>
    </div>
    `;
    };

    // Renders html
    render(html`<${FilterSort} />`, document.querySelector('.TPfilter-sort-output'));
  }
})();