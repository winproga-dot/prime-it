// Use only the coordinates exposed in the independently checked 2GIS destination link.
export function businessMap(routeUrl) {
  try {
    const path = decodeURIComponent(new URL(routeUrl).pathname);
    const match = path.match(/\|(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?);\d+/);
    if (!match) return null;
    const longitude = Number(match[1]), latitude = Number(match[2]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude)>180 || Math.abs(latitude)>90) return null;
    const embed = new URL('https://www.openstreetmap.org/export/embed.html');
    embed.searchParams.set('bbox', [longitude-.007,latitude-.0045,longitude+.007,latitude+.0045].join(','));
    embed.searchParams.set('layer', 'mapnik');
    embed.searchParams.set('marker', latitude + ',' + longitude);
    return { embed:embed.href, link:'https://www.openstreetmap.org/?mlat=' + latitude + '&mlon=' + longitude + '#map=16/' + latitude + '/' + longitude };
  } catch { return null; }
}
