export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export type KmaGridCoordinate = {
  nx: number;
  ny: number;
};

const EARTH_RADIUS_KM = 6371.00877;
const GRID_SPACING_KM = 5;
const PROJECTION_LAT_1 = 30;
const PROJECTION_LAT_2 = 60;
const ORIGIN_LON = 126;
const ORIGIN_LAT = 38;
const ORIGIN_X = 43;
const ORIGIN_Y = 136;

export function convertWgs84ToKmaGrid(coordinate: GeoCoordinate): KmaGridCoordinate {
  const re = EARTH_RADIUS_KM / GRID_SPACING_KM;
  const slat1 = toRadians(PROJECTION_LAT_1);
  const slat2 = toRadians(PROJECTION_LAT_2);
  const olon = toRadians(ORIGIN_LON);
  const olat = toRadians(ORIGIN_LAT);

  const sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5));
  const sf = (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1)) / sn;
  const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);
  const ra = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + toRadians(coordinate.latitude) * 0.5), sn);
  let theta = toRadians(coordinate.longitude) - olon;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + ORIGIN_X + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + ORIGIN_Y + 0.5),
  };
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
