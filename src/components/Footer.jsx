import React from 'react';
import { Layout } from 'antd';
const { Footer } = Layout;
export default function AppFooter() {
  return <Footer className="text-center">
    s© {new Date().getFullYear()} Retrend. All rights reserved.</Footer>;
}
