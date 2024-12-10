// The search counter component.
class SearchCounter extends Observer {
  buildMarkup(state) {
    if (state.metObjectDataToRender.length > 0 && !state.loading) {
      let total = state.recentSearchResults.length;
      return `<p>Viewing ${state.currentFirstItemInView + 1} through ${
        state.currentLastItemInView
      } of <strong>${total}</strong> results found. </p>`;
    } else {
      return ``;
    }
  }

  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'counter');
  }
}

// The search results component area.
class ResultsContainer extends Observer {
  buildMarkup(state) {
    // console.log('state here', state);
    console.log(
      'Inside ResultsContainer and buildMarkup has been called: ',
      state.metObjectDataToRender
    );
    if (state.loading) {
      return 'loading data....';
    } else {
      return `<ul class="current-result-set-container">${state.metObjectDataToRender
        .map(
          (metObject) =>
            `<li class="result" id=${metObject.objectID}>
              <div class="card">
              <img src=${
                metObject.isPublicDomain
                  ? metObject.primaryImageSmall
                  : `https://placehold.co/300x400?text=Image%20not%20available%20from%20API&font=Lato`
              } alt=${metObject.title} />
                <div class="card-body">
                <strong>${metObject.title}</strong><br>${metObject.objectID}<br>
              ${metObject.artistDisplayName}<br/>
                </div>
             </div>
          </li>`
        )
        .join('\n')}
    </ul>`;
    }
  }
  render(state, selector = 'search-results') {
    const markup = this.buildMarkup(state);
    const parent = document.getElementById(selector);
    parent.innerHTML = markup;
  }

  update(state) {
    this.render(state, 'results-container');
  }
}
