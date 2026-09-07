import React from 'react';
import { Star, Trash2, ShieldCheck, MessageSquare } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';

export const AdminReviews: React.FC = () => {
  const { reviews, apps, deleteReview } = useAppStore();

  const getAppName = (appId: string) => {
    return apps.find(a => a.id === appId)?.name || 'Unknown Application';
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
          Community Reviews Moderation ({reviews.length})
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Monitor user ratings, verify APK performance feedback, and remove inappropriate content
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">App</th>
                <th className="px-4 py-3.5">Rating</th>
                <th className="px-4 py-3.5">Review Comment</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700/60">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                  <td className="px-4 py-3.5 font-semibold text-zinc-900 dark:text-white">
                    {rev.user_name}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                    {getAppName(rev.app_id)}
                  </td>
                  <td className="px-4 py-3.5 text-amber-500 font-bold">
                    <span className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" /> {rev.rating}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300 max-w-md truncate">
                    {rev.comment}
                  </td>
                  <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <button
                      onClick={() => deleteReview(rev.id)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Remove review"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
