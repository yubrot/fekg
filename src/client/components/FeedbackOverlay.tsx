import { useFeedbackList, Feedback } from '../hooks/feedback-list';

export interface Props {}

export default function FeedbackOverlay({}: Props): React.ReactElement {
  const { feedbacks } = useFeedbackList();

  return (
    <>
      {feedbacks.map(feedback => (
        <Item key={feedback.id} {...feedback} />
      ))}
    </>
  );
}

function Item({ body }: Feedback): React.ReactElement {
  return body;
}
