// The search results component area.
class SearchResults extends Observer {
  buildMarkup(state) {
    return `<p>I will put data here when you write the code to do it.</p>`;
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

class ResultsContainer extends Observer {
  buildMarkup(state) {
    // console.log('state here', state);
    console.log(
      'Inside ResultsContainer and buildMarkup has been called: ',
      state.metObjectDataToRender
    );
    // state.metObjectDataToRender.map((object) => {
    //   console.log(object.title);
    // });
    // return `<p>results container here.</p>`;
    if (state.loading) {
      return 'loading data....';
    } else {
      return `<hr><p>I registered a state change</p><ul>
      ${state.metObjectDataToRender
        .map(
          (objectID) => `<li>
      <div class="card">
        <strong>${objectID.title}</strong><br>${objectID.objectID}<br>
        ${objectID.artistDisplayName}<br/>
        <img src=${objectID.primaryImageSmall} alt=${objectID.title} />
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

// A single result art Object.

// class SingleResultCard extends Observer {
//   buildMarkup(state) {
//     return `<div class="card">
//       <strong>${data.title}</strong><br/>
//       ${data.artistDisplayName}<br/>
//       <img src=${data.primaryImageSmall} alt=${data.title} />
//     </div>`;
//   }

//   render(state, selector = 'search-results') {
//     const markup = this.buildMarkup(state);
//     const parent = document.getElementById(selector);
//   }

//   update(state) {
//     this.render(state, '.result');
//   }
// }

// The active area of the art Object.
