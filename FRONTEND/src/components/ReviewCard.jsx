function ReviewCard({ review }) {
  return (
    <div className="review-card">
      <h4>{review.author}</h4>
      <p>{review.content}</p>
    </div>
  );
}

export default ReviewCard;
