import { Link } from 'react-router-dom';

const Test = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p className="mb-4">This is a simple test page to check if routing works.</p>
      <Link to="/" className="text-primary underline">
        Back to Home
      </Link>
    </div>
  );
};

export default Test;