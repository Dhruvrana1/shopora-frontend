import { Link } from 'react-router-dom';
import StateMessage from '../components/common/StateMessage';

export default function NotFound() {
  return (
    <div className="container">
      <StateMessage title="Page not found" message="The page you're looking for doesn't exist." />
      <p style={{ textAlign: 'center' }}>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </p>
    </div>
  );
}
