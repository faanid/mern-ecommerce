import { Link, useParams } from "react-router-dom";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { useGetOrderDetailsQuery } from "../slices/ordersApiSlice";
import { useGetUserProfileQuery } from "../slices/usersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const OrderScreen = () => {
  const { id } = useParams();
  const { data: user, isLoading: isUserLoading, error: userError } = useGetUserProfileQuery();
  const { data: order, isLoading, error } = useGetOrderDetailsQuery(id, { skip: !user });

  if (isUserLoading || isLoading) return <Loader />;
  if (userError) return <Message variant="danger">Please <Link to={`/login?redirect=/order/${id}`}>sign in</Link> to view this order.</Message>;
  if (error) return <Message variant="danger">{error?.data?.message || error.error || "Unable to load order"}</Message>;
  if (!order) return null;

  return (
    <>
      <h1>Order {order._id}</h1>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h2>Shipping</h2>
              <p>{order.user?.name}</p>
              <p>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}</p>
              <Message variant={order.isDelivered ? "success" : "warning"}>{order.isDelivered ? `Delivered on ${new Date(order.deliveredAt).toLocaleDateString()}` : "Not delivered"}</Message>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment</h2>
              <p>{order.paymentMethod}</p>
              <Message variant={order.isPaid ? "success" : "warning"}>{order.isPaid ? "Paid" : "Payment has not been recorded"}</Message>
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Items</h2>
              {order.orderItems.map((item, index) => (
                <Row key={item.product || index} className="align-items-center py-2">
                  <Col xs={2}><img src={item.image} alt={item.name} className="img-fluid" /></Col>
                  <Col><Link to={`/product/${item.product}`}>{item.name}</Link></Col>
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
              <ListGroup.Item><Row><Col>Items</Col><Col>${order.itemsPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Shipping</Col><Col>${order.shippingPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Tax</Col><Col>${order.taxPrice.toFixed(2)}</Col></Row></ListGroup.Item>
              <ListGroup.Item><Row><Col>Total</Col><Col><strong>${order.totalPrice.toFixed(2)}</strong></Col></Row></ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
