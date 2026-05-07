import { Platform } from 'react-native';

async function reverseGeocodeWeb(lat: number, lon: number): Promise<string> {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const json = await res.json();
  const a = json.address ?? {};
  const parts = [
    a.restaurant ?? a.cafe ?? a.bar ?? a.amenity ?? a.building,
    a.neighbourhood ?? a.suburb ?? a.quarter,
    a.city ?? a.town ?? a.village ?? a.county,
    a.state,
    a.country,
  ].filter(Boolean);
  return parts.slice(0, 3).join(', ');
}

export async function detectLocation(): Promise<{ name: string; lat: number; lng: number }> {
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser.'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude: lat, longitude: lng } = pos.coords;
            const name = await reverseGeocodeWeb(lat, lng);
            resolve({ name, lat, lng });
          } catch {
            reject(new Error('Could not look up location name.'));
          }
        },
        () => reject(new Error('Location access denied.')),
        { timeout: 10000 }
      );
    });
  } else {
    const Location = await import('expo-location');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied.');
    }
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const { latitude: lat, longitude: lng } = pos.coords;
    const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const parts = [
      geo?.name,
      geo?.district ?? geo?.subregion,
      geo?.city ?? geo?.region,
    ].filter(Boolean);
    const name = parts.slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    return { name, lat, lng };
  }
}
