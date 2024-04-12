import { html } from 'lit';

export function render() {
return html`
  <div class='l-container'>
    <div class='l-basic--flipped'>
      <div class="l-content">
        <p>Here is a list of foo retrieved from the database/api using a cork-app-utils model:</p>
        ${this.fooData.length ? html`
          <ul>
            ${this.fooData.map(item => html`
              <li>${item.name}</li>
            `)}
          </ul>
        ` : html`
          <p>There is no foo to display</p>
        `}
      </div>
      <div class="l-sidebar-first">
        <section class="brand-textbox category-brand__background category-brand--pinot">
          Since we are disabling the shadowdom via the createRenderRoot method, we can use the brand styles loaded by the site css sheet,
          without having to load them into the shadowdom.
        </section>
      </div>
    </div>
  </div>

`;}
