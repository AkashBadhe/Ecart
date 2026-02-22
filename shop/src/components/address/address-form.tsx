import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Label from '@/components/ui/forms/label';
import Radio from '@/components/ui/forms/radio/radio';
import TextArea from '@/components/ui/forms/text-area';
import { useTranslation } from 'next-i18next';
import * as yup from 'yup';
import { useModalState } from '@/components/ui/modal/modal.context';
import { Form } from '@/components/ui/forms/form';
import { AddressType } from '@/framework/utils/constants';
import { useUpdateUser, useUser } from '@/framework/user';
import GoogleAddressPicker from './google-address-picker';
import { useState } from 'react';

// Simple UUID-like ID generator
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

type FormValues = {
  id?: string;
  title: string;
  type: AddressType;
  address: {
    country: string;
    city: string;
    state: string;
    zip: string;
    street_address: string;
    flat_number?: string;
    building_name?: string;
    lat?: number;
    lng?: number;
  };
};

const addressSchema = yup.object().shape({
  id: yup.string().notRequired(),
  type: yup
    .string()
    .oneOf([AddressType.Billing, AddressType.Shipping])
    .required('error-type-required'),
  title: yup.string().required('error-title-required'),
  address: yup.object().shape({
    country: yup.string().required('error-country-required'),
    city: yup.string().required('error-city-required'),
    state: yup.string().required('error-state-required'),
    zip: yup.string().required('error-zip-required'),
    street_address: yup.string().required('error-street-required'),
    flat_number: yup.string(),
    building_name: yup.string(),
    lat: yup.number().notRequired(),
    lng: yup.number().notRequired(),
  }),
});

