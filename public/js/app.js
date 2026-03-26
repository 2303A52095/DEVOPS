const rateCard = {
  Bike: 18,
  Auto: 24,
  Car: 32
};

const stringToCoordinate = (text) => {
  let seed = 0;

  for (let index = 0; index < text.length; index += 1) {
    seed = (seed * 31 + text.charCodeAt(index)) % 1000000;
  }

  return {
    lat: Number((12 + ((seed % 7000) / 1000)).toFixed(6)),
    lng: Number((77 + (((seed / 7) % 7000) / 1000)).toFixed(6))
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

const calculateMeta = (pickupLocation, dropLocation, rideType) => {
  if (!pickupLocation || !dropLocation || !rideType) {
    return null;
  }

  const pickup = stringToCoordinate(pickupLocation.toLowerCase());
  const drop = stringToCoordinate(dropLocation.toLowerCase());
  const distance = Math.max(haversineDistance(pickup, drop), 1.5);
  const distanceKm = Number(distance.toFixed(1));
  const fare = Number((35 + distanceKm * rateCard[rideType]).toFixed(2));

  return {
    pickup,
    drop,
    distanceKm,
    fare
  };
};

const renderCharts = () => {
  const barChart = document.getElementById('ridesBarChart');
  const pieChart = document.getElementById('ridesPieChart');

  if (barChart) {
    new Chart(barChart, {
      type: 'bar',
      data: {
        labels: JSON.parse(barChart.dataset.labels),
        datasets: [
          {
            label: 'Rides',
            data: JSON.parse(barChart.dataset.values),
            backgroundColor: '#0f9d7a',
            borderRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    });
  }

  if (pieChart) {
    new Chart(pieChart, {
      type: 'pie',
      data: {
        labels: JSON.parse(pieChart.dataset.labels),
        datasets: [
          {
            data: JSON.parse(pieChart.dataset.values),
            backgroundColor: ['#0f9d7a', '#ffb703', '#2563eb']
          }
        ]
      },
      options: {
        responsive: true
      }
    });
  }
};

const renderRideMap = () => {
  const mapElement = document.getElementById('rideMap');

  if (!mapElement || typeof L === 'undefined') {
    return;
  }

  const pickupField = document.getElementById('pickupLocation');
  const dropField = document.getElementById('dropLocation');
  const rideTypeField = document.getElementById('rideType');
  const distanceTarget = document.querySelector('[data-distance]');
  const fareTarget = document.querySelector('[data-fare]');

  const map = L.map(mapElement).setView([12.9716, 77.5946], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  let pickupMarker;
  let dropMarker;
  let routeLine;

  const updateMap = (pickup, drop) => {
    if (pickupMarker) map.removeLayer(pickupMarker);
    if (dropMarker) map.removeLayer(dropMarker);
    if (routeLine) map.removeLayer(routeLine);

    pickupMarker = L.marker([pickup.lat, pickup.lng]).addTo(map);
    dropMarker = L.marker([drop.lat, drop.lng]).addTo(map);
    routeLine = L.polyline(
      [
        [pickup.lat, pickup.lng],
        [drop.lat, drop.lng]
      ],
      { color: '#0f9d7a', weight: 5 }
    ).addTo(map);

    map.fitBounds(routeLine.getBounds(), { padding: [30, 30] });
  };

  const refreshFromForm = () => {
    const result = calculateMeta(pickupField?.value, dropField?.value, rideTypeField?.value);

    if (!result) {
      return;
    }

    if (distanceTarget) {
      distanceTarget.textContent = `${result.distanceKm} km`;
    }

    if (fareTarget) {
      fareTarget.textContent = `₹${result.fare}`;
    }

    updateMap(result.pickup, result.drop);
  };

  if (pickupField && dropField && rideTypeField) {
    ['input', 'change'].forEach((eventName) => {
      pickupField.addEventListener(eventName, refreshFromForm);
      dropField.addEventListener(eventName, refreshFromForm);
      rideTypeField.addEventListener(eventName, refreshFromForm);
    });

    refreshFromForm();
  } else if (mapElement.dataset.pickup && mapElement.dataset.drop) {
    updateMap(JSON.parse(mapElement.dataset.pickup), JSON.parse(mapElement.dataset.drop));
  }
};

const handleSidebar = () => {
  const toggle = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.getElementById('sidebar');

  if (!toggle || !sidebar) {
    return;
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
};

const handleDriverAssignForm = () => {
  const form = document.getElementById('assignRideForm');
  const driverSelect = document.querySelector('[data-driver-select]');

  if (!form || !driverSelect) {
    return;
  }

  const updateAction = () => {
    form.action = `/drivers/${driverSelect.value}/assign`;
  };

  driverSelect.addEventListener('change', updateAction);
  updateAction();
};

document.addEventListener('DOMContentLoaded', () => {
  renderCharts();
  renderRideMap();
  handleSidebar();
  handleDriverAssignForm();
});
