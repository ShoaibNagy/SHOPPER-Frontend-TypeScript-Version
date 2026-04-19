// ─────────────────────────────────────────────────────────────
// components/review/ReviewForm.tsx
// Create or edit a product review.
// Requires a verified purchase (orderId from useCanReview).
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useCreateReview, useUpdateReview, useUploadReviewImages } from '@hooks/useReviews';
import { useCanReview } from '@hooks/useReviews';
import { cn } from '@utils/cn';
import { Input, Spinner } from '@components/ui';
import { StarRatingInput } from '@components/ui/StarRating';
import type { Review } from '@types';
import styles from './ReviewForm.module.scss';

// ── Zod schema ────────────────────────────────────────────────
const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title:  z.string().min(3, 'Title is too short').max(100, 'Title is too long'),
  body:   z.string().min(10, 'Review is too short').max(2000, 'Review is too long'),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;

export interface ReviewFormProps {
  productId: string;
  /** Pass an existing review to enter edit mode */
  editReview?: Review | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const MAX_IMAGES = 4;

export default function ReviewForm({
  productId,
  editReview = null,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const isEditMode = Boolean(editReview);

  const { data: canReview, isLoading: checkingEligibility } = useCanReview(productId);
  const { mutate: createReview, isPending: creating } = useCreateReview();
  const { mutate: updateReview, isPending: updating } = useUpdateReview();
  const { mutate: uploadImages, isPending: uploading } = useUploadReviewImages();

  const [imageFiles,    setImageFiles]    = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: editReview?.rating ?? 0,
      title:  editReview?.title  ?? '',
      body:   editReview?.body   ?? '',
    },
  });

  const rating = watch('rating');

  // Sync rating from StarRatingInput → RHF
  function handleRatingChange(value: number) {
    setValue('rating', value, { shouldValidate: true });
  }

  // Reset when editReview changes
  useEffect(() => {
    if (editReview) {
      reset({ rating: editReview.rating, title: editReview.title, body: editReview.body });
    }
  }, [editReview, reset]);

  // Image file handling
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_IMAGES - imageFiles.length);
    if (!files.length) return;

    setImageFiles((prev) => [...prev, ...files].slice(0, MAX_IMAGES));
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImagePreviews((prev) => [...prev, url].slice(0, MAX_IMAGES));
    });
  }

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index] ?? '');
      return prev.filter((_, i) => i !== index);
    });
  }

  function onSubmit(values: ReviewFormValues) {
    if (isEditMode && editReview) {
      updateReview(
        { id: editReview._id, payload: { rating: values.rating, title: values.title, body: values.body } },
        { onSuccess: () => { reset(); onSuccess?.(); } },
      );
      return;
    }

    if (!canReview?.orderId) return;

    createReview(
      { productId, orderId: canReview.orderId, ...values },
      {
        onSuccess: (review) => {
          if (imageFiles.length > 0) {
            uploadImages({ reviewId: review._id, files: imageFiles });
          }
          reset();
          setImageFiles([]);
          setImagePreviews([]);
          onSuccess?.();
        },
      },
    );
  }

  const isSubmitting = creating || updating;
  const isDisabled   = isSubmitting || uploading;

  // ── Eligibility gate (create mode only) ──────────────────────
  if (!isEditMode) {
    if (checkingEligibility) {
      return (
        <div className={styles.gate}>
          <Spinner size="sm" />
          <span>Checking eligibility…</span>
        </div>
      );
    }

    if (!canReview?.canReview) {
      return (
        <div className={styles.gate}>
          <LockIcon />
          <p className={styles.gate__text}>
            You can only review products from a delivered order.
          </p>
        </div>
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>

      {/* ── Star rating ──────────────────────────────────── */}
      <div className={styles.field}>
        <span className={styles.field__label}>Your rating <span aria-hidden="true">*</span></span>
        <StarRatingInput
          value={rating}
          onChange={handleRatingChange}
          disabled={isDisabled}
          size="lg"
        />
        {errors.rating && (
          <p className={styles.field__error} role="alert">{errors.rating.message}</p>
        )}
      </div>

      {/* ── Title ────────────────────────────────────────── */}
      <Input
        label="Review title"
        placeholder="Summarise your experience"
        required
        fullWidth
        error={errors.title?.message}
        disabled={isDisabled}
        {...register('title')}
      />

      {/* ── Body ─────────────────────────────────────────── */}
      <div className={styles.field}>
        <label className={styles.field__label} htmlFor="review-body">
          Your review <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="review-body"
          placeholder="Tell others about your experience with this product — quality, fit, and anything else that might help."
          rows={5}
          disabled={isDisabled}
          aria-invalid={Boolean(errors.body)}
          aria-describedby={errors.body ? 'review-body-error' : undefined}
          className={cn(styles.textarea, errors.body && styles['textarea--error'])}
          {...register('body')}
        />
        {errors.body && (
          <p id="review-body-error" className={styles.field__error} role="alert">
            {errors.body.message}
          </p>
        )}
      </div>

      {/* ── Image upload (create mode only) ──────────────── */}
      {!isEditMode && (
        <div className={styles.field}>
          <span className={styles.field__label}>
            Photos <span className={styles.field__label__optional}>(optional, max {MAX_IMAGES})</span>
          </span>

          <div className={styles.images}>
            {/* Previews */}
            {imagePreviews.map((src, i) => (
              <div key={i} className={styles.image_preview}>
                <img src={src} alt={`Preview ${i + 1}`} className={styles.image_preview__img} />
                <button
                  type="button"
                  className={styles.image_preview__remove}
                  onClick={() => removeImage(i)}
                  aria-label={`Remove image ${i + 1}`}
                >
                  ×
                </button>
              </div>
            ))}

            {/* Upload button */}
            {imageFiles.length < MAX_IMAGES && (
              <button
                type="button"
                className={styles.image_upload_btn}
                onClick={() => fileInputRef.current?.click()}
                disabled={isDisabled}
                aria-label="Add photo"
              >
                <PlusIcon />
                <span>Add photo</span>
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className={styles.file_input}
            onChange={handleImageChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────── */}
      <div className={styles.actions}>
        {onCancel && (
          <button
            type="button"
            className={styles.cancel_btn}
            onClick={onCancel}
            disabled={isDisabled}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className={styles.submit_btn}
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <><Spinner size="xs" color="white" /> {isEditMode ? 'Saving…' : 'Submitting…'}</>
          ) : (
            isEditMode ? 'Save changes' : 'Submit review'
          )}
        </button>
      </div>
    </form>
  );
}

// ── Icons ─────────────────────────────────────────────────────
function LockIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>; }
function PlusIcon()  { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>; }