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
    let selectedSites = [];
    let selectedTags = [];

    // get tags from input and remove duplicates by creating a Set then converting it to an array
    const tags = [...new Set(input.map((site) => [...site.tags].map(tag => tag.trim())).reduce((acc, cur) => [...acc, ...cur]))];
    console.log(tags);

    // filter button
    const FilterButton = (props) => {
      toggle = event => {
        selectedSites = [];                                   // clear selectedSites array
        selectedTags.indexOf(event.target.name) > -1 ?        // is tag already selected?
          selectedTags.splice(selectedTags.indexOf(event.target.name), 1) : // remove if yes
          selectedTags.push(event.target.name);               // add if no

        input.forEach((site) => {                             // check each site option
          if (selectedTags.every(tag => site.tags.includes(tag))) { // if all the selected tags are in that site's tags,
            selectedSites.push(site);                         // add that site to the selectedSites
          }
        });

        // re-renders html
        let selected = '';
        if (selectedTags.length && !selectedSites.length) {
          selected = "empty";
        }
        else {
          selected = "selected";
        }

        render(html`<${FilterSort} selected="${selected}" />`, document.querySelector('.TPfilter-sort-output'));
      }

      return html`
          <input type="checkbox" class="filter-button" name="${props.name}" active="${props.active}" onClick=${this.toggle} />
          <label>${props.name}</label>
        `;
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
      console.log(`selected: ${props.selected}`);
      let sites = '';
      // check "selectedSites" array for entries. if no entries, use "input" array to display all site cards else display site cards in "selectedSites" array
      if (props.selected == "none") {
        sites = input.map((site, idx) => html`<${SiteCard} img="${site.img}" key="${idx}" />`);
      }
      else if (props.selected == "selected") {
        sites = selectedSites.map((site, idx) => html`<${SiteCard} img="${site.img}" key="${idx}" />`);
      }
      else if (props.selected == "empty") {
        sites = "No matches were found";
      }

      const filterButtons = tags.map((tag) => html`<${FilterButton} name="${tag}" ></${FilterButton}`);

      return html`
    <div class="filterSort">
      <div class="filterButtons">${filterButtons}</div>
      <div class="filteredSites">
        ${sites}
      </div>
    </div>
    `;
    };

    // Renders html
    render(html`<${FilterSort} selected="none" />`, document.querySelector('.TPfilter-sort-output'));
  }
})();