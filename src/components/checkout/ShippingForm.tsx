// ─────────────────────────────────────────────────────────────
// components/checkout/ShippingForm.tsx
// Step 1 of checkout. Collects shipping address + contact.
// Pre-fills from the authenticated user's saved address.
// Validated with React Hook Form + Zod.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useMe } from '@hooks/useAuth';
import { Input } from '@components/ui';
import type { UserAddress } from '@types';
import styles from './ShippingForm.module.scss';

// ── Zod schema ────────────────────────────────────────────────
const shippingSchema = z.object({
  fullName:   z.string().min(2,  'Full name is required'),
  phone:      z.string().min(7,  'Valid phone number required'),
  street:     z.string().min(5,  'Street address is required'),
  city:       z.string().min(2,  'City is required'),
  state:      z.string().min(2,  'State / region is required'),
  postalCode: z.string().min(3,  'Postal code is required'),
  country:    z.string().min(2,  'Country is required'),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;

export interface ShippingFormProps {
  onSubmit: (values: ShippingFormValues) => void;
  isSubmitting?: boolean;
  /** Form id — lets the submit button live outside the form element */
  formId?: string;
}

export default function ShippingForm({
  onSubmit,
  isSubmitting = false,
  formId = 'shipping-form',
}: ShippingFormProps) {
  const { data: user } = useMe();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: {
      fullName:   '',
      phone:      '',
      street:     '',
      city:       '',
      state:      '',
      postalCode: '',
      country:    '',
    },
  });

  // Pre-fill from user profile when available
  useEffect(() => {
    if (!user) return;
    const addr: Partial<UserAddress> = user.address ?? {};
    reset({
      fullName:   user.name   ?? '',
      phone:      user.phone  ?? '',
      street:     addr.street     ?? '',
      city:       addr.city       ?? '',
      state:      addr.state      ?? '',
      postalCode: addr.postalCode ?? '',
      country:    addr.country    ?? '',
    });
  }, [user, reset]);

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className={styles.form}
      aria-busy={isSubmitting}
      noValidate
    >
      <Section title="Contact information">
        <div className={styles.row}>
          <Input
            label="Full name"
            placeholder="Jane Smith"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.fullName?.message}
            autoComplete="name"
            {...register('fullName')}
          />
          <Input
            label="Phone number"
            type="tel"
            placeholder="+1 555 000 0000"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.phone?.message}
            autoComplete="tel"
            {...register('phone')}
          />
        </div>
      </Section>

      <Section title="Shipping address">
        <Input
          label="Street address"
          placeholder="123 Main St, Apt 4B"
          required
          fullWidth
          disabled={isSubmitting}
          error={errors.street?.message}
          autoComplete="street-address"
          {...register('street')}
        />

        <div className={styles.row}>
          <Input
            label="City"
            placeholder="New York"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.city?.message}
            autoComplete="address-level2"
            {...register('city')}
          />
          <Input
            label="State / Region"
            placeholder="NY"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.state?.message}
            autoComplete="address-level1"
            {...register('state')}
          />
        </div>

        <div className={styles.row}>
          <Input
            label="Postal code"
            placeholder="10001"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.postalCode?.message}
            autoComplete="postal-code"
            {...register('postalCode')}
          />
          <Input
            label="Country"
            placeholder="United States"
            required
            fullWidth
            disabled={isSubmitting}
            error={errors.country?.message}
            autoComplete="country-name"
            {...register('country')}
          />
        </div>
      </Section>

      {/* External submit button targets this form via formId */}
    </form>
  );
}

// ── Section wrapper ───────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className={styles.section}>
      <legend className={styles.section__legend}>{title}</legend>
      <div className={styles.section__body}>{children}</div>
    </fieldset>
  );
}