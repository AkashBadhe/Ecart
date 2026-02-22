import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import { useMemo, useRef, useState } from 'react';
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api';

type AddressValue = {
  country: string;
  city: string;
  state: string;
  zip: string;
  street_address: string;
  lat?: number;
  lng?: number;
};

interface Props {
  value: AddressValue;
  onChange: (next: AddressValue) => void;
}

const libraries: any = ['places'];

const containerStyle = {
  width: '100%',
  height: '280px',
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

function parseAddressComponents(place: any, fallbackFormattedAddress?: string): AddressValue {
  const components = place?.address_components ?? [];
  const get = (type: string, short = false) => {
    const item = components.find((c: any) => c.types?.includes(type));
    return short ? item?.short_name ?? '' : item?.long_name ?? '';
  };

  // Extract geo-political fields
  const locality = get('locality') || get('sublocality') || get('administrative_area_level_2');
  const state = get('administrative_area_level_1');
  const zip = get('postal_code');
  const country = get('country') || 'India';

  // Build a detailed street address from all local components
  const streetNumber = get('street_number');
  const route = get('route');
  const premise = get('premise');
  const subpremise = get('subpremise');
  const neighborhood = get('neighborhood');
  const sublocalityLevel3 = get('sublocality_level_3');
  const sublocalityLevel2 = get('sublocality_level_2');
  const sublocalityLevel1 = get('sublocality_level_1');

  const streetParts = [
    subpremise,
    premise,
    streetNumber,
    route,
    neighborhood,
    sublocalityLevel3,
    sublocalityLevel2,
    sublocalityLevel1,
  ].filter(Boolean);

  let streetAddress = streetParts.join(', ').trim();

  // If component-based street is empty, derive from formatted_address
  // by stripping out city, state, zip, country to avoid duplication
  if (!streetAddress && fallbackFormattedAddress) {
    let fallback = fallbackFormattedAddress;
    const partsToRemove = [locality, state, zip, country].filter(Boolean);
    for (const part of partsToRemove) {
      fallback = fallback.replace(part, '');
    }
    // Clean up leftover commas and whitespace
    fallback = fallback
      .replace(/,\s*,/g, ',')
      .replace(/,\s*$/, '')
      .replace(/^\s*,/, '')
      .trim();
    streetAddress = fallback || fallbackFormattedAddress;
  }

  return {
    country,
    city: locality,
    state,
    zip,
    street_address: streetAddress,
  };
}

export default function GoogleAddressPicker({ value, onChange }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const [searchText, setSearchText] = useState(value?.street_address || '');
  // Initialize marker from value if available
  const [marker, setMarker] = useState<any>(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : null
  );
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState('');
  const autocompleteRef = useRef<any>(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-maps-script',
    googleMapsApiKey: apiKey || '',
    libraries,
  });

  const center = useMemo(() => {
    if (marker) return marker;
    return defaultCenter;
  }, [marker]);

  if (!apiKey) {
    return null;
  }

  if (!isLoaded) {
    return <p className="col-span-2 text-sm text-body">Loading map...</p>;
  }

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    const location = place?.geometry?.location;
    if (!place || !location) return;

    const lat = location.lat();
    const lng = location.lng();

    setMarker({ lat, lng });
    const addressData = parseAddressComponents(place, place?.formatted_address);
    onChange({ ...addressData, lat, lng });
    setSearchText(place?.formatted_address || '');
  };

  const reverseGeocodeByLatLng = (lat: number, lng: number) => {
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any) => {
      const topResult = results?.[0];
      if (!topResult) return;
      const addressData = parseAddressComponents(topResult, topResult.formatted_address);
      onChange({ ...addressData, lat, lng });
      setSearchText(topResult.formatted_address || '');
    });
  };

  const onMapClick = async (event: any) => {
    const lat = event?.latLng?.lat?.();
    const lng = event?.latLng?.lng?.();
    if (typeof lat !== 'number' || typeof lng !== 'number') return;

    setMarker({ lat, lng });
    reverseGeocodeByLatLng(lat, lng);
  };

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported in this browser.');
      return;
    }

    setGeoError('');
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMarker({ lat, lng });
        reverseGeocodeByLatLng(lat, lng);
        setIsLocating(false);
      },
      () => {
        setGeoError('Unable to access your location. Please allow location permission.');
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="col-span-2 space-y-4 rounded border border-border-base p-4">
      <p className="text-sm font-semibold text-heading">Find address with Google</p>
      <div className="flex gap-3">
        <div className="flex-1">
          <Autocomplete
            onLoad={(autocomplete: any) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={onPlaceChanged}
            options={{ componentRestrictions: { country: 'in' } }}
          >
            <Input
              name="googleAddressSearch"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search location"
              variant="outline"
            />
          </Autocomplete>
        </div>
        <Button
          type="button"
          className="whitespace-nowrap"
          loading={isLocating}
          disabled={isLocating}
          onClick={onUseCurrentLocation}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" 
            />
          </svg>
          <span className="ml-2">GPS</span>
        </Button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={marker ? 16 : 5}
        onClick={onMapClick}
        options={{ streetViewControl: false, mapTypeControl: false }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>
      <p className="text-xs text-body">Search to autofill fields, or click map to select location.</p>
      {geoError && <p className="text-xs text-red-500">{geoError}</p>}
    </div>
  );
}
