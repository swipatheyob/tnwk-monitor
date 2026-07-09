import axios from "axios";

import {
  getApiUrl
} from "../config/apiConfig";

const API_URL =
  getApiUrl("/devices");

const getToken = () => {
  return localStorage.getItem("token");
};

export const getDevices = async () => {

  const response =
    await axios.get(
      API_URL,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`
        }
      }
    );

  return response.data;
};

export const getDeviceById = async (id) => {

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

export const createDevice =
async (data) => {

  const response =
    await axios.post(
      API_URL,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`
        }
      }
    );

  return response.data;
};

export const updateDevice =
async (id, data) => {

  const response =
    await axios.put(
      `${API_URL}/${id}`,
      data,
      {
        headers: {
          Authorization:
            `Bearer ${getToken()}`
        }
      }
    );

  return response.data;
};

export const deleteDevice =
async (id) => {

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
