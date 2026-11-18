import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useLoginMutation } from "../slices/usersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [login, { isLoading, error }] = useLoginMutation();
  const requestedRedirect = searchParams.get("redirect") || "/";
  const redirect = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      await login({ email, password }).unwrap();
      navigate(redirect);
    } catch {
      // RTK Query exposes the request error for the message below.
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={6}>
        <h1>Sign In</h1>
        {error && <Message variant="danger">{error?.data?.message || error.error || "Unable to sign in"}</Message>}
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={isLoading}>Sign In</Button>
          {isLoading && <Loader />}
        </Form>
        <Row className="py-3">
          <Col>New customer? <Link to={redirect === "/" ? "/register" : `/register?redirect=${encodeURIComponent(redirect)}`}>Register</Link></Col>
        </Row>
      </Col>
    </Row>
  );
};

export default LoginScreen;
