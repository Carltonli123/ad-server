(function () {
  const currentScript = document.currentScript;
  const adId = currentScript ? currentScript.getAttribute('data-ad-id') : null;

  if (!adId) return;

  const scriptUrl = new URL(currentScript.src);
  const baseUrl = scriptUrl.origin;

  fetch(`${baseUrl}/api/ads/${adId}`)
    .then(res => res.json())
    .then(ad => {
      const container = document.getElementById(`ad-slot-${adId}`);
      if (!container) return;

      // Render with explicit display and dimensions so layout doesn't collapse
      container.innerHTML = `
        <div style="display: block; margin: 16px 0; text-align: center; width: 100%;">
          <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; max-width: 100%;">
            <img 
              src="${ad.imageUrl}" 
              alt="${ad.adName || 'Advertisement'}" 
              style="max-width: 100%; height: auto; min-width: 250px; min-height: 100px; display: block; border: 0; margin: 0 auto;" 
              onerror="this.onerror=null; this.alt='Ad image failed to load';"
            />
          </a>
        </div>
      `;
    })
    .catch(err => console.error('Failed to load ad:', err));
})();