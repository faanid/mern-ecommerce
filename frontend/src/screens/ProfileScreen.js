import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "../slices/usersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { data: user, isLoading, error: profileError } = useGetUserProfileQuery();
  const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateUserProfileMutation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const submitHandler = async (event) => {
    event.preventDefault();
    setSuccess("");
    if (password && password !== confirmPassword) {
      setSuccess("Passwords do not match");
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
      <Col md={3}>
        <h2>User Profile</h2>
        {success && <Message variant={success.includes("successfully") ? "success" : "danger"}>{success}</Message>}
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
      <Col md={9}>
        <h2>My Orders</h2>
        <p>Order history is available through the authenticated orders API. The order-history table will be added with the checkout UI integration.</p>
      </Col>
    </Row>
  );
};

export default ProfileScreen;
