import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Card, Col, ListGroup, Row } from "react-bootstrap";
import { useCreateOrderMutation } from "../slices/ordersApiSlice";
import { useGetUserProfileQuery } from "../slices/usersApiSlice";
import { clearCart } from "../slices/cartSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const getShippingAddress = () => {
  try {
    return JSON.parse(localStorage.getItem("shippingAddress") || "null");
  } catch {
    return null;
  }
};

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);
  const { isLoading: isUserLoading, error: userError } = useGetUserProfileQuery();
  const [createOrder, { isLoading, error }] = useCreateOrderMutation();
  const shippingAddress = getShippingAddress();

  const itemsPrice = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = itemsPrice * 0.15;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const placeOrderHandler = async () => {
    try {
      const order = await createOrder({
        orderItems: cartItems.map((item) => ({ product: item._id, qty: item.qty })),
        shippingAddress,
        paymentMethod: "Manual / offline (not processed online)",
      }).unwrap();
      dispatch(clearCart());
      localStorage.removeItem("shippingAddress");
      navigate(`/order/${order._id}`);
    } catch {
      // The API error is rendered below.
    }
  };

  if (isUserLoading) return <Loader />;
  if (userError) return <Message variant="danger">Please <Link to="/login?redirect=/placeorder">sign in</Link> to continue.</Message>;
  if (cartItems.length === 0) return <Message>Your cart is empty. <Link to="/">Browse products</Link>.</Message>;

  return (
    <>
      <h1>Place Order</h1>
      {!shippingAddress && <Message variant="warning">Please add a shipping address on the <Link to="/shipping">shipping page</Link>.</Message>}
      {error && <Message variant="danger">{error?.data?.message || error.error || "Unable to place order"}</Message>}
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              {shippingAddress ? (
                <p>{shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}</p>
              ) : <Link to="/shipping">Enter shipping address</Link>}
              <Link to="/shipping">Edit</Link>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment</h2>
              <p>Manual / offline payment. Online payment processing is not configured.</p>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items</h2>
              {cartItems.map((item) => (
                <Row key={item._id} className="align-items-center py-2">
                  <Col xs={2}><img src={item.image} alt={item.name} className="img-fluid" /></Col>
                  <Col><Link to={`/product/${item._id}`}>{item.name}</Link></Col>
                  <Col xs="auto">{item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}</Col>
                </Row>
              ))}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item><h2>Order Summary</h2></ListGroup.Item>
              <ListGroup.Item><Row><Col>Items</Col><Col>${itemsPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Shipping</Col><Col>${shippingPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Tax</Col><Col>${taxPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col><strong>Total</strong></Col><Col><strong>${totalPrice.toFixed(2)}</strong></Col></Row></ListGroup.Item>
              <ListGroup.Item>
                <Button className="w-100" disabled={!shippingAddress || isLoading} onClick={placeOrderHandler}>Place Order</Button>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
