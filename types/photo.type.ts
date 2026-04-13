export interface Photo {
  photoBase64: string;
  GPSCoordinates: { latitude: number; longitude: number } | null;
  date: string | null;
}
