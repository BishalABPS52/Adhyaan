export default async function handler(req, res) {
  // Get the URL from query parameter instead of route parameter
  const { url } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    // Decode the URL
    const blobUrl = decodeURIComponent(url);

    console.log('Fetching PDF from:', blobUrl);

    // Fetch the file content from the Vercel Blob URL
    const blobResponse = await fetch(blobUrl);

    if (!blobResponse.ok) {
      console.error('Failed to fetch PDF:', blobResponse.status, blobResponse.statusText);
      return res.status(blobResponse.status).json({ error: 'Failed to fetch PDF' });
    }

    // Get the content type
    const contentType = blobResponse.headers.get('content-type') || 'application/pdf';

    // Set response headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', 'inline'); // Display the PDF inline in the browser
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Pipe the response body to the client
    blobResponse.body.pipe(res);
  } catch (error) {
    console.error('Error fetching PDF:', error);
    return res.status(404).json({ error: 'File not found or an error occurred' });
  }
}