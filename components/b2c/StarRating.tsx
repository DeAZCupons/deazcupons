'use client'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number;
  total?: number;
  interactive?: boolean;
  onRate?: (value: number) => void;
}

export function StarRating({ rating, total, interactive, onRate }: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={16}
          className={`${
            star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
          } ${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : ''}`}
          onClick={() => interactive && onRate && onRate(star)}
        />
      ))}
      {total !== undefined && (
        <span className="text-[10px] font-bold text-slate-400 ml-1">({total})</span>
      )}
    </div>
  )
}