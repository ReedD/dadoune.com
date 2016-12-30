'use strict';

// Register service-worker
if (navigator.serviceWorker) {
	navigator.serviceWorker.register('/service-worker.js', {
		scope: '/'
	});
	// Do some clean up
	window.addEventListener('load', ()=> {
		if (navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({command: 'trimCaches'});
		}
	});
}
