import { Link } from 'react-router-dom';

const SimpleOrders = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-4">My Orders</h1>
      <p className="mb-4">This is a simple orders page.</p>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Order #1</h3>
          <p>iPhone 13 Pro - $899</p>
          <p>Status: Delivered</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">Order #2</h3>
          <p>MacBook Pro - $1299</p>
          <p>Status: Shipped</p>
        </div>
      </div>
      <Link to="/" className="text-primary underline mt-4 inline-block">
        Back to Home
      </Link>
    </div>
  );
};

export default SimpleOrders;