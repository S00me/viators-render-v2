import { kml, gpx } from '@tmcw/togeojson';

export async function parseTrack(input: File | string): Promise<[number, number][]> {
  let text: string;
  let filename: string;

  if (typeof input === 'string') {
    const response = await fetch(input);
    text = await response.text();
    filename = input;
  } else {
    text = await input.text();
    filename = input.name;
  }

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  
  let geojson;
  if (filename.toLowerCase().endsWith('.gpx')) {
    geojson = gpx(xmlDoc);
  } else if (filename.toLowerCase().endsWith('.kml') || filename.toLowerCase().endsWith('.kmz')) {
    // Note: KMZ is zipped KML. Client-side KMZ parsing requires JSZip. 
    // For now we only support KML or unzipped KMZ content if passed as text.
    // If real KMZ support is needed client-side, we'd need 'jszip'.
    // Assuming KML for now based on text content.
    geojson = kml(xmlDoc);
  } else {
    // Try to detect by content if filename fails or is generic
    if (text.includes('<gpx')) {
      geojson = gpx(xmlDoc);
    } else if (text.includes('<kml')) {
      geojson = kml(xmlDoc);
    } else {
      throw new Error('Unsupported file format');
    }
  }

  // Extract the first LineString or MultiLineString
  const feature = geojson.features.find(f => f.geometry.type === 'LineString' || f.geometry.type === 'MultiLineString');
  
  if (feature) {
    if (feature.geometry.type === 'LineString') {
      // GeoJSON is [lng, lat], Leaflet needs [lat, lng]
      return feature.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]]);
    } else if (feature.geometry.type === 'MultiLineString') {
      // Flatten MultiLineString
      const coords = feature.geometry.coordinates.flat();
      return coords.map((coord: number[]) => [coord[1], coord[0]]);
    }
  }
  
  return [];
}
