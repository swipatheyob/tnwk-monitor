import axios from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/captures");

const getToken = () =>
  localStorage.getItem(
    "token"
  );

export const getCaptures =
  async (
    page = 1
  ) => {

    const response =
      await axios.get(
        `${API_URL}?page=${page}&limit=12`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };

export const uploadCapture =
  async (
    formData
  ) => {

    const response =
      await axios.post(
        API_URL,
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };

export const getCaptureById =
  async (
    id
  ) => {

    const response =
      await axios.get(
        `${API_URL}/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };


export const deleteCapture =
  async (
    id
  ) => {

    const response =
      await axios.delete(
        `${API_URL}/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          }
        }
      );

    return response.data;

  };