export const AddressForm: React.FC<any> = ({
  onSubmit,
  defaultValues,
  isLoading,
  addressId,
}) => {
  const { t } = useTranslation('common');
  const hasGoogleMapsKey = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
  const [showManualFields, setShowManualFields] = useState(!hasGoogleMapsKey);
  
  // Determine initial title preset
  const initialTitle = defaultValues?.title || '';
  const isPreset = initialTitle === 'Home' || initialTitle === 'Work';
  const [titlePreset, setTitlePreset] = useState<string>(isPreset ? initialTitle : 'Custom');
  const [customTitle, setCustomTitle] = useState<string>(isPreset ? '' : initialTitle);

  const handleSubmit = (values: FormValues) => {
    // Prefer addressId prop (set from modal data), fallback to form value
    if (addressId || values.id) {
      values.id = addressId || values.id;
    }
    onSubmit(values);
  };

  return (
    <Form<FormValues>
      onSubmit={handleSubmit}
      className="grid h-full grid-cols-2 gap-5"
      //@ts-ignore
      validationSchema={addressSchema}
      useFormProps={{
        defaultValues,
      }}
      resetValues={defaultValues}
    >
      {({ register, setValue, watch, formState: { errors } }) => {
        const currentTitle = watch('title');
        
        return (
        <>
          {/* Hidden field to register the id with react-hook-form */}
          <input 
            type="hidden" 
            {...register('id')}
            defaultValue={defaultValues?.id || ''}
          />

          <div>
            <Label>{t('text-type')}</Label>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Radio
                id="shipping"
                {...register('type')}
                type="radio"
                value={AddressType.Shipping}
                label={t('text-shipping')}
              />
              <Radio
                id="billing"
                {...register('type')}
                type="radio"
                value={AddressType.Billing}
                label={t('text-billing')}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label>{t('text-title')}</Label>
            <div className="mt-2 flex items-center space-x-4 rtl:space-x-reverse">
              <Radio
                id="title-home"
                name="titlePreset"
                type="radio"
                value="Home"
                label="Home"
                checked={titlePreset === 'Home'}
                onChange={(e) => {
                  setTitlePreset(e.target.value);
                  setValue('title', 'Home', { shouldDirty: true, shouldValidate: true });
                }}
              />
              <Radio
                id="title-work"
                name="titlePreset"
                type="radio"
                value="Work"
                label="Work"
                checked={titlePreset === 'Work'}
                onChange={(e) => {
                  setTitlePreset(e.target.value);
                  setValue('title', 'Work', { shouldDirty: true, shouldValidate: true });
                }}
              />
              <Radio
                id="title-custom"
                name="titlePreset"
                type="radio"
                value="Custom"
                label="Custom"
                checked={titlePreset === 'Custom'}
                onChange={(e) => {
                  setTitlePreset(e.target.value);
                  if (customTitle) {
                    setValue('title', customTitle, { shouldDirty: true, shouldValidate: true });
                  }
                }}
              />
            </div>
            {titlePreset === 'Custom' ? (
              <Input
                {...register('title', {
                  onChange: (e) => setCustomTitle(e.target.value)
                })}
                error={t(errors.title?.message!)}
                variant="outline"
                placeholder="Enter custom title"
                className="mt-3"
              />
            ) : (
              <input type="hidden" {...register('title')} />
            )}
            {errors.title && (
              <p className="mt-2 text-xs text-red-500">{t(errors.title?.message!)}</p>
            )}
          </div>

          {hasGoogleMapsKey ? (
            <GoogleAddressPicker
              value={{
                country: watch('address.country') ?? 'India',
                city: watch('address.city') ?? '',
                state: watch('address.state') ?? '',
                zip: watch('address.zip') ?? '',
                street_address: watch('address.street_address') ?? '',
                lat: watch('address.lat'),
                lng: watch('address.lng'),
              }}
              onChange={(nextAddress) => {
                setValue('address.country', nextAddress.country || 'India', {
                  shouldDirty: true,
                });
                setValue('address.city', nextAddress.city || '', {
                  shouldDirty: true,
                });
                setValue('address.state', nextAddress.state || '', {
                  shouldDirty: true,
                });
                setValue('address.zip', nextAddress.zip || '', {
                  shouldDirty: true,
                });
                setValue('address.street_address', nextAddress.street_address || '', {
                  shouldDirty: true,
                });
                if (nextAddress.lat) {
                  setValue('address.lat', nextAddress.lat, { shouldDirty: true });
                }
                if (nextAddress.lng) {
                  setValue('address.lng', nextAddress.lng, { shouldDirty: true });
                }
              }}
            />
          ) : (
            <div className="col-span-2 rounded border border-border-base bg-gray-50 p-3 text-sm text-body">
              Set `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `shop/.env` to enable single-field address search and map selection.
            </div>
          )}

          <Input
            label="Flat/Apartment Number"
            {...register('address.flat_number')}
            error={t(errors.address?.flat_number?.message!)}
            variant="outline"
            placeholder="e.g., 401, A-Block"
          />

          <Input
            label="Building/Society Name"
            {...register('address.building_name')}
            error={t(errors.address?.building_name?.message!)}
            variant="outline"
            placeholder="e.g., Green Heights"
          />

          <div className="col-span-2 rounded border border-border-base bg-gray-50 p-3 text-sm text-body">
            <p className="font-semibold text-heading">Selected Address</p>
            {(watch('address.flat_number') || watch('address.building_name')) && (
              <p className="mt-1">
                {[watch('address.flat_number'), watch('address.building_name')]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
            <p className={watch('address.flat_number') || watch('address.building_name') ? '' : 'mt-1'}>
              {watch('address.street_address') || '-'}
            </p>
            <p>
              {[watch('address.city'), watch('address.state'), watch('address.zip')]
                .filter(Boolean)
                .join(', ') || '-'}
            </p>
            <p>{watch('address.country') || '-'}</p>
          </div>

          <button
            type="button"
            className="col-span-2 text-left text-sm font-semibold text-accent"
            onClick={() => setShowManualFields((prev) => !prev)}
          >
            {showManualFields ? 'Hide manual fields' : 'Edit address manually'}
          </button>

          {showManualFields && (
            <>
              <Input
                label={t('text-country')}
                {...register('address.country')}
                error={t(errors.address?.country?.message!)}
                variant="outline"
                autoComplete="country-name"
              />

              <Input
                label={t('text-city')}
                {...register('address.city')}
                error={t(errors.address?.city?.message!)}
                variant="outline"
                autoComplete="address-level2"
              />

              <Input
                label={t('text-state')}
                {...register('address.state')}
                error={t(errors.address?.state?.message!)}
                variant="outline"
                autoComplete="address-level1"
              />

              <Input
                label={t('text-zip')}
                {...register('address.zip')}
                error={t(errors.address?.zip?.message!)}
                variant="outline"
                autoComplete="postal-code"
              />

              <TextArea
                label={t('text-street-address')}
                {...register('address.street_address')}
                error={t(errors.address?.street_address?.message!)}
                variant="outline"
                className="col-span-2"
                autoComplete="street-address"
              />
            </>
          )}

          <Button
            type="submit"
            className="col-span-2 w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {Boolean(defaultValues) ? t('text-update') : t('text-save')}{' '}
            {t('text-address')}
          </Button>
        </>
      )}}
    </Form>
  );
};

export default function CreateOrUpdateAddressForm() {
  const { t } = useTranslation('common');
  const {
    data: { customerId, address, type },
  } = useModalState();
  const { mutate: updateProfile, isLoading } = useUpdateUser();
  const { me } = useUser();

  function onSubmit(values: FormValues) {
    const addressId = values.id || address?.id;
    
    const formattedInput = {
      id: addressId || generateId(),
      title: values.title,
      type: values.type,
      address: {
        ...values.address,
      },
    };

    // Get existing addresses and ensure all have IDs
    const existingAddresses = (me?.address || []).map((addr: any) => ({
      ...addr,
      id: addr.id || generateId(),
    }));
    
    let updatedAddresses;
    if (addressId) {
      // Update existing address - match by id
      const idx = existingAddresses.findIndex((addr: any) => addr.id === addressId);
      if (idx >= 0) {
        updatedAddresses = [...existingAddresses];
        updatedAddresses[idx] = formattedInput;
      } else {
        // ID not found, add as new
        updatedAddresses = [...existingAddresses, formattedInput];
      }
    } else {
      // Add new address
      updatedAddresses = [...existingAddresses, formattedInput];
    }
    
    updateProfile({
      id: customerId,
      address: updatedAddresses,
    });
  }
  return (
    <div className="min-h-screen bg-light p-5 sm:p-8 md:min-h-0 md:rounded-xl">
      <h1 className="mb-4 text-center text-lg font-semibold text-heading sm:mb-6">
        {address ? t('text-update') : t('text-add-new')} {t('text-address')}
      </h1>
      <AddressForm
        onSubmit={onSubmit}
        isLoading={isLoading}
        addressId={address?.id}
        defaultValues={{
          id: address?.id,
          title: address?.title ?? 'Home',
          type: address?.type ?? type,
          address: {
            country: address?.address?.country ?? 'India',
            city: address?.address?.city ?? '',
            state: address?.address?.state ?? '',
            zip: address?.address?.zip ?? '',
            street_address: address?.address?.street_address ?? '',
            flat_number: address?.address?.flat_number ?? '',
            building_name: address?.address?.building_name ?? '',
            lat: address?.address?.lat,
            lng: address?.address?.lng,
          },
        }}
      />
    </div>
  );
}
