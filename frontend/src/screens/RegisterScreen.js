import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useRegisterMutation } from "../slices/usersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [register, { isLoading, error }] = useRegisterMutation();
  const requestedRedirect = searchParams.get("redirect") || "/";
  const redirect = requestedRedirect.startsWith("/") && !requestedRedirect.startsWith("//") ? requestedRedirect : "/";

  const submitHandler = async (event) => {
    event.preventDefault();
    setValidationError("");
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    try {
      await register({ name, email, password }).unwrap();
      navigate(redirect);
    } catch {
      // RTK Query exposes the request error for the message below.
    }
  };

  return (
    <Row className="justify-content-md-center">
      <Col xs={12} md={6}>
        <h1>Register</h1>
        {(validationError || error) && <Message variant="danger">{validationError || error?.data?.message || error.error || "Unable to register"}</Message>}
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" autoComplete="name" required maxLength={80} value={name} onChange={(event) => setName(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" autoComplete="new-password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control type="password" autoComplete="new-password" minLength={8} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
          </Form.Group>
          <Button type="submit" variant="primary" disabled={isLoading}>Register</Button>
          {isLoading && <Loader />}
        </Form>
        <Row className="py-3">
          <Col>Already have an account? <Link to={redirect === "/" ? "/login" : `/login?redirect=${encodeURIComponent(redirect)}`}>Sign In</Link></Col>
        </Row>
      </Col>
    </Row>
  );
};

export default RegisterScreen;
