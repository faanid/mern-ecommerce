import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useGetUserProfileQuery } from "../slices/usersApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";

const readShippingAddress = () => {
  try {
    return JSON.parse(localStorage.getItem("shippingAddress") || "{}");
  } catch {
    return {};
  }
};

const ShippingScreen = () => {
  const navigate = useNavigate();
  const { isLoading, error } = useGetUserProfileQuery();
  const [address, setAddress] = useState(() => readShippingAddress().address || "");
  const [city, setCity] = useState(() => readShippingAddress().city || "");
  const [postalCode, setPostalCode] = useState(() => readShippingAddress().postalCode || "");
  const [country, setCountry] = useState(() => readShippingAddress().country || "");

  const submitHandler = (event) => {
    event.preventDefault();
    const shippingAddress = { address, city, postalCode, country };
    localStorage.setItem("shippingAddress", JSON.stringify(shippingAddress));
    navigate("/placeorder");
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">Please <Link to="/login?redirect=/shipping">sign in</Link> before entering a shipping address.</Message>;

  return (
    <Row className="justify-content-md-center">
      <Col md={6}>
        <h1>Shipping</h1>
        <Form onSubmit={submitHandler}>
          <Form.Group className="my-3" controlId="address">
            <Form.Label>Address</Form.Label>
            <Form.Control required value={address} onChange={(event) => setAddress(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="city">
            <Form.Label>City</Form.Label>
            <Form.Control required value={city} onChange={(event) => setCity(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="postalCode">
            <Form.Label>Postal Code</Form.Label>
            <Form.Control required value={postalCode} onChange={(event) => setPostalCode(event.target.value)} />
          </Form.Group>
          <Form.Group className="my-3" controlId="country">
            <Form.Label>Country</Form.Label>
            <Form.Control required value={country} onChange={(event) => setCountry(event.target.value)} />
          </Form.Group>
          <Button type="submit" disabled={!address.trim() || !city.trim() || !postalCode.trim() || !country.trim()}>Continue</Button>
        </Form>
      </Col>
    </Row>
  );
};

export default ShippingScreen;
