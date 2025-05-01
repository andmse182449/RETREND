import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCartOutlined, UserOutlined } from "@ant-design/icons";
import { Badge, Layout, Menu } from "antd";
import { useCart } from "../contexts/CartContext";
const { Header } = Layout;
export default function AppHeader() {
  const { cart } = useCart();
  const navigate = useNavigate();
  const menuItems = [
    { key: "1", label: <Link to="/products">Products</Link> },
    {
      key: "2",
      label: (
        <Link to="/account">
          <UserOutlined /> Account
        </Link>
      ),
    },
    {
      key: "3",
      label: (
        <Badge count={cart.length}>
          <ShoppingCartOutlined />
        </Badge>
      ),
      onClick: () => navigate("/cart"),
    },
    { key: "4", label: <Link to="/sell">Sell Clothes</Link> },
  ];
  return (
    <Header className="bg-accent">
      <div className="container mx-auto flex justify-between">
        <div
          onClick={() => navigate("/")}
          className="text-dark text-2xl font-bold cursor-pointer"
        >
          Retrend
        </div>
        <Menu
          theme="light"
          mode="horizontal"
          selectable={false}
          className="bg-accent flex-1"
          items={menuItems}
        />
      </div>
    </Header>
  );
}
