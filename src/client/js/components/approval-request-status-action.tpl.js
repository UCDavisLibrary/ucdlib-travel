import { html } from 'lit';

/**
 * @description Main render function
 * @returns {TemplateResult}
 */
export function render() {
  if ( !Object.keys(this.action).length ) return html``;
  const status = this.byStatus[this.action.action];
  if ( !status ) return html``;

  return html`
    <div class='container'>
      <div class='icon-circle category-brand--${status.brandColor} category-brand__background'>
        <i class=${status.iconClass}></i>
      </div>
      <div class='content'>
        <div class='smaller grey'>${status.byLine}</div>
        <div class='bold primary'>${this.action?.employee?.firstName} ${this.action?.employee?.lastName}</div>
        <div class='small primary'>${(this.action.approverTypes || []).map(at => at.approverTypeLabel).join(', ')}</div>
        <div ?hidden=${!this.showDate || this.action.action === 'approval-needed'} class='smaller grey'>at ${this._getDate()}</div>
        <div ?hidden=${!this.action.comments || this.hideCommentsLinks} class='comments'>
          <i class='fa-solid fa-comment'></i>
          <a @click=${this._onViewCommentsClick} class='pointer'>View Comments</a>
        </div>
      </div>
    </div>
`;}
