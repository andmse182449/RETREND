// src/services/AdminAPIService.js
import { API_BASE_URL } from './config';

class AdminAPIService {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.apiVersion = 'v1.0';
    this.resourcePath = 'admin';
  }

  _getAuthToken() {
    return localStorage.getItem('authToken');
  }

  async _handleApiResponse(response) {
    const contentType = response.headers.get("content-type");
    if (!response.ok) {
      let errorMessage = `API Error: ${response.status} ${response.statusText || ''}`;
      let errorStatus = response.status;
      let errorApiData = null;

      if (contentType && contentType.includes("application/json")) {
        try {
          errorApiData = await response.json();
          errorMessage = errorApiData.message || errorApiData.messages || JSON.stringify(errorApiData).substring(0, 200);
        } catch (e) {
          console.warn("AdminAPIService: Could not parse JSON error response.", e);
        }
      } else {
        try {
          const textError = await response.text();
          if (textError) errorMessage = textError.substring(0, 500);
        } catch (e) {}
      }
      const error = new Error(errorMessage);
      error.status = errorStatus;
      error.data = errorApiData;
      console.error('AdminAPIService API Error:', error);
      throw error;
    }

    if (response.status === 204) {
      return null;
    }

    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else if (response.status >= 200 && response.status < 300) {
      return await response.text();
    } else {
      throw new Error("Received unexpected response type from server.");
    }
  }

  // Tổng số đơn hàng theo trạng thái
  async getTotalOrderCountByStatus() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_order/status`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Tổng số đơn hàng
  async getTotalOrderCount() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_order`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Tổng doanh thu
  async getTotalPrice() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_price`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Tổng số khách hàng
  async getTotalCustomer() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/total_customer`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Doanh thu theo tháng
  async getMonthlyRevenueStats(year) {
    if (!year) throw new Error("Year is required");
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/monthly_revenue?year=${year}`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Khách hàng mới theo tháng
  async getMonthlyNewCustomers(year) {
    if (!year) throw new Error("Year is required");
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/monthly_new_customers?year=${year}`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Sản phẩm mới theo tháng
  async getNewProductsByMonth(year) {
    if (!year) throw new Error("Year is required");
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/chart/products/monthly?year=${year}`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }

  // Phân bố trạng thái sản phẩm
  async getProductStatusDistribution() {
    const url = `${this.baseUrl}/${this.apiVersion}/${this.resourcePath}/chart/products/status-distribution`;
    const token = this._getAuthToken();
    const headers = { 'Accept': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const response = await fetch(url, { method: 'GET', headers });
    return this._handleApiResponse(response);
  }
}

const adminAPIService = new AdminAPIService();
export default adminAPIService;
