import * as Exify from '@lodev09/react-native-exify';
export async function getGPSCoordinates(uri: string) {
  const tags = await Exify.read(uri);
  if (tags && tags['GPSLongitude'] && tags['GPSLatitude']) {
    return {
      latitude: Number(tags['GPSLatitude']),
      longitude: Number(tags['GPSLongitude']),
    };
  }
  return null;
}
export async function getCreatedDateTime(uri: string) {
  const tags = await Exify.read(uri);
  if (tags && tags['DateTimeOriginal']) {
    const [dateString, timeString] = tags['DateTimeOriginal'].split(' ');
    return `${dateString.replaceAll(':', '-')}T${timeString}`;
  }
  return null;
}
