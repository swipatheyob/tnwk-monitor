import axios from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/analysis");

const getToken = () =>
  localStorage.getItem(
    "token"
  );

export const processHistogram =
  async (captureId) => {

    const response =
      await axios.post(
        `${API_URL}/histogram/${captureId}`,
        {},
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };

export const getMetrics =
  async (captureId) => {

    const response =
      await axios.get(
        `${API_URL}/metrics/${captureId}`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };

export const getHistogramData =
  async (captureId) => {

    const response =
      await axios.get(
        `${API_URL}/histogram-data/${captureId}`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };
