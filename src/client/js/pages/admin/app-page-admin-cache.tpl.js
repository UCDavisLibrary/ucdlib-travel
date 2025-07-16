import { html } from 'lit';


export function render() { 
  return html`
    <div class='l-gutter l-basic--flipped'>
      <div class="l-content">
        <form @submit=${this._onDeleteClick}>
          ${renderFilters.call(this)}
          ${this.resSearchCache.length !== 0 ? html`
              <div ?hidden=${this.noResults}>
                ${this.resSearchCache.map((cache) => renderCacheList.call(this, cache))}
              </div>
            `:html`
              <div ?hidden=${!this.noResults} class='u-space-mt--large'>
                <p>No cache results match your search. <a class='pointer' @click=${this.clearAndFocusSearch}>Try another search term.</a></p>
              </div>
            `}
          <div ?hidden=${this.resSearchCache.length !== 0 || this.noResults}>
            <div class='u-space-ml--small'>
              <i>Use the search to filter through cache list.</i>
            </div>
          </div>
          <div class='sticky-update-bar'>
            <button
              type='submit' 
              class='btn btn--primary border-box u-space-mt'
              ?disabled=${this.deleteCacheList.length === 0}>Delete
            </button>
          </div>
        </form>
      </div>

      <div class='l-sidebar-first'>
          <div style="padding:20px;background-color:#ebf3fa;" class="panel panel--icon panel--icon-custom panel--icon-tahoe">
            <h2 class="panel__title"><span class="panel__custom-icon fas fa-chart-simple"></span>Cache Types</h2>
            ${this.types.map((type) => html`
              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <div>${type.type}</div>
                <div>${type.count}</div>
              </div>
              <br/>
            `)}
          </div>
      </div>
    </div>

`;}

function renderCacheList(cache){
  let date = new Date(cache.created);

  return html`
  <div
    class="cache-item ${this.isSelected(cache) ? 'selected' : ''}"
    @click=${() => this.toggleCacheSelection(cache)}>
    <div class="cache__header">
      <h4>${cache.query}</h4>
    </div>
    <div>
      <div class="bold primary">Type</div>
      <p>${cache.type}</p>
    </div>
    <div>
      <div class="bold primary">Created</div>
      <p>${date.toLocaleString()}</p>
    </div>
  </div>
  `
}

function renderFilters(){
  return html`

    <label>Search Cache</label> 
    <ucd-theme-search-form
      placeholder='Search Cache'
      class='u-space-mb'
      .value=${this.searchString}
      @search=${this._onSearch}>
    </ucd-theme-search-form>
  `
}
