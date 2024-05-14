import { html } from 'lit';

export function render() {
return html`
    <form>
        <ucdlib-employee-search-basic
        class='u-space-mb'
        @status-change=${this._onTransferEmployeeStatusChange}>
        </ucdlib-employee-search-basic>
    </form>
`;}
