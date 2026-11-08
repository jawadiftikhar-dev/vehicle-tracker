import { parseVehicle, applyPositionUpdate } from '../src/utils/vehicleParser';

describe('parseVehicle', () => {
  const validRaw = {
    id: 'VH-0047',
    status: 'active',
    lat: 41.424144,
    lng: -25.480513,
    speed: 34.3,
    region: 'West',
  };

  test('parses a valid vehicle object and coerces types', () => {
    const result = parseVehicle(validRaw);
    expect(result).toEqual({
      id: 'VH-0047',
      status: 'active',
      lat: 41.424144,
      lng: -25.480513,
      speed: 34.3,
      region: 'West',
    });
    expect(typeof result.lat).toBe('number');
    expect(typeof result.id).toBe('string');
  });

  test('throws on missing required field', () => {
    const incomplete = { ...validRaw };
    delete incomplete.speed;
    expect(() => parseVehicle(incomplete)).toThrow('Missing required field: speed');
  });

  test('throws on invalid status', () => {
    const invalid = { ...validRaw, status: 'flying' };
    expect(() => parseVehicle(invalid)).toThrow('Invalid status: flying');
  });

  test('throws on null input', () => {
    expect(() => parseVehicle(null)).toThrow('Invalid vehicle data');
  });
});

describe('applyPositionUpdate', () => {
  const vehicle = {
    id: 'VH-0047',
    status: 'active',
    lat: 41.0,
    lng: -25.0,
    speed: 30,
    region: 'West',
  };

  test('applies a position update without mutating the original', () => {
    const update = { lat: 42.0, lng: -26.0, speed: 45 };
    const result = applyPositionUpdate(vehicle, update);

    expect(result.lat).toBe(42.0);
    expect(result.lng).toBe(-26.0);
    expect(result.speed).toBe(45);
    expect(result.status).toBe('active');
    expect(vehicle.lat).toBe(41.0); // original unchanged
  });

  test('preserves status if update does not include it', () => {
    const result = applyPositionUpdate(vehicle, { lat: 42, lng: -26, speed: 50 });
    expect(result.status).toBe('active');
  });

  test('overrides status if update includes it', () => {
    const result = applyPositionUpdate(vehicle, {
      lat: 42,
      lng: -26,
      speed: 0,
      status: 'idle',
    });
    expect(result.status).toBe('idle');
  });
});