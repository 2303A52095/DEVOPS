const RATE_CARD = {
  Bike: 18,
  Auto: 24,
  Car: 32
};

const stringToCoordinate = (text) => {
  let seed = 0;

  for (let index = 0; index < text.length; index += 1) {
    seed = (seed * 31 + text.charCodeAt(index)) % 1000000;
  }

  const lat = 12 + ((seed % 7000) / 1000);
  const lng = 77 + (((seed / 7) % 7000) / 1000);

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lng.toFixed(6))
  };
};

const haversineDistance = (start, end) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRadians(end.lat - start.lat);
  const dLng = toRadians(end.lng - start.lng);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(start.lat)) *
      Math.cos(toRadians(end.lat)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const calculateRideMeta = ({ pickupLocation, dropLocation, rideType }) => {
  const pickupCoordinates = stringToCoordinate(pickupLocation.toLowerCase());
  const dropCoordinates = stringToCoordinate(dropLocation.toLowerCase());
  const rawDistance = haversineDistance(pickupCoordinates, dropCoordinates);
  const distanceKm = Number(Math.max(rawDistance, 1.5).toFixed(1));
  const fare = Number((35 + distanceKm * RATE_CARD[rideType]).toFixed(2));

  return {
    pickupCoordinates,
    dropCoordinates,
    distanceKm,
    fare
  };
};

module.exports = {
  RATE_CARD,
  calculateRideMeta
};
