// Position and business ID come only from the independently checked 2GIS destination link.
export function businessMap(routeUrl) {
  try {
    const path = decodeURIComponent(new URL(routeUrl).pathname);
    const match = path.match(/\|(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?);(\d+)/);
    if (!match) return null;
    const longitude = Number(match[1]), latitude = Number(match[2]);
    if (!Number.isFinite(longitude) || !Number.isFinite(latitude) || Math.abs(longitude)>180 || Math.abs(latitude)>90) return null;
    const embed = new URL('https://widgets.2gis.com/widget');
    embed.searchParams.set('type', 'firmsonmap');
    embed.searchParams.set('options', JSON.stringify({ pos:longitude + ',' + latitude, zoom:16, opt:'city', firms:[match[3]] }));
    return { embed:embed.href };
  } catch { return null; }
}
