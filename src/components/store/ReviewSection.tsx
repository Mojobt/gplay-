import React, { useState } from 'react';
import { Star, Trash2, MessageSquarePlus, User, CheckCircle2 } from 'lucide-react';
import { AppReview } from '../../types';
import { useAppStore } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface ReviewSectionProps {
  appId: string;
  rating: number;
  reviewCount: number;
  reviews: AppReview[];
  onOpenAuth: (mode?: 'signin' | 'signup') => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  appId,
  rating,
  reviewCount,
  reviews,
  onOpenAuth,
}) => {
  const { submitReview, deleteReview } = useAppStore();
  const { user, profile, isAdmin } = useAuth();

  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Compute breakdown
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating)));
    ratingCounts[star] = (ratingCounts[star] || 0) + 1;
  });

  const totalReviewsInState = reviews.length || reviewCount || 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    const res = await submitReview(appId, selectedRating, comment.trim());
    if (res.success) {
      setComment('');
      setStatusMessage({ type: 'success', text: 'Thank you! Your review has been published.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Failed to submit review' });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Card */}
      <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center gap-8">
        
        {/* Big Score */}
        <div className="text-center md:text-left shrink-0 md:pr-8 md:border-r border-zinc-200 dark:border-zinc-700">
          <div className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white">
            {rating > 0 ? rating.toFixed(1) : '—'}
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 text-amber-500 my-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  rating > 0 && i <= Math.round(rating) ? 'fill-amber-500 text-amber-500' : 'text-zinc-300 dark:text-zinc-600'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {reviewCount} total ratings
          </p>
        </div>

        {/* Histogram */}
        <div className="flex-1 w-full space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars] || 0;
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="w-3 font-medium text-zinc-600 dark:text-zinc-400">{stars}</span>
                <div className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-zinc-400 font-mono text-[11px]">{count}</span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Write a Review Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm space-y-4">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-emerald-500" />
          Rate this App & Write a Review
        </h4>

        {user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Interactive Stars */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-zinc-300 dark:text-zinc-600 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || selectedRating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                  {selectedRating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Your Feedback
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your experience with this APK on your Android device (installation, performance, battery life)..."
                required
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white transition-all shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Posting Review...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center sm:text-left">
              Log in to share your verified user feedback and star rating for this APK.
            </p>
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
            >
              Sign In to Review
            </button>
          </div>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3 pt-2">
        <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
          Community Reviews ({reviews.length})
        </h4>

        {reviews.length === 0 ? (
          <p className="text-xs text-zinc-500 py-4">No reviews yet. Be the first to leave one!</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((rev) => {
              const isAuthor = user && user.id === rev.user_id;
              const canDelete = isAuthor || isAdmin;

              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {rev.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-zinc-900 dark:text-white">
                          {rev.user_name}
                        </h5>
                        <div className="flex items-center gap-1 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-zinc-300 dark:text-zinc-600'}`}
                            />
                          ))}
                          <span className="text-[10px] text-zinc-400 ml-1.5">
                            {new Date(rev.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => deleteReview(rev.id)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed pl-10">
                    {rev.comment}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
