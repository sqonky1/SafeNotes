export default {
  async fetch(request, env, ctx) {
    const { pathname, searchParams } = new URL(request.url);

    if (request.method === 'POST' && pathname === '/generate') {
      try {
        const { media } = await request.json();

        if (!Array.isArray(media) || media.length === 0 || media.length > 5) {
          return new Response('Must include 1 to 5 media URLs in a "media" array.', { status: 400 });
        }

        const id = crypto.randomUUID();
        const htmlContent = `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <title>SafeNotes SOS Media</title>
            <style>
              body {
                background: #121212;
                color: #fff;
                font-family: Arial, sans-serif;
                padding: 20px;
                padding-bottom: 60px; /* Prevents audio player from being clipped on iOS */
                min-height: 100vh;     /* Ensures scrollable content height */
                font-size: 3.5vw;        /* Adjust font size based on viewport width */
                text-align: left;      /* Align everything to the left */
              }
              h1 { 
                color: #CA3535; 
                font-size: 6.5vw;        /* Adjust header size relative to the viewport width */
                text-align: left;      /* Ensure heading is left-aligned */
              }
              .media-item { 
                margin-bottom: 20px;
                text-align: left;    /* Align media left */
              }
              video, img {
                max-width: 100%;
                max-height: 500px;
                width: auto;
                height: auto;
                border: 1px solid #444;
                border-radius: 10px;
                display: block;
                margin-left: 0;    /* Align left */
                margin-right: 0;   /* Align left */
              }
              audio {
                width: 100%;
                max-width: 600px;
                display: block;
                margin-top: 8px;
                margin-left: 0;    /* Align left */
                margin-right: 0;   /* Align left */
              }

              /* Media Query for small screens like phones */
              @media screen and (max-width: 600px) {
                body {
                  font-size: 6vw;    /* Increase font size for smaller screens */
                }
                h1 {
                  font-size: 10vw;   /* Increase header size for smaller screens */
                }
              }
            </style>
          </head>
          <body>
            <h1>SOS Media Archive</h1>
            <p>This page contains temporary emergency evidence. This page will expire in 24 hours.</p>
            ${media.map(url => {
              // 1) Video
              if (url.endsWith('.mp4') || url.endsWith('.mov') || url.endsWith('.webm')) {
                return `
                  <div class="media-item">
                    <video controls src="${url}"></video>
                  </div>
                `;
              }

              // 2) Audio (m4a, 3gp, mp3, wav, ogg, amr, opus)
              else if (
                url.endsWith('.m4a') ||
                url.endsWith('.3gp') ||
                url.endsWith('.mp3') ||
                url.endsWith('.wav') ||
                url.endsWith('.ogg') ||
                url.endsWith('.amr') ||
                url.endsWith('.opus')
              ) {
                let sourceTag;
                if (url.endsWith('.3gp')) {
                  sourceTag = `<source src="${url}" type="audio/3gpp">`;
                } else if (url.endsWith('.m4a')) {
                  sourceTag = `
                    <source src="${url}" type="audio/mp4">
                    <source src="${url}" type="audio/m4a">
                  `;
                } else if (url.endsWith('.mp3')) {
                  sourceTag = `<source src="${url}" type="audio/mpeg">`;
                } else if (url.endsWith('.wav')) {
                  sourceTag = `<source src="${url}" type="audio/wav">`;
                } else if (url.endsWith('.ogg')) {
                  sourceTag = `<source src="${url}" type="audio/ogg">`;
                } else if (url.endsWith('.amr')) {
                  sourceTag = `<source src="${url}" type="audio/amr">`;
                } else if (url.endsWith('.opus')) {
                  sourceTag = `<source src="${url}" type="audio/opus">`;
                }

                return `
                  <div class="media-item">
                    <audio controls>
                      ${sourceTag}
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                `;
              }

              // 3) Images (jpg, jpeg, png, gif, bmp, webp)
              else if (
                url.endsWith('.jpg') ||
                url.endsWith('.jpeg') ||
                url.endsWith('.png') ||
                url.endsWith('.gif') ||
                url.endsWith('.bmp') ||
                url.endsWith('.webp')
              ) {
                return `
                  <div class="media-item">
                    <img src="${url}" alt="SOS media" />
                  </div>
                `;
              }

              // 4) PDF or other non–media files (render as download link or icon)
              else {
                return `
                  <div class="media-item">
                    <a href="${url}" target="_blank" rel="noopener noreferrer">
                      Download file
                    </a>
                  </div>
                `;
              }
            }).join('')}
            <p style="color:#888; font-size: 0.9em;">Page generated by SafeNotes. If you see a 404 for media, it has expired for safety reasons.</p>
          </body>
          </html>
        `;

        await env.HTML_KV.put(id, htmlContent, { expirationTtl: 86400 });

        const html_url = `https://safenotes-sos-html.safenotes-sos.workers.dev/embed?id=${id}`;
        return new Response(JSON.stringify({ html_url }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response('Error generating HTML: ' + err.message, { status: 500 });
      }
    }

    if (request.method === 'GET' && pathname === '/embed') {
      const id = searchParams.get('id');
      if (!id) {
        return new Response('Missing id', { status: 400 });
      }
      const html = await env.HTML_KV.get(id);
      if (!html) {
        return new Response('Page not found or expired', { status: 404 });
      }
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    return new Response('Not found', { status: 404 });
  }
};
