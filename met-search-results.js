// The search results component area.
class SearchResults extends Observer {
  buildMarkup(state = {}) {
    // let renderThisMuch = state.recentSearchResults;
    console.log(state.metObjectDataToRender);

    if (state.metObjectDataToRender !== undefined) {
      return `<p>I will put data here when you write the code to do it.</p>`;
      // return `<ul>${state.objectDataToRender.map(
      //   (item) => `<li>${item.title}</li>`
      // )}<    //ul>`;
    } else {
      return `<p>I'm ready to go...</p>`;
    }
  }

  render(state, selector = 'app') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);

    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'search-results');
  }
}

// A single result art Object.
class SingleResultCard extends Observer {
  buildMarkup(state) {
    return `<div class="card">
      <strong>${data.title}</strong><br/>
      ${data.artistDisplayName}<br/>
      <img src=${data.primaryImageSmall} alt=${data.title} />
    </div>`;
  }

  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
  }

  update(state) {
    this.render(state, '.result');
  }
}
// The active area of the art Object.
