import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "../slices/usersApiSlice";
import { useGetMyOrdersQuery } from "../slices/ordersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const ProfileScreen = () => {
  const { data: user, isLoading, error: profileError } = useGetUserProfileQuery();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useGetMyOrdersQuery(undefined, { skip: !user });
  const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateUserProfileMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const submitHandler = async (event) => {
    event.preventDefault();
    setSuccess("");
    setValidationError("");
    if (password && password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    const payload = { name, email };
    if (password) payload.password = password;
    try {
      await updateProfile(payload).unwrap();
      setPassword("");
      setConfirmPassword("");
      setSuccess("Profile updated successfully");
    } catch {
      // The API error is rendered below.
    }
  };

  if (isLoading) return <Loader />;
  if (profileError) return <Message variant="danger">Please <Link to="/login?redirect=/profile">sign in</Link> to view your profile.</Message>;

  return (
    <Row>
      <Col md={4}>
        <h2>User Profile</h2>
        {success && <Message variant="success">{success}</Message>}
        {validationError && <Message variant="danger">{validationError}</Message>}
        {updateError && <Message variant="danger">{updateError?.data?.message || updateError.error}</Message>}
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="password">
            <Form.Label>New Password</Form.Label>
            <Form.Control type="password" minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Leave blank to keep current password" />
          </Form.Group>
          <Form.Group className="my-3" controlId="confirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control type="password" minLength={8} autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </Form.Group>
          <Button type="submit" disabled={isUpdating}>Update</Button>
          {isUpdating && <Loader />}
        </Form>
      </Col>
      <Col md={8}>
        <h2>My Orders</h2>
        {ordersLoading ? <Loader /> : ordersError ? (
          <Message variant="danger">{ordersError?.data?.message || ordersError.error}</Message>
        ) : orders?.length ? (
          <Table striped bordered hover responsive className="table-sm">
            <thead><tr><th>ID</th><th>DATE</th><th>TOTAL</th><th>PAID</th><th>DELIVERED</th><th></th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>${order.totalPrice.toFixed(2)}</td>
                  <td>{order.isPaid ? new Date(order.paidAt).toLocaleDateString() : "No"}</td>
                  <td>{order.isDelivered ? new Date(order.deliveredAt).toLocaleDateString() : "No"}</td>
                  <td><Link className="btn btn-light btn-sm" to={`/order/${order._id}`}>Details</Link></td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : <Message>You have not placed any orders yet.</Message>}
      </Col>
    </Row>
  );
};

export default ProfileScreen;
