// pages/Profile.tsx
import { useEffect, useState } from 'react';
import { useMe, useUpdateProfile, useChangePassword, useUploadAvatar } from '@hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { Input, Button, Spinner } from '@components/ui';
import type { UserAddress } from '@types';
import styles from './Profile.module.scss';

type Tab = 'profile' | 'security';

const profileSchema = z.object({
  name:       z.string().min(2, 'Name is required'),
  phone:      z.string().optional(),
  street:     z.string().optional(),
  city:       z.string().optional(),
  state:      z.string().optional(),
  postalCode: z.string().optional(),
  country:    z.string().optional(),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword:     z.string().min(8, 'Minimum 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });
type PasswordValues = z.infer<typeof passwordSchema>;
const EMPTY_PROFILE_VALUES: ProfileValues = {
  name: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

export default function Profile() {
  const [tab, setTab] = useState<Tab>('profile');
  const { data: user, isLoading } = useMe();
  const { mutate: updateProfile, isPending: savingProfile } = useUpdateProfile();
  const { mutate: changePassword, isPending: savingPassword } = useChangePassword();
  const { mutate: uploadAvatar, isPending: uploadingAvatar } = useUploadAvatar();

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: EMPTY_PROFILE_VALUES,
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      name: user.name ?? '',
      phone: user.phone ?? '',
      street: user.address?.street ?? '',
      city: user.address?.city ?? '',
      state: user.address?.state ?? '',
      postalCode: user.address?.postalCode ?? '',
      country: user.address?.country ?? '',
    });
  }, [user, profileForm]);

  const passwordForm = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema) });

  if (isLoading) return <div className={styles.loading}><Spinner size="xl" centered /></div>;
  if (!user)     return null;

  function handleProfileSave(values: ProfileValues) {
    const trimmedPhone = values.phone?.trim();
    const hasAddress =
      !!values.street?.trim() ||
      !!values.city?.trim() ||
      !!values.state?.trim() ||
      !!values.postalCode?.trim() ||
      !!values.country?.trim();

    updateProfile({
      name: values.name,
      ...(trimmedPhone ? { phone: trimmedPhone } : {}),
      ...(hasAddress
        ? {
            address: {
              street: values.street ?? '',
              city: values.city ?? '',
              state: values.state ?? '',
              postalCode: values.postalCode ?? '',
              country: values.country ?? '',
            } as UserAddress,
          }
        : {}),
    });
  }

  function handlePasswordSave(values: PasswordValues) {
    changePassword({
      currentPassword: values.currentPassword,
      newPassword:     values.newPassword,
      confirmPassword: values.confirmPassword,
    }, { onSuccess: () => passwordForm.reset() });
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadAvatar(file);
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Account</h1>

        {/* Avatar */}
        <div className={styles.avatar_wrap}>
          <label className={styles.avatar_label} aria-label="Change avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatar_img} />
            ) : (
              <div className={styles.avatar_initials}>
                {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            {uploadingAvatar && <div className={styles.avatar_loading}><Spinner size="sm" color="white" /></div>}
            <div className={styles.avatar_overlay} aria-hidden="true"><CameraIcon /></div>
            <input type="file" accept="image/*" className={styles.avatar_input} onChange={handleAvatarChange} />
          </label>
          <div>
            <p className={styles.avatar_name}>{user.name}</p>
            <p className={styles.avatar_email}>{user.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs} role="tablist">
          {(['profile', 'security'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`${styles.tab} ${tab === t ? styles['tab--active'] : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className={styles.form} noValidate>
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldset__legend}>Personal information</legend>
              <div className={styles.row}>
                <Input label="Full name" required fullWidth
                  error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
                <Input label="Phone" type="tel" fullWidth
                  error={profileForm.formState.errors.phone?.message} {...profileForm.register('phone')} />
              </div>
            </fieldset>

            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldset__legend}>Saved address</legend>
              <Input label="Street address" fullWidth {...profileForm.register('street')} />
              <div className={styles.row}>
                <Input label="City"   fullWidth {...profileForm.register('city')}  />
                <Input label="State"  fullWidth {...profileForm.register('state')} />
              </div>
              <div className={styles.row}>
                <Input label="Postal code" fullWidth {...profileForm.register('postalCode')} />
                <Input label="Country"     fullWidth {...profileForm.register('country')}    />
              </div>
            </fieldset>

            <Button type="submit" variant="primary" size="md" loading={savingProfile}>
              Save changes
            </Button>
          </form>
        )}

        {/* Security tab */}
        {tab === 'security' && (
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} className={styles.form} noValidate>
            <fieldset className={styles.fieldset}>
              <legend className={styles.fieldset__legend}>Change password</legend>
              <Input label="Current password" type="password" autoComplete="current-password" required fullWidth
                error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
              <Input label="New password" type="password" autoComplete="new-password" required fullWidth
                hint="Minimum 8 characters" error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
              <Input label="Confirm new password" type="password" autoComplete="new-password" required fullWidth
                error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
            </fieldset>
            <Button type="submit" variant="primary" size="md" loading={savingPassword}>
              Update password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}

function CameraIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>; }