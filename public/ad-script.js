(function () {
  // Find the script element that loaded this JS to extract data attributes
  const currentScript = document.currentScript;
  const adId = currentScript ? currentScript.getAttribute('data-ad-id') : null;

  if (!adId) return;

  // Resolve host domain (works dynamically whether local or deployed)
  const scriptUrl = new URL(currentScript.src);
  const baseUrl = scriptUrl.origin;

  // Fetch ad details from server
  fetch(`${baseUrl}/api/ads/${adId}`)
    .then(res => res.json())
    .then(ad => {
      const container = document.getElementById(`ad-slot-${adId}`);
      if (!container) return;

      // Render ad anchor and image inside publisher slot
      container.innerHTML = `
        <a href="${ad.targetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block; text-decoration:none;">
          <img src="${ad.imageUrl}" alt="${ad.adName}" style="max-width:100%; height:auto; border:0;" />
        </a>
      `;
    })
    .catch(err => console.error('Failed to load ad:', err));
})();