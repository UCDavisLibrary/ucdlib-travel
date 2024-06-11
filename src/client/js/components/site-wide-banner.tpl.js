import { html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ref } from 'lit/directives/ref.js';

export function render() { 
return html`
<section class="brand-textbox category-brand__background  ">
<p>Lorem ipsum dolor sit amet, <a href="#">consectetur adipisicing elit</a>, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>  <p><a href="#" class="btn btn--primary">Primary Button</a></p>

<p><a href="#" class="btn btn--alt">Alternative Button</a></p><section class="wysiwyg-feature-block ">
<div class="wysiwyg-feature-block__figure">
<figure>
<img src="../../images/placeholders/1280x720.png" alt="16x9 Image" loading="lazy" width="1280" height="720">
<figcaption>This is some caption text for an image</figcaption>
</figure>
</div>
<h3 class="wysiwyg-feature-block__title">Title for the wysiwyg-feature-block</h3>
<div class="wysiwyg-feature-block__body">
<p>Sed vehicula metus tellus, ut <a href="#">scelerisque</a> justo posuere eget. Suspendisse eu feugiat nibh.</p><h2>Title</h2><h2 class="heading--underline">Title Intro</h2><h3>Subtitle</h3><h3 class="heading--auxiliary">Subtitle Aux</h3><h4>Subtitle 2</h4><h5>Subtitle 3</h5><h2><a href="#">Title</a></h2><h2 class="heading--underline"><a href="#">Title Intro</a></h2><h3><a href="#">Subtitle</a></h3><h3 class="heading--auxiliary"><a href="#">Subtitle Aux</a></h3><h4><a href="#">Subtitle 2</a></h4><h5><a href="#">Subtitle 3</a></h5><p><button class="btn btn--primary">Call to Action</button></p>
</div>
</section><a href="#" class="media-link ">
<div class="media-link__figure">
<img src="../../images/placeholders/135x135.png" alt="Thumbnail" class="lazyload lazyload--loaded" loading="lazy" width="135" height="135">
</div>
<div class="media-link__body">
<h3 class="media-link__title">Lorem ipsum dolor sit (37 characters)</h3>
<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.</p>
</div>
</a>
</section>
`;}