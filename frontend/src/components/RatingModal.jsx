import { useState } from "react";
import axios from "axios";

const RatingModal = ({ ride, onClose, onSubmitSuccess }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BASE_URL}/rides/rate-ride`,
        {
          rideId: ride._id,
          captainId: ride.captain._id || ride.captain,
          rating,
          feedback,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setIsSubmitting(false);
      if (onSubmitSuccess) onSubmitSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 relative text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-1">Rate Your Trip</h3>
        <p className="text-xs text-gray-500 mb-4">
          How was your trip with {ride?.captain?.fullname?.firstname || "your driver"}?
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-3xl focus:outline-none transition transform hover:scale-110"
            >
              <i
                className={`${
                  star <= rating
                    ? "ri-star-fill text-amber-400"
                    : "ri-star-line text-gray-300"
                }`}
              ></i>
            </button>
          ))}
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave an optional comment..."
          className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-black mb-4 h-24 resize-none"
        ></textarea>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <i className="ri-loader-4-line animate-spin"></i> Submitting...
            </>
          ) : (
            "Submit Review"
          )}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
